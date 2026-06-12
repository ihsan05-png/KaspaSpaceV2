/* global React, Icon */
const { useState: useFnBState } = React;

const FnBIcon = {
  Coffee: Icon.Coffee,
  Cup: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/></svg>,
  Utensils: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 2v7c0 1.1.9 2 2 2h4V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>,
  Cake: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3M12 8v3M17 8v3"/><path d="M7 4h.01M12 4h.01M17 4h.01"/></svg>,
  Salad: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 21h10"/><path d="M19.5 12 22 6H2l2.5 6"/><circle cx="12" cy="12" r="2"/><circle cx="7" cy="9" r="1.5"/><circle cx="17" cy="9" r="1.5"/></svg>,
  Cookie: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r=".8" fill="currentColor"/><circle cx="14" cy="14" r=".8" fill="currentColor"/><circle cx="15" cy="9" r=".8" fill="currentColor"/><circle cx="9" cy="15" r=".8" fill="currentColor"/></svg>,
  Plus: Icon.Plus,
  Clock: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Flame: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  Tag: Icon.Tag,
  Star: Icon.Star,
};

/* ============================================
   FNB — HERO
   ============================================ */
function FnBHero() {
  return (
    <section className="fnb-hero">
      <div className="container">
        <div className="breadcrumb" style={{ marginBottom: 18 }}>
          <a href="#/home">Beranda</a>
          <span className="sep">/</span>
          <a href="#">Produk</a>
          <span className="sep">/</span>
          <span className="current" style={{ color: "#fbbf24" }}>Food & Beverage</span>
        </div>
        <div className="fnb-hero-grid">
          <div>
            <span className="chip chip-dot chip-uppercase" style={{ color: "#fbbf24" }}>
              <style>{`.chip.chip-dot.chip-uppercase::before { background: #fbbf24 !important; box-shadow: 0 0 8px #fbbf24 !important; }`}</style>
              Buka 08:00 – 22:00 setiap hari
            </span>
            <h1 className="fnb-hero-title">
              Kopi yang Baik,<br/>
              <em>Hari yang Produktif</em>
            </h1>
            <p className="fnb-hero-lede">
              Kafe internal Kaspa Space menyajikan kopi specialty single origin, makanan
              sehat, dan camilan favorit — semua dengan diskon 20% untuk member aktif.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a className="btn" href="#menu" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#1a1206", boxShadow: "0 8px 24px -10px rgba(245, 158, 11, .7)" }}>
                Lihat Menu <Icon.Arrow />
              </a>
              <a className="btn btn-ghost" href="#cara">Cara Pesan</a>
            </div>
            <div className="fnb-hero-stats">
              <div>
                <div className="fnb-hero-stat-num">40<em>+</em></div>
                <div className="fnb-hero-stat-label">Menu Pilihan</div>
              </div>
              <div>
                <div className="fnb-hero-stat-num">4.8<em>★</em></div>
                <div className="fnb-hero-stat-label">Rating</div>
              </div>
              <div>
                <div className="fnb-hero-stat-num">20<em>%</em></div>
                <div className="fnb-hero-stat-label">Diskon Member</div>
              </div>
            </div>
          </div>
          <div className="fnb-hero-media">
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"
              alt="Kopi Kaspa Space"
            />
            <div className="fnb-hero-floater tl">
              <div className="icon"><FnBIcon.Coffee /></div>
              <div>
                <div className="num">15<span style={{ fontSize: 16, color: "#fbbf24" }}> menu</span></div>
                <div className="label">Kopi Specialty</div>
              </div>
            </div>
            <div className="fnb-hero-floater br">
              <div className="icon"><FnBIcon.Flame /></div>
              <div>
                <div className="num">100%</div>
                <div className="label">Bean Lokal Indonesia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PROMO BANNER
   ============================================ */
function FnBPromo() {
  return (
    <section className="fnb-promo">
      <div className="container">
        <div className="fnb-promo-card">
          <div className="fnb-promo-badge">
            20%
            <small>OFF</small>
          </div>
          <div>
            <h3 className="fnb-promo-title">Diskon <em>Member</em> Setiap Hari</h3>
            <p className="fnb-promo-desc">
              Tunjukkan kartu member di kasir, atau pesan via app untuk otomatis dapat diskon 20%
              di semua menu makanan & minuman.
            </p>
          </div>
          <a className="btn" href="#/auth" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#1a1206" }}>
            Jadi Member <Icon.Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   MENU
   ============================================ */
const MENU = [
  { cat: "Kopi", tag: "Signature", tagClass: "signature", name: "Manahan Latte", desc: "Single origin Aceh Gayo dengan oat milk dan caramel house syrup.", price: 38000, oldPrice: 48000, time: "5 min", rating: 4.9, img: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?auto=format&fit=crop&w=900&q=80" },
  { cat: "Kopi", tag: "Hot", tagClass: "hot", name: "Es Kopi Susu Aren", desc: "Espresso double shot dengan susu segar dan gula aren asli.", price: 28000, time: "4 min", rating: 4.8, img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80" },
  { cat: "Kopi", name: "V60 Single Origin", desc: "Manual brew dengan biji pilihan minggu ini, disajikan hitam.", price: 42000, time: "8 min", rating: 4.7, img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80" },
  { cat: "Kopi", name: "Cappuccino Klasik", desc: "Espresso, milk foam tebal, taburan cocoa premium.", price: 32000, time: "5 min", rating: 4.7, img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80" },

  { cat: "Non-Kopi", tag: "New", tagClass: "new", name: "Matcha Latte", desc: "Bubuk matcha ceremonial grade dengan susu fresh.", price: 36000, time: "5 min", rating: 4.8, img: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=80" },
  { cat: "Non-Kopi", name: "Cokelat Hangat", desc: "Cokelat dark Belgian dengan marshmallow.", price: 32000, time: "5 min", rating: 4.6, img: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=900&q=80" },
  { cat: "Non-Kopi", name: "Lemon Tea", desc: "Teh hitam dengan perasan lemon segar dan madu.", price: 25000, time: "3 min", rating: 4.5, img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80" },
  { cat: "Non-Kopi", name: "Strawberry Smoothie", desc: "Stroberi segar diblender dengan yogurt dan madu.", price: 38000, time: "6 min", rating: 4.7, img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80" },

  { cat: "Makanan", tag: "Signature", tagClass: "signature", name: "Nasi Goreng Kaspa", desc: "Nasi goreng spesial dengan ayam suwir, telur mata sapi, dan acar.", price: 45000, time: "12 min", rating: 4.9, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80" },
  { cat: "Makanan", name: "Spaghetti Aglio Olio", desc: "Pasta dengan minyak zaitun, bawang putih, cabai, dan parsley.", price: 52000, time: "14 min", rating: 4.7, img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=900&q=80" },
  { cat: "Makanan", name: "Chicken Caesar Salad", desc: "Selada romaine, ayam panggang, parmesan, crouton, dressing caesar.", price: 48000, time: "10 min", rating: 4.6, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80" },
  { cat: "Makanan", name: "Beef Burger", desc: "Beef patty grilled, keju cheddar, salad, dan saus rumahan.", price: 58000, time: "15 min", rating: 4.8, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80" },

  { cat: "Snack", name: "French Fries", desc: "Kentang goreng renyah dengan saus pilihan.", price: 22000, time: "8 min", rating: 4.5, img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80" },
  { cat: "Snack", name: "Pisang Goreng Madu", desc: "Pisang raja goreng renyah dengan drizzle madu dan keju.", price: 25000, time: "8 min", rating: 4.7, img: "https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4?auto=format&fit=crop&w=900&q=80" },
  { cat: "Snack", name: "Tahu Crispy", desc: "Tahu goreng tepung renyah dengan sambal kecap.", price: 18000, time: "6 min", rating: 4.4, img: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80" },
  { cat: "Snack", name: "Tiramisu Cup", desc: "Tiramisu rumahan dengan kopi espresso dan mascarpone.", price: 35000, time: "Siap saji", rating: 4.8, img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80" },
];

const FNB_CATS = [
  { id: "Semua", icon: <FnBIcon.Utensils /> },
  { id: "Kopi", icon: <FnBIcon.Coffee /> },
  { id: "Non-Kopi", icon: <FnBIcon.Cup /> },
  { id: "Makanan", icon: <FnBIcon.Salad /> },
  { id: "Snack", icon: <FnBIcon.Cookie /> },
];

function openFnb(item) {
  try { localStorage.setItem("ks_product", JSON.stringify({ kind: "fnb", name: item.name })); } catch (e) {}
  window.location.href = "#/product";
}

function FnBMenu() {
  const [cat, setCat] = useFnBState("Semua");
  const items = cat === "Semua" ? MENU : MENU.filter(m => m.cat === cat);
  return (
    <section className="menu-section" id="menu">
      <div className="container">
        <div className="menu-head">
          <span className="eyebrow" style={{ color: "#fbbf24" }}>Menu</span>
          <h2 className="section-title">Cita Rasa <em style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Pilihan</em></h2>
          <p className="section-sub" style={{ marginInline: "auto", textAlign: "center" }}>
            Setiap menu dibuat fresh setiap hari dengan bahan pilihan dari supplier lokal.
          </p>
        </div>

        <div className="menu-categories">
          {FNB_CATS.map(c => (
            <button
              key={c.id}
              className={`menu-cat ${cat === c.id ? "active" : ""}`}
              onClick={() => setCat(c.id)}
            >
              {c.icon} {c.id}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {items.map((m, i) => (
            <article key={i} className="menu-item" style={{ cursor: "pointer" }} onClick={() => openFnb(m)}>
              <div className="menu-media">
                {m.tag && <span className={`menu-tag ${m.tagClass || ""}`}>{m.tag}</span>}
                <img src={m.img} alt={m.name} loading="lazy" />
              </div>
              <div className="menu-body">
                <div className="menu-name-row">
                  <h3 className="menu-name">{m.name}</h3>
                  <span className="menu-rating"><FnBIcon.Star /> {m.rating}</span>
                </div>
                <p className="menu-desc">{m.desc}</p>
                <div className="menu-meta">
                  <span><FnBIcon.Clock /> {m.time}</span>
                  <span><FnBIcon.Tag /> {m.cat}</span>
                </div>
                <div className="menu-foot">
                  <div>
                    <div className="menu-price-row">
                      <span className="menu-price">Rp{m.price.toLocaleString("id-ID")}</span>
                      {m.oldPrice && <span className="menu-price-old">Rp{m.oldPrice.toLocaleString("id-ID")}</span>}
                    </div>
                    <div className="menu-price-member">-20% untuk member</div>
                  </div>
                  <button className="menu-add" aria-label="Tambah ke keranjang" onClick={(e) => { e.stopPropagation(); window.cartAdd({ kind: "fnb", name: m.name }); }}>
                    <FnBIcon.Plus />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CAFE INFO
   ============================================ */
function FnBInfo() {
  const items = [
    {
      icon: <FnBIcon.Coffee />,
      t: "Specialty Coffee",
      d: "Biji kopi single origin dari petani Indonesia, dipanggang fresh setiap minggu di roastery rekanan kami."
    },
    {
      icon: <FnBIcon.Salad />,
      t: "Bahan Segar Lokal",
      d: "Sayuran dari kebun lokal, telur free range, dan daging tanpa pengawet. Healthy without compromise."
    },
    {
      icon: <FnBIcon.Tag />,
      t: "Harga Bersahabat",
      d: "Member dapat diskon 20% otomatis. Non-member tetap dapat harga yang fair tanpa biaya tersembunyi."
    },
  ];
  return (
    <section className="cafe-info">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="eyebrow" style={{ color: "#fbbf24" }}>Kenapa Kafe Kami</span>
          <h2 className="section-title">Lebih dari <em style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Sekadar Kopi</em></h2>
        </div>
        <div className="cafe-info-grid">
          {items.map((it, i) => (
            <div key={i} className="cafe-info-card">
              <div className="cafe-info-icon">{it.icon}</div>
              <h3 className="cafe-info-title">{it.t}</h3>
              <p className="cafe-info-desc">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   HOW TO ORDER
   ============================================ */
function FnBHowTo() {
  const steps = [
    { n: "01", t: "Pilih Menu", d: "Browse menu di app atau langsung ke counter — semua menu sama harganya." },
    { n: "02", t: "Tunjukkan Member", d: "Scan QR member di kasir untuk diskon 20% otomatis." },
    { n: "03", t: "Bayar", d: "QRIS, e-wallet, transfer, atau tunai — pilih yang paling nyaman." },
    { n: "04", t: "Diantar atau Pickup", d: "Pesanan diantar ke desk Anda, atau ambil sendiri di counter." },
  ];
  return (
    <section className="howto-section" id="cara">
      <div className="container">
        <div className="howto-head">
          <span className="eyebrow" style={{ color: "#fbbf24" }}>Cara Pesan</span>
          <h2 className="section-title">Empat <em style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Langkah Cepat</em></h2>
        </div>
        <div className="howto-grid">
          {steps.map(s => (
            <div key={s.n} className="howto-card">
              <div className="howto-num">{s.n}</div>
              <h4 className="howto-title">{s.t}</h4>
              <p className="howto-desc">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.FnBHero = FnBHero;
window.FNB_MENU = MENU;
window.FnBPromo = FnBPromo;
window.FnBMenu = FnBMenu;
window.FnBInfo = FnBInfo;
window.FnBHowTo = FnBHowTo;
