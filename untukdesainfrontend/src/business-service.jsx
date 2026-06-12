/* global React, ReactDOM, Icon, Nav, Footer, CWIcon */
const { useState: useStateBS, useMemo: useMemoBS } = React;

/* ============================================
   SUB-HERO
   ============================================ */
function BSSubHero() {
  return (
    <section className="subhero bs-hero">
      <div className="subhero-bg">
        <img
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=2000&q=80"
          alt="Layanan bisnis"
        />
      </div>
      <div className="container subhero-inner">
        <div className="breadcrumb">
          <a href="#/home">Beranda</a>
          <span className="sep">/</span>
          <a href="#">Produk</a>
          <span className="sep">/</span>
          <span className="current">Business Service</span>
        </div>
        <span className="bs-eyebrow">Layanan Bisnis Terpadu</span>
        <h1 className="subhero-title" style={{ marginTop: 14 }}>
          Business <em>Service</em>
        </h1>
        <p className="subhero-lede">
          Kami siap mendampingi proses legalitas usaha, perpajakan, keuangan,
          akuntansi, hingga coaching pembukuan — satu pintu untuk semua kebutuhan
          administrasi bisnis Anda.
        </p>
        <div className="hero-cta" style={{ justifyContent: "center" }}>
          <a className="btn btn-primary" href="#produk">Lihat Layanan <Icon.Arrow /></a>
          <a className="btn btn-ghost" href="#compare">Bandingkan</a>
        </div>
        <div className="subhero-stats">
          <div className="subhero-stat">
            <div className="subhero-stat-num">4<em>+</em></div>
            <div className="subhero-stat-label">Paket Layanan</div>
          </div>
          <div className="subhero-stat-divider"></div>
          <div className="subhero-stat">
            <div className="subhero-stat-num">20<em>-70%</em></div>
            <div className="subhero-stat-label">Hemat Biaya</div>
          </div>
          <div className="subhero-stat-divider"></div>
          <div className="subhero-stat">
            <div className="subhero-stat-num">100<em>%</em></div>
            <div className="subhero-stat-label">Online</div>
          </div>
          <div className="subhero-stat-divider"></div>
          <div className="subhero-stat">
            <div className="subhero-stat-num">5.0<em>★</em></div>
            <div className="subhero-stat-label">Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   SEARCH + PRODUCT GRID
   ============================================ */
function openBiz(pid) {
  try { localStorage.setItem("ks_product", JSON.stringify(pid)); } catch (e) {}
  window.location.href = "#/product";
}

const BS_PRODUCTS = [
  {
    id: 1,
    pid: { kind: "business", id: "legalitas" },
    cat: "Legalitas Usaha",
    title: "Legalitas Usaha — Kaspa Space Solo",
    rating: 5.0,
    reviews: 5,
    price: 225000,
    placeholder: { mark: "Legalitas", sub: "Solo / Manahan" },
  },
  {
    id: 2,
    pid: { kind: "business", id: "print" },
    cat: "Print & Materai",
    title: "Print & Materai — Manahan Solo",
    price: 500,
    placeholder: { mark: "Print", sub: "Materai / Cetak" },
  },
  {
    id: 3,
    pid: { kind: "business", id: "legalitas" },
    cat: "Legalitas Usaha",
    title: "Legalitas Usaha — Kaspa Space Surabaya",
    price: 100000,
    placeholder: { mark: "Legalitas", sub: "Surabaya / Citraland" },
  },
  {
    id: 4,
    pid: { kind: "business", id: "backoffice" },
    cat: "Back Office",
    title: "Back Office — Kaspa Space",
    price: null,
    priceLabel: "Konsultasi",
    isNew: true,
    placeholder: { mark: "Back Office", sub: "Akuntansi / Pajak" },
  },
];

function BSSearchAndGrid() {
  const [query, setQuery] = useStateBS("");
  const filtered = useMemoBS(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BS_PRODUCTS;
    return BS_PRODUCTS.filter(p =>
      `${p.title} ${p.cat}`.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section className="bs-grid-section" id="produk" style={{ paddingTop: 80 }}>
      <div className="container">
        <div className="bs-search-wrap">
          <div className="bs-search">
            <Icon.Search />
            <input
              type="search"
              placeholder="Cari produk atau layanan…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="bs-search-meta">
            {filtered.length} produk tersedia
          </div>
        </div>

        <div className="bs-grid">
          {filtered.map(p => (
            <article key={p.id} className="bs-card" onClick={() => openBiz(p.pid)} style={{ cursor: "pointer" }}>
              <div className="bs-card-media">
                <div className="bs-card-placeholder">
                  <div className="ph-mark">{p.placeholder.mark}</div>
                  <div className="ph-sub">{p.placeholder.sub}</div>
                </div>
                {p.isNew && <span className="bs-card-new">New</span>}
              </div>
              <div className="bs-card-body">
                <span className="bs-card-cat">{p.cat}</span>
                <h3 className="bs-card-title">{p.title}</h3>
                {p.rating && (
                  <div className="bs-card-rate">
                    <span className="stars">
                      {[0,1,2,3,4].map(i => <Icon.Star key={i} />)}
                    </span>
                    <small>({p.reviews})</small>
                  </div>
                )}
                <div className="bs-card-price">
                  <div>
                    <div className="bs-card-price-label">
                      {p.price !== null ? "Mulai dari" : "Harga"}
                    </div>
                    <div className="bs-card-price-val">
                      {p.price !== null
                        ? <>Rp{p.price.toLocaleString("id-ID")}</>
                        : <em>{p.priceLabel}</em>}
                    </div>
                  </div>
                </div>
                <a
                  className="bs-card-cta"
                  onClick={(e) => { e.stopPropagation(); window.cartAdd(p.pid); window.openCart(); }}
                  style={{ cursor: "pointer" }}
                >
                  Pesan <Icon.Arrow />
                </a>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 18, marginBottom: 8, color: "var(--text-primary)", fontWeight: 600 }}>
              Tidak ada produk ditemukan
            </div>
            <p>Coba kata kunci lain, atau hubungi tim kami via WhatsApp.</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================
   TWIN COMPARISON
   ============================================ */
const ROW_LEGAL = [
  { label: "Biaya Total",         them: ["Kurang transparan", "bad"],          us: ["Terjangkau & transparan", "good"] },
  { label: "Kecepatan Pengerjaan",them: ["Lamban jika banyak antrean", "warn"],us: ["Lebih cepat, banyak rekan notaris", "good"] },
  { label: "Keandalan",           them: ["Tergantung skill notaris", "warn"],  us: ["Dikerjakan notaris pilihan", "good"] },
  { label: "Transparansi Proses", them: ["Tergantung kebijakan", "warn"],      us: ["Detail proses dijabarkan", "good"] },
  { label: "Komunikasi & Support",them: ["Tergantung skill", "warn"],          us: ["Responsif & terstandar", "good"] },
  { label: "Efisiensi Waktu",     them: ["Offline & menyita waktu", "bad"],    us: ["Proses online, terima jadi", "good"] },
  { label: "Integrasi Layanan",   them: ["Hanya beberapa layanan", "warn"],    us: ["Banyak layanan dalam 1 tempat", "good"] },
  { label: "Keamanan Data",       them: ["Biasanya aman", "warn"],             us: ["Dilindungi kebijakan privasi", "good"] },
  { label: "Keberlanjutan",       them: ["Selama notaris bekerja", "warn"],    us: ["Terus berlanjut sampai sekarang", "good"] },
];

const ROW_BACKOFFICE = [
  { label: "Biaya Total",         them: ["Sangat tinggi", "bad"],              us: ["Hemat 20% – 70%", "good"] },
  { label: "Kecepatan Pengerjaan",them: ["Tergantung skill", "warn"],          us: ["Cepat & terjadwal", "good"] },
  { label: "Keandalan",           them: ["Tergantung skill", "warn"],          us: ["Tim berpengalaman", "good"] },
  { label: "Transparansi Proses", them: ["Tergantung prosedur", "warn"],       us: ["Detail proses dijabarkan", "good"] },
  { label: "Komunikasi & Support",them: ["Tergantung skill", "warn"],          us: ["Responsif & terstandar", "good"] },
  { label: "Efisiensi Waktu",     them: ["Perlu pengawasan & pelatihan", "bad"],us:["Proses online, terima jadi", "good"] },
  { label: "Integrasi Layanan",   them: ["1 staf pegang sedikit tugas", "warn"],us:["Banyak layanan dalam 1 tempat", "good"] },
  { label: "Keamanan Data",       them: ["Potensi dibocorkan staf", "bad"],    us: ["Dilindungi kebijakan privasi", "good"] },
  { label: "Keberlanjutan",       them: ["Tergantung manajemen SDM", "warn"],  us: ["Terus berlanjut sampai sekarang", "good"] },
];

function Mark({ k }) {
  if (k === "good") return <span className="mk good"><CWIcon.Check /></span>;
  if (k === "warn") return <span className="mk warn"><CWIcon.Tilde /></span>;
  return <span className="mk bad"><CWIcon.X /></span>;
}

function BSCompareCard({ title, titleEm, them, themLabel, rows }) {
  return (
    <div className="bs-compare-card">
      <div className="bs-compare-card-head">
        <div className="ttl">Perbandingan</div>
        <h3>{title} <em>{titleEm}</em></h3>
      </div>
      <div className="bs-compare-cols">
        <div className="bs-h">Aspek</div>
        <div className="bs-h them">{themLabel}</div>
        <div className="bs-h us">Kaspa Space</div>
        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <div className="label">{r.label}</div>
            <div className="them"><Mark k={r.them[1]} />{r.them[0]}</div>
            <div className="us"><Mark k={r.us[1]} />{r.us[0]}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function BSCompare() {
  return (
    <section className="bs-compare-section" id="compare">
      <div className="container">
        <div className="compare-head">
          <span className="eyebrow">Kenapa Kaspa</span>
          <h2 className="section-title">Transparan, <em>Terukur</em></h2>
          <p className="section-sub" style={{ marginInline: "auto", textAlign: "center" }}>
            Bandingkan dengan opsi konvensional — kami terbuka soal proses,
            biaya, dan jaminan kualitas.
          </p>
        </div>

        <div className="bs-compare-grid">
          <BSCompareCard
            title="Legalitas"
            titleEm="Usaha"
            themLabel="Notaris"
            rows={ROW_LEGAL}
          />
          <BSCompareCard
            title="Back"
            titleEm="Office"
            themLabel="Staf Tetap"
            rows={ROW_BACKOFFICE}
          />
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURED TESTIMONIAL
   ============================================ */
function BSFeatureTesti() {
  return (
    <section className="bs-testi">
      <div className="container">
        <div className="bs-testi-card">
          <div className="bs-testi-media">
            <div className="ph">
              <div className="ph-big">"Sukses selalu"</div>
              <div className="ph-mono">Photo · Penandatanganan dokumen</div>
            </div>
          </div>
          <div className="bs-testi-body">
            <div className="stars">
              {[0,1,2,3,4].map(s => <Icon.Star key={s} />)}
            </div>
            <p className="quote">
              Pelayanan legal pembuatan <em>CV yang cepat dan amanah</em>.
              Tim Kaspa Space sangat profesional dari awal sampai dokumen
              jadi. Sukses selalu!
            </p>
            <div>
              <div className="avatar">P</div>
              <div className="who">Pratyaksa Fendhy Artadi</div>
              <div className="role">Owner · Klien Legalitas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FAQ
   ============================================ */
function BSFAQ() {
  const [open, setOpen] = useStateBS(0);
  const faqs = [
    { q: "Pelayanan online atau onsite?", a: "Kami mengedepankan pelayanan secara online untuk mendukung digitalisasi, lebih cepat, dan efisien. Pelayanan secara onsite tetap tersedia untuk kondisi tertentu." },
    { q: "Bagaimana prosedur pemesanan?", a: "Silakan pilih produk atau layanan yang Anda butuhkan. Setelah masuk ke keranjang, Anda dapat melanjutkan pengisian formulir, memilih metode pembayaran, menyetujui S&K, dan melakukan pembayaran." },
    { q: "Cara konfirmasi setelah pembayaran?", a: "Setelah melakukan pembayaran, Anda akan menerima email invoice. Setelah itu Anda hanya perlu konfirmasi kepada layanan pelanggan kami." },
    { q: "Apakah ada uang muka?", a: "Untuk memproses layanan yang Anda butuhkan, kami meminta 50% uang muka. Pelunasan dapat dilakukan setelah proses selesai." },
    { q: "Bagaimana jika layanan tidak tersedia?", a: "Jika layanan yang dibutuhkan tidak tersedia di situs web, Anda bisa menghubungi layanan pelanggan. Kami memiliki beberapa layanan tambahan yang tidak dicantumkan dalam daftar." },
  ];

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="faq-section">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="section-title">Pertanyaan <em>Umum</em></h2>
            <p className="section-sub">
              Belum menemukan jawaban? Tim kami siap bantu lewat WhatsApp dengan
              respons cepat di jam kerja.
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
   APP
   ============================================ */
function BSApp() {
  return (
    <>
      <Nav />
      <BSSubHero />
      <BSSearchAndGrid />
      <BSCompare />
      <BSFeatureTesti />
      <BSFAQ />
      <Footer />
      <a className="wa-float" href="#" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["business"] = BSApp;
