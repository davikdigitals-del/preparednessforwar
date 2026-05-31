// v2 — force clears all caches and unregisters itself
// This fixes black screen on mobile caused by stale cached assets

const CACHE_VERSION = 'v2-' + Date.now();

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete ALL caches
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      // Unregister this service worker
      await self.registration.unregister();
      // Force reload all open tabs
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});
