import StoryModel from "../data/story-model.js";
import AuthService from "../services/AuthService.js";

class LoginPresenter {
  constructor(view) {
    this.view = view;
    this.model = new StoryModel();
    this._boundHandlers = {};
    this._init();
  }

  _init() {
    this._bindEvents();
    this._checkExistingAuth();
  }

  _bindEvents() {
    this._boundHandlers.authSuccess = (e) => this._handleAuthSuccess(e.detail);
    this._boundHandlers.showMessage = (e) => this._handleShowMessage(e.detail);

    window.addEventListener("auth-success", this._boundHandlers.authSuccess);
    window.addEventListener("show-message", this._boundHandlers.showMessage);
  }

  _checkExistingAuth() {
    if (AuthService.isAuthenticated() && AuthService.isTokenValid()) {
      this.view?.showSuccess?.("Anda sudah login. Mengalihkan...");
      setTimeout(() => {
        this._redirectToHome();
      }, 1000);
      return true;
    }
    return false;
  }

  async handleLogin(credentials) {
    try {
      const validation = this._validateCredentials(credentials);
      if (!validation.isValid) {
        this.view?.showError?.(validation.message);
        return { success: false, error: validation.message };
      }

      this.view?.setLoadingState?.(true);
      this.view?.hideMessages?.();

      const normalizedCredentials = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password.trim(),
      };

      console.log("Attempting login for:", normalizedCredentials.email);
      const loginResult = await this.model.login(normalizedCredentials);

      if (!loginResult || !loginResult.loginResult) {
        throw new Error("Respons login tidak valid dari server");
      }

      const { loginResult: authData } = loginResult;

      if (!authData.token || !authData.userId) {
        throw new Error("Data autentikasi tidak lengkap");
      }

      const saveSuccess = AuthService.saveLoginData(loginResult);
      if (!saveSuccess) {
        throw new Error("Gagal menyimpan data autentikasi");
      }

      console.log(
        "Login successful for user:",
        authData.name || authData.userId
      );

      const welcomeMessage = authData.name
        ? `Login berhasil! Selamat datang kembali, ${authData.name}.`
        : "Login berhasil! Selamat datang kembali.";

      this.view?.showSuccess?.(welcomeMessage);

      AuthService.updateAuthNavigation();

      this._clearFormData();

      this._dispatchAuthSuccessEvent(authData);

      const redirectUrl = this.getRedirectUrl();
      setTimeout(() => {
        window.location.hash = redirectUrl;
      }, 1500);

      return {
        success: true,
        user: {
          userId: authData.userId,
          name: authData.name,
          token: authData.token,
        },
      };
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = this._getErrorMessage(error);

      this.view?.showError?.(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      this.view?.setLoadingState?.(false);
    }
  }

