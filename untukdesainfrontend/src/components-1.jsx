/* global React */
const { useState, useEffect, useRef } = React;

/* ============================================
   ICONS
   ============================================ */
const Icon = {
  Chevron: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>,
  Arrow: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  ArrowUR: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  Search: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Calendar: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Users: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Pin: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Briefcase: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Building: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>,
  Book: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Coffee: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  Sparkles: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.9 5.7L20 10l-5.6 2 1.6 6L12 14.5 8 18l1.6-6L4 10l5.6-1.3z"/></svg>,
  Wifi: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.55a11 11 0 0 1 14 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M8 16a6 6 0 0 1 8 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  Shield: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/></svg>,
  Award: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Bot: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="8" width="18" height="12" rx="2"/><circle cx="8.5" cy="14" r="1.2" fill="currentColor"/><circle cx="15.5" cy="14" r="1.2" fill="currentColor"/><path d="M12 3v5"/><circle cx="12" cy="3" r="1"/></svg>,
  Zap: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Tag: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  PiggyBank: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-7.5-1-10 1-2 1-3 4-2 5L2 14c0 1 1 1 2 1l2 2 4 0 0 1 6 0 0-1 3-3c2 0 2-2 2-3l-1-1c.5-1 1-3-1-5"/><path d="M16 11h.01"/></svg>,
  Star: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Plus: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ChevLeft: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 18 9 12 15 6"/></svg>,
  ChevRight: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  Play: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><polygon points="6 4 20 12 6 20 6 4"/></svg>,
  Phone: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.06a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.02-1.27a2 2 0 0 1 2.11-.45c.99.35 2.01.59 3.06.72A2 2 0 0 1 22 16.92z"/></svg>,
  Mail: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Whatsapp: (p) => <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6 0-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.3 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3c1.5.8 3.1 1.3 4.8 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>,
  Twitter: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M22 5.8c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.4 1.8-2.3-.8.5-1.7.8-2.6 1-.8-.8-2-1.4-3.2-1.4-2.4 0-4.4 2-4.4 4.4 0 .3 0 .7.1 1C7.6 9 4.3 7.2 2 4.5c-.4.7-.6 1.4-.6 2.3 0 1.5.8 2.9 2 3.7-.7 0-1.4-.2-2-.5v.1c0 2.1 1.5 3.9 3.5 4.3-.4.1-.8.2-1.2.2-.3 0-.6 0-.8-.1.6 1.7 2.2 3 4.1 3-1.5 1.2-3.4 1.9-5.5 1.9H1c1.9 1.2 4.2 1.9 6.6 1.9 7.9 0 12.3-6.6 12.3-12.3v-.6c.9-.6 1.6-1.4 2.1-2.3z"/></svg>,
  Instagram: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>,
  Linkedin: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>,
  Youtube: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15V8.5l5.75 3.25z"/></svg>,
};

/* ============================================
   NAVIGATION
   ============================================ */
