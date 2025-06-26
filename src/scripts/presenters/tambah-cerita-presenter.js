import CONFIG, { MapUtils } from "../config/config.js";

class TambahCeritaPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.cameraStream = null;
    this.selectedPhoto = null;
    this.selectedLocation = null;
    this.map = null;
    this.currentMarker = null;
    this.mapLayers = null;
    this.layerControl = null;
    this.isDestroyed = false;

    this._handleVisibilityChange = this._handleVisibilityChange.bind(this);
    this._handleBeforeUnload = this._handleBeforeUnload.bind(this);
    this._handleHashChange = this._handleHashChange.bind(this);
    this._handlePopState = this._handlePopState.bind(this);

    this._setupPageHandlers();
  }

  _setupPageHandlers() {
    document.addEventListener("visibilitychange", this._handleVisibilityChange);

    window.addEventListener("beforeunload", this._handleBeforeUnload);

    window.addEventListener("hashchange", this._handleHashChange);

    window.addEventListener("popstate", this._handlePopState);

    console.log("📡 Page navigation handlers registered in presenter");
  }

  _handleVisibilityChange() {
    if (this.isDestroyed) return;

    if (document.hidden && this.cameraStream) {
      console.log("👁️ Page hidden - stopping camera from presenter...");
      this.stopCamera();
      if (this.view && this.view.showNotification) {
        this.view.showNotification(
          "Kamera dihentikan karena halaman tidak aktif",
          "info"
        );
      }
    }
  }

  _handleBeforeUnload(event) {
    if (this.isDestroyed) return;

    if (this.cameraStream) {
      console.log(
        "⚠️ Page unload detected - cleaning up camera from presenter..."
      );
      this.stopCamera();
    }
  }

  _handleHashChange(event) {
    if (this.isDestroyed) return;

    const oldURL = event.oldURL || "";
    const newURL = event.newURL || window.location.href;

    if (
      oldURL.includes("#/tambah-cerita") &&
      !newURL.includes("#/tambah-cerita")
    ) {
      console.log("🔄 Navigation away from tambah-cerita - cleaning up...");
      this._performCleanup();
    }
  }

  _handlePopState() {
    if (this.isDestroyed) return;

    if (!window.location.hash.includes("#/tambah-cerita")) {
      console.log(
        "⬅️ Browser navigation away from tambah-cerita - cleaning up..."
      );
      this._performCleanup();
    }
  }

  _performCleanup() {
    if (this.isDestroyed) return;

    console.log("🧹 Performing navigation cleanup...");

    if (this.cameraStream) {
      console.log("🎥 Stopping active camera stream...");
      this.stopCamera();
    }

    if (this.map) {
      console.log("🗺️ Cleaning up map...");
      this._cleanupMap();
    }

    this._resetState();
  }

  isCameraActive() {
    return !!(this.cameraStream && this.cameraStream.active);
  }

  getCameraStatus() {
    if (!this.cameraStream) return "Not initialized";
    if (!this.cameraStream.active) return "Inactive";

    const tracks = this.cameraStream.getVideoTracks();
    if (tracks.length === 0) return "No video tracks";

    const track = tracks[0];
    return {
      enabled: track.enabled,
      readyState: track.readyState,
      muted: track.muted,
      settings: track.getSettings(),
    };
  }

  async handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const description = formData.get("description");

    if (!description || description.trim().length < 10) {
      this.view.showError("Deskripsi minimal 10 karakter");
      return;
    }

    if (description.trim().length > 500) {
      this.view.showError("Deskripsi maksimal 500 karakter");
      return;
    }

    if (!this.selectedPhoto) {
      this.view.showError("Silakan pilih atau ambil foto");
      return;
    }

    const photoValidation = this._validatePhoto(this.selectedPhoto);
    if (!photoValidation.valid) {
      this.view.showError(photoValidation.message);
      return;
    }

    try {
      this.view.showLoading();

      const storyData = {
        description: description.trim(),
        photo: this.selectedPhoto,
      };

      if (this.selectedLocation) {
        storyData.lat = parseFloat(this.selectedLocation.lat);
        storyData.lon = parseFloat(this.selectedLocation.lon);
      }

      const isAuthenticated = this.model.isAuthenticated();

      console.log("Submitting story:", {
        description: storyData.description,
        photoName: storyData.photo.name,
        photoSize: storyData.photo.size,
        photoType: storyData.photo.type,
        hasLocation: !!(storyData.lat && storyData.lon),
        useAuth: isAuthenticated,
      });

      await this.model.addStory(storyData, isAuthenticated);

      this.view.hideLoading();
      this.view.showSuccess("Cerita berhasil ditambahkan!");

      this._resetForm();

      setTimeout(() => {
        window.location.hash = "#/home";
      }, 2000);
    } catch (error) {
      this.view.hideLoading();
      console.error("Submit error:", error);
      this.view.showError(error.message);
    }
  }

  async startCamera() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.view.showError("Kamera tidak didukung oleh browser Anda");
        return;
      }

      if (this.cameraStream) {
        console.log("🔄 Stopping existing camera stream...");
        this.stopCamera();
      }

      this.cameraStream = await this.tryGetUserMedia([
        CONFIG.CAMERA.VIDEO_CONSTRAINTS,
        CONFIG.CAMERA.FALLBACK_CONSTRAINTS,
        CONFIG.CAMERA.MINIMAL_CONSTRAINTS,
      ]);

      const video = document.getElementById("camera-preview");
      if (video) {
        video.srcObject = this.cameraStream;
        this.view.showCameraSection();

        video.addEventListener("loadedmetadata", () => {
          console.log("Camera initialized successfully:", {
            width: video.videoWidth,
            height: video.videoHeight,
            settings: this.cameraStream.getVideoTracks()[0]?.getSettings(),
            active: this.cameraStream.active,
          });
        });

        this.cameraStream.getVideoTracks().forEach((track) => {
          track.addEventListener("ended", () => {
            console.log("📹 Camera track ended");
            this._handleCameraStreamEnded();
          });
        });
      }
    } catch (error) {
      this.handleCameraError(error);
    }
  }

  _handleCameraStreamEnded() {
    console.log("🎥 Camera stream ended automatically");
    this.cameraStream = null;
    this.view.hideCameraSection();

    if (this.view && this.view.showNotification) {
      this.view.showNotification("Kamera telah dihentikan", "info");
    }
  }

  async tryGetUserMedia(constraintsArray) {
    let lastError;

    for (let i = 0; i < constraintsArray.length; i++) {
      const constraints = constraintsArray[i];
      try {
        console.log(
          `Trying camera constraints (attempt ${i + 1}):`,
          constraints
        );
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(
          "✅ Camera access successful with constraints:",
          constraints
        );
        return stream;
      } catch (error) {
        console.log(
          `❌ Failed with constraints (attempt ${i + 1}):`,
          error.name,
          error.message
        );
        lastError = error;

        if (error.name === "NotAllowedError") {
          break;
        }

        if (error.name === "OverconstrainedError") {
          console.log("Constraint yang bermasalah:", error.constraint);
          continue;
        }
      }
    }

    throw lastError;
  }

  handleCameraError(error) {
    console.error("Camera error details:", {
      name: error.name,
      message: error.message,
      constraint: error.constraint,
    });

    let errorMessage = "Tidak dapat mengakses kamera.";
    let suggestions = "";

    switch (error.name) {
      case "NotAllowedError":
        errorMessage = "Akses kamera ditolak.";
        suggestions = "Silakan berikan izin akses kamera dan refresh halaman.";
        break;
      case "NotFoundError":
        errorMessage = "Kamera tidak ditemukan pada perangkat Anda.";
        suggestions = "Pastikan perangkat memiliki kamera yang terpasang.";
        break;
      case "NotSupportedError":
        errorMessage = "Kamera tidak didukung oleh browser Anda.";
        suggestions =
          "Coba gunakan browser yang lebih baru atau gunakan opsi upload file.";
        break;
      case "OverconstrainedError":
        errorMessage = "Pengaturan kamera tidak dapat dipenuhi.";
        suggestions = `${
          error.constraint ? `Masalah pada: ${error.constraint}. ` : ""
        }Silakan gunakan opsi upload file sebagai alternatif.`;
        break;
      case "NotReadableError":
        errorMessage = "Kamera sedang digunakan oleh aplikasi lain.";
        suggestions =
          "Tutup aplikasi lain yang menggunakan kamera dan coba lagi.";
        break;
      case "AbortError":
        errorMessage = "Akses kamera dibatalkan.";
        suggestions = "Silakan coba lagi.";
        break;
      case "TypeError":
        errorMessage = "Terjadi kesalahan sistem.";
        suggestions = "Silakan refresh halaman dan coba lagi.";
        break;
      default:
        errorMessage = `Terjadi kesalahan: ${error.message}`;
        suggestions = "Silakan coba lagi atau gunakan opsi upload file.";
    }

    this.view.showError(`${errorMessage} ${suggestions}`);
  }

  async getCameraInfo() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      console.log(
        "Available cameras:",
        videoDevices.map((device) => ({
          id: device.deviceId,
          label: device.label || "Camera",
          groupId: device.groupId,
        }))
      );

      return videoDevices;
    } catch (error) {
      console.error("Error getting camera info:", error);
      return [];
    }
  }

  async testCameraCapabilities() {
    try {
      const capabilities =
        await navigator.mediaDevices.getSupportedConstraints();
      console.log("Supported camera constraints:", capabilities);
      return capabilities;
    } catch (error) {
      console.error("Error getting camera capabilities:", error);
      return {};
    }
  }

  stopCamera() {
    if (this.cameraStream) {
      console.log("🛑 Stopping camera stream...");

      this.cameraStream.getTracks().forEach((track) => {
        console.log(
          `Stopping track: ${track.kind}, state: ${track.readyState}`
        );
        track.stop();
      });

      const video = document.getElementById("camera-preview");
      if (video) {
        video.srcObject = null;
      }

      this.cameraStream = null;
      console.log("✅ Camera stream stopped successfully");
    }

    this.view.hideCameraSection();
  }

  capturePhoto() {
    const video = document.getElementById("camera-preview");
    if (!video || !this.cameraStream) {
      this.view.showError("Kamera tidak aktif");
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      this.view.showError("Video belum siap. Coba lagi dalam beberapa detik.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const timestamp = new Date().getTime();
          this.selectedPhoto = new File(
            [blob],
            `camera-photo-${timestamp}.jpg`,
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          );

          const validation = this._validatePhoto(this.selectedPhoto);
          if (!validation.valid) {
            this.view.showError(validation.message);
            return;
          }

          const imageUrl = URL.createObjectURL(blob);
          this.view.showPhotoPreview(imageUrl);

          this.stopCamera();

          this.validateForm();

          console.log("Photo captured:", {
            name: this.selectedPhoto.name,
            size: this.selectedPhoto.size,
            type: this.selectedPhoto.type,
          });
        } else {
          this.view.showError("Gagal mengambil foto. Coba lagi.");
        }
      },
      "image/jpeg",
      0.8
    );
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validation = this._validatePhoto(file);
    if (!validation.valid) {
      this.view.showError(validation.message);
      event.target.value = "";
      return;
    }

    this.selectedPhoto = file;

    const imageUrl = URL.createObjectURL(file);
    this.view.showPhotoPreview(imageUrl);

    this.validateForm();

    console.log("File selected:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
  }

  removePhoto() {
    this.selectedPhoto = null;
    this.view.hidePhotoPreview();

    const photoInput = document.getElementById("photo-input");
    if (photoInput) {
      photoInput.value = "";
    }

    this.validateForm();
  }

  async getCurrentLocation() {
    if (!navigator.geolocation) {
      this.view.showError("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    try {
      this.view.showLoading();

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      this.selectedLocation = { lat, lon };
      this.view.updateCoordinatesDisplay(lat, lon);

      if (this.map) {
        this._updateMapLocation(lat, lon);
      }

      this.view.hideLoading();
      this.view.showSuccess("Lokasi berhasil dideteksi");
    } catch (error) {
      this.view.hideLoading();

      let errorMessage = "Tidak dapat mendapatkan lokasi.";

      if (error.code === error.PERMISSION_DENIED) {
        errorMessage =
          "Akses lokasi ditolak. Silakan berikan izin akses lokasi.";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = "Informasi lokasi tidak tersedia.";
      } else if (error.code === error.TIMEOUT) {
        errorMessage = "Timeout mendapatkan lokasi. Coba lagi.";
      }

      this.view.showError(errorMessage);
      console.error("Geolocation error:", error);
    }
  }

  toggleMapSelection() {
    const mapContainer = document.getElementById("map-container");
    if (mapContainer.style.display === "none" || !mapContainer.style.display) {
      this.view.showMapSection();
      if (!this.map) {
        this.initializeMap();
      }
    } else {
      this.view.hideMapSection();
    }
  }

  initializeMap() {
    const mapElement = document.getElementById("location-map");
    if (!mapElement) {
      console.error("Map element not found");
      return;
    }

    try {
      const mapResult = MapUtils.initializeMap("location-map", {
        center: CONFIG.MAP.DEFAULT_CENTER,
        zoom: CONFIG.MAP.DEFAULT_ZOOM,
        defaultLayer: MapUtils.getLayerPreference(),
      });

      this.map = mapResult.map;
      this.mapLayers = mapResult.mapLayers;

      this.layerControl = L.control
        .layers(this.mapLayers, null, {
          position: "topright",
          collapsed: false,
        })
        .addTo(this.map);

      this._customizeLayerControl();

      this.map.on("click", (e) => {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;

        this.selectedLocation = { lat, lon };
        this.view.updateCoordinatesDisplay(lat, lon);

        this._updateMapLocation(lat, lon);
      });

      this.map.on("baselayerchange", (e) => {
        const layerName = this._getLayerNameFromLayer(e.layer);
        if (layerName) {
          MapUtils.saveLayerPreference(layerName);
        }
      });

      if (this.selectedLocation) {
        this._updateMapLocation(
          this.selectedLocation.lat,
          this.selectedLocation.lon
        );
      }

      if (CONFIG.MAP.CONTROLS.scaleControl) {
        L.control.scale().addTo(this.map);
      }

      console.log(
        "Map initialized successfully with layers:",
        Object.keys(this.mapLayers)
      );
    } catch (error) {
      console.error("Map initialization error:", error);
      this.view.showError(
        "Gagal menginisialisasi peta. Pastikan koneksi internet Anda stabil."
      );
    }
  }

  _customizeLayerControl() {
    const layerControlContainer = this.layerControl.getContainer();
    if (layerControlContainer) {
      layerControlContainer.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(139, 90, 140, 0.2);
        backdrop-filter: blur(10px);
      `;

      const labels = layerControlContainer.querySelectorAll("label");
      labels.forEach((label) => {
        label.style.cssText = `
          padding: 6px 8px;
          margin: 2px 0;
          border-radius: 4px;
          transition: background-color 0.2s ease;
          cursor: pointer;
          font-size: 0.9rem;
        `;

        label.addEventListener("mouseenter", () => {
          label.style.backgroundColor = "rgba(139, 90, 140, 0.1)";
        });

        label.addEventListener("mouseleave", () => {
          label.style.backgroundColor = "transparent";
        });
      });
    }
  }

  _getLayerNameFromLayer(layer) {
    for (const [name, mapLayer] of Object.entries(this.mapLayers)) {
      if (mapLayer === layer) {
        return name;
      }
    }
    return null;
  }

  _updateMapLocation(lat, lon) {
    if (!this.map) return;

    try {
      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
      }

      const customIcon = L.divIcon({
        className: "location-marker",
        html: `
          <div style="
            background: linear-gradient(135deg, #b794b8, #8b5a8c);
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
        popupAnchor: [0, -24],
      });

      this.currentMarker = L.marker([lat, lon], { icon: customIcon }).addTo(
        this.map
      ).bindPopup(`
          <div style="text-align: center; font-family: 'Segoe UI', sans-serif;">
            <strong style="color: #8b5a8c;">📍 Lokasi Dipilih</strong><br>
            <small style="color: #666;">
              ${lat.toFixed(6)}, ${lon.toFixed(6)}
            </small>
          </div>
        `);

      this.map.setView([lat, lon], Math.max(this.map.getZoom(), 15));
    } catch (error) {
      console.error("Map update error:", error);
    }
  }

  validateForm() {
    const description = document.getElementById("description")?.value;
    const isValid =
      description &&
      description.trim().length >= 10 &&
      description.trim().length <= 500 &&
      this.selectedPhoto;

    if (isValid) {
      this.view.enableSubmitButton();
    } else {
      this.view.disableSubmitButton();
    }
  }

  _validatePhoto(file) {
    if (!file) {
      return { valid: false, message: "File tidak ditemukan" };
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `Ukuran file terlalu besar. Maksimal ${
          CONFIG.MAX_FILE_SIZE / 1024 / 1024
        }MB`,
      };
    }

    if (!CONFIG.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        message: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP",
      };
    }

    return { valid: true };
  }

  _resetForm() {
    const form = document.getElementById("story-form");
    if (form) {
      form.reset();
    }

    this.selectedPhoto = null;
    this.view.hidePhotoPreview();

    this.selectedLocation = null;
    const coordDisplay = document.getElementById("coordinates-display");
    if (coordDisplay) {
      coordDisplay.style.display = "none";
    }

    if (this.currentMarker && this.map) {
      this.map.removeLayer(this.currentMarker);
      this.currentMarker = null;
    }

    this.view.hideCameraSection();
    this.view.hideMapSection();

    this.stopCamera();

    this.view.disableSubmitButton();
  }

  _resetState() {
    this.selectedPhoto = null;
    this.selectedLocation = null;
    this.currentMarker = null;
  }

  _cleanupMap() {
    try {
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
      this.mapLayers = null;
      this.layerControl = null;
      this.currentMarker = null;
    } catch (error) {
      console.error("Error cleaning up map:", error);
    }
  }

  _removeEventListeners() {
    document.removeEventListener(
      "visibilitychange",
      this._handleVisibilityChange
    );
    window.removeEventListener("beforeunload", this._handleBeforeUnload);
    window.removeEventListener("hashchange", this._handleHashChange);
    window.removeEventListener("popstate", this._handlePopState);

    console.log("📡 Page navigation handlers removed from presenter");
  }

  destroy() {
    if (this.isDestroyed) return;

    console.log("🧹 Destroying TambahCeritaPresenter...");

    this.isDestroyed = true;

    this.stopCamera();

    this._cleanupMap();

    this._removeEventListeners();

    this._resetState();

    console.log("✅ TambahCeritaPresenter destroyed successfully");
  }
}

export default TambahCeritaPresenter;
