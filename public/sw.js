const CACHE_NAME = "gyanpath-v2"
const OFFLINE_URL = "/offline"
const RUNTIME_CACHE = "gyanpath-runtime"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon-192.jpg",
  "/icon-512.jpg",
  "/_next/static/css/app/layout.css",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
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

  // Skip Supabase API calls (let them go through)
  if (event.request.url.includes("supabase.co") || event.request.url.includes("supabase.in")) {
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

          // Cache strategy based on file type
          if (
            event.request.url.includes("/_next/static/") ||
            event.request.url.match(/\.(css|js|woff|woff2|ttf|eot)$/i)
          ) {
            // Cache static assets with cache-first strategy
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          } else if (
            event.request.url.includes("/images/") ||
            event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
          ) {
            // Cache images with network-first strategy
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          } else if (
            event.request.url.includes("/videos/") ||
            event.request.url.match(/\.(mp4|webm|ogg)$/i)
          ) {
            // Cache videos with network-first strategy
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          } else if (event.request.url.match(/\.(pdf)$/i)) {
            // Cache PDFs
            caches.open(RUNTIME_CACHE).then((cache) => {
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

          // Return cached version if available for other requests
          return caches.match(event.request)
        })
    })
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-progress") {
    event.waitUntil(syncProgress())
  }

  if (event.tag === "sync-queue") {
    event.waitUntil(syncQueue())
  }
})

async function syncProgress() {
  try {
    // This will be handled by the sync manager in the main thread
    // The service worker just triggers it
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({ type: "SYNC_PROGRESS" })
    })
  } catch (error) {
    console.error("Failed to sync progress:", error)
  }
}

async function syncQueue() {
  try {
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({ type: "SYNC_QUEUE" })
    })
  } catch (error) {
    console.error("Failed to sync queue:", error)
  }
}

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "CACHE_URLS") {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls)
      })
    )
  }
})
