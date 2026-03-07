const CACHE_NAME = 'un-petit-mot-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/service-worker-register.js',
    '/manifest.json'
];

// Install event - cache essential assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - cache-first strategy for assets, network-first for API
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // API calls - network first
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        return response;
                    }
                    return caches.match(request);
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Static assets - cache first
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then(response => {
                // Cache successful responses
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                }
                return response;
            });
        }).catch(() => {
            // Fallback for offline
            if (request.mode === 'navigate') {
                return caches.match('/index.html');
            }
        })
    );
});
