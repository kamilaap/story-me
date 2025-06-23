import AuthService from "../services/AuthService.js";

class HomePresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async loadStories() {
    try {
      this.view.showLoading();

      const authToken = AuthService.isAuthenticated()
        ? AuthService.getAuthToken()
        : null;

      const result = await this.model.getAllStories({
        page: 1,
        size: 20,
        location: 1,
        authToken: authToken,
      });

      this.view.hideLoading();

      let stories = this._extractStoriesFromResponse(result);

      if (!Array.isArray(stories)) {
        console.error("Stories is not an array:", stories);
        throw new Error("Data cerita tidak dalam format yang valid");
      }

      this.view.renderStories(stories);
      this.view.renderMap(stories);
    } catch (error) {
      this.view.hideLoading();

      const errorMessage = this._processError(error);
      this.view.showError(errorMessage);

      console.error("Error loading stories:", error);
    }
  }

  async refreshStories() {
    await this.loadStories();
  }

  _extractStoriesFromResponse(result) {
    if (Array.isArray(result)) {
      return result;
    } else if (
      result &&
      result.error === false &&
      Array.isArray(result.listStory)
    ) {
      return result.listStory;
    } else if (result && Array.isArray(result.data)) {
      return result.data;
    } else if (result && result.stories && Array.isArray(result.stories)) {
      return result.stories;
    } else {
      console.error("Unexpected API response format:", result);
      throw new Error("Format respon API tidak sesuai yang diharapkan");
    }
  }

  _processError(error) {
    if (error.message.includes("401")) {
      AuthService.logout();
      return "Sesi login telah berakhir. Silakan login kembali.";
    } else if (error.message.includes("403")) {
      return "Anda tidak memiliki akses untuk melihat cerita.";
    } else if (error.message.includes("404")) {
      return "Layanan cerita tidak ditemukan.";
    } else if (
      error.message.includes("Network") ||
      error.message.includes("fetch")
    ) {
      return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
    } else if (
      error.message.includes("format") ||
      error.message.includes("Format")
    ) {
      return error.message;
    } else {
      return error.message || "Terjadi kesalahan saat memuat cerita";
    }
  }
}

export default HomePresenter;
