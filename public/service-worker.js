// v6 — never intercept Supabase requests, clear old caches
const CACHE_NAME = 'pfw-v6';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept navigation requests (HTML page loads / SPA routes).
  if (request.mode === 'navigate') return;

  // Never intercept Supabase API or storage requests — let them go direct.
  if (request.url.includes('supabase.co')) return;

  // Never intercept JS/CSS chunks — always fetch fresh from network.
  // This prevents stale cached bundles from causing 503 errors.
  const url = new URL(request.url);
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(fetch(request));
    return;
  }

  // For all other requests (images, fonts) — passthrough fetch with offline fallback.
  event.respondWith(
    fetch(request).catch(() => {
      return new Response('', { status: 503, statusText: 'Offline' });
    })
  );
});
