import StoryModel from "../../data/story-model.js";
import DetailStoryPresenter from "../../presenters/detail-story-presenter.js";
import UrlParser from "../../routes/url-parser.js";

const DetailStory = {
  async render() {
    return `
      <div class="detail-container">
        <div class="detail-header">
          <button id="back-btn" class="back-btn">
            <i class="fas fa-arrow-left"></i>
            Kembali
          </button>
          <h1 class="detail-title">
            📖 Detail Cerita
          </h1>
        </div>
        
        <div id="story-detail-content" class="story-detail-content">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat detail cerita...</p>
          </div>
        </div>
      </div>
      
      <style>
        .detail-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8d8ea 0%, #d4b8d6 50%, #c299c4 100%);
          padding: 0;
        }

        .detail-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 1.5rem 2rem;
          box-shadow: 0 4px 20px rgba(139, 90, 140, 0.15);
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(139, 90, 140, 0.1);
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #b794b8, #a584a7);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
          box-shadow: 0 4px 15px rgba(183, 148, 184, 0.3);
        }

        .back-btn:hover {
          background: linear-gradient(135deg, #a584a7, #8b5a8c);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(183, 148, 184, 0.4);
        }

        .back-btn:active {
          transform: translateY(0);
        }

        .back-btn i {
          font-size: 0.85rem;
        }

        .detail-title {
          color: #8b5a8c;
          text-align: center;
          margin: 0;
          font-size: 1.8rem;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(139, 90, 140, 0.1);
        }

        .story-detail-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(139, 90, 140, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(183, 148, 184, 0.3);
          border-top: 3px solid #8b5a8c;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-state p {
          color: #8b5a8c;
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
        }

        .story-detail-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(139, 90, 140, 0.15);
          margin: 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .story-image-container {
          margin-bottom: 2rem;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(139, 90, 140, 0.2);
        }

        .story-detail-image {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .story-detail-image:hover {
          transform: scale(1.02);
        }

        .story-author-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(232, 216, 234, 0.6), rgba(212, 184, 214, 0.6));
          border-radius: 15px;
          border-left: 4px solid #b794b8;
          backdrop-filter: blur(5px);
        }

        .story-detail-author {
          color: #8b5a8c;
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .story-detail-date {
          color: #6c757d;
          font-size: 0.9rem;
          margin: 0;
          font-weight: 500;
        }

        .story-description-section {
          margin-bottom: 2rem;
        }

        .story-description-section h3 {
          color: #8b5a8c;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .story-detail-description {
          line-height: 1.7;
          color: #333;
          font-size: 1rem;
          margin: 0;
          padding: 1.5rem;
          background: rgba(248, 249, 250, 0.8);
          border-radius: 12px;
          border-left: 3px solid #b794b8;
        }

        /* Enhanced Location Section */
        .story-location-section {
          margin-bottom: 2rem;
        }

        .story-location-section h3 {
          color: #8b5a8c;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .map-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .map-control-btn, #layer-selector {
          padding: 8px 12px;
          border: 2px solid #b794b8;
          border-radius: 20px;
          background: white;
          color: #8b5a8c;
          font-size: 0.9rem;
          cursor: pointer;
          outline: none;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .map-control-btn:hover, #layer-selector:hover {
          background: #b794b8;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(183, 148, 184, 0.3);
        }

        .map-control-btn.round {
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .story-location-map {
          height: 400px;
          border-radius: 15px;
          overflow: hidden;
          margin-bottom: 1rem;
          background: rgba(248, 249, 250, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          box-shadow: 0 8px 25px rgba(139, 90, 140, 0.2);
          border: 1px solid rgba(183, 148, 184, 0.2);
          position: relative;
        }

        .map-legend {
          margin-top: 1rem;
          padding: 12px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          font-size: 0.9rem;
          color: #8b5a8c;
          text-align: center;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(183, 148, 184, 0.2);
        }

        .coordinates-info {
          text-align: center;
          color: #8b5a8c;
          font-size: 0.9rem;
          font-weight: 500;
          background: rgba(232, 216, 234, 0.6);
          padding: 0.75rem;
          border-radius: 10px;
          margin-top: 0.5rem;
          backdrop-filter: blur(5px);
        }

        .error-message {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 8px 32px rgba(139, 90, 140, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .error-message h2 {
          color: #dc3545;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .error-message p {
          color: #6c757d;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          margin: 0 0.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, #b794b8, #a584a7);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #a584a7, #8b5a8c);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(183, 148, 184, 0.3);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #6c757d, #5a6268);
          color: white;
        }

        .btn-secondary:hover {
          background: linear-gradient(135deg, #5a6268, #495057);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(108, 117, 125, 0.3);
        }

        /* Enhanced Map Popup Styling */
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(139, 90, 140, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
        }

        .leaflet-popup-close-button {
          color: #8b5a8c !important;
          font-size: 18px !important;
          font-weight: bold !important;
        }

        .leaflet-popup-close-button:hover {
          color: #a584a7 !important;
        }

        /* Custom marker styles */
        .custom-story-marker .marker-container {
          position: relative;
          transition: all 0.3s ease;
        }

        .custom-story-marker .marker-container.selected {
          transform: rotate(-45deg) scale(1.2);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .detail-header {
            padding: 1rem 1.5rem;
          }

          .detail-title {
            font-size: 1.5rem;
          }

          .story-detail-content {
            padding: 0 1rem 2rem;
          }

          .story-detail-card {
            padding: 2rem;
          }

          .story-author-section {
            padding: 1rem;
          }

          .story-location-map {
            height: 300px;
          }

          .map-header {
            flex-direction: column;
            align-items: stretch;
          }

          .map-controls {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .detail-header {
            padding: 1rem;
          }

          .story-detail-card {
            padding: 1.5rem;
          }

          .back-btn {
            padding: 0.6rem 1.2rem;
            font-size: 0.85rem;
          }

          .detail-title {
            font-size: 1.3rem;
          }

          .story-location-map {
            height: 250px;
          }

          .map-controls {
            gap: 8px;
          }

          .map-control-btn, #layer-selector {
            font-size: 0.8rem;
            padding: 6px 10px;
          }
        }

        .story-detail-card {
          animation: fadeInUp 0.6s ease;
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .story-author-section,
        .story-description-section,
        .story-location-section {
          animation: fadeIn 0.8s ease;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .map-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #8b5a8c;
        }

        .map-loading .spinner {
          width: 30px;
          height: 30px;
          margin-bottom: 1rem;
        }
          .toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 8px 25px rgba(139, 90, 140, 0.3);
  border-left: 4px solid #b794b8;
  z-index: 10000;
  transform: translateX(400px);
  opacity: 0;
  transition: all 0.3s ease;
}

.toast-notification.show {
  transform: translateX(0);
  opacity: 1;
}

.toast-notification.success {
  border-left-color: #28a745;
}

.toast-notification.error {
  border-left-color: #dc3545;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  font-weight: 500;
}
      </style>
    `;
  },

  async afterRender() {
    console.log("Current URL:", window.location.hash);
    console.log("Current path:", UrlParser.getCurrentPath());

    const model = new StoryModel();
    const presenter = new DetailStoryPresenter(model, this);

    if (!model.isAuthenticated()) {
      console.log("User not authenticated");
      this.showError(
        "Anda harus login terlebih dahulu untuk melihat detail cerita"
      );
      return;
    }

    const queryParams = UrlParser.getQueryParams();
    const storyId = queryParams.id;

    console.log("Query params:", queryParams);
    console.log("Story ID:", storyId);

    if (!storyId) {
      console.error("No story ID found in URL");
      this.showError(
        "ID cerita tidak ditemukan dalam URL. Format URL yang benar: #/detail-story?id=story-xxx"
      );
      return;
    }

    this._initializeEventListeners();

    await presenter.loadStoryDetail(storyId);
  },

  _initializeEventListeners() {
    const backBtn = document.getElementById("back-btn");

    backBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = "#/home";
      }
    });
  },

  _initializeMapEventListeners() {
    const layerSelector = document.getElementById("layer-selector");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const resetViewBtn = document.getElementById("reset-view-btn");

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
    const content = document.getElementById("story-detail-content");
    if (content) {
      content.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Memuat detail cerita...</p>
        </div>
      `;
    }
  },

  hideLoading() {},

  showError(message) {
    const content = document.getElementById("story-detail-content");
    if (content) {
      content.innerHTML = `
        <div class="error-message">
          <h2>😞 Terjadi Kesalahan</h2>
          <p>${this._escapeHtml(message)}</p>
          <div>
            <button onclick="window.location.hash='#/home'" class="btn-primary">
              Kembali ke Home
            </button>
            ${
              message.includes("login") ||
              message.includes("Authentication") ||
              message.includes("Sesi")
                ? `
              <button onclick="window.location.hash='#/login'" class="btn-secondary">
                Login
              </button>
            `
                : ""
            }
          </div>
        </div>
      `;
    }
  },

  renderStoryDetail(story) {
    const content = document.getElementById("story-detail-content");
    if (!content || !story) {
      console.error("Content element or story data is missing", {
        content: !!content,
        story: !!story,
      });
      this.showError("Terjadi kesalahan saat menampilkan detail cerita");
      return;
    }

    console.log("Rendering story:", story);

    content.innerHTML = `
    <article class="story-detail-card" role="article">
      <div class="story-image-container">
        <img 
          src="${story.photoUrl || ""}" 
          alt="Foto cerita: ${this._escapeHtml(story.description || "")}" 
          class="story-detail-image"
          loading="eager"
          onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;400&quot; height=&quot;300&quot;><rect width=&quot;100%&quot; height=&quot;100%&quot; fill=&quot;%23f0f0f0&quot;/><text x=&quot;50%&quot; y=&quot;50%&quot; text-anchor=&quot;middle&quot; fill=&quot;%23999&quot;>Gambar tidak dapat dimuat</text></svg>'"
        />
      </div>
      
      <div class="story-detail-info">
        <!-- TAMBAHKAN SAVE BUTTON DI SINI -->
       <!-- TAMBAHKAN SAVE BUTTON -->
<div class="story-actions" style="margin-bottom: 1.5rem; text-align: center;">
  <button id="save-story-btn" class="save-btn ${story.isSaved ? "saved" : ""}" 
          style="background: linear-gradient(135deg, ${
            story.isSaved ? "#28a745, #20c997" : "#b794b8, #a584a7"
          }); 
                 color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 50px; 
                 cursor: pointer; font-weight: 500; transition: all 0.3s ease;
                 box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
    <i class="fas ${story.isSaved ? "fa-heart" : "fa-heart-o"}"></i>
    ${story.isSaved ? "Tersimpan" : "Simpan Cerita"}
  </button>
