const CACHE_NAME = "yeom-v1";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./login.html",
  "./profile.html",
  "./home.html",

  "./login.js",
  "./profile.js",
  "./fbase.js",

  "./profile.css",
  "./home.css",

  "./yeom_img.png",
  "./profile.png",
  "./home.png",
  "./search.png",
  "./upload.png",
  "./lumi2.png",
  "./person.png"
];

/* Install */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* Activate */
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
  self.clients.claim();
});

/* Fetch */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 🚫 Don't cache Firebase / auth requests
  if (request.url.includes("firebase")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request);
    })
  );
});
