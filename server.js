import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = join(__dirname, 'dist');

// ── Static assets (JS/CSS/images) — long cache, hashed filenames ─────────────
app.use('/assets', (req, res, next) => {
  // Verify the file actually exists before serving
  const filePath = join(distDir, 'assets', req.path);
  if (!existsSync(filePath)) {
    // Asset not found — don't fall through to SPA, return 404
    return res.status(404).send('Asset not found');
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
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
}));

// ── Other static files (manifest, icons, sw.js, etc.) ────────────────────────
app.use(express.static(distDir, {
  maxAge: 0,
  etag: true,
  index: false, // Don't auto-serve index.html here — we handle it below
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  },
}));

// ── SPA fallback — serve index.html for all non-asset routes ─────────────────
app.get('*', (req, res) => {
  const path = req.path;

  // Hard 404 for any asset-like path that wasn't found above
  const assetExtensions = ['.js', '.css', '.map', '.woff', '.woff2', '.ttf',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webmanifest', '.txt'];
  if (assetExtensions.some(ext => path.endsWith(ext))) {
    return res.status(404).send('Not found');
  }

  // Serve index.html with aggressive no-cache headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  // Tell browser to clear its cache for this origin
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Clear-Site-Data', '"cache"');
  }
  res.sendFile(join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
