const CACHE_NAME = 'last-seen-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        // Safely catch network errors to prevent "Uncaught (in promise) TypeError" in console
        return fetch(event.request).catch(() => {
             // Return a simple 404 or null to satisfy the promise chain cleanly
             return new Response(null, { status: 404, statusText: "Offline/Network Error" });
        });
      })
  );
});