</div>
        
        <div class="story-author-section">
          <h2 class="story-detail-author">👤 ${this._escapeHtml(
            story.name || "Nama tidak tersedia"
          )}</h2>
          <p class="story-detail-date">📅 ${this._formatDate(
            story.createdAt
          )}</p>
        </div>
        
        <div class="story-description-section">
          <h3>📝 Cerita</h3>
          <p class="story-detail-description">${this._escapeHtml(
            story.description || "Deskripsi tidak tersedia"
          )}</p>
        </div>
        
        ${
          story.lat && story.lon
            ? `
          <div class="story-location-section">
            <div class="map-header">
              <h3>📍 Lokasi Cerita</h3>
              <div class="map-controls">
                <select id="layer-selector" title="Pilih gaya peta">
                  <option value="openstreetmap">🗺️ OpenStreetMap</option>
                  <option value="satellite">🛰️ Satellite</option>
                  <option value="terrain">🏔️ Terrain</option>
                  <option value="dark">🌙 Dark Mode</option>
                  <option value="light">☀️ Light Mode</option>
                </select>
                <button id="fullscreen-btn" class="map-control-btn round" title="Layar penuh">⛶</button>
                <button id="reset-view-btn" class="map-control-btn round" title="Reset tampilan">🏠</button>
              </div>
            </div>
            
            <div id="story-location-map" class="story-location-map">
              <div class="map-loading">
                <div class="spinner"></div>
                <p>Memuat peta...</p>
              </div>
            </div>
            
            <div class="map-legend">
              📍 Lokasi cerita • 🔍 Scroll untuk zoom • 🖱️ Drag untuk navigasi • 🎨 Ganti gaya peta di atas
            </div>
            
            <div class="coordinates-info">
              Koordinat: ${parseFloat(story.lat).toFixed(6)}, ${parseFloat(
                story.lon
              ).toFixed(6)}
            </div>
          </div>
        `
            : ""
        }
      </div>
    </article>
  `;

    this._setupSaveButtonListener(story);

    if (story.lat && story.lon) {
      this.initializeLocationMap(story);
      this._initializeMapEventListeners();
    }
  },

  _setupSaveButtonListener(story) {
    const saveBtn = document.getElementById("save-story-btn");
    if (!saveBtn) return;

    saveBtn.addEventListener("click", async () => {
      try {
        saveBtn.disabled = true;
        saveBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Memproses...';

        const model = new StoryModel();
        const presenter = new DetailStoryPresenter(model, this);

        const newSavedState = await presenter.toggleSaveStory(story);

        if (newSavedState) {
          saveBtn.classList.add("saved");
          saveBtn.innerHTML = '<i class="fas fa-heart"></i> Tersimpan';
          this._showToast("Cerita berhasil disimpan!", "success");
        } else {
          saveBtn.classList.remove("saved");
          saveBtn.innerHTML = '<i class="fas fa-heart-o"></i> Simpan Cerita';
          this._showToast("Cerita dihapus dari simpanan", "info");
        }
      } catch (error) {
        console.error("Error toggling save story:", error);
        this._showToast("Gagal menyimpan cerita", "error");
      } finally {
        saveBtn.disabled = false;
      }
    });
  },

  _showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
    <div class="toast-content">
      <i class="fas ${
        type === "success"
          ? "fa-check-circle"
          : type === "error"
          ? "fa-exclamation-circle"
          : "fa-info-circle"
      }"></i>
      <span>${message}</span>
    </div>
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    }, 100);
  },
  initializeLocationMap(story) {
    setTimeout(() => {
      const mapElement = document.getElementById("story-location-map");
      if (!mapElement) {
        console.warn("Map element not found");
        return;
      }

      if (typeof L === "undefined") {
        console.error("Leaflet library is not loaded");
        mapElement.innerHTML =
          '<div class="map-loading"><p style="color: #6c757d;">Peta tidak dapat dimuat - Leaflet library tidak tersedia</p></div>';
        return;
      }

      try {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);

        if (isNaN(lat) || isNaN(lon)) {
          console.error("Invalid coordinates:", story.lat, story.lon);
          mapElement.innerHTML =
            '<div class="map-loading"><p style="color: #dc3545;">Koordinat lokasi tidak valid</p></div>';
          return;
        }

        if (
          window.MapUtils &&
          typeof window.MapUtils.initializeMap === "function"
        ) {
          try {
            const mapConfig = window.MapUtils.initializeMap(
              "story-location-map",
              {
                center: [lat, lon],
                zoom: 15,
              }
            );

            this.map = mapConfig.map;
            this.mapLayers = mapConfig.mapLayers;
            this.currentLayer = window.MapUtils.getLayerPreference();
          } catch (error) {
            console.warn(
              "MapUtils initialization failed, falling back to basic setup:",
              error
            );
            this._initializeBasicMap(lat, lon);
          }
        } else {
          this._initializeBasicMap(lat, lon);
        }

        this._addStoryMarker(story, lat, lon);

        this.currentStory = story;
        this.originalCenter = [lat, lon];
        this.originalZoom = 15;
      } catch (error) {
        console.error("Error initializing map:", error);
        mapElement.innerHTML =
          '<div class="map-loading"><p style="color: #dc3545;">Peta tidak dapat dimuat</p></div>';
      }
    }, 100);
  },

  _initializeBasicMap(lat, lon) {
    this.map = L.map("story-location-map").setView([lat, lon], 15);

    this.mapLayers = {
      openstreetmap: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ),
      satellite: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 18,
        }
      ),
      terrain: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution:
          'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        maxZoom: 17,
      }),
      dark: L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }
      ),
      light: L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }
      ),
    };

    const savedLayer = window.MapUtils?.getLayerPreference() || "openstreetmap";
    if (this.mapLayers[savedLayer]) {
      this.mapLayers[savedLayer].addTo(this.map);
      this.currentLayer = savedLayer;
    } else {
      this.mapLayers.openstreetmap.addTo(this.map);
      this.currentLayer = "openstreetmap";
    }
  },
  _addStoryMarker(story, lat, lon) {
    let marker;
    if (
      window.MapUtils &&
      typeof window.MapUtils.createCustomMarker === "function"
    ) {
      const customIcon = window.MapUtils.createCustomMarker(story, true);
      marker = L.marker([lat, lon], { icon: customIcon });
    } else {
      const customIcon = L.divIcon({
        className: "custom-story-marker",
        html: `
          <div class="marker-container selected" style="
            background: linear-gradient(135deg, #feb2b2, #e53e3e);
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(139, 90, 140, 0.4);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              font-size: 12px;
              color: white;
            ">📍</div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [12, -12],
      });
      marker = L.marker([lat, lon], { icon: customIcon });
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

    marker.addTo(this.map);

    this.storyMarker = marker;
  },

  _initializeMapLayers() {
    if (!window.CONFIG?.MAP?.TILE_LAYERS) {
      this.mapLayers = {
        openstreetmap: L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ),
        satellite: L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          }
        ),
        terrain: L.tileLayer(
          "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          {
            attribution:
              'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
          }
        ),
        dark: L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          }
        ),
        light: L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          }
        ),
      };
      return;
    }

    const tileLayers = window.CONFIG.MAP.TILE_LAYERS;
    this.mapLayers = {};

    Object.keys(tileLayers).forEach((layerKey) => {
      const layerConfig = tileLayers[layerKey];
      this.mapLayers[layerKey] = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        maxZoom: layerConfig.maxZoom || 18,
      });
    });
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
    const mapContainer = document.getElementById("story-location-map");
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
    if (!this.map || !this.originalCenter) return;

    this.map.setView(this.originalCenter, this.originalZoom);
  },

  _createBasicPopupContent(story) {
    return `
      <div style="max-width: 250px;">
        <img src="${story.photoUrl}" 
             alt="Foto cerita: ${this._escapeHtml(story.description)}" 
             style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
        <h4 style="margin: 0 0 5px 0; color: #8b5a8c;">👤 ${this._escapeHtml(
          story.name
        )}</h4>
        <p style="margin: 0 0 8px 0; font-size: 0.9rem;">${this._truncateText(
          this._escapeHtml(story.description),
          80
        )}</p>
        <small style="color: #8b5a8c; display: block; margin-bottom: 8px;">📅 ${this._formatDate(
          story.createdAt
        )}</small>
        <div style="text-align: center; padding: 8px 0;">
          <strong style="color: #8b5a8c;">📍 Lokasi Cerita</strong>
        </div>
      </div>
    `;
  },

  _escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  _truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  },

  _formatDate(dateString) {
    if (!dateString) return "Tanggal tidak tersedia";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Tanggal tidak valid";

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      };

      return date.toLocaleDateString("id-ID", options);
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "Tanggal tidak valid";
    }
  },
};

export default DetailStory;
