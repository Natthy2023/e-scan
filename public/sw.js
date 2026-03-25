// Service Worker for ኢ - Scan
// Provides offline support and advanced caching

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `escan-${CACHE_VERSION}`;

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/assets/images/hero.png',
  '/assets/images/landscape.png',
  '/assets/images/abay dam.png',
  '/assets/images/omo-river-valley.png',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (Firebase, Gemini API)
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Determine cache strategy based on request
  const strategy = getCacheStrategy(url);

  event.respondWith(
    handleRequest(request, strategy)
  );
});

// Get cache strategy based on URL
function getCacheStrategy(url) {
  const pathname = url.pathname;

  // HTML - Network first (always get latest)
  if (pathname.endsWith('.html') || pathname === '/') {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }

  // Static assets - Cache first
  if (
    pathname.includes('/assets/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.mp4')
  ) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }

  // Default - Network first
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Handle request based on strategy
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);
    
    default:
      return networkFirst(request);
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline uploads (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scans') {
    event.waitUntil(syncScans());
  }
});

async function syncScans() {
  // Placeholder for syncing offline scans when back online
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ኢ - Scan';
  const options = {
    body: data.body || 'New notification',
    icon: '/assets/images/artboard-1.svg',
    badge: '/assets/images/artboard-1.svg',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
