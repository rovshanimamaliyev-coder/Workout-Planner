/*const CACHE_NAME = 'workout-planner-v1';
const CACHE_URLS = ['/', 'index.html', 'style.css', 'script.js', 'manifest.json','./images/13.jpg','./images/192.jpg','./images/512.jpg'];

self.addEventListener('install', evt=>{
  evt.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', evt=>{
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evt=>{
  if(evt.request.method !== 'GET') return;
  evt.respondWith(caches.match(evt.request).then(r=>r || fetch(evt.request).then(resp=>{
    return caches.open(CACHE_NAME).then(cache=>{ cache.put(evt.request, resp.clone()); return resp; });
  })));
});*/

const CACHE_NAME = 'workout-planner-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/images/13.jpg',
  '/images/192.jpg',
  '/images/512.jpg'
];

// Install event: Cache all necessary files
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
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
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(evt.request, resp.clone());
            return resp;
          });
        })
        .catch(() => {
          // Fallback for offline use
          return caches.match('/offline.html'); // Make sure you have an offline page in the cache
        })
      )
  );
});
