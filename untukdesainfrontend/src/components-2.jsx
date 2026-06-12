/* global React, Icon */
const { useState: useState2 } = React;

/* ============================================
   PRODUCTS / SOLUTIONS
   ============================================ */
function Products() {
  return (
    <section className="section" id="produk">
      <div className="container">
        <div className="product-head">
          <div>
            <span className="eyebrow">Produk Unggulan</span>
            <h2 className="section-title">Solusi Lengkap untuk <em>Bisnis Anda</em></h2>
            <p className="section-sub">
              Pilih layanan yang paling sesuai dengan kebutuhan tim Anda — dari share desk
              harian sampai virtual office prestige.
            </p>
          </div>
          <a className="btn btn-ghost" href="#">Lihat Semua <Icon.Arrow /></a>
        </div>

        <div className="product-grid">
          <ProductCard
            className="span-3 row-2 large"
            tag="Paling Populer"
            title="Coworking Space"
            desc="Share desk, private room, dan ruang tim dengan internet 1 Gbps, kopi tanpa batas, dan komunitas profesional."
            price={<>Mulai <strong>Rp 5.000</strong> / hari</>}
            img="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80"
          />
          <ProductCard
            className="span-3"
            tag="Untuk Bisnis"
            title="Virtual Office"
            desc="Alamat bisnis prestige + layanan PKP & resepsionis profesional."
            price={<>Mulai <strong>Rp 350.000</strong> / bulan</>}
            img="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"
          />
          <ProductCard
            className="span-3"
            tag="Eksklusif"
            title="Private Office"
            desc="Kantor pribadi siap pakai untuk tim 4–20 orang, lengkap dengan furnitur, internet, dan keamanan 24/7."
            price={<>Mulai <strong>Rp 4.5jt</strong> / bulan</>}
            img="https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=80"
          />
          <ProductCard
            className="span-3"
            tag="Tim"
            title="Meeting Room"
            desc="Ruang rapat dengan layar interaktif, video conference, dan whiteboard untuk diskusi efektif."
            price={<>Mulai <strong>Rp 75.000</strong> / jam</>}
            img="https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80"
          />
          <ProductCard
            className="span-3"
            tag="Kuliner"
            title="Food & Beverage"
            desc="Kafe internal dengan menu kopi specialty, makanan sehat, dan diskon member sampai 20%."
            price={<>Diskon hingga <strong>20%</strong> untuk member</>}
            img="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80"
          />
        </div>
      </div>
    </section>
  );
}

function ProductCard({ className = "", tag, title, desc, price, img }) {
  return (
    <a className={`product-card ${className}`} href="#">
      <img src={img} alt={title} loading="lazy" />
      <div className="product-body">
        <span className="product-tag">{tag}</span>
        <h3 className="product-title">{title}</h3>
        <p className="product-desc">{desc}</p>
        <div className="product-foot">
          <span className="product-price">{price}</span>
          <span className="product-cta">Pesan <Icon.Arrow /></span>
        </div>
      </div>
    </a>
  );
}

/* ============================================
   ABOUT
   ============================================ */
