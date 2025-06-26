import CONFIG from "../config/config.js";

const Utils = {
  showLoading() {
    this.hideLoading();

    const loading = document.createElement("div");
    loading.id = "loading-overlay";
    loading.className = "loading-overlay";
    loading.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Memuat...</p>
      </div>
    `;

    loading.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    const spinner = loading.querySelector(".loading-spinner");
    spinner.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    const spinnerDiv = loading.querySelector(".spinner");
    spinnerDiv.style.cssText = `
      border: 4px solid #f3f3f3;
      border-top: 4px solid #8b5a8c;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    `;

    if (!document.getElementById("loading-styles")) {
      const style = document.createElement("style");
      style.id = "loading-styles";
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(loading);
  },

  hideLoading() {
    const loading = document.getElementById("loading-overlay");
    if (loading) {
      loading.remove();
    }
  },

  showError(message) {
    this.showNotification(message, "error");
  },

  showSuccess(message) {
    this.showNotification(message, "success");
  },

  showInfo(message) {
    this.showNotification(message, "info");
  },

  showNotification(message, type = "info") {
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((notification) => notification.remove());

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;

    let backgroundColor, textColor, borderColor;
    switch (type) {
      case "error":
        backgroundColor = "#fee2e2";
        textColor = "#dc2626";
        borderColor = "#fca5a5";
        break;
      case "success":
        backgroundColor = "#d1fae5";
        textColor = "#065f46";
        borderColor = "#a7f3d0";
        break;
      case "info":
      default:
        backgroundColor = "#dbeafe";
        textColor = "#1e40af";
        borderColor = "#93c5fd";
        break;
    }

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${backgroundColor};
      color: ${textColor};
      border: 1px solid ${borderColor};
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      max-width: 400px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: ${textColor}; cursor: pointer; margin-left: 1rem; font-size: 1.2rem;">
          ×
        </button>
      </div>
    `;

    if (!document.getElementById("notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
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
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  },

  escapeHtml(text) {
    if (typeof text !== "string") {
      return "";
    }

    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  truncateText(text, maxLength = 100) {
    if (typeof text !== "string") {
      return "";
    }

    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength).trim() + "...";
  },

  validateFile(file) {
    if (!file) {
      return { valid: false, message: "File tidak ditemukan" };
    }

    const maxFileSize = CONFIG?.MAX_FILE_SIZE || 5 * 1024 * 1024;
    const supportedTypes = CONFIG?.SUPPORTED_IMAGE_TYPES || [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / 1024 / 1024;
      return {
        valid: false,
        message: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB. Ukuran file Anda: ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`,
      };
    }

    if (!supportedTypes.includes(file.type)) {
      return {
        valid: false,
        message: `Format file tidak didukung. Gunakan format: ${supportedTypes
          .map((type) => type.split("/")[1].toUpperCase())
          .join(", ")}`,
      };
    }

    if (file.size === 0) {
      return { valid: false, message: "File kosong atau rusak" };
    }

    return { valid: true, message: "File valid" };
  },

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  formatDate(dateString) {
    if (!dateString) {
      return "Tanggal tidak tersedia";
    }

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return "Format tanggal tidak valid";
      }

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };

      return date.toLocaleDateString("id-ID", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error format tanggal";
    }
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  validateDescription(description) {
    if (!description || typeof description !== "string") {
      return { valid: false, message: "Deskripsi harus diisi" };
    }

    const trimmed = description.trim();

    if (trimmed.length < 10) {
      return { valid: false, message: "Deskripsi minimal 10 karakter" };
    }

    if (trimmed.length > 500) {
      return { valid: false, message: "Deskripsi maksimal 500 karakter" };
    }

    return { valid: true, message: "Deskripsi valid" };
  },

  supportsCamera() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  supportsGeolocation() {
    return "geolocation" in navigator;
  },

  async getAddressFromCoordinates(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } catch (error) {
      console.error("Error getting address:", error);
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
  },

  async compressImage(file, maxSizeKB = 800) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        const maxWidth = 1024;
        const maxHeight = 1024;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob.size / 1024 <= maxSizeKB || quality <= 0.1) {
                resolve(new File([blob], file.name, { type: "image/jpeg" }));
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            "image/jpeg",
            quality
          );
        };

        tryCompress();
      };

      img.src = URL.createObjectURL(file);
    });
  },

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  },

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from localStorage:", error);
      return false;
    }
  },

  getHashRoute() {
    return window.location.hash.slice(1) || "/";
  },

  navigateTo(route) {
    window.location.hash = route;
  },

  getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return null;

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  },

  async checkOnlineStatus() {
    if (!navigator.onLine) {
      return false;
    }

    try {
      const response = await fetch("https://httpbin.org/get", {
        method: "HEAD",
        mode: "no-cors",
      });
      return true;
    } catch {
      return false;
    }
  },

  handleError(error, context = "") {
    console.error(`Error in ${context}:`, error);

    let message = "Terjadi kesalahan";

    if (error.message) {
      message = error.message;
    } else if (error.name === "NetworkError") {
      message = "Masalah koneksi jaringan";
    } else if (error.name === "TypeError") {
      message = "Terjadi kesalahan sistem";
    }

    this.showError(message);
    return message;
  },
};

export default Utils;
