// Minimal service worker to avoid caching issues
const CACHE_NAME = 'deepfake-detector-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// Don't cache anything in development
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});