function About() {
  return (
    <section className="section" id="tentang" style={{ background: "var(--bg-base)" }}>
      <div className="container">
        <div className="about-grid">
          <div className="about-media">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
              alt="Komunitas Kaspa Space"
            />
            <div className="about-stats">
              <div>
                <div className="about-stat-num">500<em>+</em></div>
                <div className="about-stat-label">Member Aktif</div>
              </div>
              <div>
                <div className="about-stat-num">4.9<em>★</em></div>
                <div className="about-stat-label">Rating Member</div>
              </div>
              <div>
                <div className="about-stat-num">3<em>Thn</em></div>
                <div className="about-stat-label">Pengalaman</div>
              </div>
            </div>
          </div>

          <div className="about-body">
            <span className="eyebrow">Tentang Kaspa Space</span>
            <h2 className="section-title">Tumbuh Bersama <em>Komunitas Kami</em></h2>
            <div className="about-pills">
              <span className="chip">Coworking</span>
              <span className="chip">Virtual Office</span>
              <span className="chip">Meeting Room</span>
              <span className="chip">Business Service</span>
            </div>
            <p className="about-text">
              Kaspa Space adalah ekosistem kerja profesional yang menggabungkan ruang
              kerja fleksibel, perizinan usaha, sertifikasi ISO, hingga layanan resepsionis —
              mendukung pekerjaan Anda dari hari pertama.
            </p>
            <p className="about-text">
              Lewat lebih dari 6 lokasi dan komunitas yang aktif, Kaspa Space telah menjadi
              tempat bertumbuh ribuan ide, brand, dan peluang — di satu ekosistem yang saling menguatkan.
            </p>
            <div className="about-actions">
              <a className="btn btn-primary" href="#">Pelajari Lebih Lanjut <Icon.Arrow /></a>
              <button className="play-btn">
                <span className="play-btn-icon"><Icon.Play /></span>
                Tonton Video Profil
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   BENEFITS
   ============================================ */
function Benefits() {
  const items = [
    { n: "01", icon: <Icon.Briefcase />, title: "Coworking Space", desc: "Akses harian dan bulanan ke ruang kerja kolaboratif dengan internet 1 Gbps." },
    { n: "02", icon: <Icon.Building />, title: "Microsoft Key", desc: "Office, Teams, dan tools produktivitas Microsoft untuk semua member." },
    { n: "03", icon: <Icon.Tag />, title: "Signage", desc: "Plang nama perusahaan terpasang di front desk untuk citra profesional Anda." },
    { n: "04", icon: <Icon.Users />, title: "Resepsionis", desc: "Resepsionis profesional yang menerima tamu dan paket atas nama bisnis Anda." },
    { n: "05", icon: <Icon.Award />, title: "PKP", desc: "Pengurusan PKP untuk perusahaan dengan support tim akuntan kami." },
    { n: "06", icon: <Icon.Shield />, title: "Sertifikasi ISO", desc: "Pendampingan sertifikasi ISO 9001:2015 untuk member yang memenuhi syarat." },
    { n: "07", icon: <Icon.Pin />, title: "Alamat Prestige", desc: "Alamat bisnis di lokasi premium untuk kebutuhan domisili dan legalitas usaha." },
    { n: "08", icon: <Icon.Sparkles />, title: "Event Komunitas", desc: "Networking event, workshop, dan mentoring rutin bersama komunitas member." },
    { n: "09", icon: <Icon.Coffee />, title: "Free F&B", desc: "Kopi premium, teh, dan air mineral gratis di semua jam operasional." },
  ];

  return (
    <section className="section" style={{ background: "var(--bg-deep)" }}>
      <div className="container">
        <div className="benefits-head">
          <div>
            <div className="benefits-mark">
              <span className="benefits-mark-num">9×</span>
              <span className="benefits-mark-label">Keunggulan</span>
            </div>
            <h2 className="section-title">Mengapa Memilih <em>Kaspa Space?</em></h2>
          </div>
          <div>
            <p className="section-sub">
              Sembilan benefit eksklusif yang kami berikan secara <strong style={{ color: "var(--text-primary)" }}>gratis</strong> untuk
              setiap member aktif. Bukan basa-basi — setiap layanan dirancang untuk membantu
              tim Anda tumbuh lebih cepat dan lebih jauh.
            </p>
          </div>
        </div>

        <div className="benefits-grid">
          {items.map(b => (
            <div key={b.n} className="benefit-card">
              <div className="benefit-num">{b.n}</div>
              <div className="benefit-icon">{b.icon}</div>
              <h3 className="benefit-title">{b.title} <span className="gratis">gratis</span></h3>
              <p className="benefit-desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   TESTIMONIALS
   ============================================ */
function Testimonials() {
  const items = [
    {
      stars: 5,
      quote: "Kaspa Space mengubah cara saya bekerja. Suasananya produktif, fasilitasnya lengkap, dan komunitasnya sangat suportif.",
      name: "Nirina A.",
      role: "Founder, Loola Studio",
      color: "#3b82f6",
      initials: "N"
    },
    {
      stars: 5,
      quote: "Proses pengurusan legalitas bisnis saya jadi sangat mudah. Tim Kaspa selalu siap membantu sampai kelar.",
      name: "Rudi S.",
      role: "Direktur, RS Konsultindo",
      color: "#f59e0b",
      initials: "R"
    },
    {
      stars: 5,
      quote: "Virtual office-nya keren — alamat prestige dengan harga terjangkau. Cocok untuk startup seperti kami.",
      name: "Dewi P.",
      role: "CEO, Pixelnova",
      color: "#10b981",
      initials: "D"
    },
    {
      stars: 5,
      quote: "Tim kami pindah ke Kaspa Space 6 bulan lalu — produktivitas naik, biaya operasional turun. Lokasinya strategis & komunitasnya aktif.",
      name: "Ardi M.",
      role: "Marketing Lead, Hiretive",
      color: "#ec4899",
      initials: "A"
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="testi-head">
          <div>
            <span className="eyebrow">Apa Kata Mereka</span>
            <h2 className="section-title">Testimoni <em>Member Kami</em></h2>
          </div>
          <div className="testi-controls">
            <button className="testi-nav" aria-label="Sebelumnya"><Icon.ChevLeft /></button>
            <button className="testi-nav" aria-label="Berikutnya"><Icon.ChevRight /></button>
          </div>
        </div>

        <div className="testi-grid">
          {items.map((t, i) => (
            <div key={i} className="testi-card">
              <div className="testi-stars">
                {[0,1,2,3,4].map(s => <Icon.Star key={s} />)}
              </div>
              <p className="testi-quote">"{t.quote}"</p>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)` }}>
                  {t.initials}
                </div>
                <div>
                  <p className="testi-name">{t.name}</p>
                  <p className="testi-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Products = Products;
window.About = About;
window.Benefits = Benefits;
window.Testimonials = Testimonials;
