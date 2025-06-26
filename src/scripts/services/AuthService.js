import CONFIG from "../config/config.js";

class AuthService {
  static initializeAuth() {
    try {
      console.log("Initializing auth service...");

      if (this.isAuthenticated()) {
        if (!this.isTokenValid()) {
          console.warn("Token expired, logging out...");
          this.logout();
        } else {
          console.log("User is authenticated with valid token");
        }
      }

      this.updateAuthNavigation();

      this._setupTokenValidation();

      console.log("Auth service initialized successfully");
    } catch (error) {
      console.error("Error initializing auth:", error);
    }
  }

  static _setupTokenValidation() {
    setInterval(() => {
      if (this.isAuthenticated() && !this.isTokenValid()) {
        console.warn("Token expired during session, logging out...");
        this.handleLogout("Sesi Anda telah berakhir. Silakan login kembali.");
      }
    }, 5 * 60 * 1000);
  }

  static isAuthenticated() {
    try {
      const token = this.getAuthToken();
      return (
        token !== null &&
        token !== undefined &&
        token !== "" &&
        token !== "null"
      );
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

  static getAuthToken() {
    try {
      return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  static getCurrentUser() {
    try {
      const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
      if (!userData || userData === "null" || userData === "undefined") {
        return null;
      }
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static saveLoginData(loginResult) {
    try {
      console.log("Saving login data:", loginResult);

      if (loginResult && loginResult.loginResult) {
        const { token, userId, name } = loginResult.loginResult;

        if (!token) {
          console.error("No token received in login result");
          return false;
        }

        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);

        const userData = {
          userId: userId,
          name: name || "User",
        };
        localStorage.setItem(
          CONFIG.STORAGE_KEYS.USER,
          JSON.stringify(userData)
        );

        console.log("Login data saved successfully");

        this._dispatchAuthEvent("auth-success", {
          message: "Login berhasil",
          user: userData,
        });

        return true;
      } else {
        console.error("Invalid login result structure:", loginResult);
        return false;
      }
    } catch (error) {
      console.error("Error saving login data:", error);
      return false;
    }
  }

  static logout() {
    try {
      console.log("Logging out user...");

      localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);

      localStorage.setItem(
        CONFIG.STORAGE_KEYS.NOTIFICATION_SUBSCRIBED,
        "false"
      );
      localStorage.removeItem(CONFIG.STORAGE_KEYS.NOTIFICATION_SUBSCRIPTION);

      if (CONFIG.STORAGE_KEYS.LAST_STORY) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.LAST_STORY);
      }

      if (window.notificationSystem) {
        window.notificationSystem.isSubscribed = false;
        window.notificationSystem.updateUI();
      }

      console.log("User logged out successfully");

      this._dispatchAuthEvent("user-logout", {
        message: "Logout berhasil",
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
  static onAuthChange(callback) {
    window.addEventListener("auth-success", callback);
    window.addEventListener("user-logout", callback);
  }
  static handleLogout(message = "Anda telah logout dengan sukses") {
    try {
      this.logout();

      this.updateAuthNavigation();

      const currentHash = window.location.hash;
      if (currentHash !== "#/login" && currentHash !== "#/register") {
        window.location.hash = "#/login";
      }

      setTimeout(() => {
        this._dispatchAuthEvent("show-message", {
          type: "success",
          message: message,
        });
      }, 100);
    } catch (error) {
      console.error("Error handling logout:", error);
    }
  }

  static isTokenValid() {
    const token = this.getAuthToken();
    if (!token || token === "null") return false;

    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));

      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const isValid = payload.exp > currentTime;

        if (!isValid) {
          console.warn("Token has expired");
        }

        return isValid;
      }

      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }

  static updateAuthNavigation() {
    try {
      const isLoggedIn = this.isAuthenticated() && this.isTokenValid();
      const currentUser = this.getCurrentUser();

      console.log(
        "Updating auth navigation. Logged in:",
        isLoggedIn,
        "User:",
        currentUser
      );

      const loginLink = document.querySelector('a[href="#/login"]');
      const registerLink = document.querySelector('a[href="#/register"]');
      let userSection = document.querySelector(".nav-user-section");

      if (isLoggedIn && currentUser) {
        if (loginLink) {
          loginLink.style.display = "none";
        }
        if (registerLink) {
          registerLink.style.display = "none";
        }

        if (!userSection) {
          let navRight = document.querySelector(".nav-right");
          if (!navRight) {
            const navbar = document.querySelector(".navbar");
            if (navbar) {
              navRight = document.createElement("div");
              navRight.className = "nav-right";
              navbar.appendChild(navRight);
            }
          }

          if (navRight) {
            userSection = document.createElement("div");
            userSection.className = "nav-user-section";
            navRight.appendChild(userSection);
          }
        }

        if (userSection) {
          userSection.innerHTML = `
          <span class="nav-welcome">Halo, ${currentUser.name || "User"}!</span>
          <button class="nav-logout" id="logout-btn">
            Logout
          </button>
        `;
          userSection.style.display = "flex";
        }

        const logoutBtn = document.querySelector("#logout-btn");
        if (logoutBtn) {
          logoutBtn.replaceWith(logoutBtn.cloneNode(true));
          const newLogoutBtn = document.querySelector("#logout-btn");

          newLogoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            this.handleLogout();
          });
        }
      } else {
        if (loginLink) {
          loginLink.style.display = "inline-block";
        }
        if (registerLink) {
          registerLink.style.display = "inline-block";
        }

        if (userSection) {
          userSection.style.display = "none";
        }
      }

      const protectedLinks = document.querySelectorAll(
        '[data-protected="true"]'
      );
      protectedLinks.forEach((link) => {
        if (isLoggedIn) {
          link.style.display = "inline-block";
          link.removeAttribute("disabled");
        } else {
          link.style.display = "none";
          link.setAttribute("disabled", "true");
        }
      });
    } catch (error) {
      console.error("Error updating auth navigation:", error);
    }
  }
  static requiresAuth(page) {
    const protectedPages = [
      "create-story",
      "my-stories",
      "profile",
      "dashboard",
    ];
    return protectedPages.includes(page);
  }

  static redirectToLoginIfNeeded(currentPage) {
    if (this.requiresAuth(currentPage) && !this.isAuthenticated()) {
      console.log(`Page ${currentPage} requires auth, redirecting to login`);
      window.location.hash = "#/login";

      setTimeout(() => {
        this._dispatchAuthEvent("show-message", {
          type: "info",
          message:
            "Silakan login terlebih dahulu untuk mengakses halaman tersebut.",
        });
      }, 100);

      return true;
    }
    return false;
  }

  static _dispatchAuthEvent(eventName, detail) {
    try {
      const event = new CustomEvent(eventName, { detail });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error dispatching auth event:", error);
    }
  }

  static saveLastStoryData(storyData, storyId) {
    try {
      const lastStoryCreated = {
        timestamp: Date.now(),
        storyId: storyId || "unknown",
        description: storyData.description?.substring(0, 100) || "",
      };
      const storageKey = CONFIG.STORAGE_KEYS.LAST_STORY || "last_story_created";
      localStorage.setItem(storageKey, JSON.stringify(lastStoryCreated));
      return true;
    } catch (storageError) {
      console.warn("Failed to store story creation data:", storageError);
      return false;
    }
  }

  static getLastStoryData() {
    try {
      const storageKey = CONFIG.STORAGE_KEYS.LAST_STORY || "last_story_created";
      const lastStoryData = localStorage.getItem(storageKey);
      return lastStoryData ? JSON.parse(lastStoryData) : null;
    } catch (error) {
      console.error("Error getting last story data:", error);
      return null;
    }
  }

  static hasPermission(permission) {
    const user = this.getCurrentUser();
    return user && user.permissions && user.permissions.includes(permission);
  }

  static getAuthHeaders() {
    const token = this.getAuthToken();
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    }
    return {
      "Content-Type": "application/json",
    };
  }

  static async validateSession() {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (!this.isTokenValid()) {
      console.log("Token expired, attempting to refresh...");
      this.handleLogout("Sesi Anda telah berakhir. Silakan login kembali.");
      return false;
    }

    return true;
  }
}

export default AuthService;
