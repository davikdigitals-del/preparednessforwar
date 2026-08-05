// v8 — do nothing, intercept nothing
// Prevents all service worker interference with navigation and assets

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Delete ALL old caches
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// No fetch handler — browser handles everything natively
// This prevents ALL service worker interference
