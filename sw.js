const CACHE_NAME = 'portfolio-v5';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './worker.js',
    './photo.webp',
    './projects/tembusptn.html',
    './projects/case-study.css'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    const isAppCache = key.startsWith('portfolio-') || key.startsWith('api-cache-');
                    if (isAppCache && key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    let url;
    try {
        url = new URL(e.request.url);
    } catch (_) {
        return;
    }

    // Third-party requests (Firestore, fonts, analytics) go straight to the network.
    // Intercepting them here used to fabricate 503s and could serve stale data.
    if (url.origin !== self.location.origin) return;

    // Navigation: network-first with the cached shell as offline fallback.
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone)).catch(() => {});
                }
                return networkResponse;
            }).catch(() => {
                return caches.match(e.request).then((cached) => cached || caches.match('./index.html'));
            })
        );
        return;
    }

    // Static assets: stale-while-revalidate.
    e.respondWith(
        caches.match(e.request).then((cached) => {
            const network = fetch(e.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone)).catch(() => {});
                }
                return networkResponse;
            });

            if (cached) {
                e.waitUntil(network.catch(() => {}));
                return cached;
            }

            return network.catch(() => new Response(null, { status: 503, statusText: 'Service Unavailable' }));
        })
    );
});
