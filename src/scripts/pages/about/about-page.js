const About = {
  async render() {
    return `
      <div class="about-container">
        <h1 class="about-title">Cerita Kamu Dimulai Dari Sini ♥</h1>
        
        <div class="about-content">
          <p class="about-text">
            Story Me, adalah tugas submission Pemrograman Web Fundamental dari kelas Dicoding
          </p>
          
          <div style="margin-top: 3rem;">
            <h2 style="color: #8b5a8c; margin-bottom: 1rem;">Fitur Aplikasi</h2>
            <ul style="text-align: left; color: #5a4a5b; font-size: 1.1rem; line-height: 1.8;">
              <li>📱 Berbagi cerita dengan foto</li>
              <li>🗺️ Menampilkan lokasi cerita di peta</li>
              <li>📷 Akses kamera untuk mengambil foto</li>
              <li>🌟 Tampilan yang responsif dan menarik</li>
              <li>♿ Aksesibilitas yang baik</li>
            </ul>
          </div>
          
          <div style="margin-top: 3rem; padding: 2rem; background: rgba(139, 90, 140, 0.1); border-radius: 15px;">
            <h3 style="color: #8b5a8c; margin-bottom: 1rem;">Dibuat dengan ❤️</h3>
            <p style="color: #5a4a5b; margin: 0;">
              Aplikasi ini dibuat sebagai bagian dari pembelajaran front-end web development 
              di Dicoding Indonesia. Semua fitur telah disesuaikan dengan kriteria submission 
              yang telah ditetapkan.
            </p>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    console.log("About page loaded");
  },
};

export default About;
