importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

const CACHE_NAME = "story-me-v4";
const RUNTIME_CACHE = "story-me-runtime-v4";

workbox.setConfig({
  debug: false,
});

workbox.routing.registerRoute(
  ({ request }) => request.destination === "document",
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: RUNTIME_CACHE,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new workbox.strategies.CacheFirst({
    cacheName: "story-me-images-v1",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  new RegExp("/v1/"),
  new workbox.strategies.NetworkFirst({
    cacheName: "story-me-api-v1",
    networkTimeoutSeconds: 3,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  })
);
workbox.routing.registerRoute(
  ({ url }) => url.pathname === "/saved-stories",
  new workbox.strategies.NetworkFirst({
    cacheName: "saved-stories",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  })
);
workbox.routing.registerRoute(
  ({ url }) =>
    url.pathname.includes("analytics") ||
    url.pathname.includes("sockjs-node") ||
    url.pathname.includes("hot-update") ||
    url.pathname.includes("sw.js"),
  new workbox.strategies.NetworkOnly()
);

workbox.precaching.precacheAndRoute([
  { url: "/", revision: "v4" },
  { url: "/index.html", revision: "v4" },
  { url: "/manifest.json", revision: "v4" },
  { url: "/styles/styles.css", revision: "v4" },
  { url: "/scripts/index.js", revision: "v4" },
  { url: "/favicon.png", revision: "v4" },
  { url: "/icons/icon-72x72.png", revision: "v4" },
  { url: "/icons/icon-96x96.png", revision: "v4" },
  { url: "/icons/icon-128x128.png", revision: "v4" },
  { url: "/icons/icon-144x144.png", revision: "v4" },
  { url: "/icons/icon-152x152.png", revision: "v4" },
  { url: "/icons/icon-192x192.png", revision: "v4" },
  { url: "/icons/icon-384x384.png", revision: "v4" },
  { url: "/icons/icon-512x512.png", revision: "v4" },
  { url: "/saved-stories", revision: "v4" },
  { url: "/scripts/pages/saved-stories/saved-stories-page.js", revision: "v4" },
  { url: "/scripts/services/Database.js", revision: "v4" },
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
    revision: "1",
  },
  { url: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", revision: "1" },
  { url: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", revision: "1" },
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/sweetalert2/11.12.4/sweetalert2.min.css",
    revision: "1",
  },
  {
    url: "https://cdnjs.cloudflare.com/ajax/libs/sweetalert2/11.12.4/sweetalert2.min.js",
    revision: "1",
  },
]);

self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("Service Worker installed");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "Story Me",
    body: "Ada cerita baru yang menarik!",
    url: "/",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: { url: data.url },
      actions: [
        { action: "view", title: "Lihat" },
        { action: "dismiss", title: "Tutup" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view" || !event.action) {
    const urlToOpen = event.notification.data?.url || "/";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === urlToOpen && "focus" in client) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});