function Nav() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const closeTimer = useRef(null);

  const openMega = () => { clearTimeout(closeTimer.current); setMegaOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setMegaOpen(false), 150); };

  useEffect(() => {
    const h = () => setCartOpen(true);
    window.addEventListener("ks:open-cart", h);
    return () => window.removeEventListener("ks:open-cart", h);
  }, []);

  return (
    <>
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-bar">
          <a href="#" className="logo">
            <span className="logo-mark">Kaspa</span>
            <span className="logo-sub">Space</span>
          </a>
          <div className="nav-links">
            <a className={`nav-link ${window.__PAGE === "home" ? "active" : ""}`} href="#/home">Beranda</a>
            <a className={`nav-link ${window.__PAGE === "about" ? "active" : ""}`} href="#/about">Tentang</a>
            <div style={{ position: "relative" }} onMouseEnter={openMega} onMouseLeave={scheduleClose}>
              <a className={`nav-link ${window.__PAGE === "coworking" ? "active" : ""}`} href="#produk">Produk <Icon.Chevron /></a>
              <div className={`mega ${megaOpen ? "open" : ""}`} style={{ width: 480 }}>
                {[
                  { icon: <Icon.Briefcase />, title: "Coworking Space", desc: "Share desk, private room & ruang tim", href: "#/coworking" },
                  { icon: <Icon.Coffee />, title: "Food & Beverage", desc: "Kafe internal + diskon untuk member", href: "#/fnb" },
                  { icon: <Icon.Award />, title: "Business Service", desc: "Legalitas, pajak, akuntansi & back office", href: "#/business" },
                ].map((m, i) => (
                  <a key={i} className="mega-item" href={m.href} style={{ gridColumn: "span 2" }}>
                    <span className="mega-icon">{m.icon}</span>
                    <div>
                      <p className="mega-title">{m.title}</p>
                      <p className="mega-desc">{m.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <a className={`nav-link ${window.__PAGE === "media" ? "active" : ""}`} href="#/media">Media</a>
            <a className={`nav-link ${window.__PAGE === "contact" ? "active" : ""}`} href="#/contact">Kontak</a>
          </div>
          <div className="nav-actions">
            <CartButton onOpen={() => setCartOpen(true)} />
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    <KsToast onOpenCart={() => setCartOpen(true)} />
    </>
  );
}

/* ============================================
   HERO
   ============================================ */
function Hero() {
  return (
    <section className="hero" id="beranda">
      <div className="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80"
          alt="Modern office hallway"
        />
      </div>
      <div className="hero-inner container">
        <div className="hero-grid">
          <div>
            <span className="chip chip-dot chip-uppercase">Coworking Space Profesional</span>
            <h1 className="hero-title">
              Ruang Kerja
              <em className="serif-italic">Masa Depan</em>
              Ada di Sini
            </h1>
            <p className="hero-lede">
              Ekosistem kerja modern yang menggabungkan ruang fleksibel, layanan bisnis,
              dan komunitas profesional — semua dalam satu tempat. <span className="hashtag">#GrowingWithUs</span>
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#booking">Mulai Booking <Icon.Arrow /></a>
              <a className="btn btn-ghost" href="#tentang">Kenali Kami</a>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8 }}>
                <div style={{ display: "flex" }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: "2px solid var(--bg-deep)",
                      background: ["#3b82f6","#60a5fa","#f59e0b","#ec4899"][i],
                      marginLeft: i ? -10 : 0,
                      display: "grid", placeItems: "center",
                      color: "white", fontSize: 12, fontWeight: 700
                    }}>{["AN","RM","DP","SL"][i]}</div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.3 }}>
                  <strong style={{ color: "var(--text-primary)" }}>500+ member</strong><br/>
                  bergabung di sini
                </div>
              </div>
            </div>
          </div>
          <div className="hero-side">
            <HeroCard />
          </div>
        </div>
      </div>
      <div className="scroll-indicator">SCROLL</div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="hero-card">
      <div className="hero-card-head">
        <h3>Ketersediaan Hari Ini</h3>
        <span className="live-badge"><span className="live-dot"></span>Live</span>
      </div>
      <div>
        {[
          { icon: <Icon.Briefcase />, label: "Share Desk", value: "23 / 40 tersedia", pct: 58 },
          { icon: <Icon.Users />, label: "Private Room", value: "4 / 6 tersedia", pct: 67 },
          { icon: <Icon.Users />, label: "Meeting Room", value: "5 / 8 tersedia", pct: 62 },
          { icon: <Icon.Building />, label: "Private Office", value: "2 / 6 tersedia", pct: 33 },
        ].map((r, i) => (
          <div key={i} className="avail-row">
            <div className="avail-row-label">
              <div className="avail-row-icon">{r.icon}</div>
              {r.label}
            </div>
            <div className="avail-row-value">{r.value}</div>
          </div>
        ))}
      </div>
      <div className="avail-bar">
        <div className="avail-bar-fill" style={{ width: "62%" }}></div>
      </div>
      <div className="avail-foot">
        <span>Total ketersediaan</span>
        <span style={{ color: "var(--brand-glow)", fontWeight: 600 }}>62%</span>
      </div>
    </div>
  );
}

/* ============================================
   QUICK SEARCH
   ============================================ */
function QuickSearch() {
  const [tag, setTag] = useState("Coworking");
  return (
    <div className="container">
      <div className="quicksearch">
        <div className="quicksearch-card">
          <div className="quicksearch-row">
            <label className="qs-field">
              <span>Cari Ruang</span>
              <span className="qs-field-inner">
                <Icon.Search />
                <input placeholder="Coworking, meeting room, virtual office..." />
              </span>
            </label>
            <label className="qs-field">
              <span>Tanggal</span>
              <span className="qs-field-inner">
                <Icon.Calendar />
                <input placeholder="Pilih tanggal" defaultValue="18 Mei 2026" />
              </span>
            </label>
            <label className="qs-field">
              <span>Kapasitas</span>
              <span className="qs-field-inner">
                <Icon.Users />
                <select defaultValue="1">
                  <option value="1">1 orang</option>
                  <option value="2">2–4 orang</option>
                  <option value="5">5–10 orang</option>
                  <option value="10">10+ orang</option>
                </select>
              </span>
            </label>
            <button className="qs-search-btn">
              <Icon.Search /> Cari
            </button>
          </div>
          <div className="quick-tags">
            <span className="quick-tags-label">Populer</span>
            {["Coworking", "Virtual Office", "Meeting Room", "Private Office", "Event Space", "Legalitas"].map(t => (
              <button
                key={t}
                className={`qtag ${tag === t ? "active" : ""}`}
                onClick={() => setTag(t)}
              >{t}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Nav = Nav;
window.Hero = Hero;
window.QuickSearch = QuickSearch;
window.Icon = Icon;
