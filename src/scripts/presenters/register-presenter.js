class RegisterPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async register(userData) {
    try {
      this.view.showLoading();

      const result = await this.model.register(userData);

      this.view.hideLoading();

      if (result && result.error === false) {
        this.view.showSuccess(
          "Pendaftaran berhasil! Silakan login dengan akun baru Anda."
        );

        setTimeout(() => {
          this.view.redirectToLogin();
        }, 2000);
      } else {
        this.view.showError(result.message || "Pendaftaran gagal");
      }
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message || "Terjadi kesalahan saat mendaftar");
      console.error("Register error:", error);
    }
  }
}

export default RegisterPresenter;
