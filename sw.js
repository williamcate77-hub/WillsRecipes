// Cooking With Will — service worker.
// Cache-first: the whole app is static, so everything is precached and served
// from cache; the network is only touched to fill the cache. Bump VERSION on
// every deploy that changes any precached file, so clients pick up the update.

const VERSION = 'cww-v14';

const PRECACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/recipes.js',
  '/ratios.js',
  '/public/manifest.json',
  '/public/icon.svg',
  '/public/icon-192.png',
  '/public/icon-512.png',
  '/public/icon-512-maskable.png',
  '/public/apple-touch-icon.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  // Never intercept the recipe-import API
  if (url.pathname.startsWith('/api/')) return;

  // Google Fonts (and other cross-origin GETs like GA): cache-first with
  // network fill, so the font works offline after the first visit.
  event.respondWith(
    caches.match(event.request, { ignoreSearch: url.origin === location.origin }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resp) => {
        // Cache successful same-origin responses and font files
        const cacheable = resp && (resp.ok || resp.type === 'opaque') &&
          (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname));
        if (cacheable) {
          const copy = resp.clone();
          caches.open(VERSION).then((cache) => cache.put(event.request, copy));
        }
        return resp;
      }).catch(() => {
        // Offline and not cached: for navigations, fall back to the app shell
        if (event.request.mode === 'navigate') return caches.match('/index.html');
        return Response.error();
      });
    })
  );
});
