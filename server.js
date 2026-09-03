import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// ── Simple in-memory rate limiter (no extra deps needed) ──────────────────────
const rateLimitStore = new Map();
function rateLimit({ windowMs = 60000, max = 100, message = 'Too many requests' } = {}) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitStore.get(ip) || { count: 0, reset: now + windowMs };
    if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs; }
    entry.count++;
    rateLimitStore.set(ip, entry);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.reset / 1000));
    if (entry.count > max) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}

// Clean up old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.reset) rateLimitStore.delete(ip);
  }
}, 5 * 60 * 1000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = join(__dirname, 'dist');

// ── Security & compatibility headers for ALL responses ───────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
});

// ── Global rate limit: 200 req/min per IP ─────────────────────────────────────
app.use(rateLimit({ windowMs: 60 * 1000, max: 200, message: 'Rate limit exceeded. Try again shortly.' }));

// ── Strict rate limit on API routes: 30 req/min per IP ───────────────────────
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 30, message: 'API rate limit exceeded.' }));

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
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// ── Keep-alive / health check ─────────────────────────────────────────────────
app.get('/ping', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('pong');
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OG metadata scraper — uses Jina AI reader (free, no key, handles JS sites like Amazon)
app.get('/api/og-meta', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  try {
    // Jina Reader API — free, no key needed, renders JS, works on Amazon/eBay etc.
    const jinaUrl = `https://r.jina.ai/${url}`;
    const jinaRes = await fetch(jinaUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'json',
        'X-With-Images-Summary': 'true',
        'X-With-Generated-Alt': 'true',
      },
      signal: AbortSignal.timeout(20000),
    });

    if (jinaRes.ok) {
      const data = await jinaRes.json();
      const content = data.data || data;
      const text = content.text || content.content || '';

      // Extract price from content text
      let price = null;
      const pricePatterns = [
        /\$\s*([\d,]+\.?\d{0,2})/,
        /£\s*([\d,]+\.?\d{0,2})/,
        /€\s*([\d,]+\.?\d{0,2})/,
        /"price":\s*"?([\d.]+)"?/i,
      ];
      for (const re of pricePatterns) {
        const m = text.match(re);
        if (m) { price = parseFloat(m[1].replace(/,/g, '')); break; }
      }

      // Collect images from Jina images map
      const images = [];
      if (content.images && typeof content.images === 'object') {
        Object.values(content.images).forEach(img => {
          if (typeof img === 'string' && img.startsWith('http')) images.push(img);
        });
      }
      // Extract markdown image URLs from content
      const mdImgs = [...text.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
      images.push(...mdImgs);

      // For Amazon — derive image from ASIN using their CDN
      if (images.length === 0 && url.includes('amazon.')) {
        const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/product\/([A-Z0-9]{10})/i);
        if (asinMatch) {
          const asin = asinMatch[1];
          images.push(`https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`);
          images.push(`https://m.media-amazon.com/images/P/${asin}.jpg`);
        }
      }

      return res.json({
        title: content.title || '',
        description: content.description || text.substring(0, 200),
        images: [...new Set(images)].slice(0, 6),
        price,
        site_name: new URL(url).hostname.replace('www.', ''),
      });
    }

    throw new Error(`Jina returned ${jinaRes.status}`);
  } catch (err) {
    // Fallback: plain HTML scrape
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: AbortSignal.timeout(10000),
        redirect: 'follow',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();

      const getMeta = (prop) => {
        const patterns = [
          new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
          new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i'),
          new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
          new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${prop}["']`, 'i'),
        ];
        for (const re of patterns) {
          const m = html.match(re);
          if (m) return m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
        }
        return '';
      };

      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = getMeta('og:title') || getMeta('twitter:title') || (titleMatch ? titleMatch[1].trim() : '');
      const description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description');

      const images = [];
      const ogRe = /<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["'])[^>]+content=["']([^"']+)["']/gi;
      const ogRe2 = /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property=["']og:image["']|name=["']twitter:image["'])/gi;
      let m;
      while ((m = ogRe.exec(html)) !== null) images.push(m[1]);
      while ((m = ogRe2.exec(html)) !== null) images.push(m[1]);

      let price = null;
      const jsonLdBlocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
      for (const block of jsonLdBlocks) {
        try {
          const json = JSON.parse(block.replace(/<script[^>]*>|<\/script>/gi, ''));
          const offers = json.offers || (Array.isArray(json) && json[0]?.offers);
          if (offers) {
            const p = offers.price || offers.lowPrice || (Array.isArray(offers) && offers[0]?.price);
            if (p) { price = parseFloat(p); break; }
          }
        } catch { }
      }

      return res.json({ title, description, images: [...new Set(images)].slice(0, 6), price, site_name: getMeta('og:site_name') });
    } catch (fallbackErr) {
      return res.status(502).json({ error: 'Could not fetch metadata', detail: fallbackErr.message });
    }
  }
});

// ÔöÇÔöÇ Static assets (JS/CSS/images) ÔÇö long cache ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
app.use('/assets', (req, res, next) => {
  const filePath = join(distDir, 'assets', req.path);
  if (!existsSync(filePath)) {
    return res.status(404).send('Not found');
  }
  next();
}, express.static(join(distDir, 'assets'), {
  maxAge: '1y',
  immutable: true,
  etag: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    } else if (filePath.endsWith('.woff')) {
      res.setHeader('Content-Type', 'font/woff');
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // Allow cross-origin font loading
    res.setHeader('Access-Control-Allow-Origin', '*');
  },
}));

// ÔöÇÔöÇ Other static files ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
app.use(express.static(distDir, {
  maxAge: 0,
  etag: true,
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  },
}));

// ÔöÇÔöÇ SPA fallback ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
app.get('*', async (req, res) => {
  const path = req.path;

  // 404 for missing assets
  const assetExts = ['.js', '.css', '.map', '.woff', '.woff2', '.ttf',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webmanifest', '.json'];
  if (assetExts.some(ext => path.endsWith(ext))) {
    return res.status(404).send('Not found');
  }

  const indexPath = join(distDir, 'index.html');

  // If dist/index.html is missing, poll briefly (handles Render cold-start race condition)
  if (!existsSync(indexPath)) {
    const maxWaitMs = 15000;
    const intervalMs = 500;
    let waited = 0;
    await new Promise(resolve => {
      const timer = setInterval(() => {
        waited += intervalMs;
        if (existsSync(indexPath) || waited >= maxWaitMs) {
          clearInterval(timer);
          resolve(undefined);
        }
      }, intervalMs);
    });
  }

  if (!existsSync(indexPath)) {
    // Still missing after wait — build likely failed
    return res.status(503).send('App failed to start. Please check build logs and redeploy.');
  }

  // Serve index.html — no cache, correct content type
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: err.message });
});

