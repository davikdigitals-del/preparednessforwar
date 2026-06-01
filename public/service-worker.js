// v3 — minimal passthrough service worker
// Cleans up old caches from previous versions without causing reload loops

const CACHE_NAME = 'pfw-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete any caches from old versions (v1, v2, etc.)
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
      // Take control of all open tabs immediately
      await self.clients.claim();
    })()
  );
});

// Passthrough fetch — no caching, let the browser handle it normally
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
