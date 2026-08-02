// v5 — never intercept Supabase requests
const CACHE_NAME = 'pfw-v5';

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

  // For all other requests (JS, CSS, images) — passthrough fetch.
  event.respondWith(
    fetch(request).catch(() => {
      return new Response('', { status: 503, statusText: 'Offline' });
    })
  );
});
