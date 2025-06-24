import CONFIG from "../config/config.js";

class StoryModel {
  constructor() {
    this.baseUrl = CONFIG.BASE_URL;
  }

  isAuthenticated() {
    try {
      const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
      return token && token.length > 0;
    } catch (error) {
      console.warn("Could not check authentication:", error);
      return false;
    }
  }

  getAuthToken() {
    try {
      return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.warn("Could not get auth token:", error);
      return null;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}${CONFIG.ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Email atau password salah");
        } else if (response.status === 400) {
          throw new Error("Data yang dimasukkan tidak valid");
        } else {
          throw new Error(result.message || "Login gagal");
        }
      }

      if (result.error) {
        throw new Error(result.message || "Login gagal");
      }

      return result;
    } catch (error) {
      console.error("Error during login:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
        );
      }

      throw error;
    }
  }

  async register(userData) {
    try {
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error("Semua field harus diisi");
      }

      if (userData.name.trim().length < 2) {
        throw new Error("Nama minimal 2 karakter");
      }

      if (userData.password.length < 8) {
        throw new Error("Password minimal 8 karakter");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Format email tidak valid");
      }

      const response = await fetch(
        `${this.baseUrl}${CONFIG.ENDPOINTS.REGISTER}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          if (
            result.message &&
            result.message.toLowerCase().includes("email")
          ) {
            throw new Error("Email sudah terdaftar atau format tidak valid");
          }
          throw new Error(result.message || "Data yang dimasukkan tidak valid");
        } else if (response.status === 409) {
          throw new Error("Email sudah terdaftar");
        } else {
          throw new Error(result.message || "Registrasi gagal");
        }
      }

      if (result.error) {
        throw new Error(result.message || "Registrasi gagal");
      }

      return result;
    } catch (error) {
      console.error("Error during registration:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
        );
      }

      throw error;
    }
  }

  async addStory(storyData, useAuth = null) {
    try {
      const formData = new FormData();

      formData.append("description", storyData.description);
      formData.append("photo", storyData.photo);

      if (storyData.lat !== undefined && storyData.lon !== undefined) {
        formData.append("lat", storyData.lat.toString());
        formData.append("lon", storyData.lon.toString());
      }

      const headers = {};
      let endpoint = CONFIG.ENDPOINTS.STORIES_GUEST;

      const shouldUseAuth = useAuth !== null ? useAuth : this.isAuthenticated();

      if (shouldUseAuth) {
        const authToken = this.getAuthToken();
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
          endpoint = CONFIG.ENDPOINTS.STORIES;
        }
      }

      const url = `${this.baseUrl}${endpoint}`;

      console.log("Adding story to:", url, "with auth:", shouldUseAuth);

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesi telah berakhir. Silakan login kembali.");
        } else if (response.status === 413) {
          throw new Error("Ukuran file terlalu besar. Maksimal 1MB.");
        } else if (response.status === 400) {
          throw new Error(
            result.message || "Data tidak valid. Periksa kembali form Anda."
          );
        } else {
          throw new Error(result.message || "Gagal menambahkan cerita.");
        }
      }

      if (result.error) {
        throw new Error(result.message || "Gagal menambahkan cerita.");
      }

      return result;
    } catch (error) {
      console.error("Error adding story:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Koneksi bermasalah. Periksa koneksi internet Anda.");
      }

      throw error;
    }
  }

  async getStories(page = 1, size = 10, location = 0, authToken = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        location: location.toString(),
      });

      const headers = {};
      const tokenToUse =
        authToken || (this.isAuthenticated() ? this.getAuthToken() : null);

      if (tokenToUse) {
        headers["Authorization"] = `Bearer ${tokenToUse}`;
      }

      const response = await fetch(
        `${this.baseUrl}${CONFIG.ENDPOINTS.STORIES}?${params}`,
        { headers }
      );

      if (!response.ok) throw new Error("Failed to fetch stories");

      const result = await response.json();

      this._cacheStories(result.listStory);
      this._cacheLastStories(result.listStory.slice(0, 8));

      return result;
    } catch (error) {
      console.warn("Online fetch failed, trying cache:", error);

      const cachedStories = this._getCachedStories();
      if (cachedStories) {
        return {
          error: false,
          message: "Showing cached stories (offline mode)",
          listStory: cachedStories,
          isOffline: true,
        };
      }

      return {
        error: false,
        message: "No cached stories available",
        listStory: [],
        isOffline: true,
      };
    }
  }

  _getCachedStories() {
    try {
      const cachedData = localStorage.getItem(
        CONFIG.STORAGE_KEYS.OFFLINE_STORIES
      );
      if (!cachedData) return null;

      const { stories, timestamp } = JSON.parse(cachedData);
      const cacheAge = Date.now() - timestamp;

      if (cacheAge < CONFIG.OFFLINE_CACHE_EXPIRY) {
        return stories;
      }
      return null;
    } catch (error) {
      console.error("Failed to get cached stories:", error);
      return null;
    }
  }
  async getAllStories(options = {}) {
    const { page = 1, size = 20, location = 0, authToken = null } = options;
    return await this.getStories(page, size, location, authToken);
  }

  _cacheStories(stories) {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.OFFLINE_STORIES,
        JSON.stringify({
          stories: stories,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Failed to cache stories:", error);
    }
  }

  _cacheLastStories(stories) {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.LAST_STORIES,
        JSON.stringify(stories)
      );
    } catch (error) {
      console.error("Failed to cache last stories:", error);
    }
  }

  _getLastStories() {
    try {
      const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_STORIES);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Failed to get cached stories:", error);
      return null;
    }
  }

  async getStoryDetail(id, authToken = null) {
    try {
      const headers = {};

      const tokenToUse =
        authToken || (this.isAuthenticated() ? this.getAuthToken() : null);

      if (tokenToUse) {
        headers["Authorization"] = `Bearer ${tokenToUse}`;
      }

      console.log("Fetching story detail with auth:", !!tokenToUse);
      const response = await fetch(
        `${this.baseUrl}${CONFIG.ENDPOINTS.STORIES}/${id}`,
        {
          method: "GET",
          headers: headers,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesi telah berakhir. Silakan login kembali.");
        } else if (response.status === 404) {
          throw new Error("Cerita tidak ditemukan.");
        }
        throw new Error(result.message || "Gagal mengambil detail cerita.");
      }

      if (result.error) {
        throw new Error(result.message || "Gagal mengambil detail cerita.");
      }

      return result;
    } catch (error) {
      console.error("Error fetching story detail:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Koneksi bermasalah. Periksa koneksi internet Anda.");
      }

      throw error;
    }
  }
}

export default StoryModel;
