import LoginPresenter from "../../presenters/login-presenter";

const LoginPage = {
  presenter: null,

  async render() {
    return `
      <div class="form-container">
        <h1 style="text-align: center; color: #8b5a8c; font-size: 2.5rem; margin-bottom: 2rem;">
          🔐 Masuk Akun
        </h1>
        <p style="text-align: center; color: #6c757d; font-size: 1rem; margin-bottom: 2rem;">
          Masuk untuk berbagi cerita Anda
        </p>
        
        <form id="login-form" novalidate>
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
                placeholder="Masukkan password Anda"
                required
                autocomplete="current-password"
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

          <!-- Message Areas -->
          <div id="error-message" class="error-message" style="
            display: none;
            background: linear-gradient(135deg, #f8d7da, #f5c6cb);
            color: #721c24;
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            border: 1px solid #f5c6cb;
            font-size: 0.9rem;
            font-weight: 500;
          "></div>

          <div id="success-message" class="success-message" style="
            display: none;
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            color: #155724;
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            border: 1px solid #c3e6cb;
            font-size: 0.9rem;
            font-weight: 500;
          "></div>

          <div id="info-message" class="info-message" style="
            display: none;
            background: linear-gradient(135deg, #d1ecf1, #bee5eb);
            color: #0c5460;
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            border: 1px solid #bee5eb;
            font-size: 0.9rem;
            font-weight: 500;
          "></div>

          <button type="submit" class="btn-primary" id="login-btn">
            🚀 Masuk Sekarang
          </button>
        </form>

        <div style="text-align: center; margin-top: 2rem;">
          <p style="color: #5a4a5b;">
            Belum punya akun? 
            <a href="#/register" style="color: #8b5a8c; text-decoration: none; font-weight: 600;">
              Daftar di sini
            </a>
          </p>
          <p style="margin-top: 1rem;">
            <button 
              type="button" 
              id="forgot-password-btn"
              style="
                background: none;
                border: none;
                color: #8b5a8c;
                cursor: pointer;
                font-size: 0.9rem;
                text-decoration: underline;
                font-family: inherit;
                padding: 0.5rem;
              "
            >
              Lupa password?
            </button>
          </p>
        </div>
      </div>
    `;
  },

  async afterRender() {
    try {
      this.presenter = new LoginPresenter(this);

      const loginForm = document.querySelector("#login-form");
      const emailInput = document.querySelector("#email");
      const passwordInput = document.querySelector("#password");
      const togglePasswordBtn = document.querySelector("#toggle-password");
      const forgotPasswordBtn = document.querySelector("#forgot-password-btn");

      this._setupPasswordToggle(togglePasswordBtn, passwordInput);

      this._setupFormHandling(loginForm, emailInput, passwordInput);

      this._setupForgotPassword(forgotPasswordBtn, emailInput);

      this._setupRealTimeValidation(emailInput, passwordInput);

      this._setupKeyboardNavigation(emailInput, passwordInput, loginForm);

      await this._checkExistingAuth();

      emailInput?.focus();
    } catch (error) {
      console.error("Error in LoginPage afterRender:", error);
      this.showError(
        "Terjadi kesalahan saat memuat halaman. Silakan refresh browser Anda."
      );
    }
  },

  _setupPasswordToggle(toggleBtn, passwordInput) {
    if (toggleBtn && passwordInput) {
      toggleBtn.addEventListener("click", () => {
        const isVisible = passwordInput.type === "text";
        passwordInput.type = isVisible ? "password" : "text";
        toggleBtn.classList.toggle("fa-eye");
        toggleBtn.classList.toggle("fa-eye-slash");
      });
    }
  },

  _setupFormHandling(form, emailInput, passwordInput) {
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (this._validateForm()) {
          const credentials = {
            email: emailInput.value.trim(),
            password: passwordInput.value.trim(),
          };

          const result = await this.presenter.handleLogin(credentials);

          if (!result.success) {
            passwordInput.value = "";
            passwordInput.focus();
          }
        }
      });
    }
  },

  _setupForgotPassword(forgotBtn, emailInput) {
    if (forgotBtn) {
      forgotBtn.addEventListener("click", () => {
        const email = emailInput.value.trim();
        this.presenter.handleForgotPassword(email);
      });
    }
  },

  _setupRealTimeValidation(emailInput, passwordInput) {
    emailInput?.addEventListener("blur", () => this._validateEmail());
    passwordInput?.addEventListener("blur", () => this._validatePassword());

    [emailInput, passwordInput].forEach((input) => {
      input?.addEventListener("input", () => {
        this._clearFieldError(input);
        this.hideMessages();
      });
    });
  },

  _setupKeyboardNavigation(emailInput, passwordInput, form) {
    [emailInput, passwordInput].forEach((input) => {
      input?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          form.dispatchEvent(new Event("submit"));
        }
      });
    });
  },

  async _checkExistingAuth() {
    if (this.presenter) {
      const isValid = await this.presenter.validateCurrentSession();
    }
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
    const password = passwordInput.value.trim();

    if (!password) {
      this._showFieldError(errorDiv, "Password harus diisi");
      return false;
    }

    this._clearFieldError(errorDiv);
    return true;
  },

  _validateForm() {
    const emailValid = this._validateEmail();
    const passwordValid = this._validatePassword();

    return emailValid && passwordValid;
  },

  _showFieldError(errorDiv, message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.color = "#cc0000";
      errorDiv.style.fontSize = "0.9rem";
      errorDiv.style.marginTop = "0.5rem";
    }
  },

  _clearFieldError(input) {
    const fieldName = input.getAttribute("name") || input.getAttribute("id");
    const errorDiv = document.getElementById(`${fieldName}-error`);
    if (errorDiv) {
      errorDiv.textContent = "";
    }
  },

  setLoadingState(isLoading) {
    const loginBtn = document.querySelector("#login-btn");
    const formInputs = document.querySelectorAll(
      "#login-form input, #login-form button"
    );

    if (loginBtn) {
      if (isLoading) {
        loginBtn.disabled = true;
        loginBtn.textContent = "⏳ Memproses...";
        formInputs.forEach((input) => {
          if (input.id !== "login-btn") {
            input.disabled = true;
          }
        });
      } else {
        loginBtn.disabled = false;
        loginBtn.textContent = "🚀 Masuk Sekarang";
        formInputs.forEach((input) => {
          input.disabled = false;
        });
      }
    }
  },

  showLoading() {
    this.setLoadingState(true);
  },

  hideLoading() {
    this.setLoadingState(false);
  },

  showError(message) {
    this._showMessage("error", message);
  },

  showSuccess(message) {
    this._showMessage("success", message);
  },

  showInfo(message) {
    this._showMessage("info", message);
  },

  hideMessages() {
    const messageElements = [
      document.querySelector("#error-message"),
      document.querySelector("#success-message"),
      document.querySelector("#info-message"),
    ];

    messageElements.forEach((element) => {
      if (element) {
        element.style.display = "none";
        element.textContent = "";
      }
    });
  },

  _showMessage(type, message) {
    this.hideMessages();

    const messageElement = document.querySelector(`#${type}-message`);
    if (messageElement && message) {
      messageElement.textContent = message;
      messageElement.style.display = "block";

      if (type === "success" || type === "info") {
        setTimeout(() => {
          if (messageElement.style.display === "block") {
            messageElement.style.display = "none";
          }
        }, 5000);
      }
    }
  },

  destroy() {
    if (this.presenter) {
      this.presenter.destroy();
      this.presenter = null;
    }

    const form = document.querySelector("#login-form");
    if (form) {
      form.removeEventListener("submit", this._handleSubmit);
    }
  },
};

export default LoginPage;
