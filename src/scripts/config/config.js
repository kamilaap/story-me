const CONFIG = {
  BASE_URL: "https://story-api.dicoding.dev/v1",

  ENDPOINTS: {
    REGISTER: "/register",
    LOGIN: "/login",
    STORIES: "/stories",
    STORIES_GUEST: "/stories/guest",
    DETAIL_STORY: "/stories",
    SUBSCRIBE: "/notifications/subscribe",
    UNSUBSCRIBE: "/notifications/subscribe",
  },

  MAP: {
    DEFAULT_CENTER: [-6.2088, 106.8456],
    DEFAULT_ZOOM: 10,

    TILE_LAYERS: {
      openstreetmap: {
        name: "OpenStreetMap",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      },
      satellite: {
        name: "Satellite",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        maxZoom: 19,
      },
      terrain: {
        name: "Terrain",
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        maxZoom: 17,
      },
      dark: {
        name: "Dark Mode",
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      },
      light: {
        name: "Light Mode",
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      },
    },

    MARKER_STYLES: {
      default: {
        color: "#8b5a8c",
        fillColor: "#b794b8",
        radius: 8,
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.6,
      },
      selected: {
        color: "#e53e3e",
        fillColor: "#feb2b2",
        radius: 12,
        weight: 4,
        opacity: 1,
        fillOpacity: 0.8,
      },
      cluster: {
        color: "#38a169",
        fillColor: "#68d391",
        radius: 15,
        weight: 3,
        opacity: 0.9,
        fillOpacity: 0.7,
      },
    },

    CONTROLS: {
      zoomControl: true,
      attributionControl: true,
      scaleControl: true,
      fullscreenControl: true,
      layerControl: true,
      searchControl: false,
    },

    ANIMATION: {
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      transform3DLimit: 2 ^ 23,
    },
  },
  CAMERA: {
    VIDEO_CONSTRAINTS: {
      audio: false,
      video: {
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
        facingMode: "environment",
        frameRate: { ideal: 30, min: 15 },
      },
    },

    FALLBACK_CONSTRAINTS: {
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "environment",
      },
    },

    MINIMAL_CONSTRAINTS: {
      audio: false,
      video: true,
    },

    TIMEOUT: 15000,
  },

  VAPID: {
    PUBLIC_KEY:
      "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk",
  },

  STORAGE_KEYS: {
    TOKEN: "story_token",
    USER: "story_user",
    NOTIFICATION_SUBSCRIBED: "notification_subscribed",
    NOTIFICATION_SUBSCRIPTION: "notification_subscription",
    MAP_LAYER_PREFERENCE: "map_layer_preference",
  },

  MAX_FILE_SIZE: 1024 * 1024,
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
};

