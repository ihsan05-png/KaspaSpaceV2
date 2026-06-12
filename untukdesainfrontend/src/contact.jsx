/* global React, Icon, AboutLocations */
const { useState: useStateC } = React;

/* ============================================
   CONTACT — SUB HERO
   ============================================ */
function ContactSubHero() {
  return (
    <section className="subhero">
      <div className="subhero-bg">
        <img
          src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=2000&q=80"
          alt="Tim support Kaspa Space"
        />
      </div>
      <div className="container subhero-inner">
        <div className="breadcrumb">
          <a href="#/home">Beranda</a>
          <span className="sep">/</span>
          <span className="current">Kontak</span>
        </div>
        <span className="chip chip-dot chip-uppercase">Response 5 menit di jam kerja</span>
        <h1 className="subhero-title">
          Hubungi <em>Kami</em>
        </h1>
        <p className="subhero-lede">
          Pertanyaan tentang ruang, paket, kunjungan langsung, atau kemitraan?
          Pilih cara paling nyaman buat Anda — kami siap membantu.
        </p>
      </div>
    </section>
  );
}

/* ============================================
   QUICK CONTACT METHODS
   ============================================ */
function ContactMethods() {
  const methods = [
    {
      label: "Paling Cepat",
      title: "WhatsApp",
      detail: "Balas dalam 5 menit di jam kerja (08:00–22:00 WIB).",
      cta: "Buka WhatsApp",
      href: "#",
      icon: <Icon.Whatsapp />,
      iconClass: "green"
    },
    {
      label: "Telepon",
      title: "Hubungi Langsung",
      detail: "+62 812-3456-7890",
      cta: "Telepon",
      href: "tel:+6281234567890",
      icon: <Icon.Phone />
    },
    {
      label: "Email",
      title: "Tim Customer Care",
      detail: "cs@kaspaspace.com",
      cta: "Kirim Email",
      href: "mailto:cs@kaspaspace.com",
      icon: <Icon.Mail />
    },
    {
      label: "Datang Langsung",
      title: "Tour Gratis",
      detail: "Lihat fasilitas tanpa perlu booking, di 6 lokasi.",
      cta: "Lihat Lokasi",
      href: "#lokasi",
      icon: <Icon.Pin />
    },
  ];
  return (
    <section className="contact-methods">
      <div className="container">
        <div className="methods-grid">
          {methods.map((m, i) => (
            <a key={i} className="method-card" href={m.href}>
              <div className={`method-icon ${m.iconClass || ""}`}>{m.icon}</div>
              <span className="method-label">{m.label}</span>
              <h3 className="method-title">{m.title}</h3>
              <p className="method-detail">{m.detail}</p>
              <span className="method-cta">{m.cta} <Icon.ArrowUR /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CONTACT FORM SPLIT
   ============================================ */
function ContactFormSplit() {
  return (
    <section className="contact-split-section">
      <div className="container">
        <div className="contact-split">
          {/* Side info */}
          <div className="contact-side">
            <span className="eyebrow">Detail Kontak</span>
            <h3>Mari <em>Bicara</em></h3>
            <p>
              Tim kami terbagi berdasarkan kebutuhan. Hubungi langsung yang paling
              relevan untuk respons paling cepat.
            </p>

            <div className="contact-direct">
              <a className="contact-direct-row" href="mailto:cs@kaspaspace.com">
                <div className="contact-direct-icon"><Icon.Mail /></div>
                <div>
                  <div className="contact-direct-label">Customer Care</div>
                  <div className="contact-direct-value">cs@kaspaspace.com</div>
                </div>
              </a>
              <a className="contact-direct-row" href="mailto:partner@kaspaspace.com">
                <div className="contact-direct-icon"><Icon.Briefcase /></div>
                <div>
                  <div className="contact-direct-label">Kemitraan & Korporat</div>
                  <div className="contact-direct-value">partner@kaspaspace.com</div>
                </div>
              </a>
              <a className="contact-direct-row" href="mailto:press@kaspaspace.com">
                <div className="contact-direct-icon"><Icon.Sparkles /></div>
                <div>
                  <div className="contact-direct-label">Media & Press</div>
                  <div className="contact-direct-value">press@kaspaspace.com</div>
                </div>
              </a>
              <a className="contact-direct-row" href="tel:+6281234567890">
                <div className="contact-direct-icon"><Icon.Phone /></div>
                <div>
                  <div className="contact-direct-label">Hotline</div>
                  <div className="contact-direct-value">+62 812-3456-7890</div>
                </div>
              </a>
            </div>

            <div className="contact-hours">
              <div className="contact-hours-title">Jam Operasional Support</div>
              <div className="contact-hours-row">
                <span className="day">Senin – Jumat</span>
                <span className="time">08:00 – 22:00</span>
              </div>
              <div className="contact-hours-row">
                <span className="day">Sabtu</span>
                <span className="time">09:00 – 21:00</span>
              </div>
              <div className="contact-hours-row">
                <span className="day">Minggu</span>
                <span className="time">10:00 – 18:00</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <span className="eyebrow">Kirim Pesan</span>
            <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 32, margin: "12px 0 12px" }}>
              Isi <em style={{ fontStyle: "italic", color: "var(--brand-glow)" }}>Form di Bawah</em>
            </h3>
            <p style={{ color: "var(--text-tertiary)", fontSize: 14.5, margin: 0 }}>
              Kami balas semua pesan dalam 1×24 jam, biasanya jauh lebih cepat.
            </p>
            <div className="form-grid">
              <div className="form-field">
                <label>Nama Lengkap</label>
                <input type="text" placeholder="Nama Anda" />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" placeholder="email@perusahaan.com" />
              </div>
              <div className="form-field">
                <label>No. WhatsApp</label>
                <input type="tel" placeholder="+62" />
              </div>
              <div className="form-field">
                <label>Topik</label>
                <select defaultValue="">
                  <option value="" disabled>Pilih topik</option>
                  <option>Booking & Reservasi</option>
                  <option>Pertanyaan Paket</option>
                  <option>Kunjungan / Tour</option>
                  <option>Kemitraan & Event</option>
                  <option>Media & Press</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Lokasi yang Diminati</label>
                <select defaultValue="">
                  <option value="" disabled>Pilih lokasi (opsional)</option>
                  <option>Manahan, Solo</option>
                  <option>Citraland, Surabaya</option>
                  <option>Sinarmas, Surabaya</option>
                  <option>Pakuwon, Surabaya</option>
                  <option>Kuningan, Jakarta</option>
                  <option>Canggu, Bali</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Pesan</label>
                <textarea placeholder="Ceritakan kebutuhan tim Anda..." rows="5"></textarea>
              </div>
              <div className="form-field full" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="consent" style={{ width: "auto" }} />
                <label htmlFor="consent" style={{
                  textTransform: "none", letterSpacing: "0", fontWeight: 400,
                  color: "var(--text-tertiary)", fontSize: 13
                }}>
                  Saya setuju Kaspa Space menyimpan & memproses data ini untuk membalas pesan saya.
                </label>
              </div>
              <div className="form-field full">
                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "16px 24px" }}>
                  Kirim Pesan <Icon.Arrow />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   MAP / LOCATIONS PICKER
   ============================================ */
const MAP_PINS = [
  { city: "Solo", x: 60, y: 70, name: "Manahan" },
  { city: "Surabaya", x: 70, y: 65, name: "Citraland" },
  { city: "Surabaya", x: 73, y: 67, name: "Sinarmas" },
  { city: "Surabaya", x: 75, y: 64, name: "Pakuwon" },
  { city: "Jakarta", x: 38, y: 60, name: "Kuningan" },
  { city: "Bali", x: 82, y: 80, name: "Canggu" },
];

function ContactMap() {
  const [activeIdx, setActiveIdx] = useStateC(0);
  return (
    <section className="map-section" id="lokasi">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="eyebrow">Lokasi Kami</span>
          <h2 className="section-title">Datang ke <em>Cabang Terdekat</em></h2>
        </div>

        <div className="map-card">
          <div className="map-info">
            <span className="eyebrow">Pilih Cabang</span>
            <h3>Enam <em style={{ fontStyle: "italic", color: "var(--brand-glow)" }}>Lokasi Strategis</em></h3>
            <div className="map-locations">
              {window.LOCATIONS_DATA.map((l, i) => (
                <button
                  key={i}
                  className={`map-loc-btn ${activeIdx === i ? "active" : ""}`}
                  onClick={() => setActiveIdx(i)}
                >
                  <Icon.Pin /> {l.name}
                </button>
              ))}
            </div>
            <a className="btn btn-primary" href="#/coworking" style={{ marginTop: 24, justifyContent: "center" }}>
              Booking di {window.LOCATIONS_DATA[activeIdx].name.replace("Kaspa Space ", "")} <Icon.Arrow />
            </a>
          </div>
          <div className="map-visual">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80" alt="Peta Indonesia" />
            {MAP_PINS.map((p, i) => (
              <div
                key={i}
                className="map-pin"
                style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: activeIdx === i ? 3 : 2 }}
              >
                <div className="map-pin-marker">
                  <Icon.Pin />
                </div>
                {activeIdx === i && <div className="map-pin-label">{p.name}, {p.city}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CONTACT FAQ
   ============================================ */
function ContactFAQ() {
  const [open, setOpen] = useStateC(0);
  const faqs = [
    { q: "Berapa lama tim membalas pertanyaan?", a: "Di WhatsApp & jam kerja, kami balas dalam 5 menit. Untuk email, maksimal 1×24 jam — biasanya jauh lebih cepat di hari kerja." },
    { q: "Apa saya bisa tour tanpa reservasi?", a: "Bisa! Tapi untuk memastikan ada tim yang menyambut & menjelaskan fasilitas, kami sarankan untuk menjadwalkan tour gratis via WhatsApp atau form di atas." },
    { q: "Bagaimana cara mendaftarkan event di Kaspa Space?", a: "Hubungi tim Kemitraan di partner@kaspaspace.com dengan informasi event (tanggal, jumlah peserta, kebutuhan ruang). Tim kami akan respon dengan paket & ketersediaan." },
    { q: "Apakah ada paket khusus untuk media & influencer?", a: "Ya — kami punya program collab untuk media, kreator, dan komunitas. Kirim deck atau profil ke press@kaspaspace.com." },
    { q: "Bisa kunjungan untuk evaluasi kantor virtual?", a: "Tentu. Walaupun virtual office tidak butuh kehadiran fisik, kami senang menerima kunjungan untuk verifikasi & tanya-jawab." },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="faq-section">
          <div>
            <span className="eyebrow">FAQ Kontak</span>
            <h2 className="section-title">Pertanyaan <em>Seputar Kontak</em></h2>
            <p className="section-sub">
              Belum menemukan jawaban? Tim Customer Care siap membantu via channel
              di atas.
            </p>
            <a className="btn btn-primary" href="#" style={{ marginTop: 24 }}>
              <Icon.Whatsapp /> Chat WhatsApp
            </a>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  {f.q}
                  <span className="faq-toggle"><Icon.Plus /></span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

window.ContactSubHero = ContactSubHero;
window.ContactMethods = ContactMethods;
window.ContactFormSplit = ContactFormSplit;
window.ContactMap = ContactMap;
window.ContactFAQ = ContactFAQ;
