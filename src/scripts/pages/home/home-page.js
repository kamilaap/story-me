import StoryModel from "../../data/story-model.js";
import HomePresenter from "../../presenters/home-presenter.js";
import Utils from "../../utils/index.js";

const Home = {
  async render() {
    return `
     <div class="home-container">
        <h1 class="welcome-title">Welcome to Your Story!</h1>
        <p style="text-align: center; color: #8b5a8c; font-size: 1.2rem; margin-bottom: 1rem;">
          Bagikan cerita Anda dan jelajahi cerita menarik dari komunitas Dicoding
        </p>
        <p style="text-align: center; color: #ff4444; font-size: 1.4rem; font-weight: bold; margin-bottom: 2rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
          Tapi login dulu ya kalo mau liat cerita! 🔐
        </p>
        
        <div class="story-controls">
          <a href="#/tambah-cerita" class="control-btn">📝 Tambah Cerita</a>
          <button id="load-stories-btn" class="control-btn">🔄 Muat Cerita</button>
        </div>

        <div id="map-container" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 2rem 0 1rem 0;">
            <h2 style="color: #8b5a8c; margin: 0;">📍 Lokasi Cerita</h2>
            <div class="map-controls" style="display: flex; gap: 15px; align-items: center;">
              <!-- Layer Selection with Radio Buttons -->
              <div class="layer-selector-container" style="
                background: white;
                border: 2px solid #b794b8;
                border-radius: 25px;
                padding: 8px 12px;
                display: flex;
                gap: 10px;
                align-items: center;
                box-shadow: 0 2px 8px rgba(139, 90, 140, 0.1);
              ">
                <div style="
                  display: flex;
                  gap: 8px;
                  align-items: center;
                  flex-wrap: wrap;
                ">
                  <label style="
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    color: #8b5a8c;
                    font-weight: 500;
                  ">
                    <input type="radio" name="mapLayer" value="openstreetmap" checked style="
                      margin: 0;
                      accent-color: #8b5a8c;
                    ">
                    <span>🗺️ OpenStreetMap</span>
                  </label>
                  <label style="
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    color: #8b5a8c;
                    font-weight: 500;
                  ">
                    <input type="radio" name="mapLayer" value="satellite" style="
                      margin: 0;
                      accent-color: #8b5a8c;
                    ">
                    <span>🛰️ Satellite</span>
                  </label>
                  <label style="
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    color: #8b5a8c;
                    font-weight: 500;
                  ">
                    <input type="radio" name="mapLayer" value="terrain" style="
                      margin: 0;
                      accent-color: #8b5a8c;
                    ">
                    <span>🏔️ Terrain</span>
                  </label>
                  <label style="
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    color: #8b5a8c;
                    font-weight: 500;
                  ">
                    <input type="radio" name="mapLayer" value="dark" style="
                      margin: 0;
                      accent-color: #8b5a8c;
                    ">
                    <span>🌙 Dark</span>
                  </label>
                  <label style="
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    color: #8b5a8c;
                    font-weight: 500;
                  ">
                    <input type="radio" name="mapLayer" value="light" style="
                      margin: 0;
                      accent-color: #8b5a8c;
                    ">
                    <span>☀️ Light</span>
                  </label>
                </div>
              </div>
              
              <button id="fullscreen-btn" style="
                padding: 8px 12px;
                border: 2px solid #b794b8;
                border-radius: 50%;
                background: white;
                color: #8b5a8c;
                cursor: pointer;
                outline: none;
                font-size: 1rem;
                box-shadow: 0 2px 8px rgba(139, 90, 140, 0.1);
                transition: all 0.3s ease;
              ">⛶</button>
              <button id="reset-view-btn" style="
                padding: 8px 12px;
                border: 2px solid #b794b8;
                border-radius: 50%;
                background: white;
                color: #8b5a8c;
                cursor: pointer;
                outline: none;
                font-size: 1rem;
                box-shadow: 0 2px 8px rgba(139, 90, 140, 0.1);
                transition: all 0.3s ease;
              ">🏠</button>
              <button id="locate-me-btn" style="
                padding: 8px 12px;
                border: 2px solid #b794b8;
                border-radius: 50%;
                background: white;
                color: #8b5a8c;
                cursor: pointer;
                outline: none;
                font-size: 1rem;
                box-shadow: 0 2px 8px rgba(139, 90, 140, 0.1);
                transition: all 0.3s ease;
              ">📍</button>
            </div>
          </div>
          <div id="stories-map" style="
            height: 400px; 
            width: 100%; 
            border-radius: 15px; 
            box-shadow: 0 8px 32px rgba(139, 90, 140, 0.15);
            position: relative;
            border: 1px solid rgba(139, 90, 140, 0.2);
          "></div>
          <div id="map-legend" style="
            margin-top: 1rem;
            padding: 12px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            font-size: 0.9rem;
            color: #8b5a8c;
            text-align: center;
            box-shadow: 0 2px 8px rgba(139, 90, 140, 0.1);
            border: 1px solid rgba(139, 90, 140, 0.1);
          ">
            📍 Klik marker untuk melihat detail cerita • 🔍 Gunakan scroll untuk zoom • 🖱️ Drag untuk navigasi
          </div>
        </div>

        <div id="stories-container" class="stories-grid">
          <div style="text-align: center; color: #8b5a8c; font-size: 1.2rem; margin: 2rem 0;">
            Klik "Muat Cerita" untuk melihat cerita terbaru
          </div>
        </div>
      </div>

      <style>
        .map-controls button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 90, 140, 0.2) !important;
          background: #f8f9fa !important;
        }

        .layer-selector-container label:hover {
          background: rgba(139, 90, 140, 0.1);
          border-radius: 12px;
          padding: 4px 6px;
        }

        .layer-selector-container input[type="radio"]:checked + span {
          font-weight: 600;
          color: #744a75;
        }

        @media (max-width: 768px) {
          .map-controls {
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          .layer-selector-container {
            flex-direction: column !important;
            padding: 10px !important;
          }
          
          .layer-selector-container > div {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .layer-selector-container label {
            justify-content: flex-start !important;
            width: 100%;
            padding: 6px 8px !important;
          }
        }
      </style>
    `;
  },

  async afterRender() {
    const model = new StoryModel();
    const presenter = new HomePresenter(model, this);
    this._initializeEventListeners(presenter);
    await presenter.loadStories();
  },

  _initializeEventListeners(presenter) {
    const loadStoriesBtn = document.getElementById("load-stories-btn");
    const layerRadios = document.querySelectorAll('input[name="mapLayer"]');
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const resetViewBtn = document.getElementById("reset-view-btn");
    const locateMeBtn = document.getElementById("locate-me-btn");

    if (loadStoriesBtn) {
      loadStoriesBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await presenter.loadStories();
      });
    }

    layerRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.checked) {
          const selectedLayer = e.target.value;
          this._changeMapLayer(selectedLayer);
          if (window.MapUtils) {
            window.MapUtils.saveLayerPreference(selectedLayer);
          }
        }
      });
    });

    const savedLayer = window.MapUtils?.getLayerPreference() || "openstreetmap";
    const savedRadio = document.querySelector(
      `input[name="mapLayer"][value="${savedLayer}"]`
    );
    if (savedRadio) {
      savedRadio.checked = true;
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", () => {
        this._toggleFullscreen();
      });
    }

    if (resetViewBtn) {
      resetViewBtn.addEventListener("click", () => {
        this._resetMapView();
      });
    }

    if (locateMeBtn) {
      locateMeBtn.addEventListener("click", () => {
        this._locateMe();
      });
    }
  },

  showLoading() {
    Utils.showLoading();
  },

  hideLoading() {
    Utils.hideLoading();
  },

  showError(message) {
    Utils.showError(message);
  },

  renderStories(stories) {
    const container = document.getElementById("stories-container");

    if (!container) return;

    let storiesArray = [];

    if (Array.isArray(stories)) {
      storiesArray = stories;
    } else if (stories && Array.isArray(stories.listStory)) {
      storiesArray = stories.listStory;
    } else if (stories && Array.isArray(stories.data)) {
      storiesArray = stories.data;
    } else {
      console.error("Stories data is not in expected format:", stories);
      container.innerHTML = `
        <div style="text-align: center; color: #ff6b6b; font-size: 1.2rem; margin: 2rem 0;">
          ❌ Format data cerita tidak valid
        </div>
      `;
      return;
    }

    if (storiesArray.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: #8b5a8c; font-size: 1.2rem; margin: 2rem 0;">
          📭 Belum ada cerita yang tersedia
        </div>
      `;
      return;
    }

    container.innerHTML = storiesArray
      .map(
        (story) => `
      <article class="story-card" role="article" tabindex="0">
        <img src="${story.photoUrl}" 
             alt="Foto cerita: ${Utils.escapeHtml(story.description)}" 
             class="story-image"
             loading="lazy">
        <div class="story-info">
          <h3 class="story-author">👤 ${Utils.escapeHtml(story.name)}</h3>
          <p class="story-description">${Utils.truncateText(
            Utils.escapeHtml(story.description),
            150
          )}</p>
          <p class="story-date">📅 ${Utils.formatDate(story.createdAt)}</p>
          ${
            story.lat && story.lon
              ? '<p style="color: #8b5a8c; font-size: 0.9rem;">📍 Dengan lokasi</p>'
              : ""
          }
          <button class="detail-btn" data-story-id="${story.id}">
            👁️ Detail
          </button>
        </div>
      </article>
    `
      )
      .join("");

    const detailBtns = container.querySelectorAll(".detail-btn");
    detailBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const storyId = e.target.dataset.storyId;
        window.location.hash = `#/detail-story?id=${storyId}`;
      });
    });

    const storyCards = container.querySelectorAll(".story-card");
    storyCards.forEach((card) => {
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const detailBtn = card.querySelector(".detail-btn");
          if (detailBtn) detailBtn.click();
        }
      });
    });
  },

  renderMap(stories) {
    const mapContainer = document.getElementById("map-container");
    const mapElement = document.getElementById("stories-map");

    if (!mapElement || !stories) return;

    let storiesArray = [];

    if (Array.isArray(stories)) {
      storiesArray = stories;
    } else if (stories && Array.isArray(stories.listStory)) {
      storiesArray = stories.listStory;
    } else if (stories && Array.isArray(stories.data)) {
      storiesArray = stories.data;
    } else {
      mapContainer.style.display = "none";
      return;
    }

    const storiesWithLocation = storiesArray.filter(
      (story) => story.lat && story.lon
    );

    if (storiesWithLocation.length === 0) {
      mapContainer.style.display = "none";
      return;
    }

    mapContainer.style.display = "block";

    if (typeof L === "undefined") {
      console.warn("Leaflet library not loaded, skipping map rendering");
      return;
    }

    if (!this.map) {
      const defaultCenter = [-6.2088, 106.8456];
      const defaultZoom = 10;

      this.map = L.map("stories-map", {
        zoomControl: true,
        attributionControl: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
      }).setView(defaultCenter, defaultZoom);

      this._initializeMapLayers();

      L.control
        .scale({
          position: "bottomleft",
          metric: true,
          imperial: false,
        })
        .addTo(this.map);

      this.originalBounds = this.map.getBounds();
      this.originalZoom = defaultZoom;
      this.originalCenter = defaultCenter;
    }

    if (this.markersGroup) {
      this.map.removeLayer(this.markersGroup);
    }
    this.markersGroup = L.layerGroup().addTo(this.map);

    storiesWithLocation.forEach((story) => {
      let marker;

      if (
        window.MapUtils &&
        typeof window.MapUtils.createCustomMarker === "function"
      ) {
        const customIcon = window.MapUtils.createCustomMarker(story);
        marker = L.marker([story.lat, story.lon], { icon: customIcon });
      } else {
        const customIcon = L.divIcon({
          className: "custom-story-marker",
          html: `
            <div style="
              background: #8b5a8c;
              color: white;
              border: 3px solid white;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">📖</div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
        });
        marker = L.marker([story.lat, story.lon], { icon: customIcon });
      }

      const popupContent =
        window.MapUtils &&
        typeof window.MapUtils.createPopupContent === "function"
          ? window.MapUtils.createPopupContent(story)
          : this._createEnhancedPopupContent(story);

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        minWidth: 250,
        className: "custom-popup",
        autoClose: false,
        closeOnClick: false,
      });

      marker.on("popupopen", () => {
        const popupDetailBtn = document.querySelector(
          `.popup-detail-btn[data-story-id="${story.id}"]`
        );
        if (popupDetailBtn) {
          popupDetailBtn.addEventListener("click", () => {
            window.location.hash = `#/detail-story?id=${story.id}`;
          });
        }
      });

      this.markersGroup.addLayer(marker);
    });

    if (storiesWithLocation.length > 0) {
      const group = new L.featureGroup(this.markersGroup.getLayers());
      const bounds = group.getBounds();

      const minZoom = 8;
      const maxZoom = 16;

      this.map.fitBounds(bounds.pad(0.1), {
        minZoom: minZoom,
        maxZoom: maxZoom,
      });

      if (storiesWithLocation.length === 1) {
        this.map.setZoom(12);
      }
    }

    this.currentStories = storiesWithLocation;
  },

  _initializeMapLayers() {
    this.mapLayers = {};

    this.mapLayers.openstreetmap = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 1,
      }
    );

    this.mapLayers.satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        maxZoom: 19,
        minZoom: 1,
      }
    );

    this.mapLayers.terrain = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        maxZoom: 17,
        minZoom: 1,
      }
    );

    this.mapLayers.dark = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
        minZoom: 1,
      }
    );

    this.mapLayers.light = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
        minZoom: 1,
      }
    );

    const savedLayer = window.MapUtils?.getLayerPreference() || "openstreetmap";
    if (this.mapLayers[savedLayer]) {
      this.mapLayers[savedLayer].addTo(this.map);
      this.currentLayer = savedLayer;
    } else {
      this.mapLayers.openstreetmap.addTo(this.map);
      this.currentLayer = "openstreetmap";
    }
  },

  _setupLocateControl() {
    if (!this.map) return;

    this.locateControl = L.control.locate({
      position: "topright",
      strings: {
        title: "Lokasi saya saat ini",
        popup: "Anda berada dalam radius {distance} {unit} dari titik ini",
        outsideMapBoundsMsg: "Anda berada di luar batas peta",
      },
      locateOptions: {
        maxZoom: 16,
        enableHighAccuracy: true,
      },
      icon: "locate-me-icon",
      iconLoading: "locate-me-loading",
    });

    this.locateControl.addTo(this.map);
  },

  _changeMapLayer(layerKey) {
    if (!this.map || !this.mapLayers) return;

    if (this.currentLayer && this.mapLayers[this.currentLayer]) {
      this.map.removeLayer(this.mapLayers[this.currentLayer]);
    }

    if (this.mapLayers[layerKey]) {
      this.mapLayers[layerKey].addTo(this.map);
      this.currentLayer = layerKey;
    }
  },

  _toggleFullscreen() {
    const mapContainer = document.getElementById("stories-map");
    if (!mapContainer) return;

    if (!document.fullscreenElement) {
      mapContainer
        .requestFullscreen()
        .then(() => {
          setTimeout(() => {
            if (this.map) {
              this.map.invalidateSize();
            }
          }, 100);
        })
        .catch((err) => {
          console.warn("Could not enter fullscreen:", err);
        });
    } else {
      document.exitFullscreen();
    }
  },

  _resetMapView() {
    if (!this.map) return;

    if (this.currentStories && this.currentStories.length > 0) {
      const group = new L.featureGroup(this.markersGroup.getLayers());
      const bounds = group.getBounds();

      this.map.fitBounds(bounds.pad(0.1), {
        minZoom: 8,
        maxZoom: 16,
      });

      if (this.currentStories.length === 1) {
        this.map.setZoom(12);
      }
    } else {
      const defaultCenter = [-6.2088, 106.8456];
      const defaultZoom = 10;
      this.map.setView(defaultCenter, defaultZoom);
    }
  },

  _locateMe() {
    if (!this.map) return;

    this.map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
    });

    this.map.on("locationfound", (e) => {
      const radius = e.accuracy / 2;

      if (this.locationCircle) {
        this.map.removeLayer(this.locationCircle);
      }
      if (this.locationMarker) {
        this.map.removeLayer(this.locationMarker);
      }

      this.locationCircle = L.circle(e.latlng, radius, {
        color: "#8b5a8c",
        fillColor: "#b794b8",
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(this.map);

      this.locationMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          className: "user-location-marker",
          html: `
            <div style="
              background: #007bff;
              color: white;
              border: 3px solid white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(this.map);
    });

    this.map.on("locationerror", (e) => {
      this.showError(
        "Gagal mendapatkan lokasi: " +
          e.message +
          "\nPastikan Anda mengizinkan akses lokasi."
      );
    });
  },

  _createEnhancedPopupContent(story) {
    return `
      <div style="max-width: 250px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <img src="${story.photoUrl}" 
             alt="Foto cerita: ${Utils.escapeHtml(story.description)}" 
             style="
               width: 100%; 
               height: 120px; 
               object-fit: cover; 
               border-radius: 8px; 
               margin-bottom: 8px;
               box-shadow: 0 2px 4px rgba(0,0,0,0.1);
             ">
        <div style="padding: 0 4px;">
          <h4 style="
            margin: 0 0 5px 0; 
            color: #8b5a8c; 
            font-size: 1rem;
            font-weight: 600;
          ">
            👤 ${Utils.escapeHtml(story.name)}
          </h4>
          <p style="
            margin: 0 0 8px 0; 
            font-size: 0.85rem;
            color: #555;
            line-height: 1.4;
          ">
            ${Utils.truncateText(Utils.escapeHtml(story.description), 80)}
          </p>
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          ">
            <small style="
              color: #8b5a8c; 
              font-size: 0.75rem;
            ">
              📅 ${Utils.formatDate(story.createdAt)}
            </small>
            <button 
              class="popup-detail-btn"
              data-story-id="${story.id}"
              style="
                background: #8b5a8c;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 15px;
                cursor: pointer;
                font-size: 0.75rem;
                transition: all 0.2s ease;
              "
              onmouseover="this.style.background='#744a75'"
              onmouseout="this.style.background='#8b5a8c'"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>
    `;
  },

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    if (this.markersGroup) {
      this.markersGroup.clearLayers();
      this.markersGroup = null;
    }

    if (this.markersGroup) {
      this.markersGroup.clearLayers();
      this.markersGroup = null;
    }

    if (this.locateControl) {
      this.locateControl.stop();
      this.locateControl = null;
    }
  },
};

export default Home;
