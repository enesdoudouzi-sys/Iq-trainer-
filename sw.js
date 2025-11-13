// Service Worker with Advanced Caching Strategies
// Version 2.0 - with Runtime Caching, Cache Versioning, and Cleanup

const CACHE_VERSION = '2.0.0';
const CACHE_NAMES = {
  SHELL: `iq-trainer-shell-${CACHE_VERSION}`,
  IMAGES: `iq-trainer-images-${CACHE_VERSION}`,
  VIDEOS: `iq-trainer-videos-${CACHE_VERSION}`,
  API: `iq-trainer-api-${CACHE_VERSION}`,
  DYNAMIC: `iq-trainer-dynamic-${CACHE_VERSION}`
};

// URLs to precache (App Shell)
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'icons/icon-72x72.png',
  'icons/icon-96x96.png',
  'icons/icon-152x152.png',
  'icons/icon-180x180.png',
  'icons/icon-167x167.png'
];

// External CDN resources to precache
const cdnUrls = [
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Poppins:wght@400;600;700&display=swap'
];

// =====================
// Install Event - Precache App Shell
// =====================
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache app shell (HTML, manifest, critical assets)
      caches.open(CACHE_NAMES.SHELL).then((cache) => {
        return cache.addAll(urlsToCache);
      }),
      // Precache CDN resources
      caches.open(CACHE_NAMES.API).then((cache) => {
        return Promise.allSettled(
          cdnUrls.map(url => cache.add(url).catch(() => {
            console.log(`Failed to precache ${url} - will cache at runtime`);
          }))
        );
      })
    ]).then(() => {
      // Skip waiting to activate immediately
      self.skipWaiting();
    })
  );
});

// =====================
// Activate Event - Cleanup Old Caches
// =====================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete caches that don't match current version
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// =====================
// Fetch Event - Smart Routing & Runtime Caching
// =====================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different content types with appropriate strategies
  
  // 1. Images - Stale While Revalidate (cache first, update in background)
  if (isImageRequest(url)) {
    event.respondWith(
      caches.open(CACHE_NAMES.IMAGES).then((cache) => {
        return cache.match(request).then((response) => {
          // Return cached version while fetching fresh copy
          if (response) {
            // Fetch fresh version in background
            fetch(request).then((freshResponse) => {
              if (freshResponse && freshResponse.status === 200) {
                cache.put(request, freshResponse.clone());
              }
            }).catch(() => {
              // Network error - use cached version
            });
            return response;
          }
          // Not in cache, fetch and store
          return fetch(request).then((freshResponse) => {
            if (freshResponse && freshResponse.status === 200) {
              cache.put(request, freshResponse.clone());
            }
            return freshResponse;
          });
        });
      }).catch(() => {
        // Cache/network error - return placeholder
        return new Response('Image not available', {
          status: 404,
          statusText: 'Not Found'
        });
      })
    );
    return;
  }

  // 2. Videos - Network First with Cache Fallback (allow streaming)
  if (isVideoRequest(url)) {
    event.respondWith(
      fetch(request).then((response) => {
        // Only cache successful responses to avoid storing errors
        if (response && response.status === 200) {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAMES.VIDEOS).then((cache) => {
            cache.put(request, cacheCopy);
          });
        }
        return response;
      }).catch(() => {
        // Network error - try cache
        return caches.open(CACHE_NAMES.VIDEOS).then((cache) => {
          return cache.match(request).then((response) => {
            return response || new Response('Video not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        });
      })
    );
    return;
  }

  // 3. API/External Resources - Network First with Cache Fallback
  if (isExternalRequest(url)) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response && response.status === 200) {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAMES.API).then((cache) => {
            cache.put(request, cacheCopy);
          });
        }
        return response;
      }).catch(() => {
        return caches.open(CACHE_NAMES.API).then((cache) => {
          return cache.match(request);
        });
      })
    );
    return;
  }

  // 4. HTML & JS - Cache First, Network Second (with update check)
  if (isHtmlRequest(url) || isJsRequest(url)) {
    event.respondWith(
      caches.open(CACHE_NAMES.SHELL).then((cache) => {
        return cache.match(request).then((response) => {
          return response || fetch(request).then((fetchResponse) => {
            if (fetchResponse && fetchResponse.status === 200) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // 5. Default - Network First with Cache Fallback
  event.respondWith(
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        const cacheCopy = response.clone();
        caches.open(CACHE_NAMES.DYNAMIC).then((cache) => {
          cache.put(request, cacheCopy);
        });
      }
      return response;
    }).catch(() => {
      return caches.open(CACHE_NAMES.DYNAMIC).then((cache) => {
        return cache.match(request);
      });
    })
  );
});

// =====================
// Push Notifications
// =====================
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your daily training!',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    tag: 'iq-trainer-notification',
    requireInteraction: false,
    data: {
      dateOfArrival: Date.now(),
      url: '/'
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Daily IQ & Focus Trainer', options)
  );
});

// =====================
// Notification Click Handler
// =====================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].url === '/' && 'focus' in clientList[i]) {
            return clientList[i].focus();
          }
        }
        // Open new window if not already open
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// =====================
// Background Sync (periodic)
// =====================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-history') {
    event.waitUntil(
      // Future: sync local history to server if needed
      Promise.resolve()
    );
  }
});

// =====================
// Helper Functions
// =====================
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url.pathname) ||
         url.origin.includes('cdn.jsdelivr.net') && url.pathname.includes('image');
}

function isVideoRequest(url) {
  return /\.(mp4|webm|ogg|mov)$/i.test(url.pathname) ||
         url.hostname.includes('youtube.com') ||
         url.hostname.includes('vimeo.com');
}

function isExternalRequest(url) {
  return url.origin !== self.location.origin &&
         (url.hostname.includes('googleapis.com') ||
          url.hostname.includes('gstatic.com') ||
          url.hostname.includes('cdn.jsdelivr.net') ||
          url.hostname.includes('fonts.'));
}

function isHtmlRequest(url) {
  return url.pathname.endsWith('.html') || url.pathname.endsWith('/');
}

function isJsRequest(url) {
  return /\.(js|mjs)$/i.test(url.pathname);
}

// =====================
// Message Handler (for cache management from client)
// =====================
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'clearCache') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data && event.data.action === 'getCacheStats') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.open(cacheName).then((cache) => {
            return cache.keys().then((requests) => ({
              name: cacheName,
              size: requests.length
            }));
          });
        })
      );
    }).then((stats) => {
      event.ports[0].postMessage({ stats, success: true });
    });
  }
});
