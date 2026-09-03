import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { getRedisClient, closeRedis, checkRedisHealth } from './lib/redis.js';
import { createRateLimiter, createBurstRateLimiter, RATE_LIMITS } from './lib/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = join(__dirname, 'dist');

// Initialize Redis
const redis = getRedisClient();

// ── Compression middleware (gzip/brotli) ──────────────────────────────────────
app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  level: 6, // Compression level (1-9)
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// ── Security & compatibility headers for ALL responses ───────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
});

// ── Redis-based distributed rate limiting ─────────────────────────────────────
// Global rate limit with burst allowance
app.use(createBurstRateLimiter({
  burstLimit: 200,      // Allow 200 burst requests
  sustainedRate: 50,    // But sustain only 50 req/s average
  keyPrefix: 'rl:global',
}));

// API-specific rate limiting (stricter)
app.use('/api/', createRateLimiter({
  windowMs: 60 * 1000,  // 1 minute
  max: RATE_LIMITS.api, // 30 requests per minute
  message: 'API rate limit exceeded. Please try again later.',
  keyPrefix: 'rl:api',
}));

// ── Block common attack probes ────────────────────────────────────────────────
app.use((req, res, next) => {
  const blocked = [
    /\.php$/i, /\.asp[x]?$/i, /\.env/i, /\.git/i,
    /wp-admin/i, /wp-login/i, /xmlrpc/i, /phpmyadmin/i,
    /\.htaccess/i, /\/etc\/passwd/i, /\/proc\//i,
    /<script/i, /javascript:/i, /union.*select/i, /drop.*table/i,
  ];
  const target = req.path + (req.query ? JSON.stringify(req.query) : '');
  if (blocked.some(re => re.test(target))) {
    console.warn(`Blocked suspicious request: ${req.path} from ${req.ip}`);
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// ── Health & monitoring endpoints ─────────────────────────────────────────────
app.get('/ping', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('pong');
});

app.get('/health', async (_req, res) => {
  const redisHealthy = await checkRedisHealth();
  const health = {
    status: redisHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    redis: redisHealthy ? 'connected' : 'disconnected',
  };

  res.status(redisHealthy ? 200 : 503).json(health);
});

app.get('/ready', async (_req, res) => {
  try {
    const redisHealthy = await checkRedisHealth();
    const distExists = existsSync(join(distDir, 'index.html'));

    if (redisHealthy && distExists) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({
        status: 'not ready',
        redis: redisHealthy,
        dist: distExists,
      });
    }
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
});

app.get('/live', (_req, res) => {
  res.status(200).json({ status: 'alive' });
});

app.get('/metrics', async (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const metrics = [
      `# HELP nodejs_memory_usage_bytes Memory usage in bytes`,
      `# TYPE nodejs_memory_usage_bytes gauge`,
      `nodejs_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}`,
      `nodejs_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}`,
      `nodejs_memory_usage_bytes{type="rss"} ${memUsage.rss}`,
      ``,
      `# HELP nodejs_uptime_seconds Process uptime in seconds`,
      `# TYPE nodejs_uptime_seconds counter`,
      `nodejs_uptime_seconds ${process.uptime()}`,
      ``,
      `# HELP redis_connected Redis connection status`,
      `# TYPE redis_connected gauge`,
      `redis_connected ${await checkRedisHealth() ? 1 : 0}`,
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    res.status(500).send('Error generating metrics');
  }
});

// ── OG metadata scraper with caching ──────────────────────────────────────────
app.get('/api/og-meta', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  try {
    const cacheKey = `og:${Buffer.from(url).toString('base64').substring(0, 100)}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    res.setHeader('X-Cache', 'MISS');
    const jinaUrl = `https://r.jina.ai/${url}`;
    const jinaRes = await fetch(jinaUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'json',
        'X-With-Images-Summary': 'true',
      },
      signal: AbortSignal.timeout(20000),
    });

    if (jinaRes.ok) {
      const data = await jinaRes.json();
      const content = data.data || data;
      const text = content.text || content.content || '';

      let price = null;
      const pricePatterns = [/\$\s*([\d,]+\.?\d{0,2})/, /£\s*([\d,]+\.?\d{0,2})/, /€\s*([\d,]+\.?\d{0,2})/];
      for (const re of pricePatterns) {
        const m = text.match(re);
        if (m) { price = parseFloat(m[1].replace(/,/g, '')); break; }
      }

      const images = [];
      if (content.images && typeof content.images === 'object') {
        Object.values(content.images).forEach(img => {
          if (typeof img === 'string' && img.startsWith('http')) images.push(img);
        });
      }

      const result = {
        title: content.title || '',
        description: content.description || text.substring(0, 200),
        images: [...new Set(images)].slice(0, 6),
        price,
        site_name: new URL(url).hostname.replace('www.', ''),
      };

      await redis.setex(cacheKey, 3600, JSON.stringify(result));
      return res.json(result);
    }

    throw new Error(`Jina returned ${jinaRes.status}`);
  } catch (err) {
    return res.status(502).json({ error: 'Could not fetch metadata' });
  }
});

// ── Static assets ─────────────────────────────────────────────────────────────
app.use('/assets', express.static(join(distDir, 'assets'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
  },
}));

app.use(express.static(distDir, { maxAge: 0, etag: true, index: false }));

// ── SPA fallback ──────────────────────────────────────────────────────────────
app.get('*', async (req, res) => {
  const assetExts = ['.js', '.css', '.map', '.woff', '.woff2', '.ttf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json'];
  if (assetExts.some(ext => req.path.endsWith(ext))) {
    return res.status(404).send('Not found');
  }

  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) {
    return res.status(503).send('App not ready');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(indexPath);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} with Redis`);
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

async function gracefulShutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(() => console.log('HTTP server closed'));
  await closeRedis();
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
