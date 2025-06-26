import { openDB } from "idb";

const DB_NAME = "storyme";
const DB_VERSION = 1;
const STORE_NAME = "savedStories";

class StoryDB {
  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }

  async saveStory(story) {
    try {
      const db = await this.dbPromise;
      await db.put(STORE_NAME, story);
      return true;
    } catch (error) {
      console.error("Failed to save story:", error);
      return false;
    }
  }

  async getSavedStories() {
    try {
      const db = await this.dbPromise;
      return await db.getAll(STORE_NAME);
    } catch (error) {
      console.error("Failed to get saved stories:", error);
      return [];
    }
  }

  async deleteStory(storyId) {
    try {
      const db = await this.dbPromise;
      await db.delete(STORE_NAME, storyId);
      return true;
    } catch (error) {
      console.error("Failed to delete story:", error);
      return false;
    }
  }

  async isStorySaved(storyId) {
    try {
      const db = await this.dbPromise;
      const story = await db.get(STORE_NAME, storyId);
      return !!story;
    } catch (error) {
      console.error("Failed to check saved story:", error);
      return false;
    }
  }
}

export const storyDB = new StoryDB();