  _validateCredentials(credentials) {
    if (!credentials) {
      return { isValid: false, message: "Data login tidak valid" };
    }

    const { email, password } = credentials;

    if (!email || typeof email !== "string" || !email.trim()) {
      return { isValid: false, message: "Email harus diisi" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { isValid: false, message: "Format email tidak valid" };
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return { isValid: false, message: "Password harus diisi" };
    }

    if (password.trim().length < 3) {
      return {
        isValid: false,
        message: "Password terlalu pendek (minimal 3 karakter)",
      };
    }

    return { isValid: true };
  }

  _getErrorMessage(error) {
    if (!error) return "Terjadi kesalahan tidak dikenal";

    const message =
      error.message || error.toString() || "Terjadi kesalahan tidak dikenal";

    const errorMap = {
      "email atau password salah":
        "Email atau password salah. Silakan periksa kembali.",
      "invalid credentials":
        "Email atau password salah. Silakan periksa kembali.",
      unauthorized: "Email atau password salah. Silakan periksa kembali.",
      "data yang dimasukkan tidak valid":
        "Data yang dimasukkan tidak valid. Periksa format email dan password.",
      "validation failed":
        "Data yang dimasukkan tidak valid. Periksa format email dan password.",
      "tidak dapat terhubung ke server":
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      "failed to fetch": "Koneksi bermasalah. Periksa koneksi internet Anda.",
      "network request failed": "Jaringan bermasalah. Silakan coba lagi.",
      "network error":
        "Masalah jaringan. Periksa koneksi internet dan coba lagi.",
      fetch: "Masalah koneksi. Periksa internet Anda dan coba lagi.",
      timeout: "Koneksi timeout. Silakan coba lagi.",
      "server error": "Server sedang bermasalah. Silakan coba lagi nanti.",
      "service unavailable":
        "Layanan sedang tidak tersedia. Silakan coba lagi nanti.",
    };

    const lowerMessage = message.toLowerCase();
    for (const [key, value] of Object.entries(errorMap)) {
      if (lowerMessage.includes(key.toLowerCase())) {
        return value;
      }
    }

    return message.length > 100
      ? "Terjadi kesalahan. Silakan coba lagi."
      : message;
  }

  _clearFormData() {
    try {
      const form = document.querySelector("#login-form");
      if (form) {
        form.reset();
      }

      const inputs = document.querySelectorAll("#login-form input");
      inputs.forEach((input) => {
        if (input.type === "password") {
          input.value = "";
        }
      });
    } catch (error) {
      console.warn("Could not clear form data:", error);
    }
  }

  _redirectToHome() {
    const redirectUrl = this.getRedirectUrl();
    window.location.hash = redirectUrl;
  }

  _dispatchAuthSuccessEvent(authData) {
    try {
      const event = new CustomEvent("auth-success", {
        detail: {
          user: {
            userId: authData.userId,
            name: authData.name,
            token: authData.token,
          },
          timestamp: new Date().toISOString(),
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.warn("Could not dispatch auth success event:", error);
    }
  }

  _handleAuthSuccess(detail) {
    console.log("Auth success event received:", detail);
    if (detail?.user?.name) {
      this.view?.showSuccess?.(`Selamat datang, ${detail.user.name}!`);
    }
  }

  _handleShowMessage(detail) {
    if (!detail || !detail.type || !detail.message) return;

    switch (detail.type) {
      case "success":
        this.view?.showSuccess?.(detail.message);
        break;
      case "error":
        this.view?.showError?.(detail.message);
        break;
      case "info":
        this.view?.showInfo?.(detail.message);
        break;
      default:
        console.warn("Unknown message type:", detail.type);
    }
  }

  getRedirectUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get("redirectTo");

      if (redirectTo) {
        const allowedPages = [
          "create-story",
          "my-stories",
          "profile",
          "dashboard",
          "home",
          "stories",
        ];

        const cleanRedirectTo = redirectTo.replace(/[^a-zA-Z0-9-]/g, "");
        if (allowedPages.includes(cleanRedirectTo)) {
          return `#/${cleanRedirectTo}`;
        }
      }

      return "#/home";
    } catch (error) {
      console.warn("Error getting redirect URL:", error);
      return "#/home";
    }
  }

  handleForgotPassword(email) {
    try {
      console.log("Forgot password requested for:", email);

      if (email && this._isValidEmail(email)) {
        this.view?.showInfo?.(
          `Instruksi reset password akan dikirim ke ${email} jika akun terdaftar.`
        );
      } else {
        this.view?.showInfo?.(
          "Masukkan email yang valid terlebih dahulu untuk reset password."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      this.view?.showError?.(
        "Terjadi kesalahan saat memproses permintaan reset password."
      );
    }
  }

  _isValidEmail(email) {
    if (!email || typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  async validateCurrentSession() {
    try {
      if (!AuthService.isAuthenticated()) {
        return false;
      }

      if (!AuthService.isTokenValid()) {
        AuthService.handleLogout(
          "Sesi Anda telah berakhir. Silakan login kembali."
        );
        this.view?.showInfo?.("Sesi telah berakhir. Silakan login kembali.");
        return false;
      }

      if (AuthService.isAuthenticated() && AuthService.isTokenValid()) {
        this.view?.showSuccess?.("Anda sudah login. Mengalihkan...");
        setTimeout(() => {
          this._redirectToHome();
        }, 1000);
        return true;
      }

      return true;
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  }

  refreshAuthState() {
    try {
      AuthService.updateAuthNavigation();
      return true;
    } catch (error) {
      console.error("Error refreshing auth state:", error);
      return false;
    }
  }

  getCurrentUser() {
    try {
      return AuthService.getCurrentUser();
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  destroy() {
    try {
      if (this._boundHandlers.authSuccess) {
        window.removeEventListener(
          "auth-success",
          this._boundHandlers.authSuccess
        );
      }
      if (this._boundHandlers.showMessage) {
        window.removeEventListener(
          "show-message",
          this._boundHandlers.showMessage
        );
      }

      this._boundHandlers = {};
      this.view = null;
      this.model = null;

      console.log("LoginPresenter destroyed");
    } catch (error) {
      console.error("Error destroying LoginPresenter:", error);
    }
  }
}

export default LoginPresenter;
