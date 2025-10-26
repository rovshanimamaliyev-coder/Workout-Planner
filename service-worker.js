const CACHE_NAME = 'workout-planner-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/images/13.jpg',
  '/images/144.jpg',
  '/images/192.jpg',
  '/images/512.jpg',
  '/images/screenshot-mobile.png',
  '/images/screenshot-wide.png'
];

// Install event: Cache all necessary files
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS).catch(err => {
        console.error('Caching failed:', err);
        // You can log the individual URL that failed here if needed
      });
    })
  );
  self.skipWaiting(); // Skip waiting and activate immediately
});

// Activate event: Clean up old caches
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event: Serve from cache, fallback to network, then cache the response
self.addEventListener('fetch', evt => {
  if (evt.request.method !== 'GET') return;

  evt.respondWith(
    caches.match(evt.request)
      .then(r => r || fetch(evt.request)
        .then(resp => {
          // Check if the request was successful
          if (resp && resp.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(evt.request, resp.clone());
            });
          }
          return resp;
        })
        .catch(err => {
          // Fallback for offline use
          console.error('Network request failed:', err);
          return caches.match('/offline.html'); // Ensure you have an offline.html file in your cache
        })
      )
  );
});
