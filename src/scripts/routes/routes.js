import Home from "../pages/home/home-page.js";
import About from "../pages/about/about-page.js";
import TambahCerita from "../pages/tambah-cerita/tambah-cerita-page.js";
import DetailStory from "../pages/detail-story/detail-story-page.js";
import Login from "../pages/login/login-page.js";
import Register from "../pages/register/register-page.js";
import SavedStories from "../pages/saved-stories/saved-stories-page.js";

const routes = {
  "/": Home,
  "/home": Home,
  "/about": About,
  "/tambah-cerita": TambahCerita,
  "/detail-story": DetailStory,
  "/login": Login,
  "/register": Register,
  "/saved-stories": SavedStories,
};

export default routes;
