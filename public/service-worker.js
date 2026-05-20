// Service Worker for Offline Capability
const CACHE_NAME = 'pfw-portal-v2';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/my-courses',
  '/offline.html',
  '/manifest.json'
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll can fail if any asset 404s — use individual adds to be safe
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Only handle same-origin requests
  if (!url.startsWith(self.location.origin)) return;

  // Never intercept Supabase API, Stripe, or other external APIs
  if (
    url.includes('supabase.co') ||
    url.includes('stripe.com') ||
    url.includes('api.') ||
    url.includes('/functions/v1/')
  ) return;

  // For navigation requests (page loads) — network first, fallback to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Network failed — try cache first, then offline page
          caches.match(request).then(
            (cached) => cached || caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 })
          )
        )
    );
    return;
  }

  // For static assets (JS, CSS, images) — cache first, then network
  if (
    url.includes('/assets/') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // All other requests — network only, no interception
  // (don't call event.respondWith — let browser handle normally)
});

// ── MESSAGES ─────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Keep the service worker alive while handling the message
  if (event.data.type === 'CACHE_CONTENT') {
    const { url, contentType, contentId } = event.data;
    const port = event.ports[0];
    
    fetch(url)
      .then((response) => {
        if (response && response.status === 200) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(url, response.clone());
            return { success: true, contentType, contentId };
          });
        }
        throw new Error('Failed to fetch content');
      })
      .then((result) => { if (port) port.postMessage(result); })
      .catch((error) => { if (port) port.postMessage({ success: false, error: error.message }); });
  }

  if (event.data.type === 'REMOVE_CACHED_CONTENT') {
    const { url } = event.data;
    const port = event.ports[0];
    
    caches.open(CACHE_NAME)
      .then((cache) => cache.delete(url))
      .then(() => { if (port) port.postMessage({ success: true }); })
      .catch((error) => { if (port) port.postMessage({ success: false, error: error.message }); });
  }

  if (event.data.type === 'CLEAR_ALL_CACHE') {
    const port = event.ports[0];
    
    caches.delete(CACHE_NAME)
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => Promise.allSettled(PRECACHE_ASSETS.map(url => cache.add(url).catch(() => {}))))
      .then(() => { if (port) port.postMessage({ success: true }); })
      .catch((error) => { if (port) port.postMessage({ success: false, error: error.message }); });
  }

  // Ping to keep SW alive
  if (event.data.type === 'PING') {
    if (event.ports[0]) event.ports[0].postMessage({ type: 'PONG' });
  }
});
