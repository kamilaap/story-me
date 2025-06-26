import UrlParser from "../routes/url-parser.js";
import routes from "../routes/routes.js";
import AuthService from "../services/AuthService";

class App {
  constructor() {
    this._routes = routes;
    this._mainContent = null;
    this._initialAppShell();
  }

  _initialAppShell() {
    this._ensureMainContentExists();

    const skipLink = document.querySelector(".skip-link");
    skipLink?.addEventListener("click", (e) => {
      e.preventDefault();
      const mainContent = document.querySelector("#main-content");
      if (mainContent) {
        mainContent.focus();
      }
    });

    this._updateActiveNavigation();

    AuthService.initializeAuth();

    window.addEventListener("hashchange", () => {
      this._updateActiveNavigation();
      AuthService.updateAuthNavigation();
      this._checkAuthRequirement();
    });

    window.addEventListener("user-logout", () => {
      this._handleUserLogout();
    });

    this._checkAuthRequirement();
  }

  _ensureMainContentExists() {
    this._mainContent = document.querySelector("#main-content");

    if (!this._mainContent) {
      console.warn("Element #main-content not found, creating one...");

      const header = document.querySelector("header");
      const footer = document.querySelector("footer");

      if (header && footer) {
        const mainElement = document.createElement("main");
        mainElement.id = "main-content";
        mainElement.setAttribute("tabindex", "-1");

        header.insertAdjacentElement("afterend", mainElement);
        this._mainContent = mainElement;
      } else {
        const mainElement = document.createElement("main");
        mainElement.id = "main-content";
        mainElement.setAttribute("tabindex", "-1");
        document.body.appendChild(mainElement);
        this._mainContent = mainElement;
      }
    }
  }

  _updateActiveNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const currentHash = window.location.hash || "#/home";

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active");
      }
    });
  }

  _updateAuthNavigation() {
    AuthService.updateAuthNavigation();
  }

  _checkAuthRequirement() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const currentPage = url.split("/")[0];

    if (AuthService.requiresAuth(currentPage)) {
      AuthService.redirectToLoginIfNeeded(currentPage);
    }
  }

  _handleUserLogout() {
    this._clearSensitiveData();

    window.location.hash = "#/home";

    setTimeout(() => {
      this.renderPage();
    }, 100);
  }

  _clearSensitiveData() {
    const userSpecificElements = document.querySelectorAll(
      "[data-user-specific]"
    );
    userSpecificElements.forEach((element) => {
      element.innerHTML = "";
    });
  }

  async renderPage() {
    try {
      this._ensureMainContentExists();

      if (!this._mainContent) {
        console.error("Cannot render page: main content element not found");
        return;
      }

      const url = UrlParser.parseActiveUrlWithCombiner();
      const page = this._routes[url];

      if (page) {
        const loadingElement = document.querySelector("#loading");
        if (loadingElement) {
          loadingElement.classList.remove("hidden");
        }

        const currentPage = url.split("/")[0];
        if (
          AuthService.requiresAuth(currentPage) &&
          !AuthService.isAuthenticated()
        ) {
          window.location.hash = "#/login";
          return;
        }

        if (document.startViewTransition) {
          await document.startViewTransition(async () => {
            this._mainContent.innerHTML = await page.render();
            await page.afterRender();
          });
        } else {
          this._mainContent.innerHTML = await page.render();
          await page.afterRender();
        }

        if (loadingElement) {
          loadingElement.classList.add("hidden");
        }

        this._updateActiveNavigation();
        this._updateAuthNavigation();

        if (
          this._mainContent &&
          typeof this._mainContent.scrollIntoView === "function"
        ) {
          this._mainContent.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        this._mainContent.innerHTML = `
          <div style="text-align: center; padding: 4rem 2rem;">
            <h1 style="color: #8b5a8c; font-size: 3rem; margin-bottom: 1rem;">404</h1>
            <p style="color: #5a4a5b; font-size: 1.2rem; margin-bottom: 2rem;">Halaman tidak ditemukan</p>
            <a href="#/home" class="control-btn" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #8b5a8c; color: white; text-decoration: none; border-radius: 4px;">
              Kembali ke Home
            </a>
          </div>
        `;
      }
    } catch (error) {
      console.error("Error rendering page:", error);

      if (this._mainContent) {
        this._mainContent.innerHTML = `
          <div class="error-message" style="text-align: center; padding: 2rem; background-color: #f8f9fa; border-radius: 8px; margin: 2rem;">
            <h2 style="color: #dc3545; margin-bottom: 1rem;">Terjadi Kesalahan</h2>
            <p style="color: #6c757d; margin-bottom: 2rem;">
              Mohon muat ulang halaman atau coba lagi nanti.
            </p>
            <button 
              onclick="location.reload()" 
              class="btn-primary" 
              style="padding: 0.75rem 1.5rem; background-color: #8b5a8c; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Muat Ulang
            </button>
          </div>
        `;
      } else {
        console.error(
          "Cannot display error message: main content element not found"
        );
      }
    }
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this._initializeApp();
      });
    } else {
      this._initializeApp();
    }
  }

  _initializeApp() {
    this._ensureMainContentExists();

    this.renderPage();

    window.addEventListener("hashchange", () => {
      this.renderPage();
    });

    if (!window.location.hash) {
      window.location.hash = "#/home";
    }

    window.addEventListener("error", (error) => {
      console.error("Global error:", error);
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
    });
  }
}

export default App;
