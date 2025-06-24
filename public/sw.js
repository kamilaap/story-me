importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js"
);

const CACHE_NAME = "story-me-v6";
const RUNTIME_CACHE = "story-me-runtime-v6";

workbox.setConfig({
  debug: false,
});

workbox.routing.registerRoute(
  ({ url }) =>
    url.pathname.includes("screenshots") ||
    url.pathname.includes("analytics") ||
    url.pathname.includes("sockjs-node") ||
    url.pathname.includes("hot-update") ||
    url.pathname.includes("sw.js"),
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
  new workbox.strategies.NetworkFirst({
    cacheName: "story-me-images-v3",
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
          console.log("Image failed to load, trying fallback");
          return null;
        },
        requestWillFetch: async ({ request }) => {
          console.log("Fetching image:", request.url);
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
    cacheName: "dicoding-images-v1",
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
          console.log("Dicoding API image failed to load");
          return new Response("", { status: 404 });
        },
      },
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) => {
    const baseUrl =
      typeof CONFIG !== "undefined"
        ? CONFIG.BASE_URL
        : "https://story-api.dicoding.dev";
    return url.href.includes(`${baseUrl}/v1/`);
  },
  new workbox.strategies.NetworkFirst({
    cacheName: "story-me-api-v3",
    networkTimeoutSeconds: 5,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) => url.href.includes("tile.openstreetmap.org"),
  new workbox.strategies.CacheFirst({
    cacheName: "map-tiles-v3",
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
          console.log(
            "Map tile unavailable, serving placeholder:",
            request.url
          );

          const svgContent = `
            <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
              <rect width="256" height="256" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
              <text x="128" y="128" text-anchor="middle" dominant-baseline="middle" 
                    font-family="Arial" font-size="14" fill="#999">Offline</text>
              <text x="128" y="148" text-anchor="middle" dominant-baseline="middle" 
                    font-family="Arial" font-size="10" fill="#ccc">No Connection</text>
            </svg>
          `;

          return new Response(svgContent, {
            status: 200,
            statusText: "OK",
            headers: {
              "Content-Type": "image/svg+xml",
              "Cache-Control": "no-cache",
            },
          });
        },
        cacheWillUpdate: async ({ response }) => {
          return response.status === 200 ? response : null;
        },
      },
    ],
  })
);

workbox.precaching.precacheAndRoute([
  { url: "/", revision: "v6" },
  { url: "/index.html", revision: "v6" },
  { url: "/manifest.json", revision: "v6" },
  { url: "/styles/styles.css", revision: "v6" },
  { url: "/favicon.png", revision: "v6" },
  { url: "/icons/icon-72x72.png", revision: "v6" },
  { url: "/icons/icon-96x96.png", revision: "v6" },
  { url: "/icons/icon-128x128.png", revision: "v6" },
  { url: "/icons/icon-144x144.png", revision: "v6" },
  { url: "/icons/icon-152x152.png", revision: "v6" },
  { url: "/icons/icon-192x192.png", revision: "v6" },
  { url: "/icons/icon-384x384.png", revision: "v6" },
  { url: "/icons/icon-512x512.png", revision: "v6" },
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
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache
          .addAll(["/offline.html"])
          .catch((err) => {
            console.log("Failed to cache offline resources:", err);
            return Promise.resolve();
          });
      })
      .then(() => {
        console.log("Service Worker installed successfully");
        self.skipWaiting();
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  const cacheWhitelist = [
    CACHE_NAME,
    RUNTIME_CACHE,
    "map-tiles-v3",
    "story-me-images-v3",
    "dicoding-images-v1",
    "story-me-api-v3",
  ];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker activated successfully");
        self.clients.claim();
      })
  );
});

self.addEventListener("unhandledrejection", (event) => {
  console.log("Unhandled promise rejection in SW:", event.reason);
  event.preventDefault();
});

self.addEventListener("fetch", (event) => {
  if (
    !event.request.url.includes("chrome-extension://") &&
    !event.request.url.includes("moz-extension://")
  ) {
    if (event.request.url.includes("tile.openstreetmap.org")) {
      console.log("Intercepting map tile request:", event.request.url);
    }
  }
});
