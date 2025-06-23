import StoryModel from "../../data/story-model.js";
import HomePresenter from "../../presenters/home-presenter.js";
import Utils from "../../utils/index.js";

const Home = {
  async render() {
    return `
      <div class="home-container">
        <h1 class="welcome-title">Welcome to Your Story!</h1>
        <p style="text-align: center; color: #8b5a8c; font-size: 1.2rem; margin-bottom: 2rem;">
          Bagikan cerita Anda dan jelajahi cerita menarik dari komunitas Dicoding
        </p>
        
        <div class="story-controls">
          <a href="#/tambah-cerita" class="control-btn">📝 Tambah Cerita</a>
          <button id="load-stories-btn" class="control-btn">🔄 Muat Cerita</button>
        </div>

        <div id="map-container" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 2rem 0 1rem 0;">
            <h2 style="color: #8b5a8c; margin: 0;">📍 Lokasi Cerita</h2>
            <div class="map-controls" style="display: flex; gap: 10px; align-items: center;">
              <select id="layer-selector" style="
                padding: 8px 12px;
                border: 2px solid #b794b8;
                border-radius: 20px;
                background: white;
                color: #8b5a8c;
                font-size: 0.9rem;
                cursor: pointer;
                outline: none;
              ">
                <option value="openstreetmap">🗺️ OpenStreetMap</option>
                <option value="satellite">🛰️ Satellite</option>
                <option value="terrain">🏔️ Terrain</option>
                <option value="dark">🌙 Dark Mode</option>
                <option value="light">☀️ Light Mode</option>
              </select>
              <button id="fullscreen-btn" style="
                padding: 8px 12px;
                border: 2px solid #b794b8;
                border-radius: 50%;
                background: white;
                color: #8b5a8c;
                cursor: pointer;
                outline: none;
                font-size: 1rem;
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
              ">🏠</button>
            </div>
          </div>
          <div id="stories-map" style="
            height: 400px; 
            width: 100%; 
            border-radius: 15px; 
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            position: relative;
          "></div>
          <div id="map-legend" style="
            margin-top: 1rem;
            padding: 10px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 10px;
            font-size: 0.9rem;
            color: #8b5a8c;
            text-align: center;
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
    const layerSelector = document.getElementById("layer-selector");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const resetViewBtn = document.getElementById("reset-view-btn");

    if (loadStoriesBtn) {
      loadStoriesBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await presenter.loadStories();
      });
    }

    if (layerSelector) {
      const savedLayer =
        window.MapUtils?.getLayerPreference() || "openstreetmap";
      layerSelector.value = savedLayer;

      layerSelector.addEventListener("change", (e) => {
        const selectedLayer = e.target.value;
        this._changeMapLayer(selectedLayer);
        if (window.MapUtils) {
          window.MapUtils.saveLayerPreference(selectedLayer);
        }
      });
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
      const defaultCenter = window.CONFIG?.MAP?.DEFAULT_CENTER || [
        -2.5489, 118.0149,
      ];
      const defaultZoom = window.CONFIG?.MAP?.DEFAULT_ZOOM || 5;

      this.map = L.map("stories-map", {
        zoomControl: window.CONFIG?.MAP?.CONTROLS?.zoomControl !== false,
        attributionControl:
          window.CONFIG?.MAP?.CONTROLS?.attributionControl !== false,
        zoomAnimation: window.CONFIG?.MAP?.ANIMATION?.zoomAnimation !== false,
        fadeAnimation: window.CONFIG?.MAP?.ANIMATION?.fadeAnimation !== false,
        markerZoomAnimation:
          window.CONFIG?.MAP?.ANIMATION?.markerZoomAnimation !== false,
      }).setView(defaultCenter, defaultZoom);

      this._initializeMapLayers();

      if (window.CONFIG?.MAP?.CONTROLS?.scaleControl) {
        L.control.scale().addTo(this.map);
      }

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
        marker = L.marker([story.lat, story.lon]);
      }

      const popupContent =
        window.MapUtils &&
        typeof window.MapUtils.createPopupContent === "function"
          ? window.MapUtils.createPopupContent(story)
          : this._createBasicPopupContent(story);

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "custom-popup",
      });

      this.markersGroup.addLayer(marker);
    });

    if (storiesWithLocation.length > 0) {
      const group = new L.featureGroup(this.markersGroup.getLayers());
      this.map.fitBounds(group.getBounds().pad(0.1));
    }

    this.currentStories = storiesWithLocation;
  },

  _initializeMapLayers() {
    if (!window.CONFIG?.MAP?.TILE_LAYERS) return;

    const tileLayers = window.CONFIG.MAP.TILE_LAYERS;
    this.mapLayers = {};

    Object.keys(tileLayers).forEach((layerKey) => {
      const layerConfig = tileLayers[layerKey];
      this.mapLayers[layerKey] = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        maxZoom: layerConfig.maxZoom || 18,
      });
    });

    const savedLayer = window.MapUtils?.getLayerPreference() || "openstreetmap";
    if (this.mapLayers[savedLayer]) {
      this.mapLayers[savedLayer].addTo(this.map);
      this.currentLayer = savedLayer;
    } else {
      this.mapLayers.openstreetmap.addTo(this.map);
      this.currentLayer = "openstreetmap";
    }
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
      this.map.fitBounds(group.getBounds().pad(0.1));
    } else {
      const defaultCenter = window.CONFIG?.MAP?.DEFAULT_CENTER || [
        -2.5489, 118.0149,
      ];
      const defaultZoom = window.CONFIG?.MAP?.DEFAULT_ZOOM || 5;
      this.map.setView(defaultCenter, defaultZoom);
    }
  },

  _createBasicPopupContent(story) {
    return `
      <div style="max-width: 250px;">
        <img src="${story.photoUrl}" 
             alt="Foto cerita: ${Utils.escapeHtml(story.description)}" 
             style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
        <h4 style="margin: 0 0 5px 0; color: #8b5a8c;">👤 ${Utils.escapeHtml(
          story.name
        )}</h4>
        <p style="margin: 0 0 8px 0; font-size: 0.9rem;">${Utils.truncateText(
          Utils.escapeHtml(story.description),
          80
        )}</p>
        <small style="color: #8b5a8c; display: block; margin-bottom: 8px;">📅 ${Utils.formatDate(
          story.createdAt
        )}</small>
        <button onclick="window.location.hash='#/detail-story?id=${story.id}'" 
                style="background: #b47eb1; color: white; border: none; padding: 8px 16px; border-radius: 10px; cursor: pointer; width: 100%;">
          👁️ Detail
        </button>
      </div>
    `;
  },
};

export default Home;
