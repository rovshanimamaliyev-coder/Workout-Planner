const CACHE_NAME = 'workout-planner-v1';
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
});