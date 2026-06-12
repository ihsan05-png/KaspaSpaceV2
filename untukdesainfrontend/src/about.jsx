/* global React, Icon */

/* ============================================
   ABOUT — SUB HERO
   ============================================ */
function AboutSubHero() {
  return (
    <section className="subhero">
      <div className="subhero-bg">
        <img
          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2000&q=80"
          alt="Tim Kaspa Space"
        />
      </div>
      <div className="container subhero-inner">
        <div className="breadcrumb">
          <a href="#/home">Beranda</a>
          <span className="sep">/</span>
          <span className="current">Tentang Kami</span>
        </div>
        <span className="chip chip-dot chip-uppercase">Tentang Kaspa Space</span>
        <h1 className="subhero-title">
          Membangun <em>Ruang</em><br/>Tempat Ide Tumbuh
        </h1>
        <p className="subhero-lede">
          Sejak 2023, Kaspa Space hadir untuk mendukung freelancer, startup, dan bisnis
          dewasa dengan ruang kerja fleksibel dan layanan bisnis terintegrasi.
        </p>
      </div>
    </section>
  );
}

/* ============================================
   STORY
   ============================================ */
function AboutStory() {
  return (
    <section className="story-section">
      <div className="container">
        <div className="story-grid">
          <div className="story-media">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
              alt="Founder Kaspa Space"
            />
            <div className="story-quote">
              "Kami percaya ruang kerja yang baik bukan soal mewahnya gedung — tapi soal
              komunitas, fleksibilitas, dan rasa di rumah."
              <span className="story-quote-author">— Adit Pratama, Founder</span>
            </div>
          </div>
          <div className="story-body">
            <span className="eyebrow">Cerita Kami</span>
            <h2 className="section-title">Dari Garasi <em>ke Enam Kota</em></h2>
            <p style={{ marginTop: 24 }}>
              Kaspa Space berawal dari satu pertanyaan sederhana di tahun 2023:
              <strong> kenapa sewa kantor harus serumit ini?</strong> Founder kami baru saja
              keluar dari pekerjaan kantoran dan kesulitan menemukan ruang kerja yang
              terjangkau, profesional, dan tidak mengikat kontrak panjang.
            </p>
            <p>
              Dari garasi di Solo, kami memulai dengan 12 share desk dan 1 ruang meeting.
              Tiga tahun kemudian, kami melayani <strong>500+ member aktif</strong> di
              6 kota dengan layanan yang terus berkembang — dari coworking hingga
              pengurusan legalitas bisnis.
            </p>
            <p>
              Kami bukan sekadar penyedia ruang. Kami percaya bahwa <strong>pertumbuhan
              terjadi ketika ide bertemu</strong> — dan tugas kami adalah memastikan
              ruang itu ada, terjangkau, dan menyambut.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   MISSION / VISION
   ============================================ */
function AboutMV() {
  return (
    <section className="mv-section">
      <div className="container">
        <div className="mv-grid">
          <div className="mv-card">
            <div className="mv-mark">01 — Misi</div>
            <h3 className="mv-title">Memudahkan setiap orang untuk <em>memulai dan tumbuh</em></h3>
            <p className="mv-body">
              Menyediakan ruang kerja fleksibel, layanan bisnis lengkap, dan komunitas
              yang aktif — agar setiap freelancer, startup, dan UMKM bisa fokus pada
              hal yang penting: membangun produk dan melayani pelanggan.
            </p>
          </div>
          <div className="mv-card">
            <div className="mv-mark">02 — Visi</div>
            <h3 className="mv-title">Menjadi ekosistem kerja <em>paling ramah</em> di Indonesia</h3>
            <p className="mv-body">
              Kami membayangkan masa depan di mana setiap kota di Indonesia punya
              ruang kerja yang terjangkau, hangat, dan terhubung — tempat profesional
              muda bisa bertemu, kolaborasi, dan membangun bisnis tanpa hambatan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   VALUES
   ============================================ */
function AboutValues() {
  const values = [
    { n: "01", icon: <Icon.Users />, t: "Komunitas Dulu", d: "Setiap keputusan kami uji dengan pertanyaan: apakah ini baik untuk member?" },
    { n: "02", icon: <Icon.Sparkles />, t: "Sederhana", d: "Booking 4 langkah. Tanpa kontrak panjang. Tanpa biaya tersembunyi." },
    { n: "03", icon: <Icon.Shield />, t: "Transparan", d: "Harga jelas, kebijakan terbuka, semua kontak ada di satu klik." },
    { n: "04", icon: <Icon.Zap />, t: "Cepat Tanggap", d: "Response 5 menit di WhatsApp, 1×24 jam di email, selalu." },
  ];
  return (
    <section className="values-section">
      <div className="container">
        <div className="values-head">
          <span className="eyebrow">Nilai-Nilai Kami</span>
          <h2 className="section-title">Empat Hal yang <em>Kami Pegang</em></h2>
          <p className="section-sub" style={{ marginInline: "auto", textAlign: "center" }}>
            Bukan slogan dinding kantor — ini cara kami mengambil keputusan setiap hari.
          </p>
        </div>
        <div className="values-grid">
          {values.map(v => (
            <div key={v.n} className="value-card">
              <div className="value-num">{v.n}</div>
              <div className="value-icon">{v.icon}</div>
              <h3 className="value-title">{v.t}</h3>
              <p className="value-desc">{v.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   TIMELINE
   ============================================ */
function AboutTimeline() {
  const events = [
    { y: "2023", t: "Awal Mula", d: "Kaspa Space berdiri di Solo dengan 12 share desk dan 1 meeting room." },
    { y: "2024", t: "Ekspansi Surabaya", d: "Membuka 3 cabang di Surabaya: Citraland, Sinarmas, dan Pakuwon." },
    { y: "2024", t: "Layanan Virtual Office", d: "Meluncurkan paket Virtual Office dengan alamat prestige & support PKP." },
    { y: "2025", t: "500+ Member", d: "Mencapai milestone 500 member aktif dengan rating rata-rata 4.9★." },
    { y: "2026", t: "Hari Ini", d: "6 lokasi di 4 kota, 15+ ruangan, dan komunitas yang terus tumbuh." },
  ];
  return (
    <section className="timeline-section">
      <div className="container">
        <div className="timeline-head">
          <span className="eyebrow">Perjalanan Kami</span>
          <h2 className="section-title">Tiga Tahun, <em>Banyak Cerita</em></h2>
        </div>
        <div className="timeline">
          {events.map((e, i) => (
            <div key={i} className="timeline-item">
              {i % 2 === 0 ? (
                <>
                  <div className="timeline-content">
                    <div className="timeline-year">{e.y}</div>
                    <h4 className="timeline-title">{e.t}</h4>
                    <p className="timeline-desc">{e.d}</p>
                  </div>
                  <div className="timeline-dot"></div>
                  <div className="timeline-spacer"></div>
                </>
              ) : (
                <>
                  <div className="timeline-spacer"></div>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-year">{e.y}</div>
                    <h4 className="timeline-title">{e.t}</h4>
                    <p className="timeline-desc">{e.d}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   TEAM
   ============================================ */
function AboutTeam() {
  const team = [
    { name: "Adit Pratama", role: "Founder & CEO", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" },
    { name: "Sarah Wijaya", role: "Head of Community", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" },
    { name: "Reza Hakim", role: "Head of Operations", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80" },
    { name: "Maya Lestari", role: "Head of Growth", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80" },
  ];
  return (
    <section className="team-section">
      <div className="container">
        <div className="team-head">
          <div>
            <span className="eyebrow">Tim Kami</span>
            <h2 className="section-title">Orang-orang di <em>Balik Kaspa</em></h2>
          </div>
          <a className="btn btn-ghost" href="#">Lihat Semua Tim <Icon.Arrow /></a>
        </div>
        <div className="team-grid">
          {team.map(p => (
            <div key={p.name} className="team-card">
              <div className="team-media">
                <img src={p.img} alt={p.name} />
                <div className="team-social">
                  <a href="#" aria-label="LinkedIn"><Icon.Linkedin /></a>
                  <a href="#" aria-label="Instagram"><Icon.Instagram /></a>
                  <a href="#" aria-label="Email"><Icon.Mail /></a>
                </div>
              </div>
              <div className="team-body">
                <h3 className="team-name">{p.name}</h3>
                <div className="team-role">{p.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   LOCATIONS (shared with Contact too)
   ============================================ */
const LOCATIONS_DATA = [
  {
    city: "Solo",
    name: "Kaspa Space Manahan",
    address: "Jl. Adi Sucipto No. 12, Manahan, Solo 57139",
    img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    hours: "08:00 – 22:00",
    seats: "60+ seat"
  },
  {
    city: "Surabaya",
    name: "Kaspa Space Citraland",
    address: "Citraland Boulevard No. 88, Surabaya 60219",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    hours: "08:00 – 22:00",
    seats: "80+ seat"
  },
  {
    city: "Surabaya",
    name: "Kaspa Space Sinarmas",
    address: "Sinarmas Tower Lt. 18, Jl. Pemuda 60-66, Surabaya",
    img: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80",
    hours: "08:00 – 22:00",
    seats: "100+ seat"
  },
  {
    city: "Surabaya",
    name: "Kaspa Space Pakuwon",
    address: "Pakuwon City Mall Lt. 3, Jl. Kejawan Putih, Surabaya",
    img: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=80",
    hours: "08:00 – 22:00",
    seats: "70+ seat"
  },
  {
    city: "Jakarta",
    name: "Kaspa Space Kuningan",
    address: "Sampoerna Strategic Square Lt. 22, Jakarta Selatan",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    hours: "07:00 – 23:00",
    seats: "120+ seat"
  },
  {
    city: "Bali",
    name: "Kaspa Space Canggu",
    address: "Jl. Pantai Berawa No. 99, Canggu, Bali 80361",
    img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
    hours: "08:00 – 22:00",
    seats: "50+ seat"
  },
];

function AboutLocations() {
  return (
    <section className="locations-section">
      <div className="container">
        <div className="locations-head">
          <div>
            <span className="eyebrow">Lokasi Kami</span>
            <h2 className="section-title">Enam Cabang, <em>Empat Kota</em></h2>
          </div>
          <a className="btn btn-ghost" href="#/contact">Lihat di Peta <Icon.Arrow /></a>
        </div>
        <div className="locations-grid">
          {LOCATIONS_DATA.map((l, i) => (
            <div key={i} className="location-card">
              <div className="location-media">
                <span className="location-tag">{l.city}</span>
                <img src={l.img} alt={l.name} loading="lazy" />
              </div>
              <div className="location-body">
                <h3 className="location-title">{l.name}</h3>
                <p className="location-address"><Icon.Pin /> {l.address}</p>
                <div className="location-meta">
                  <span><Icon.Calendar /> {l.hours}</span>
                  <span><Icon.Users /> {l.seats}</span>
                </div>
                <div className="location-actions">
                  <a className="btn btn-ghost" href="#">Lihat Detail</a>
                  <a className="btn btn-primary" href="#/coworking">Booking</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CTA BANNER
   ============================================ */
function AboutCTA() {
  return (
    <section className="cta-banner">
      <div className="container">
        <div className="cta-card">
          <div>
            <span className="eyebrow">Bergabung dengan Kami</span>
            <h2 className="cta-title">Siap Coba <em>Kaspa Space?</em></h2>
            <p className="cta-sub">
              Tour gratis 30 menit di salah satu cabang terdekat. Tanpa biaya,
              tanpa komitmen — datang, lihat, rasakan.
            </p>
            <div className="cta-actions">
              <a className="btn btn-primary" href="#/coworking">Booking Tour Gratis <Icon.Arrow /></a>
              <a className="btn btn-ghost" href="#/contact">Hubungi Kami</a>
            </div>
          </div>
          <div className="cta-visual">
            <div className="cta-mini">
              <div className="cta-mini-icon"><Icon.Users /></div>
              <div className="cta-mini-num">500<em>+</em></div>
              <div className="cta-mini-label">Member</div>
            </div>
            <div className="cta-mini">
              <div className="cta-mini-icon"><Icon.Pin /></div>
              <div className="cta-mini-num">6<em>kota</em></div>
              <div className="cta-mini-label">Lokasi</div>
            </div>
            <div className="cta-mini">
              <div className="cta-mini-icon"><Icon.Award /></div>
              <div className="cta-mini-num">4.9<em>★</em></div>
              <div className="cta-mini-label">Rating</div>
            </div>
            <div className="cta-mini">
              <div className="cta-mini-icon"><Icon.Zap /></div>
              <div className="cta-mini-num">5<em>mnt</em></div>
              <div className="cta-mini-label">Response</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.AboutSubHero = AboutSubHero;
window.AboutStory = AboutStory;
window.AboutMV = AboutMV;
window.AboutValues = AboutValues;
window.AboutTimeline = AboutTimeline;
window.AboutTeam = AboutTeam;
window.AboutLocations = AboutLocations;
window.AboutCTA = AboutCTA;
window.LOCATIONS_DATA = LOCATIONS_DATA;
