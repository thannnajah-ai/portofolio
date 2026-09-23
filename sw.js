const CACHE_NAME = 'portfolio-v1';
const API_CACHE = 'api-cache-v1';

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './',
                './index.html',
                './style.css',
                './script.js',
                './worker.js'
            ]);
        })
    );
});

self.addEventListener('fetch', (e) => {
    const isApiRequest = e.request.url.includes('api.github.com') || e.request.url.includes('api.open-meteo.com');
    
    if (isApiRequest) {
        e.respondWith(
            caches.open(API_CACHE).then((cache) => {
                return fetch(e.request).then((response) => {
                    cache.put(e.request, response.clone());
                    return response;
                }).catch(() => {
                    return cache.match(e.request);
                });
            })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then((response) => {
                return response || fetch(e.request);
            })
        );
    }
});
