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

// OG metadata scraper — fetches and parses OG/meta tags server-side (no CORS, no API key)
app.get('/api/og-meta', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

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

    // Parse a meta tag by property or name
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

    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';
    const title = getMeta('og:title') || getMeta('twitter:title') || pageTitle;

    // Description
    const description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description');

    // Images — collect all og:image and twitter:image occurrences
    const images = [];
    const ogImageRe = /<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["'])[^>]+content=["']([^"']+)["']/gi;
    const ogImageRe2 = /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property=["']og:image["']|name=["']twitter:image["'])/gi;
    let m;
    while ((m = ogImageRe.exec(html)) !== null) images.push(m[1]);
    while ((m = ogImageRe2.exec(html)) !== null) images.push(m[1]);
    // Also grab first <img> with a large src as fallback
    if (images.length === 0) {
      const imgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(jpg|jpeg|png|webp)[^"']*)["']/i);
      if (imgMatch) images.push(imgMatch[1]);
    }

    // Price — try JSON-LD first, then common patterns
    let price = '';
    const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const block of jsonLdMatch) {
        try {
          const json = JSON.parse(block.replace(/<script[^>]*>|<\/script>/gi, ''));
          const offers = json.offers || (Array.isArray(json) && json[0]?.offers);
          if (offers) {
            const p = offers.price || offers.lowPrice || (Array.isArray(offers) && offers[0]?.price);
            if (p) { price = String(p); break; }
          }
        } catch {}
      }
    }
    // Fallback: look for price patterns in HTML
    if (!price) {
      const pricePatterns = [
        /["']price["']\s*:\s*["']?([\d.]+)["']?/i,
        /itemprop=["']price["'][^>]+content=["']([\d.]+)["']/i,
        /class=["'][^"']*price[^"']*["'][^>]*>\s*[£$€]?\s*([\d,]+\.?\d*)/i,
      ];
      for (const re of pricePatterns) {
        const pm = html.match(re);
        if (pm) { price = pm[1].replace(/,/g, ''); break; }
      }
    }

    const siteName = getMeta('og:site_name');

    return res.json({
      title,
      description,
      images: [...new Set(images)], // deduplicate
      price: price ? parseFloat(price) : null,
      site_name: siteName,
    });
  } catch (err) {
    return res.status(502).json({ error: 'Could not fetch metadata', detail: err.message });
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

