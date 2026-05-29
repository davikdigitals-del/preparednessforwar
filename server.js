import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = join(__dirname, 'dist');

// Serve static files with correct MIME types and long cache for assets
app.use(express.static(distDir, {
  maxAge: '1y',
  etag: true,
  setHeaders: (res, filePath) => {
    // JS and CSS — set correct MIME types explicitly
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.html')) {
      // HTML — no cache so new deploys are picked up immediately
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  },
}));

// SPA fallback — ONLY for non-asset requests
app.get('*', (req, res, next) => {
  const path = req.path;

  // Never serve index.html for asset requests — return 404 instead
  if (
    path.startsWith('/assets/') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.map') ||
    path.endsWith('.woff') ||
    path.endsWith('.woff2') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.svg') ||
    path.endsWith('.ico') ||
    path.endsWith('.webmanifest') ||
    path.endsWith('.json')
  ) {
    return res.status(404).send('Not found');
  }

  // All other routes — serve index.html for React Router
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Clear-Site-Data', '"cache"');
  res.sendFile(join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
