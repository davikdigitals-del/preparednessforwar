import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = join(__dirname, 'dist');

// ÔöÇÔöÇ Security & compatibility headers for ALL responses ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
app.use((req, res, next) => {
  // Required for Chrome mobile to accept the connection
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Allow Chrome mobile to load all resources
  res.removeHeader('X-Powered-By');
  next();
});

// ÔöÇÔöÇ Keep-alive / health check ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
app.get('/ping', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('pong');
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OG metadata proxy — fetches product metadata server-side to avoid CORS
app.get('/api/og-meta', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url param' });
  try {
    const response = await fetch(
      `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PFWBot/1.0)' } }
    );
    if (!response.ok) throw new Error(`jsonlink ${response.status}`);
    const data = await response.json();
    return res.json(data);
  } catch {
    return res.status(502).json({ error: 'Could not fetch metadata' });
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
app.get('*', (req, res) => {
  const path = req.path;

  // 404 for missing assets
  const assetExts = ['.js', '.css', '.map', '.woff', '.woff2', '.ttf',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webmanifest', '.json'];
  if (assetExts.some(ext => path.endsWith(ext))) {
    return res.status(404).send('Not found');
  }

  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) {
    return res.status(503).send('App is starting up, please refresh in a moment.');
  }

  // Serve index.html ÔÇö no cache, correct content type
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

