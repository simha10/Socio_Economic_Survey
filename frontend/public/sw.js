// sw.js - Service Worker for PWA functionality

const CACHE_NAME = 'ses-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/globals.css',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Don't cache certain types of requests
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    // For API requests, don't use cache
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ 
            error: 'Network error - please check your connection',
            offline: true 
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
  } else {
    // For static assets, try cache first
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request).catch(() => {
            // For HTML requests, return offline page
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
            
            // For other requests, return a basic response
            return new Response('Offline', { status: 503 });
          });
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});