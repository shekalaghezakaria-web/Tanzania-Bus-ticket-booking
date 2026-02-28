// SafariBus Service Worker v5 - Complete PWA Support
const CACHE_NAME = "safaribus-v5";
const STATIC_CACHE = "safaribus-static-v5";
const API_CACHE = "safaribus-api-v5";

// Files to cache for offline functionality
const STATIC_FILES = [
  "/",
  "/index.html",
  "/register.html",
  "/dashboard.html",
  "/routes.html",
  "/seats.html",
  "/confirmation.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-96.svg"
];

// API endpoints to cache (optional, for offline viewing)
const API_ENDPOINTS = [
  "/api/health",
  "/api/routes"
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("[SW] Installing SafariBus PWA v5...");
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Caching static files...");
      return cache.addAll(STATIC_FILES);
    })
  );
  
  // Force the new service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating SafariBus PWA v5...");
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages
  return self.clients.claim();
});

// Fetch event - handle requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle GET requests for caching
  if (request.method !== "GET") {
    // Don't cache non-GET requests (POST, PUT, DELETE, etc.)
    event.respondWith(fetch(request));
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith("/api/")) {
    // API requests - network first, then cache
    event.respondWith(handleApiRequest(request));
  } else {
    // Static files - cache first, then network
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful GET responses for specific endpoints
    if (response.ok && API_ENDPOINTS.some(endpoint => request.url.includes(endpoint))) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log("[SW] Network failed, trying cache for:", request.url);
    
    // Try cache for read-only API endpoints
    if (API_ENDPOINTS.some(endpoint => request.url.includes(endpoint))) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return offline error
    return new Response(
      JSON.stringify({ error: "Offline - Please check your internet connection" }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Handle static file requests
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log("[SW] Network failed for static file:", request.url);
    
    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/") || new Response("Offline - SafariBus", { status: 503 });
    }
    
    throw error;
  }
}
