import StoryModel from "../../data/story-model.js";
import RegisterPresenter from "../../presenters/register-presenter.js";
import Utils from "../../utils/index.js";

const Register = {
  async render() {
    return `
      <div class="form-container">
        <h1 style="text-align: center; color: #8b5a8c; font-size: 2.5rem; margin-bottom: 2rem;">
          📝 Daftar Akun
        </h1>
        
        <form id="register-form" novalidate>
          <div class="form-group">
            <label for="name" class="form-label">👤 Nama Lengkap</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              class="form-input" 
              placeholder="Masukkan nama lengkap Anda"
              required
              autocomplete="name"
              aria-describedby="name-error"
            >
            <div id="name-error" class="error-text" role="alert"></div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">📧 Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="Masukkan email Anda"
              required
              autocomplete="email"
              aria-describedby="email-error"
            >
            <div id="email-error" class="error-text" role="alert"></div>
          </div>

        <div class="form-group">
  <label for="password" class="form-label">🔒 Password</label>
  <div style="position: relative;">
    <input 
      type="password" 
      id="password" 
      name="password" 
      class="form-input" 
      placeholder="Masukkan password (minimal 8 karakter)"
      required
      autocomplete="new-password"
      aria-describedby="password-error"
      style="padding-right: 2.5rem;"
    >
    <i 
      id="toggle-password" 
      class="fa-solid fa-eye" 
      style="position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); cursor: pointer; color: #8b5a8c; z-index: 10;"
    ></i>
  </div>
  <div id="password-error" class="error-text" role="alert"></div>
</div>

<div class="form-group">
  <label for="confirm-password" class="form-label">🔒 Konfirmasi Password</label>
  <div style="position: relative;">
    <input 
      type="password" 
      id="confirm-password" 
      name="confirmPassword" 
      class="form-input" 
      placeholder="Masukkan ulang password Anda"
      required
      autocomplete="new-password"
      aria-describedby="confirm-password-error"
      style="padding-right: 2.5rem;"
    >
    <i 
      id="toggle-confirm-password" 
      class="fa-solid fa-eye" 
      style="position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); cursor: pointer; color: #8b5a8c; z-index: 10;"
    ></i>
  </div>
  <div id="confirm-password-error" class="error-text" role="alert"></div>
</div>

          <button type="submit" class="btn-primary" id="register-btn">
            🚀 Daftar Sekarang
          </button>
        </form>

        <div style="text-align: center; margin-top: 2rem;">
          <p style="color: #5a4a5b;">
            Sudah punya akun? 
            <a href="#/login" style="color: #8b5a8c; text-decoration: none; font-weight: 600;">
              Masuk di sini
            </a>
          </p>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const model = new StoryModel();
    const presenter = new RegisterPresenter(model, this);
    this._initializeForm(presenter);
    this._initializePasswordToggles();
  },

  _initializePasswordToggles() {
    const togglePassword = document.getElementById("toggle-password");
    const passwordInput = document.getElementById("password");

    if (togglePassword && passwordInput) {
      togglePassword.addEventListener("click", () => {
        const isVisible = passwordInput.type === "text";
        passwordInput.type = isVisible ? "password" : "text";
        togglePassword.classList.toggle("fa-eye");
        togglePassword.classList.toggle("fa-eye-slash");
      });
    }

    const toggleConfirmPassword = document.getElementById(
      "toggle-confirm-password"
    );
    const confirmPasswordInput = document.getElementById("confirm-password");

    if (toggleConfirmPassword && confirmPasswordInput) {
      toggleConfirmPassword.addEventListener("click", () => {
        const isVisible = confirmPasswordInput.type === "text";
        confirmPasswordInput.type = isVisible ? "password" : "text";
        toggleConfirmPassword.classList.toggle("fa-eye");
        toggleConfirmPassword.classList.toggle("fa-eye-slash");
      });
    }
  },

  _initializeForm(presenter) {
    const form = document.getElementById("register-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");

    nameInput.addEventListener("blur", () => this._validateName());
    emailInput.addEventListener("blur", () => this._validateEmail());
    passwordInput.addEventListener("blur", () => this._validatePassword());
    confirmPasswordInput.addEventListener("blur", () =>
      this._validateConfirmPassword()
    );

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (this._validateForm()) {
        const formData = new FormData(form);
        const userData = {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        };

        await presenter.register(userData);
      }
    });
  },

  _validateName() {
    const nameInput = document.getElementById("name");
    const errorDiv = document.getElementById("name-error");
    const name = nameInput.value.trim();

    if (!name) {
      this._showFieldError(errorDiv, "Nama harus diisi");
      return false;
    }

    if (name.length < 2) {
      this._showFieldError(errorDiv, "Nama minimal 2 karakter");
      return false;
    }

    this._clearFieldError(errorDiv);
    return true;
  },

  _validateEmail() {
    const emailInput = document.getElementById("email");
    const errorDiv = document.getElementById("email-error");
    const email = emailInput.value.trim();

    if (!email) {
      this._showFieldError(errorDiv, "Email harus diisi");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this._showFieldError(errorDiv, "Format email tidak valid");
      return false;
    }

    this._clearFieldError(errorDiv);
    return true;
  },

  _validatePassword() {
    const passwordInput = document.getElementById("password");
    const errorDiv = document.getElementById("password-error");
    const password = passwordInput.value;

    if (!password) {
      this._showFieldError(errorDiv, "Password harus diisi");
      return false;
    }

    if (password.length < 8) {
      this._showFieldError(errorDiv, "Password minimal 8 karakter");
      return false;
    }

    this._clearFieldError(errorDiv);
    return true;
  },

  _validateConfirmPassword() {
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const errorDiv = document.getElementById("confirm-password-error");
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!confirmPassword) {
      this._showFieldError(errorDiv, "Konfirmasi password harus diisi");
      return false;
    }

    if (password !== confirmPassword) {
      this._showFieldError(errorDiv, "Password tidak cocok");
      return false;
    }

    this._clearFieldError(errorDiv);
    return true;
  },

  _validateForm() {
    const nameValid = this._validateName();
    const emailValid = this._validateEmail();
    const passwordValid = this._validatePassword();
    const confirmPasswordValid = this._validateConfirmPassword();

    return nameValid && emailValid && passwordValid && confirmPasswordValid;
  },

  _showFieldError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.style.color = "#cc0000";
    errorDiv.style.fontSize = "0.9rem";
    errorDiv.style.marginTop = "0.5rem";
  },

  _clearFieldError(errorDiv) {
    errorDiv.textContent = "";
  },

  showLoading() {
    const btn = document.getElementById("register-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "⏳ Memproses...";
    }
    Utils.showLoading();
  },

  hideLoading() {
    const btn = document.getElementById("register-btn");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🚀 Daftar Sekarang";
    }
    Utils.hideLoading();
  },

  showError(message) {
    Utils.showError(message);
  },

  showSuccess(message) {
    Utils.showSuccess(message);
  },

  redirectToLogin() {
    window.location.hash = "#/login";
  },
};

export default Register;
