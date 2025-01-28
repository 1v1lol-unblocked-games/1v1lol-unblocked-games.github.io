
const CACHE_NAME = 'my-site-cache-v2'; // Increment version for updates
const urlsToCache = [
    '/',
    '/styles/main.css',
    '/script/main.js',
    '/offline.html'
];

// Install event: Cache essential resources
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching files...');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // Activate the new service worker immediately
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    const cacheWhitelist = [CACHE_NAME]; // Keep only the current cache
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: Serve from cache or fallback to offline page
self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetching:', event.request.url);

    if (event.request.url.includes('/api/')) {
        // Dynamic caching for API responses
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    return caches.open('api-cache').then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Serve from cache if available
                    if (response) {
                        return response;
                    }
                    // Fetch from the network and cache it
                    return fetch(event.request).catch(() => {
                        // Serve offline fallback for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                    });
                })
        );
    }
});
