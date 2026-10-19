const CACHE_NAME = 'portfolio-v3';
const API_CACHE = 'api-cache-v1';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './worker.js',
    './photo.webp',
    './i18n/en.json',
    './i18n/id.json'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
});

self.addEventListener('activate', (e) => {
    const CURRENT_CACHES = [CACHE_NAME, API_CACHE];
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    const isAppCache = key.startsWith('portfolio-') || key.startsWith('api-cache-');
                    if (isAppCache && !CURRENT_CACHES.includes(key)) {
                        console.log('[SW] Deleting old app cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    let protocol;
    try {
        protocol = new URL(e.request.url).protocol;
    } catch (_) {
        return;
    }

    if (protocol !== 'http:' && protocol !== 'https:') {
        return;
    }

    const url = e.request.url;
    const isApiRequest = url.includes('api.github.com') || url.includes('api.open-meteo.com');

    // 1. API Requests: Network-first dengan fallback ke cache API
    if (isApiRequest) {
        e.respondWith(
            caches.open(API_CACHE).then((cache) => {
                return fetch(e.request).then((response) => {
                    if (response && response.status === 200) {
                        cache.put(e.request, response.clone()).catch(() => {});
                    }
                    return response;
                }).catch(() => {
                    return cache.match(e.request).catch(() => null).then((res) => {
                        return res || new Response(null, { status: 503, statusText: 'Service Unavailable' });
                    });
                });
            }).catch(() => {
                return new Response(null, { status: 503, statusText: 'Service Unavailable' });
            })
        );
        return;
    }

    // 2. HTML Navigation: Network-first agar halaman HTML selalu mutakhir, dengan offline cache fallback
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone).catch(() => {})).catch(() => {});
                }
                return networkResponse;
            }).catch(() => {
                return caches.match('./index.html').catch(() => null).then((cached) => {
                    return cached || caches.match(e.request).catch(() => null);
                });
            })
        );
        return;
    }

    // 3. Static Assets: Cache-first dengan network fallback dan dynamic cache
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone).catch(() => {})).catch(() => {});
                }
                return networkResponse;
            });
        }).catch(() => {
            return caches.match(e.request).catch(() => null).then((fallback) => {
                return fallback || new Response(null, { status: 503, statusText: 'Service Unavailable' });
            });
        })
    );
});
