// v4 — passthrough SW, navigation-aware
// Cleans up old caches and never intercepts page navigations (SPA routes)

const CACHE_NAME = 'pfw-v4';

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
  // Let the browser handle them directly so the server's SPA fallback works.
  if (request.mode === 'navigate') return;

  // For all other requests (JS, CSS, images, API calls) — passthrough fetch.
  event.respondWith(
    fetch(request).catch(() => {
      // If fetch fails (offline), just let it fail naturally.
      return new Response('', { status: 503, statusText: 'Offline' });
    })
  );
});
