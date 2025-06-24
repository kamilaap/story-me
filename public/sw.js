importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

const CACHE_NAME = "story-me-v7";
const RUNTIME_CACHE = "story-me-runtime-v7";

workbox.setConfig({
  debug: false,
});

workbox.routing.registerRoute(
  ({ url }) =>
    url.pathname.includes("screenshots") ||
    url.pathname.includes("analytics") ||
    url.pathname.includes("sockjs-node") ||
    url.pathname.includes("hot-update") ||
    url.pathname.includes("sw.js") ||
    url.pathname.includes("service-worker") ||
    url.protocol === "chrome-extension:" ||
    url.protocol === "moz-extension:",
  new workbox.strategies.NetworkOnly()
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "document",
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 24 * 60 * 60,
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      {
        handlerDidError: async ({ request }) => {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/offline.html');
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            `<!DOCTYPE html>
            <html>
            <head><title>Offline</title></head>
            <body>
              <h1>You're offline</h1>
              <p>Please check your internet connection and try again.</p>
            </body>
            </html>`,
            {
              status: 200,
              statusText: "OK",
              headers: { "Content-Type": "text/html" }
            }
          );
        }
      }
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
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new workbox.strategies.NetworkFirst({
    cacheName: "story-me-images-v4",
    networkTimeoutSeconds: 10,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
      {
        handlerDidError: async () => {
          const fallbackImage =
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="transparent"/></svg>';
          return fetch(fallbackImage);
        },
        requestWillFetch: async ({ request }) => {
          return request;
        },
      },
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) =>
    url.hostname === "story-api.dicoding.dev" &&
    url.pathname.includes("/images/"),
  new workbox.strategies.NetworkFirst({
    cacheName: "dicoding-images-v2",
    networkTimeoutSeconds: 15,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60,
      }),
      {
        handlerDidError: async () => {
          return new Response("", {
            status: 200,
            statusText: "OK",
            headers: { "Content-Type": "image/svg+xml" },
          });
        },
      },
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) => {
    const baseUrl = "https://story-api.dicoding.dev";
    return url.href.includes(`${baseUrl}/v1/`);
  },
  new workbox.strategies.NetworkFirst({
    cacheName: "story-me-api-v4",
    networkTimeoutSeconds: 8,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
      {
        handlerDidError: async () => {
          return new Response(JSON.stringify({ error: "Network unavailable" }), {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) => url.href.includes("tile.openstreetmap.org"),
  new workbox.strategies.CacheFirst({
    cacheName: "map-tiles-v4",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 14 * 24 * 60 * 60,
      }),
      {
        handlerDidError: async ({ request }) => {
          const svgContent = `<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
            <text x="128" y="128" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial" font-size="14" fill="#999">Offline</text>
            <text x="128" y="148" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial" font-size="10" fill="#ccc">No Connection</text>
          </svg>`;

          return new Response(svgContent, {
            status: 200,
            statusText: "OK",
            headers: {
              "Content-Type": "image/svg+xml",
              "Cache-Control": "no-cache",
            },
          });
        },
        cacheWillUpdate: async ({ request, response }) => {
          return response && response.status === 200 ? response : null;
        },
      },
    ],
  })
);

const precacheResources = [
  { url: "/", revision: "v7-001" },
  { url: "/index.html", revision: "v7-001" },
  { url: "/manifest.json", revision: "v7-001" },
  { url: "/offline.html", revision: "v7-001" },
];

try {
  workbox.precaching.precacheAndRoute(precacheResources);
} catch (error) {
  console.error("Precaching failed:", error);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.add("/offline.html").catch((err) => {
          console.warn("Failed to cache offline.html:", err);
          return Promise.resolve();
        });
      }),
      self.skipWaiting(),
    ])
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [
    CACHE_NAME,
    RUNTIME_CACHE,
    "map-tiles-v4",
    "story-me-images-v4",
    "dicoding-images-v2",
    "story-me-api-v4",
  ];

  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      }),
      self.clients.claim(),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  if (
    !event.request.url.startsWith("http") ||
    event.request.url.includes("chrome-extension://") ||
    event.request.url.includes("moz-extension://")
  ) {
    return;
  }
});

self.addEventListener("unhandledrejection", (event) => {
  console.warn("Unhandled promise rejection in SW:", event.reason);
  event.preventDefault();
});

self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error);
});