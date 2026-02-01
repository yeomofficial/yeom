const CACHE_NAME = "yeom-v1.1";

/**
 *  IMPORTANT:
 * Only cache files that are STABLE and READY.
 * DO NOT cache CSS/JS during active development.
 */
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./login.html",
  "./home.html",

  // Images (safe to cache)
  "./yeom_img.png",
  "./profile.png",
  "./home.png",
  "./search.png",
  "./upload.png",
  "./lumi2.png",
  "./person.png"
];

/* -------------------- INSTALL -------------------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Activate immediately
  self.skipWaiting();
});

/* -------------------- ACTIVATE -------------------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  // Take control of all clients immediately
  self.clients.claim();
});

/* -------------------- FETCH -------------------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // ❌ Never cache Firebase, auth, or dynamic requests
  if (
    request.url.includes("firebase") ||
    request.url.includes("firestore") ||
    request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      // Serve from cache if available
      if (cached) return cached;

      // Otherwise fetch from network (NO caching for CSS/JS)
      return fetch(request);
    })
  );
});
