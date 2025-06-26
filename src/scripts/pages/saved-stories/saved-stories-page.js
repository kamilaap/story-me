import { storyDB } from "../../services/Database.js";

const SavedStories = {
  async render() {
    return `
      <div class="saved-container">
        <div class="saved-header">
          <button id="back-btn" class="back-btn">
            <i class="fas fa-arrow-left"></i>
            Kembali
          </button>
          <h1 class="saved-title">
            💾 Cerita Tersimpan
          </h1>
        </div>
        
        <div id="saved-stories-content" class="saved-stories-content">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat cerita tersimpan...</p>
          </div>
        </div>
      </div>
      
      <style>
        .saved-container {
          min-height: 100vh;
          padding: 20px;
          background: linear-gradient(135deg, #e8c5e5 0%, #d4a7d1 50%, #c28dbf 100%);
        }
        
        .saved-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .back-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .saved-title {
          color: white;
          margin: 0;
          font-size: 2rem;
        }
        
        .loading-state {
          text-align: center;
          color: white;
          padding: 50px;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .empty-state {
          text-align: center;
          color: white;
          padding: 50px;
        }
        
        .empty-state h2 {
          margin-bottom: 15px;
        }
        
        .empty-state p {
          margin-bottom: 25px;
          opacity: 0.8;
        }
        
        .btn-primary {
          background: #ff6b6b;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          background: #ff5252;
          transform: translateY(-2px);
        }
        
        .saved-stories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .saved-story-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .saved-story-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .saved-story-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .saved-story-info {
          padding: 20px;
          color: white;
        }
        
        .saved-story-info h3 {
          margin: 0 0 10px 0;
          font-size: 1.3rem;
        }
        
        .saved-story-info p {
          margin: 0 0 15px 0;
          opacity: 0.8;
          line-height: 1.5;
        }
        
        .saved-story-actions {
          display: flex;
          gap: 10px;
        }
        
        .btn-view {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          flex: 1;
          transition: all 0.3s ease;
        }
        
        .btn-view:hover {
          background: #45a049;
        }
        
        .btn-delete {
          background: #f44336;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-delete:hover {
          background: #da190b;
        }
        
        .error-state {
          text-align: center;
          color: white;
          padding: 50px;
        }
        
        .error-state h2 {
          color: #ff6b6b;
          margin-bottom: 15px;
        }
        
        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          z-index: 1000;
          transform: translateX(100%);
          transition: transform 0.3s ease;
        }
        
        .toast.show {
          transform: translateX(0);
        }
        
        .toast.success {
          background: #4CAF50;
        }
        
        .toast.error {
          background: #f44336;
        }
      </style>
    `;
  },

  async afterRender() {
    console.log("SavedStories afterRender called");
    this._initializeEventListeners();
    await this.loadSavedStories();
  },

  async loadSavedStories() {
    console.log("Loading saved stories...");

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout loading stories")), 10000)
      );

      const storiesPromise = storyDB.getSavedStories();

      const savedStories = await Promise.race([storiesPromise, timeoutPromise]);

      console.log("Saved stories loaded:", savedStories);
      this.renderSavedStories(savedStories);
    } catch (error) {
      console.error("Error loading saved stories:", error);
      this.showError("Gagal memuat cerita tersimpan: " + error.message);
    }
  },

  renderSavedStories(stories) {
    console.log("Rendering saved stories:", stories.length);

    const content = document.getElementById("saved-stories-content");

    if (!content) {
      console.error("Content element not found!");
      return;
    }

    if (stories.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <h2>📚 Belum Ada Cerita Tersimpan</h2>
          <p>Simpan cerita favorit Anda untuk dibaca offline</p>
          <button onclick="window.location.hash='#/home'" class="btn-primary">
            Jelajahi Cerita
          </button>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="saved-stories-grid">
        ${stories
          .map(
            (story) => `
          <div class="saved-story-card" data-story-id="${story.id}">
            <img src="${story.photoUrl || "/images/default-story.jpg"}" 
                 alt="${story.description || story.name}" 
                 class="saved-story-image"
                 onerror="this.src='/images/default-story.jpg'">
            <div class="saved-story-info">
              <h3>${story.name || "Untitled Story"}</h3>
              <p>${(story.description || "No description available").substring(
                0,
                100
              )}...</p>
              <div class="saved-story-actions">
                <button onclick="window.location.hash='#/detail-story?id=${
                  story.id
                }'" class="btn-view">
                  Lihat Detail
                </button>
                <button class="btn-delete" data-story-id="${story.id}">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    this._initializeDeleteButtons();
  },

  showError(message) {
    const content = document.getElementById("saved-stories-content");
    if (content) {
      content.innerHTML = `
        <div class="error-state">
          <h2>❌ Error</h2>
          <p>${message}</p>
          <button onclick="location.reload()" class="btn-primary">
            Coba Lagi
          </button>
        </div>
      `;
    }
  },

  _initializeEventListeners() {
    const backBtn = document.getElementById("back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.history.back();
      });
    }
  },

  _initializeDeleteButtons() {
    const deleteButtons = document.querySelectorAll(".btn-delete");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const storyId = e.target.dataset.storyId;
        if (confirm("Hapus cerita ini dari simpanan?")) {
          await this.deleteStory(storyId);
        }
      });
    });
  },

  async deleteStory(storyId) {
    try {
      await storyDB.deleteStory(storyId);
      await this.loadSavedStories();
      this._showToast("Cerita berhasil dihapus", "success");
    } catch (error) {
      console.error("Error deleting story:", error);
      this._showToast("Gagal menghapus cerita", "error");
    }
  },

  _showToast(message, type = "success") {
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
};

export default SavedStories;
