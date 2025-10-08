const CACHE_NAME = "gyanpath-v1"
const OFFLINE_URL = "/offline"

// Assets to cache on install
const STATIC_ASSETS = ["/", "/offline", "/manifest.json", "/icon-192.jpg", "/icon-512.jpg"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Skip chrome extensions and other non-http(s) requests
  if (!event.request.url.startsWith("http")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === "error") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache videos, images, and other media
          if (
            event.request.url.includes("/videos/") ||
            event.request.url.includes("/images/") ||
            event.request.url.match(/\.(jpg|jpeg|png|gif|webp|mp4|pdf)$/i)
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }

          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL)
          }
        })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-progress") {
    event.waitUntil(syncProgress())
  }
})

async function syncProgress() {
  // Sync lesson progress when back online
  const cache = await caches.open(CACHE_NAME)
  const requests = await cache.keys()

  // Process any pending progress updates
  for (const request of requests) {
    if (request.url.includes("/api/progress")) {
      try {
        await fetch(request)
        await cache.delete(request)
      } catch (error) {
        console.error("Failed to sync progress:", error)
      }
    }
  }
}
