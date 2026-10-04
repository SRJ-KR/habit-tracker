const CACHE_NAME = "daymark-shell-v14";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("daymark-shell-") && key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  if (!APP_SHELL.some(path => new URL(path, self.registration.scope).pathname === url.pathname)) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
