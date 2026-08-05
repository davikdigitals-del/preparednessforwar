// v7 — passthrough only, no caching whatsoever
const CACHE_NAME = 'pfw-v7';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Delete ALL old caches on activate
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Never cache anything — always fetch from network
// This prevents stale JS bundles from causing 503 errors
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept navigation
  if (request.mode === 'navigate') return;

  // Never intercept Supabase
  if (request.url.includes('supabase.co')) return;

  // Everything else — network only, no cache fallback
  // If network fails, let it fail naturally (no fake 503)
  event.respondWith(fetch(request));
});
