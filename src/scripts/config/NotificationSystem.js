import CONFIG from "./config.js";

class NotificationSystem {
  constructor() {
    this.vapidPublicKey = CONFIG.VAPID.PUBLIC_KEY;
    this.baseUrl = CONFIG.BASE_URL;
    this.notificationCount = 0;
    this.isSubscribed = false;
    this.serviceWorkerRegistration = null;
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.registerServiceWorker();
    await this.checkNotificationSupport();
    await this.checkSubscriptionStatus();
    this.updateUI();
  }

  setupEventListeners() {
    const notificationBtn = document.getElementById("notification-btn");
    if (notificationBtn) {
      notificationBtn.addEventListener("click", () =>
        this.showNotificationPanel()
      );
    }
  }

  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker tidak didukung di browser ini");
      return null;
    }

    try {
      const possiblePaths = ["/sw.js", "./sw.js", "/scripts/sw.js", "../sw.js"];

      let registration = null;

      for (const path of possiblePaths) {
        try {
          console.log(`Mencoba mendaftarkan Service Worker di: ${path}`);

          const testResponse = await fetch(path, { method: "HEAD" });
          if (testResponse.ok) {
            registration = await navigator.serviceWorker.register(path, {
              scope: "/",
            });
            console.log("Service Worker berhasil terdaftar:", registration);
            this.serviceWorkerRegistration = registration;
            break;
          }
        } catch (error) {
          console.log(`Path ${path} tidak berhasil:`, error.message);
          continue;
        }
      }

      if (!registration) {
        console.log("Membuat Service Worker inline sebagai fallback");
        registration = await this.createInlineServiceWorker();
      }

      return registration;
    } catch (error) {
      console.error("Service Worker registration gagal:", error);
      return null;
    }
  }

  async createInlineServiceWorker() {
    const serviceWorkerCode = `
            const CACHE_NAME = 'story-me-v1';
            const urlsToCache = [
                '/',
                '/index.html'
            ];

            self.addEventListener('install', function(event) {
                console.log('Service Worker installing');
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            return cache.addAll(urlsToCache);
                        })
                        .catch(function(error) {
                            console.log('Cache addAll failed:', error);
                        })
                );
            });

            self.addEventListener('fetch', function(event) {
                event.respondWith(
                    caches.match(event.request)
                        .then(function(response) {
                            return response || fetch(event.request);
                        })
                        .catch(function(error) {
                            console.log('Fetch failed:', error);
                            return new Response('Offline');
                        })
                );
            });

            self.addEventListener('push', function(event) {
                console.log('Push event received:', event);
                
                let notificationData = {
                    title: 'Story Me',
                    body: 'Ada update baru!',
                    icon: '/public/favicon.png',
                    badge: '/public/favicon.png',
                    tag: 'story-notification',
                    requireInteraction: false
                };

                if (event.data) {
                    try {
                        const data = event.data.json();
                        console.log('Push data received:', data);
                        
                        // Handle format dari API: { title: "...", options: { body: "..." } }
                        notificationData = {
                            title: data.title || notificationData.title,
                            body: data.options?.body || data.body || notificationData.body,
                            icon: data.options?.icon || notificationData.icon,
                            badge: data.options?.badge || notificationData.badge,
                            tag: data.options?.tag || notificationData.tag,
                            requireInteraction: data.options?.requireInteraction || notificationData.requireInteraction,
                            data: data.options?.data || { url: '/' }
                        };
                    } catch (e) {
                        console.log('Push data bukan JSON, menggunakan text:', e);
                        notificationData.body = event.data.text() || notificationData.body;
                    }
                }

                event.waitUntil(
                    self.registration.showNotification(notificationData.title, {
                        body: notificationData.body,
                        icon: notificationData.icon,
                        badge: notificationData.badge,
                        tag: notificationData.tag,
                        requireInteraction: notificationData.requireInteraction,
                        data: notificationData.data,
                        actions: [
                            {
                                action: 'view',
                                title: 'Lihat'
                            },
                            {
                                action: 'close',
                                title: 'Tutup'
                            }
                        ]
                    }).catch(error => {
                        console.error('Failed to show notification:', error);
                    })
                );
            });

            self.addEventListener('notificationclick', function(event) {
                console.log('Notification clicked:', event);
                event.notification.close();
                
                if (event.action === 'view' || !event.action) {
                    const urlToOpen = event.notification.data?.url || '/';
                    
                    event.waitUntil(
                        clients.matchAll({ type: 'window', includeUncontrolled: true })
                            .then(function(clientList) {
                                for (const client of clientList) {
                                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                                        return client.focus();
                                    }
                                }
                                if (clients.openWindow) {
                                    return clients.openWindow(urlToOpen);
                                }
                            })
                            .catch(error => {
                                console.error('Failed to handle notification click:', error);
                            })
                    );
                }
            });

            self.addEventListener('notificationclose', function(event) {
                console.log('Notification closed', event);
            });
        `;

    const blob = new Blob([serviceWorkerCode], {
      type: "application/javascript",
    });
    const swUrl = URL.createObjectURL(blob);

    try {
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: "/",
      });
      console.log("Inline Service Worker berhasil terdaftar:", registration);
      this.serviceWorkerRegistration = registration;
      return registration;
    } catch (error) {
      console.error("Inline Service Worker registration gagal:", error);
      return null;
    }
  }

  async checkNotificationSupport() {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker tidak didukung");
      return false;
    }

    if (!("Notification" in window)) {
      console.warn("Web Notifications tidak didukung");
      return false;
    }

    if (!("PushManager" in window)) {
      console.warn("Push API tidak didukung");
      return false;
    }

    return true;
  }

  isNotificationSupported() {
    return (
      "serviceWorker" in navigator &&
      "Notification" in window &&
      "PushManager" in window
    );
  }

  async checkSubscriptionStatus() {
    try {
      let registration = this.serviceWorkerRegistration;

      if (!registration) {
        console.log("Menunggu service worker ready...");
        registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Service Worker timeout")), 3000)
          ),
        ]);
      }

      const subscription = await registration.pushManager.getSubscription();
      this.isSubscribed = !!subscription;

      const savedCount = localStorage.getItem("notification_count");
      this.notificationCount = savedCount ? parseInt(savedCount) : 0;

      console.log("Subscription status:", this.isSubscribed);
    } catch (error) {
      console.error("Error checking subscription:", error);
      this.isSubscribed = false;
    }
  }

  updateUI() {
    const notificationBtn = document.getElementById("notification-btn");
    const badge = document.getElementById("notification-badge");

    if (notificationBtn) {
      notificationBtn.classList.remove(
        "active",
        "denied",
        "pending",
        "unsupported"
      );
      this.updateNotificationIcon(notificationBtn);

      if (badge) {
        if (this.notificationCount > 0) {
          badge.textContent = this.notificationCount;
          badge.classList.remove("hidden");
        } else {
          badge.classList.add("hidden");
        }
      }
    }
  }

  updateNotificationIcon(button) {
    const permission = Notification.permission;
    const isSupported = this.isNotificationSupported();

    let iconSvg = "";
    let statusClass = "";

    if (!isSupported) {
      statusClass = "unsupported";
      iconSvg = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="#ff4757" stroke-width="3"/>
                </svg>
            `;
    } else if (permission === "denied") {
      statusClass = "denied";
      iconSvg = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#ff4757" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="#ff4757" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="#ff4757" stroke-width="2"/>
                </svg>
            `;
    } else if (permission === "granted" && this.isSubscribed) {
      statusClass = "active";
      iconSvg = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    <circle cx="18" cy="6" r="3" fill="#2ecc71" stroke="#2ecc71"/>
                    <path d="m16.5 7.5 1 1 3-3" stroke="white" stroke-width="1.5" fill="none"/>
                </svg>
            `;
    } else if (permission === "granted" && !this.isSubscribed) {
      statusClass = "pending";
      iconSvg = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    <circle cx="18" cy="6" r="3" fill="#f39c12" stroke="#f39c12"/>
                    <text x="18" y="9" text-anchor="middle" fill="white" font-size="6" font-weight="bold">!</text>
                </svg>
            `;
    } else {
      statusClass = "pending";
      iconSvg = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    <circle cx="18" cy="6" r="3" fill="#95a5a6" stroke="#95a5a6"/>
                    <text x="18" y="9" text-anchor="middle" fill="white" font-size="6" font-weight="bold">?</text>
                </svg>
            `;
    }

    button.innerHTML = iconSvg;
    button.classList.add(statusClass);
    this.updateTooltip(button, permission, isSupported);
  }

  updateTooltip(button, permission, isSupported) {
    let tooltip = "";

    if (!isSupported) {
      tooltip = "Notifikasi tidak didukung di browser ini";
    } else if (permission === "denied") {
      tooltip = "Notifikasi diblokir - Klik untuk pengaturan";
    } else if (permission === "granted" && this.isSubscribed) {
      tooltip = `Notifikasi aktif${
        this.notificationCount > 0 ? ` (${this.notificationCount} baru)` : ""
      }`;
    } else if (permission === "granted" && !this.isSubscribed) {
      tooltip = "Notifikasi diizinkan - Klik untuk mengaktifkan";
    } else {
      tooltip = "Klik untuk mengaktifkan notifikasi";
    }

    button.title = tooltip;
  }

  async showNotificationPanel() {
    const isSupported = await this.checkNotificationSupport();

    if (!isSupported) {
      Swal.fire({
        icon: "error",
        title: "Notifikasi Tidak Didukung",
        text: "Browser Anda tidak mendukung notifikasi web.",
        confirmButtonColor: "#b47eb1",
      });
      return;
    }

    const permission = Notification.permission;
    let statusText = "";
    let statusClass = "";
    let actions = "";
    let statusIcon = "";

    switch (permission) {
      case "granted":
        if (this.isSubscribed) {
          statusText = "Aktif - Anda akan menerima notifikasi";
          statusClass = "status-active";
          statusIcon = "🟢";
        } else {
          statusText = "Diizinkan - Belum berlangganan";
          statusClass = "status-pending";
          statusIcon = "🟡";
        }
        actions = this.isSubscribed
          ? '<button class="btn-disable" onclick="window.notificationSystem.unsubscribe()">Nonaktifkan</button>'
          : '<button class="btn-enable" onclick="window.notificationSystem.subscribe()">Aktifkan Notifikasi</button>';
        break;
      case "denied":
        statusText = "Ditolak - Notifikasi diblokir";
        statusClass = "status-inactive";
        statusIcon = "🔴";
        actions =
          '<p style="color: #e74c3c; font-size: 0.9rem;">Untuk mengaktifkan, ubah pengaturan browser Anda.</p>';
        break;
      default:
        statusText = "Belum diatur - Klik untuk mengaktifkan";
        statusClass = "status-inactive";
        statusIcon = "⚪";
        actions =
          '<button class="btn-enable" onclick="window.notificationSystem.requestPermission()">Minta Izin</button>';
    }

    const html = `
            <div class="notification-status">
                <span class="status-indicator ${statusClass}">${statusIcon}</span>
                <span>${statusText}</span>
            </div>
            <p style="margin: 1rem 0; color: #5a4a5b;">
                Dapatkan notifikasi saat ada update cerita baru atau saat Anda berhasil membuat cerita.
            </p>
            <div class="notification-controls">
                ${actions}
            </div>
        `;

    Swal.fire({
      title: "🔔 Pengaturan Notifikasi",
      html: html,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Tutup",
      width: "500px",
      customClass: {
        popup: "notification-popup",
      },
    });

    this.notificationCount = 0;
    localStorage.setItem("notification_count", "0");
    this.updateUI();
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      this.updateUI();

      if (permission === "granted") {
        Swal.fire({
          icon: "success",
          title: "Izin Diberikan!",
          text: "Sekarang Anda dapat mengaktifkan notifikasi.",
          confirmButtonColor: "#b47eb1",
        }).then(() => {
          this.showNotificationPanel();
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Izin Ditolak",
          text: "Notifikasi tidak dapat diaktifkan karena izin ditolak.",
          confirmButtonColor: "#b47eb1",
        });
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal meminta izin notifikasi.",
        confirmButtonColor: "#b47eb1",
      });
    }
  }

  async subscribe() {
    let loadingDialog = null;

    try {
      loadingDialog = Swal.fire({
        title: "Mengaktifkan Notifikasi...",
        allowOutsideClick: false,
        timer: 15000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let registration = this.serviceWorkerRegistration;
      try {
  registration = await navigator.serviceWorker.ready;
  console.log('✅ Service Worker is ready');
} catch (e) {
  console.error('❌ Gagal mendapatkan service worker:', e);
  throw new Error("Service Worker belum siap.");
}

      if (!registration) {
        console.log("Menunggu service worker ready untuk subscription...");
        registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(new Error("Service Worker timeout after 10 seconds")),
              10000
            )
          ),
        ]);
      }

      const vapidKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

      const subscription = await Promise.race([
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Subscription timeout after 8 seconds")),
            8000
          )
        ),
      ]);

      const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error(
          "Token tidak ditemukan. Silakan login terlebih dahulu."
        );
      }

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("p256dh"))
            )
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")))
          ),
        },
      };

      console.log("Mengirim subscription data ke server:", subscriptionData);

      const response = await fetch(`${this.baseUrl}/notifications/subscribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      console.log("Server response:", result);

      this.isSubscribed = true;
      localStorage.setItem(CONFIG.STORAGE_KEYS.NOTIFICATION_SUBSCRIBED, "true");
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.NOTIFICATION_SUBSCRIPTION,
        JSON.stringify(subscriptionData)
      );

      if (loadingDialog) {
        Swal.close();
      }

      this.updateUI();

      Swal.fire({
        icon: "success",
        title: "Notifikasi Diaktifkan!",
        text: "Anda akan menerima notifikasi untuk update terbaru.",
        confirmButtonColor: "#b47eb1",
      });

      this.showLocalNotification(
        "Notifikasi Aktif! 🎉",
        "Anda akan mendapat pemberitahuan untuk aktivitas baru."
      );
    } catch (error) {
      console.error("Error subscribing:", error);

      if (loadingDialog) {
        Swal.close();
      }

      let errorMessage = "Terjadi kesalahan saat mengaktifkan notifikasi.";

      if (error.message.includes("timeout")) {
        errorMessage =
          "Timeout: Proses terlalu lama. Coba refresh halaman dan ulangi.";
      } else if (error.message.includes("Service Worker")) {
        errorMessage =
          "Service Worker bermasalah. Coba refresh halaman dan ulangi.";
      } else if (error.message.includes("Token tidak ditemukan")) {
        errorMessage =
          "Silakan login terlebih dahulu untuk mengaktifkan notifikasi.";
      } else if (error.name === "NotAllowedError") {
        errorMessage =
          "Notifikasi ditolak oleh browser. Periksa pengaturan situs.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Browser tidak mendukung push notifications.";
      } else if (error.message.includes("HTTP error")) {
        errorMessage = `Server error: ${error.message}`;
      }

      Swal.fire({
        icon: "error",
        title: "Gagal Mengaktifkan",
        text: errorMessage,
        confirmButtonColor: "#b47eb1",
      });
    }
  }

  async unsubscribe() {
    let loadingDialog = null;

    try {
      loadingDialog = Swal.fire({
        title: "Menonaktifkan Notifikasi...",
        allowOutsideClick: false,
        timer: 8000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let registration = this.serviceWorkerRegistration;

      if (!registration) {
        registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Service Worker timeout")), 5000)
          ),
        ]);
      }

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
        if (token) {
          try {
            console.log("Mengirim unsubscribe request ke server");
            const response = await fetch(
              `${this.baseUrl}/notifications/subscribe`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  endpoint: subscription.endpoint,
                }),
              }
            );

            const result = await response.json();
            console.log("Unsubscribe server response:", result);

            if (!response.ok) {
              console.warn("Server unsubscribe failed:", result.message);
            }
          } catch (apiError) {
            console.warn("API unsubscribe error:", apiError);
          }
        }

        await subscription.unsubscribe();
      }

      this.isSubscribed = false;
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.NOTIFICATION_SUBSCRIBED,
        "false"
      );
      localStorage.removeItem(CONFIG.STORAGE_KEYS.NOTIFICATION_SUBSCRIPTION);

      if (loadingDialog) {
        Swal.close();
      }

      this.updateUI();

      Swal.fire({
        icon: "success",
        title: "Notifikasi Dinonaktifkan",
        text: "Anda tidak akan lagi menerima notifikasi.",
        confirmButtonColor: "#b47eb1",
      });
    } catch (error) {
      console.error("Error unsubscribing:", error);

      if (loadingDialog) {
        Swal.close();
      }

      Swal.fire({
        icon: "error",
        title: "Gagal Menonaktifkan",
        text: "Terjadi kesalahan saat menonaktifkan notifikasi.",
        confirmButtonColor: "#b47eb1",
      });
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  showLocalNotification(title, body, options = {}) {
    if (Notification.permission === "granted") {
      const defaultOptions = {
        icon: "/public/favicon.png",
        badge: "/public/favicon.png",
        tag: "story-notification",
        requireInteraction: false,
        ...options,
      };

      try {
        new Notification(title, {
          body: body,
          ...defaultOptions,
        });
      } catch (error) {
        console.error("Error showing local notification:", error);
      }
    }
  }

  incrementNotificationCount() {
    this.notificationCount++;
    localStorage.setItem(
      "notification_count",
      this.notificationCount.toString()
    );
    this.updateUI();
  }

  resetNotificationCount() {
    this.notificationCount = 0;
    localStorage.setItem("notification_count", "0");
    this.updateUI();
  }
}

const notificationSystem = new NotificationSystem();
window.notificationSystem = notificationSystem;

export default NotificationSystem;
