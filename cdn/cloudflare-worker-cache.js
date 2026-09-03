/**
 * Cloudflare Worker for Advanced Edge Caching
 * Handles 4-5M requests/second at the edge
 * 
 * Deploy: wrangler publish
 * Route: *preparednessforwar.com/api/*
 */

// Cache TTLs by content type
const CACHE_TTLS = {
  'application/json': 60,        // 1 minute for API responses
  'text/html': 300,              // 5 minutes for HTML
  'text/css': 31536000,          // 1 year for CSS
  'application/javascript': 31536000,  // 1 year for JS
  'image/': 2592000,             // 30 days for images
  'font/': 31536000,             // 1 year for fonts
};

// Cache keys to bypass (authenticated, personalized)
const BYPASS_PATTERNS = [
  /\/api\/auth\//,
  /\/api\/user\//,
  /\/api\/admin\//,
  /checkout/,
  /payment/,
];

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Main request handler
 */
async function handleRequest(request) {
  const url = new URL(request.url);

  // Only cache GET and HEAD requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return fetch(request);
  }

  // Check if request should bypass cache
  if (shouldBypassCache(request, url)) {
    return fetch(request);
  }

  // Try to get from cache
  const cache = caches.default;
  const cacheKey = new Request(url.toString(), request);
  let response = await cache.match(cacheKey);

  if (response) {
    // Cache hit
    response = new Response(response.body, response);
    response.headers.set('X-Cache', 'HIT-EDGE');
    response.headers.set('X-Cache-Age', getAge(response));
    return response;
  }

  // Cache miss - fetch from origin
  response = await fetch(request);

  // Clone response for caching
  const responseToCache = response.clone();

  // Determine if response should be cached
  if (shouldCacheResponse(response, url)) {
    const ttl = getCacheTTL(response, url);

    // Add caching headers
    const headers = new Headers(responseToCache.headers);
    headers.set('Cache-Control', `public, max-age=${ttl}`);
    headers.set('X-Cache', 'MISS');
    headers.set('X-Edge-Location', request.cf?.colo || 'unknown');

    const cachedResponse = new Response(responseToCache.body, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers: headers,
    });

    // Store in cache
    event.waitUntil(cache.put(cacheKey, cachedResponse));
  }

  // Add cache miss header
  response = new Response(response.body, response);
  response.headers.set('X-Cache', 'MISS');

  return response;
}

/**
 * Check if request should bypass cache
 */
function shouldBypassCache(request, url) {
  // Bypass if Authorization header present
  if (request.headers.has('Authorization')) {
    return true;
  }

  // Bypass if Cookie header present (user session)
  if (request.headers.has('Cookie')) {
    const cookie = request.headers.get('Cookie');
    if (cookie.includes('session') || cookie.includes('auth')) {
      return true;
    }
  }

  // Bypass specific paths
  for (const pattern of BYPASS_PATTERNS) {
    if (pattern.test(url.pathname)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if response should be cached
 */
function shouldCacheResponse(response, url) {
  // Only cache successful responses
  if (response.status !== 200 && response.status !== 304) {
    return false;
  }

  // Check Cache-Control header
  const cacheControl = response.headers.get('Cache-Control');
  if (cacheControl) {
    if (cacheControl.includes('no-store') || cacheControl.includes('private')) {
      return false;
    }
  }

  return true;
}

/**
 * Get cache TTL based on content type
 */
function getCacheTTL(response, url) {
  const contentType = response.headers.get('Content-Type') || '';

  // Check for explicit Cache-Control header
  const cacheControl = response.headers.get('Cache-Control');
  if (cacheControl) {
    const match = cacheControl.match(/max-age=(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  // Use content type mapping
  for (const [type, ttl] of Object.entries(CACHE_TTLS)) {
    if (contentType.startsWith(type)) {
      return ttl;
    }
  }

  // Check URL patterns
  if (url.pathname.includes('/assets/')) {
    return 31536000; // 1 year
  }

  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    return 2592000; // 30 days
  }

  // Default TTL
  return 300; // 5 minutes
}

/**
 * Get age of cached response
 */
function getAge(response) {
  const date = response.headers.get('Date');
  if (!date) return 'unknown';

  const age = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  return `${age}s`;
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
async function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Error handler
 */
addEventListener('error', event => {
  console.error('Worker error:', event.error);
  event.respondWith(
    new Response('Internal Server Error', { status: 500 })
  );
});
