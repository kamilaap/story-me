import { storyDB } from "../services/Database.js";

class DetailStoryPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async loadStoryDetail(storyId) {
    try {
      if (!storyId || storyId.trim() === "") {
        throw new Error("ID cerita tidak valid");
      }

      console.log("Loading story detail for ID:", storyId);

      this.view.showLoading();

      const result = await this.model.getStoryDetail(storyId.trim());

      if (!result) {
        throw new Error("Cerita tidak ditemukan");
      }

      const story = result.story;

      if (!story) {
        throw new Error("Data cerita tidak ditemukan dalam respons");
      }

      const isSaved = await storyDB.isStorySaved(storyId);
      story.isSaved = isSaved;

      console.log("Story loaded successfully:", story);

      this.view.renderStoryDetail(story);
    } catch (error) {
      console.error("Error loading story detail:", error);
      this.handleError(error);
    }
  }

  async toggleSaveStory(story) {
    try {
      if (story.isSaved) {
        await storyDB.deleteStory(story.id);
      } else {
        await storyDB.saveStory({ ...story, isSaved: true });
      }
      return !story.isSaved;
    } catch (error) {
      console.error("Gagal mengubah status penyimpanan:", error);
      return story.isSaved;
    }
  }
  handleError(error) {
    let errorMessage = error.message;

    if (
      error.message.includes("Authentication required") ||
      error.message.includes("Token tidak valid") ||
      error.message.includes("Sesi telah berakhir")
    ) {
      errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";

      setTimeout(() => {
        window.location.hash = "#/login";
      }, 2000);
    } else if (
      error.message.includes("not found") ||
      error.message.includes("tidak ditemukan") ||
      error.message.includes("404")
    ) {
      errorMessage = "Cerita yang Anda cari tidak ditemukan.";
    } else if (
      error.message.includes("Network error") ||
      error.message.includes("fetch") ||
      error.message.includes("Koneksi bermasalah")
    ) {
      errorMessage =
        "Terjadi kesalahan jaringan. Periksa koneksi internet Anda.";
    }

    this.view.showError(errorMessage);
  }
}

export default DetailStoryPresenter;
