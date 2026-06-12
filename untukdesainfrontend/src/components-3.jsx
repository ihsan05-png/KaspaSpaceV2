/* global React, Icon */
const { useState: useState3 } = React;

/* ============================================
   PARTNERS
   ============================================ */
function Partners() {
  const partners = ["IBI", "DetiKom", "Coworking Indonesia", "Microsoft", "ISO Certified", "Mitrans", "Google Workspace", "Bank Mandiri", "BCA Business", "Tokopedia for Business", "GoTo Business", "OVO Bisnis"];
  return (
    <section className="partners">
      <div className="container">
        <div style={{ textAlign: "center" }}>
          <span className="eyebrow">Didukung Oleh</span>
          <h2 className="section-title" style={{ fontSize: "clamp(28px, 3vw, 40px)" }}>
            Mitra <em>Terpercaya</em> Kami
          </h2>
        </div>
        <div className="partners-list">
          {partners.map(p => (
            <div key={p} className="partner-pill">{p}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   NEWS / UPDATES
   ============================================ */
function News() {
  const articles = [
    {
      cat: "Penghargaan",
      date: "12 Mei 2026 • 4 min",
      title: "Kaspa Space Raih Penghargaan Coworking Terbaik 2026",
      img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
    },
    {
      cat: "Produk",
      date: "5 Mei 2026 • 6 min",
      title: "Layanan Legalitas Bisnis Kaspa Space Kini Hadir di 6 Kota",
      img: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80"
    },
    {
      cat: "Kolaborasi",
      date: "28 April 2026 • 5 min",
      title: "Kolaborasi Kaspa Space & BRI Buka Layanan Keuangan Terintegrasi",
      img: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=80"
    },
  ];

  return (
    <section className="section" id="media" style={{ background: "var(--bg-base)" }}>
      <div className="container">
        <div className="news-head">
          <div>
            <span className="eyebrow">Kabar Terbaru</span>
            <h2 className="section-title">Update <em>Terbaru</em></h2>
          </div>
          <a className="btn btn-ghost" href="#/media">Semua Berita <Icon.Arrow /></a>
        </div>

        <div className="news-grid">
          {articles.map((a, i) => (
            <a className="news-card" key={i} href="#/media">
              <div className="news-media">
                <img src={a.img} alt={a.title} loading="lazy" />
                <span className="news-cat">{a.cat}</span>
              </div>
              <div className="news-body">
                <div className="news-meta">{a.date}</div>
                <h3 className="news-title">{a.title}</h3>
                <span className="news-link">Baca selengkapnya <Icon.ArrowUR /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FAQ
   ============================================ */
function FAQ() {
  const [open, setOpen] = useState3(0);
  const faqs = [
    { q: "Apa itu Kaspa Space?", a: "Kaspa Space adalah ekosistem coworking yang menyediakan ruang kerja fleksibel, virtual office, dan layanan legalitas bisnis dalam satu paket terintegrasi." },
    { q: "Berapa harga sewa coworking per jam?", a: "Mulai dari Rp 5.000/jam untuk share desk dan Rp 75.000/jam untuk meeting room. Tersedia paket harian, mingguan, dan bulanan dengan harga lebih hemat." },
    { q: "Apa benefit menjadi member?", a: "Member mendapat akses internet 1 Gbps, kopi & teh gratis, diskon F&B hingga 20%, resepsionis profesional, dan komunitas networking aktif." },
    { q: "Bagaimana cara booking?", a: "Anda bisa booking langsung lewat website, aplikasi mobile, atau WhatsApp. Konfirmasi instan dan pembayaran fleksibel via transfer, QRIS, atau kartu kredit." },
    { q: "Ada paket virtual office?", a: "Ya! Paket virtual office mulai Rp 350.000/bulan dengan alamat prestige, layanan resepsionis, pengelolaan surat, dan support PKP." },
    { q: "Di mana lokasi Kaspa Space?", a: "Kami memiliki 6 lokasi strategis di Jakarta, Bandung, Surabaya, dan Bali. Cek halaman Lokasi untuk detail alamat dan fasilitas tiap cabang." },
  ];

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="faq-section">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="section-title">Pertanyaan yang <em>Sering Ditanyakan</em></h2>
            <p className="section-sub">
              Tidak menemukan jawaban? Hubungi tim kami via WhatsApp — biasanya kami balas
              dalam 5 menit di jam kerja.
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

/* ============================================
   CONTACT
   ============================================ */
function Contact() {
  return (
    <section className="contact-section" id="kontak" style={{ background: "var(--bg-base)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="eyebrow">Hubungi Kami</span>
          <h2 className="section-title">Mari <em>Terhubung</em></h2>
          <p className="section-sub" style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
            Punya pertanyaan tentang ruang, paket, atau ingin kunjungan langsung? Kami siap membantu.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-media">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
              alt="Tim Kaspa Space"
            />
            <div className="contact-media-overlay">
              <h3 style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, fontSize: 26, margin: 0 }}>
                Kunjungi Kami
              </h3>
              <div className="contact-info">
                <div className="contact-info-row">
                  <div className="contact-info-icon"><Icon.Phone /></div>
                  +62 812-3456-7890
                </div>
                <div className="contact-info-row">
                  <div className="contact-info-icon"><Icon.Mail /></div>
                  cs@kaspaspace.com
                </div>
                <div className="contact-info-row">
                  <div className="contact-info-icon"><Icon.Pin /></div>
                  Kota Anda, Indonesia
                </div>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 28, margin: 0 }}>
              Kirim Pesan
            </h3>
            <p style={{ color: "var(--text-tertiary)", fontSize: 14, margin: "6px 0 0" }}>
              Isi form di bawah — tim kami akan balas dalam 1×24 jam.
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
                <label>Tertarik Pada</label>
                <select defaultValue="">
                  <option value="" disabled>Pilih layanan</option>
                  <option>Coworking Space</option>
                  <option>Virtual Office</option>
                  <option>Private Office</option>
                  <option>Meeting Room</option>
                  <option>Business Service</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Pesan</label>
                <textarea placeholder="Ceritakan kebutuhan tim Anda..."></textarea>
              </div>
              <div className="form-field full">
                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
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
   FOOTER
   ============================================ */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#" className="logo">
              <span className="logo-mark">Kaspa</span>
              <span className="logo-sub">Space</span>
            </a>
            <p className="footer-brand-text">
              Ekosistem kerja modern yang menggabungkan ruang fleksibel, layanan bisnis,
              dan komunitas profesional.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><Icon.Instagram /></a>
              <a href="#" aria-label="Twitter"><Icon.Twitter /></a>
              <a href="#" aria-label="LinkedIn"><Icon.Linkedin /></a>
              <a href="#" aria-label="YouTube"><Icon.Youtube /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Layanan</h4>
            <ul>
              <li><a href="#">Coworking Space</a></li>
              <li><a href="#">Virtual Office</a></li>
              <li><a href="#">Private Office</a></li>
              <li><a href="#">Meeting Room</a></li>
              <li><a href="#/business">Business Service</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Perusahaan</h4>
            <ul>
              <li><a href="#">Tentang Kami</a></li>
              <li><a href="#">Karier</a></li>
              <li><a href="#">Media & Press</a></li>
              <li><a href="#">Mitra Bisnis</a></li>
              <li><a href="#">Kontak</a></li>
            </ul>
          </div>

          <div className="footer-cta">
            <h4>Newsletter Mingguan</h4>
            <p>Dapatkan tips produktivitas, event komunitas, dan promo eksklusif setiap Senin.</p>
            <div className="footer-newsletter">
              <input type="email" placeholder="email@anda.com" />
              <button>Berlangganan</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Kaspa Space. Semua hak cipta dilindungi.</span>
          <div className="footer-bottom-links">
            <a href="#" onClick={(e) => { e.preventDefault(); window.openLegal("privacy"); }}>Kebijakan Privasi</a>
            <a href="#" onClick={(e) => { e.preventDefault(); window.openLegal("terms"); }}>Syarat & Ketentuan</a>
            <a href="#" onClick={(e) => { e.preventDefault(); window.openLegal("cookies"); }}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

window.Partners = Partners;
window.News = News;
window.FAQ = FAQ;
window.Contact = Contact;
window.Footer = Footer;