const MapUtils = {
  createTileLayer(layerConfig) {
    if (!layerConfig || !layerConfig.url) {
      console.error("Invalid layer configuration:", layerConfig);
      return null;
    }

    try {
      return L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution || "",
        maxZoom: layerConfig.maxZoom || 18,
        subdomains: layerConfig.subdomains || ["a", "b", "c"],
        errorTileUrl:
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="256"%3E%3Crect width="256" height="256" fill="%23f0f0f0"/%3E%3Ctext x="128" y="128" text-anchor="middle" fill="%23999" font-size="14"%3ETile Error%3C/text%3E%3C/svg%3E',
      });
    } catch (error) {
      console.error("Error creating tile layer:", error);
      return null;
    }
  },

  initializeMapLayers() {
    const layers = {};

    Object.keys(CONFIG.MAP.TILE_LAYERS).forEach((key) => {
      const layerConfig = CONFIG.MAP.TILE_LAYERS[key];
      const layer = this.createTileLayer(layerConfig);

      if (layer) {
        layers[key] = layer;
      } else {
        console.warn(`Failed to create layer: ${key}`);
      }
    });

    if (Object.keys(layers).length === 0) {
      console.warn(
        "No valid layers found, creating fallback OpenStreetMap layer"
      );
      layers.openstreetmap = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }
      );
    }

    return layers;
  },

  initializeMap(containerId, options = {}) {
    try {
      const defaultOptions = {
        center: CONFIG.MAP.DEFAULT_CENTER,
        zoom: CONFIG.MAP.DEFAULT_ZOOM,
        zoomControl: CONFIG.MAP.CONTROLS.zoomControl,
        attributionControl: CONFIG.MAP.CONTROLS.attributionControl,
        ...options,
      };

      const map = L.map(containerId, defaultOptions);

      const mapLayers = this.initializeMapLayers();

      const defaultLayer = options.defaultLayer || this.getLayerPreference();
      if (mapLayers[defaultLayer]) {
        mapLayers[defaultLayer].addTo(map);
      } else if (mapLayers.openstreetmap) {
        mapLayers.openstreetmap.addTo(map);
      }

      return { map, mapLayers };
    } catch (error) {
      console.error("Error initializing map:", error);
      throw new Error("Failed to initialize map: " + error.message);
    }
  },

  createCustomMarker(story, isSelected = false) {
    const style = isSelected
      ? CONFIG.MAP.MARKER_STYLES.selected
      : CONFIG.MAP.MARKER_STYLES.default;

    return L.divIcon({
      className: "custom-story-marker",
      html: `
        <div class="marker-container ${isSelected ? "selected" : ""}" 
             style="
               background: linear-gradient(135deg, ${style.fillColor}, ${
        style.color
      });
               width: ${style.radius * 2}px;
               height: ${style.radius * 2}px;
               border-radius: 50% 50% 50% 0;
               transform: rotate(-45deg);
               border: ${style.weight}px solid white;
               box-shadow: 0 3px 10px rgba(139, 90, 140, 0.4);
               position: relative;
             ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            font-size: ${style.radius}px;
            color: white;
          ">📍</div>
        </div>
      `,
      iconSize: [style.radius * 2, style.radius * 2],
      iconAnchor: [style.radius, style.radius * 2],
      popupAnchor: [0, -style.radius * 2],
    });
  },

  createPopupContent(story) {
    return `
      <div class="story-popup" style="max-width: 250px; font-family: 'Segoe UI', system-ui, sans-serif;">
        <div class="popup-image-container" style="position: relative; margin-bottom: 12px;">
          <img src="${story.photoUrl}" 
               alt="Foto cerita: ${this.escapeHtml(story.description)}" 
               style="
                 width: 100%; 
                 height: 120px; 
                 object-fit: cover; 
                 border-radius: 8px; 
                 box-shadow: 0 2px 8px rgba(0,0,0,0.1);
               "
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div style="
            display: none;
            width: 100%;
            height: 120px;
            background: linear-gradient(135deg, #e8d8ea, #d4b8d6);
            border-radius: 8px;
            align-items: center;
            justify-content: center;
            color: #8b5a8c;
            font-size: 2rem;
          ">📷</div>
        </div>
        
        <div class="popup-content">
          <h4 style="
            margin: 0 0 8px 0; 
            color: #8b5a8c; 
            font-size: 1.1rem; 
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            👤 ${this.escapeHtml(story.name)}
          </h4>
          
          <p style="
            margin: 0 0 12px 0; 
            font-size: 0.9rem; 
            line-height: 1.4; 
            color: #555;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          ">
            ${this.escapeHtml(story.description)}
          </p>
          
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          ">
            <small style="color: #8b5a8c; font-size: 0.8rem;">
              📅 ${this.formatDate(story.createdAt)}
            </small>
            <small style="color: #8b5a8c; font-size: 0.8rem;">
              📍 ${story.lat?.toFixed(4)}, ${story.lon?.toFixed(4)}
            </small>
          </div>
          
          <button 
            onclick="window.location.hash='#/detail-story?id=${story.id}'" 
            style="
              background: linear-gradient(135deg, #b794b8, #8b5a8c);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 20px;
              cursor: pointer;
              font-size: 0.9rem;
              font-weight: 500;
              width: 100%;
              transition: all 0.3s ease;
              box-shadow: 0 2px 6px rgba(139, 90, 140, 0.3);
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(139, 90, 140, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 6px rgba(139, 90, 140, 0.3)'"
          >
            👁️ Lihat Detail Cerita
          </button>
        </div>
      </div>
    `;
  },

  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  formatDate(dateString) {
    if (!dateString) return "Tanggal tidak tersedia";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Tanggal tidak valid";
    }
  },

  saveLayerPreference(layerName) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.MAP_LAYER_PREFERENCE, layerName);
    } catch (error) {
      console.warn("Could not save layer preference:", error);
    }
  },

  getLayerPreference() {
    try {
      return (
        localStorage.getItem(CONFIG.STORAGE_KEYS.MAP_LAYER_PREFERENCE) ||
        "openstreetmap"
      );
    } catch (error) {
      console.warn("Could not get layer preference:", error);
      return "openstreetmap";
    }
  },
};

window.CONFIG = CONFIG;
window.MapUtils = MapUtils;

export default CONFIG;
export { MapUtils };
