import StoryModel from "../../data/story-model.js";
import TambahCeritaPresenter from "../../presenters/tambah-cerita-presenter.js";

const TambahCerita = {
  async render() {
    return `
      <div class="form-container" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
        <div class="form-header" style="text-align: center; margin-bottom: 2rem;">
          <h1 style="color: #8b5a8c; margin-bottom: 0.5rem; font-size: 2rem; font-weight: 600;">
            📝 Tambah Cerita Baru
          </h1>
          <p style="color: #666; font-size: 1rem; margin: 0;">
            Bagikan pengalaman menarik Anda dengan dunia
          </p>
        </div>
        
        <form id="story-form" class="story-form" style="
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(139, 90, 140, 0.1);
          border: 1px solid rgba(139, 90, 140, 0.1);
        ">
          <!-- Description Section -->
          <div class="form-group" style="margin-bottom: 2rem;">
            <label for="description" class="form-label" style="
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 600;
              color: #8b5a8c;
              font-size: 1rem;
            ">
              📖 Deskripsi Cerita *
            </label>
            <textarea 
              id="description" 
              name="description" 
              class="form-textarea" 
              placeholder="Ceritakan pengalaman menarik Anda... (minimal 10 karakter)"
              required
              aria-describedby="description-help"
              style="
                width: 100%;
                min-height: 120px;
                padding: 1rem;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 1rem;
                font-family: inherit;
                resize: vertical;
                transition: border-color 0.3s ease, box-shadow 0.3s ease;
                box-sizing: border-box;
              "
            ></textarea>
            <div id="description-help" style="
              font-size: 0.875rem;
              color: #666;
              margin-top: 0.5rem;
            ">
              Ceritakan pengalaman Anda dengan detail (10-500 karakter)
            </div>
            <div id="char-count" style="
              font-size: 0.875rem;
              color: #999;
              text-align: right;
              margin-top: 0.25rem;
            ">
              0/500 karakter
            </div>
          </div>

          <!-- Photo Section -->
          <div class="form-group" style="margin-bottom: 2rem;">
            <label class="form-label" style="
              display: block;
              margin-bottom: 1rem;
              font-weight: 600;
              color: #8b5a8c;
              font-size: 1rem;
            ">
              📸 Foto Cerita *
            </label>
            
            <div class="photo-options" style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
              margin-bottom: 1rem;
            ">
              <button 
                type="button" 
                id="camera-btn" 
                class="photo-btn"
                style="
                  padding: 1rem;
                  border: 2px dashed #8b5a8c;
                  border-radius: 8px;
                  background: rgba(139, 90, 140, 0.05);
                  color: #8b5a8c;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 0.5rem;
                "
              >
                <span style="font-size: 1.5rem;">📷</span>
                <span>Ambil Foto</span>
              </button>
              
              <label 
                for="photo-input" 
                class="photo-btn"
                style="
                  padding: 1rem;
                  border: 2px dashed #8b5a8c;
                  border-radius: 8px;
                  background: rgba(139, 90, 140, 0.05);
                  color: #8b5a8c;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 0.5rem;
                "
              >
                <span style="font-size: 1.5rem;">📁</span>
                <span>Pilih File</span>
              </label>
              
              <input 
                type="file" 
                id="photo-input" 
                accept="image/*" 
                style="display: none;"
              />
            </div>

            <!-- Camera Section -->
            <div id="camera-section" style="display: none; margin-bottom: 1rem;">
              <div style="
                background: #f8f9fa;
                border-radius: 8px;
                padding: 1rem;
                text-align: center;
              ">
                <video 
                  id="camera-preview" 
                  autoplay 
                  muted 
                  playsinline
                  style="
                    width: 100%;
                    max-width: 400px;
                    height: auto;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                  "
                ></video>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                  <button 
                    type="button" 
                    id="capture-btn"
                    style="
                      padding: 0.75rem 1.5rem;
                      background: #8b5a8c;
                      color: white;
                      border: none;
                      border-radius: 6px;
                      font-weight: 600;
                      cursor: pointer;
                      transition: background-color 0.3s ease;
                    "
                  >
                    📸 Ambil Foto
                  </button>
                  <button 
                    type="button" 
                    id="cancel-camera-btn"
                    style="
                      padding: 0.75rem 1.5rem;
                      background: #6b7280;
                      color: white;
                      border: none;
                      border-radius: 6px;
                      font-weight: 600;
                      cursor: pointer;
                      transition: background-color 0.3s ease;
                    "
                  >
                    ❌ Batal
                  </button>
                </div>
              </div>
            </div>

            <!-- Photo Preview -->
            <div id="photo-preview" style="display: none; margin-bottom: 1rem;">
              <div style="
                background: #f8f9fa;
                border-radius: 8px;
                padding: 1rem;
                text-align: center;
                position: relative;
              ">
                <img 
                  id="preview-image" 
                  alt="Preview foto"
                  style="
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                  "
                />
                <button 
                  type="button" 
                  id="remove-photo-btn"
                  style="
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background: rgba(220, 53, 69, 0.9);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 2rem;
                    height: 2rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    transition: background-color 0.3s ease;
                  "
                  title="Hapus foto"
                >
                  ❌
                </button>
              </div>
            </div>
          </div>

          <!-- Location Section -->
          <div class="form-group" style="margin-bottom: 2rem;">
            <label class="form-label" style="
              display: block;
              margin-bottom: 1rem;
              font-weight: 600;
              color: #8b5a8c;
              font-size: 1rem;
            ">
              📍 Lokasi (Opsional)
            </label>
            
            <div class="location-options" style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
              margin-bottom: 1rem;
            ">
              <button 
                type="button" 
                id="get-location-btn"
                style="
                  padding: 0.75rem 1rem;
                  border: 2px solid #8b5a8c;
                  border-radius: 8px;
                  background: white;
                  color: #8b5a8c;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 0.5rem;
                "
              >
                <span>🎯</span>
                <span>Lokasi Saat Ini</span>
              </button>
              
              <button 
                type="button" 
                id="map-select-btn"
                style="
                  padding: 0.75rem 1rem;
                  border: 2px solid #8b5a8c;
                  border-radius: 8px;
                  background: white;
                  color: #8b5a8c;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 0.5rem;
                "
              >
                <span>🗺️</span>
                <span>Pilih di Peta</span>
              </button>
            </div>

            <!-- Coordinates Display -->
            <div id="coordinates-display" style="
              display: none;
              background: rgba(139, 90, 140, 0.1);
              padding: 0.75rem;
              border-radius: 8px;
              margin-bottom: 1rem;
              text-align: center;
            ">
              <div style="
                font-size: 0.875rem;
                color: #8b5a8c;
                font-weight: 600;
                margin-bottom: 0.25rem;
              ">
                📍 Lokasi Terpilih
              </div>
              <div id="coordinates-text" style="
                font-size: 0.875rem;
                color: #666;
                font-family: monospace;
              "></div>
            </div>

            <!-- Map Container -->
            <div id="map-container" style="display: none; margin-bottom: 1rem;">
              <div style="
                background: #f8f9fa;
                border-radius: 8px;
                padding: 1rem;
              ">
                <div style="
                  font-size: 0.875rem;
                  color: #666;
                  margin-bottom: 0.5rem;
                  text-align: center;
                ">
                  Klik pada peta untuk memilih lokasi
                </div>
                <div 
                  id="location-map" 
                  style="
                    width: 100%;
                    height: 300px;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                  "
                ></div>
              </div>
            </div>
          </div>

          <!-- Submit Section -->
          <div class="form-group" style="margin-bottom: 1rem;">
            <button 
              type="submit" 
              id="submit-btn"
              disabled
              style="
                width: 100%;
                padding: 1rem;
                background: #8b5a8c;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                opacity: 0.6;
              "
            >
              <span>✨</span>
              <span>Bagikan Cerita</span>
            </button>
            
            <div style="
              font-size: 0.875rem;
              color: #666;
              text-align: center;
              margin-top: 0.5rem;
            ">
              Pastikan semua field yang diperlukan sudah diisi
            </div>
          </div>
        </form>

        <!-- Notifications -->
        <div id="notification" style="
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: none;
        "></div>

        <!-- Loading Overlay -->
        <div id="loading-overlay" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 1001;
        ">
          <div style="
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          ">
            <div style="
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #8b5a8c;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem;
            "></div>
            <div style="color: #8b5a8c; font-weight: 600;">
              Sedang memproses...
            </div>
          </div>
        </div>
      </div>

      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .form-textarea:focus {
          outline: none;
          border-color: #8b5a8c !important;
          box-shadow: 0 0 0 3px rgba(139, 90, 140, 0.1) !important;
        }

        .photo-btn:hover {
          background: rgba(139, 90, 140, 0.1) !important;
          border-color: #8b5a8c !important;
          transform: translateY(-2px);
        }

        #submit-btn:not(:disabled) {
          opacity: 1 !important;
          background: linear-gradient(135deg, #b794b8, #8b5a8c) !important;
        }

        #submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(139, 90, 140, 0.3) !important;
        }

        #submit-btn:disabled {
          cursor: not-allowed !important;
        }

        #get-location-btn:hover,
        #map-select-btn:hover {
          background: #8b5a8c !important;
          color: white !important;
          transform: translateY(-2px);
        }

        #capture-btn:hover {
          background: #744a75 !important;
        }

        #cancel-camera-btn:hover {
          background: #555d68 !important;
        }

        #remove-photo-btn:hover {
          background: rgba(220, 53, 69, 1) !important;
        }

        @media (max-width: 768px) {
          .form-container {
            padding: 1rem !important;
          }
          
          .story-form {
            padding: 1.5rem !important;
          }
          
          .photo-options,
          .location-options {
            grid-template-columns: 1fr !important;
          }
          
          .form-header h1 {
            font-size: 1.5rem !important;
          }
        }
      </style>
    `;
  },

  async afterRender() {
    try {
      const model = new StoryModel();
      const presenter = new TambahCeritaPresenter(model, this);

      this.presenter = presenter;
      this._bindEvents();
      this._setupCharacterCounter();
      this._setupPageUnloadHandlers();
    } catch (error) {
      console.error("Error initializing TambahCerita:", error);
      this.showError(
        "Gagal menginisialisasi halaman. Silakan refresh halaman."
      );
    }
  },

  _setupPageUnloadHandlers() {
    this.beforeUnloadHandler = (event) => {
      if (this.presenter && this.presenter.cameraStream) {
        console.log("⚠️ Page unload detected - cleaning up camera...");
        this.presenter.stopCamera();

        if (
          this.presenter.selectedPhoto ||
          document.getElementById("description")?.value.trim()
        ) {
          const message =
            "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman?";
          event.preventDefault();
          event.returnValue = message;
          return message;
        }
      }
    };

    this.unloadHandler = () => {
      if (this.presenter) {
        console.log("🔄 Page unload - final cleanup...");
        this.presenter.stopCamera();
      }
    };

    this.visibilityChangeHandler = () => {
      if (document.hidden && this.presenter && this.presenter.cameraStream) {
        console.log("👁️ Page hidden - pausing camera...");
        this.presenter.stopCamera();
        this.showNotification(
          "Kamera dihentikan karena halaman tidak aktif",
          "info"
        );
      }
    };

    this.hashChangeHandler = (event) => {
      const oldURL = event.oldURL || "";
      const newURL = event.newURL || window.location.href;

      if (
        oldURL.includes("#/tambah-cerita") &&
        !newURL.includes("#/tambah-cerita")
      ) {
        console.log("🔄 Navigation detected - cleaning up...");
        this._cleanupBeforeNavigation();
      }
    };

    this.popStateHandler = () => {
      if (!window.location.hash.includes("#/tambah-cerita")) {
        console.log("⬅️ Browser navigation detected - cleaning up...");
        this._cleanupBeforeNavigation();
      }
    };

    window.addEventListener("beforeunload", this.beforeUnloadHandler);
    window.addEventListener("unload", this.unloadHandler);
    document.addEventListener("visibilitychange", this.visibilityChangeHandler);
    window.addEventListener("hashchange", this.hashChangeHandler);
    window.addEventListener("popstate", this.popStateHandler);

    console.log("✅ Page unload handlers registered");
  },

  _cleanupBeforeNavigation() {
    if (this.presenter) {
      if (this.presenter.cameraStream) {
        console.log("🎥 Stopping active camera stream...");
        this.presenter.stopCamera();
      }

      this.presenter.destroy();
    }
  },

  showNotification(message, type = "info") {
    const colors = {
      error: "#dc3545",
      success: "#28a745",
      info: "#17a2b8",
      warning: "#ffc107",
    };

    const icons = {
      error: "❌",
      success: "✅",
      info: "ℹ️",
      warning: "⚠️",
    };

    this._showNotification(message, type, colors[type], icons[type]);
  },

  _bindEvents() {
    const form = document.getElementById("story-form");
    const cameraBtn = document.getElementById("camera-btn");
    const photoInput = document.getElementById("photo-input");
    const captureBtn = document.getElementById("capture-btn");
    const cancelCameraBtn = document.getElementById("cancel-camera-btn");
    const removePhotoBtn = document.getElementById("remove-photo-btn");
    const getLocationBtn = document.getElementById("get-location-btn");
    const mapSelectBtn = document.getElementById("map-select-btn");
    const descriptionTextarea = document.getElementById("description");

    form?.addEventListener("submit", (e) => this.presenter.handleSubmit(e));

    cameraBtn?.addEventListener("click", () => this.presenter.startCamera());
    photoInput?.addEventListener("change", (e) =>
      this.presenter.handleFileSelect(e)
    );
    captureBtn?.addEventListener("click", () => this.presenter.capturePhoto());
    cancelCameraBtn?.addEventListener("click", () =>
      this.presenter.stopCamera()
    );
    removePhotoBtn?.addEventListener("click", () =>
      this.presenter.removePhoto()
    );

    getLocationBtn?.addEventListener("click", () =>
      this.presenter.getCurrentLocation()
    );
    mapSelectBtn?.addEventListener("click", () =>
      this.presenter.toggleMapSelection()
    );

    descriptionTextarea?.addEventListener("input", () =>
      this.presenter.validateForm()
    );
  },

  _setupCharacterCounter() {
    const textarea = document.getElementById("description");
    const charCount = document.getElementById("char-count");

    if (textarea && charCount) {
      textarea.addEventListener("input", () => {
        const length = textarea.value.length;
        charCount.textContent = `${length}/500 karakter`;

        if (length > 500) {
          charCount.style.color = "#dc3545";
        } else if (length < 10) {
          charCount.style.color = "#6c757d";
        } else {
          charCount.style.color = "#28a745";
        }
      });
    }
  },

  showError(message) {
    this.showNotification(message, "error");
  },

  showSuccess(message) {
    this.showNotification(message, "success");
  },

  showLoading() {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.style.display = "flex";
    }
  },

  hideLoading() {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.style.display = "none";
    }
  },

  showCameraSection() {
    const cameraSection = document.getElementById("camera-section");
    if (cameraSection) {
      cameraSection.style.display = "block";
    }
  },

  hideCameraSection() {
    const cameraSection = document.getElementById("camera-section");
    if (cameraSection) {
      cameraSection.style.display = "none";
    }
  },

  showPhotoPreview(imageUrl) {
    const photoPreview = document.getElementById("photo-preview");
    const previewImage = document.getElementById("preview-image");

    if (photoPreview && previewImage) {
      previewImage.src = imageUrl;
      photoPreview.style.display = "block";
    }
  },

  hidePhotoPreview() {
    const photoPreview = document.getElementById("photo-preview");
    if (photoPreview) {
      photoPreview.style.display = "none";
    }
  },

  showMapSection() {
    const mapContainer = document.getElementById("map-container");
    if (mapContainer) {
      mapContainer.style.display = "block";
    }
  },

  hideMapSection() {
    const mapContainer = document.getElementById("map-container");
    if (mapContainer) {
      mapContainer.style.display = "none";
    }
  },

  updateCoordinatesDisplay(lat, lon) {
    const coordDisplay = document.getElementById("coordinates-display");
    const coordText = document.getElementById("coordinates-text");

    if (coordDisplay && coordText) {
      coordText.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      coordDisplay.style.display = "block";
    }
  },

  enableSubmitButton() {
    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  },

  disableSubmitButton() {
    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
    }
  },

  _showNotification(message, type, bgColor = "#17a2b8", icon = "ℹ️") {
    const notification = document.getElementById("notification");
    if (!notification) return;

    notification.innerHTML = `
      <div style="
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 400px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
      ">
        <span>${icon}</span>
        <span>${message}</span>
      </div>
    `;

    if (!document.querySelector("#notification-animation-styles")) {
      const style = document.createElement("style");
      style.id = "notification-animation-styles";
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    notification.style.display = "block";

    setTimeout(() => {
      const notificationElement = notification.querySelector("div");
      if (notificationElement) {
        notificationElement.style.animation = "slideOut 0.3s ease-in forwards";
        setTimeout(() => {
          notification.style.display = "none";
        }, 300);
      }
    }, 5000);
  },

  destroy() {
    console.log("🧹 Cleaning up TambahCerita component...");

    if (this.presenter) {
      this.presenter.destroy();
    }

    if (this.beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this.beforeUnloadHandler);
    }
    if (this.unloadHandler) {
      window.removeEventListener("unload", this.unloadHandler);
    }
    if (this.visibilityChangeHandler) {
      document.removeEventListener(
        "visibilitychange",
        this.visibilityChangeHandler
      );
    }
    if (this.hashChangeHandler) {
      window.removeEventListener("hashchange", this.hashChangeHandler);
    }
    if (this.popStateHandler) {
      window.removeEventListener("popstate", this.popStateHandler);
    }

    console.log("✅ TambahCerita cleanup completed");
  },
};

export default TambahCerita;
