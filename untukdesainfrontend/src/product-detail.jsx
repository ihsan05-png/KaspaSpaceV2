/* global React, ReactDOM, Icon, Nav, Footer, buildProduct */
const { useState: useStatePD, useEffect: useEffectPD } = React;

const PDIcon = {
  Check: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  Clock: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  ShieldCheck: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/><polyline points="9 12 11 14 15 10"/></svg>,
  Headset: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-7h3v5zM3 19a2 2 0 0 0 2 2h1v-7H3v5z"/></svg>,
  File: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Doc: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  Pin: Icon.Pin,
  Bag: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
};

/* read descriptor saved before navigation */
function readDescriptor() {
  try {
    const raw = localStorage.getItem("ks_product");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { kind: "business", id: "legalitas" };
}

/* ============================================
   GALLERY
   ============================================ */
function PDGallery({ product, active, onSelect }) {
  if (product.heroImg) {
    return (
      <div className="pd-gallery">
        <div className="pd-main-img" style={{ overflow: "hidden" }}>
          {product.badge && <div className="badge">{product.badge}</div>}
          <img
            src={product.heroImg}
            alt={product.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    );
  }
  const phs = product.galleryPlaceholders || [{ big: product.title, sub: product.cat, thumb: product.cat }];
  const a = phs[active] || phs[0];
  return (
    <div className="pd-gallery">
      <div className="pd-main-img">
        {product.badge && <div className="badge">{product.badge}</div>}
        <div className="ph">
          <div className="ph-big">"{a.big}"</div>
          <div className="ph-mono">Photo · {a.sub}</div>
        </div>
      </div>
      {phs.length > 1 && (
        <div className="pd-thumbs">
          {phs.map((g, i) => (
            <button
              key={i}
              className={`pd-thumb ${active === i ? "active" : ""}`}
              onClick={() => onSelect(i)}
              aria-label={`Lihat ${g.thumb}`}
            >
              <div className="ph"><span>{g.thumb}</span></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================
   INFO COLUMN
   ============================================ */
function PDInfo({ product, variant, setVariant, qty, setQty, onAddCart, onBuyNow }) {
  const v = product.variants.find(x => x.id === variant) || product.variants[0];
  const total = v.price * qty;
  const isFree = v.price === 0;
  const depositPct = product.depositPct != null ? product.depositPct : 0.5;
  const showDeposit = depositPct < 1 && !isFree;
  return (
    <div className="pd-info">
      <div className="pd-cat">{product.cat} · Kaspa Space</div>
      <h1 className="pd-title">{product.title} {product.titleEm && <em>{product.titleEm}</em>}</h1>
      <div className="pd-rating-row">
        <span className="stars">{[0,1,2,3,4].map(i => <Icon.Star key={i} />)}</span>
        <strong style={{ color: "var(--text-primary)" }}>{(product.rating || 5).toFixed(1)}</strong>
        <a href="#ulasan">{product.reviewCount || 0} ulasan</a>
        <span className="sep">·</span>
        <span>{product.variants.length} {product.kind === "fnb" ? "pilihan" : "paket"} tersedia</span>
        {product.loc && (<><span className="sep">·</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><PDIcon.Pin /> {product.loc}</span></>)}
        {product.meta && (<><span className="sep">·</span><span>{product.meta}</span></>)}
      </div>
      <p className="pd-desc">{product.desc}</p>

      <div className="pd-price-card">
        <div className="pd-price-label">Harga untuk "{v.name}"</div>
        <div className="pd-price-row">
          <div className="pd-price">{isFree ? "Gratis" : <>Rp{total.toLocaleString("id-ID")}</>}{v.unit && !isFree && <small style={{ fontSize: 15, color: "var(--text-tertiary)", fontWeight: 500 }}> / {v.unit}</small>}</div>
        </div>
        {product.priceNote && <div className="pd-price-note">{product.priceNote}</div>}
        {showDeposit && (
          <div className="pd-deposit">
            <span className="badge-mini">DP 50%</span>
            <span>Bayar Rp{Math.round(total * depositPct).toLocaleString("id-ID")} dulu untuk mulai, sisanya menyusul.</span>
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="pd-section">
        <h4>{product.kind === "fnb" ? "Pilihan" : "Pilih Paket"} <span className="hint">{product.variants.length} opsi</span></h4>
        <div className="pd-variants">
          {product.variants.map(x => (
            <button
              key={x.id}
              className={`pd-variant ${variant === x.id ? "active" : ""}`}
              onClick={() => setVariant(x.id)}
            >
              <div className="v-name">
                {x.name}
                {x.popular && <span style={{ marginLeft: 8, fontSize: 10, color: "var(--brand-glow)", letterSpacing: ".12em" }}>POPULER</span>}
                {x.bundle && <span style={{ marginLeft: 8, fontSize: 10, color: "var(--success)", letterSpacing: ".12em" }}>BUNDLING</span>}
              </div>
              {x.desc && <div className="v-desc">{x.desc}</div>}
              <div className="v-price">{x.price === 0 ? "Gratis" : <>Rp{x.price.toLocaleString("id-ID")}{x.unit && <small> / {x.unit}</small>}</>}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Qty + Add */}
      <div className="pd-qty-row">
        <div className="pd-qty">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Kurangi">−</button>
          <input value={qty} readOnly aria-label="Jumlah" />
          <button onClick={() => setQty(qty + 1)} aria-label="Tambah">+</button>
        </div>
        <button className="btn btn-primary pd-btn-primary" onClick={onAddCart}>
          <PDIcon.Bag /> Tambah ke Keranjang
        </button>
      </div>

      <button
        className="btn btn-ghost"
        style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}
        onClick={onBuyNow}
      >
        Beli Langsung <Icon.Arrow />
      </button>

      <a className="btn btn-ghost" href="#" style={{ width: "100%", justifyContent: "center" }}>
        <Icon.Whatsapp /> Konsultasi Dulu via WhatsApp
      </a>

      <div className="pd-trust">
        <div className="pd-trust-item">
          <PDIcon.ShieldCheck />
          <div><strong>Transaksi Aman</strong>Pembayaran terenkripsi</div>
        </div>
        <div className="pd-trust-item">
          <PDIcon.Clock />
          <div><strong>Proses Cepat</strong>Konfirmasi otomatis</div>
        </div>
        <div className="pd-trust-item">
          <PDIcon.Headset />
          <div><strong>Support Responsif</strong>Bantuan via WhatsApp</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   TABS
   ============================================ */
function PDTabs({ product, includedList }) {
  const stepsLabel = product.kind === "business" ? "Proses" : product.kind === "fnb" ? "Cara Pesan" : "Cara Booking";
  const includedLabel = product.kind === "coworking" ? "Fasilitas" : "Yang Termasuk";

  const tabs = [{ key: "desc", label: "Deskripsi" }];
  if (includedList && includedList.length) tabs.push({ key: "incl", label: includedLabel });
  if (product.docs && product.docs.length) tabs.push({ key: "docs", label: "Dokumen" });
  if (product.steps && product.steps.length) tabs.push({ key: "steps", label: stepsLabel });
  tabs.push({ key: "terms", label: "Syarat & Ketentuan" });
  if (product.reviews && product.reviews.length) tabs.push({ key: "reviews", label: "Ulasan" });

  const [tab, setTab] = useStatePD("desc");
  React.useEffect(() => { setTab("desc"); }, [product.id]);

  return (
    <div className="pd-tabs-section" id="ulasan">
      <div className="pd-tabs">
        {tabs.map(t => (
          <button key={t.key} className={`pd-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "desc" && (
        <div className="pd-tab-body">
          <h3>Tentang <em>{product.title}</em></h3>
          <p style={{ marginBottom: 0 }}>{product.desc}</p>
        </div>
      )}

      {tab === "incl" && (
        <div className="pd-tab-body">
          <h3>{includedLabel === "Fasilitas" ? <>Fasilitas yang <em>Anda Dapat</em></> : <>Yang <em>Termasuk</em></>}</h3>
          <ul className="pd-list">
            {includedList.map((it, i) => (
              <li key={i}>
                <span className="ic"><PDIcon.Check /></span>
                <div><strong>{it.t}</strong>{it.d && <span>{it.d}</span>}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "docs" && (
        <div className="pd-tab-body">
          <h3>{product.docsTitle || "Dokumen yang Anda Siapkan"}</h3>
          {product.docsIntro && <p style={{ marginBottom: 18 }}>{product.docsIntro}</p>}
          <ul className="pd-list">
            {product.docs.map((it, i) => (
              <li key={i}>
                <span className="ic" style={{ background: "rgba(59,130,246,.15)", color: "var(--brand-glow)" }}>
                  <PDIcon.File />
                </span>
                <div><strong>{it.t}</strong>{it.d && <span>{it.d}</span>}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "steps" && (
        <div className="pd-tab-body">
          <h3>{stepsLabel} <em>{product.steps.length} Langkah</em></h3>
          <div className="pd-steps">
            {product.steps.map((s, i) => (
              <div key={i} className="pd-step">
                <div className="n">0{i + 1}</div>
                <h5>{s.t}</h5>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "terms" && (
        <div className="pd-tab-body">
          <h3>Syarat &amp; <em>Ketentuan</em></h3>
          <p style={{ marginBottom: 18 }}>
            Dengan melanjutkan pemesanan, Anda dianggap menyetujui ketentuan berikut.
          </p>
          <ul className="pd-list">
            {product.terms.map((t, i) => (
              <li key={i}>
                <span className="ic" style={{ background: "rgba(52,211,153,.15)", color: "var(--success)" }}>
                  <PDIcon.Doc />
                </span>
                <div><strong style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{t}</strong></div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "reviews" && (
        <div className="pd-tab-body" style={{ maxWidth: "none" }}>
          <div className="pd-reviews-head">
            <div>
              <div className="pd-reviews-score">{(product.rating || 5).toFixed(1)}</div>
              <div style={{ color: "#fbbf24", marginTop: 6, display: "flex", gap: 1 }}>
                {[0,1,2,3,4].map(i => <Icon.Star key={i} />)}
              </div>
              <div style={{ color: "var(--text-tertiary)", fontSize: 12, marginTop: 4 }}>
                {product.reviewCount} ulasan terverifikasi
              </div>
            </div>
            <div className="pd-reviews-bars">
              {[5,4,3,2,1].map(n => {
                const pct = n === 5 ? 92 : n === 4 ? 8 : 0;
                return (
                  <div key={n} className="pd-reviews-bar">
                    <div>{n} ★</div>
                    <div className="track"><div className="fill" style={{ width: `${pct}%` }} /></div>
                    <div>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
          {product.reviews.map((r, i) => (
            <div key={i} className="pd-review">
              <div className="pd-review-head">
                <div className="pd-review-avatar">{r.n.charAt(0)}</div>
                <div>
                  <div className="pd-review-name">{r.n}</div>
                  <div className="pd-review-meta">{r.role} · {r.date}</div>
                </div>
              </div>
              <div className="stars">{[0,1,2,3,4].map(k => <Icon.Star key={k} />)}</div>
              <p>"{r.t}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================
   RELATED
   ============================================ */
function PDRelated({ product, onOpen }) {
  const items = (product.related || [])
    .map(desc => ({ desc, p: buildProduct(desc) }))
    .filter(x => x.p);
  if (!items.length) return null;

  const backHref = product.kind === "fnb" ? "#/fnb" : product.kind === "coworking" ? "#/coworking" : "#/business";

  return (
    <div className="pd-related">
      <div className="pd-related-head">
        <div>
          <span className="eyebrow">Produk Lain</span>
          <h2>Mungkin <em>Anda Butuh</em></h2>
        </div>
        <a className="btn btn-ghost" href={backHref} style={{ padding: "10px 18px", fontSize: 13 }}>
          Lihat Semua <Icon.Arrow />
        </a>
      </div>
      <div className="bs-grid pd-related-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {items.map(({ desc, p }) => {
          const price = p.variants[0] ? p.variants[0].price : null;
          return (
            <article key={p.id} className="bs-card" style={{ cursor: "pointer" }} onClick={() => onOpen(desc)}>
              <div className="bs-card-media">
                {p.heroImg ? (
                  <img src={p.heroImg} alt={p.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div className="bs-card-placeholder">
                    <div className="ph-mark">{(p.galleryPlaceholders && p.galleryPlaceholders[0].big) || p.cat}</div>
                    <div className="ph-sub">{p.cat}</div>
                  </div>
                )}
                {p.isNew && <span className="bs-card-new">New</span>}
              </div>
              <div className="bs-card-body">
                <span className="bs-card-cat">{p.cat}</span>
                <h3 className="bs-card-title">{p.title} {p.titleEm}</h3>
                <div className="bs-card-price">
                  <div>
                    <div className="bs-card-price-label">{price ? "Mulai dari" : "Harga"}</div>
                    <div className="bs-card-price-val">
                      {price === 0 ? <em>Konsultasi</em> : price ? <>Rp{price.toLocaleString("id-ID")}</> : <em>—</em>}
                    </div>
                  </div>
                </div>
                <span className="bs-card-cta">Lihat Detail <Icon.Arrow /></span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================
   APP
   ============================================ */
function PDApp() {
  const [descriptor, setDescriptor] = useStatePD(readDescriptor);
  const product = buildProduct(descriptor);
  const [activeImg, setActiveImg] = useStatePD(0);
  const [variant, setVariant] = useStatePD(null);
  const [qty, setQty] = useStatePD(1);

  // pilih variant default (popular) saat produk berubah
  useEffectPD(() => {
    if (!product) return;
    const def = product.variants.find(v => v.popular) || product.variants[0];
    setVariant(def ? def.id : null);
    setQty(1);
    setActiveImg(0);
  }, [descriptor]);

  if (!product) {
    return (
      <>
        <Nav />
        <section className="com-page">
          <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
            <h2 className="section-title">Produk tidak <em>ditemukan</em></h2>
            <a className="btn btn-primary" href="#/business" style={{ marginTop: 20 }}>Lihat Layanan <Icon.Arrow /></a>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const v = product.variants.find(x => x.id === variant) || product.variants[0];
  const includedList = (v && v.features) ? v.features.map(f => ({ t: f })) : product.included;

  const openProduct = (desc) => {
    try { localStorage.setItem("ks_product", JSON.stringify(desc)); } catch (e) {}
    setDescriptor(desc);
    window.scrollTo(0, 0);
  };

  const onAddCart = () => {
    window.cartAdd(descriptor, v, qty, product);
    window.openCart();
  };

  const onBuyNow = () => {
    window.cartAdd(descriptor, v, qty, product);
    window.location.href = "#/checkout";
  };

  const backHref = product.kind === "fnb" ? "#/fnb" : product.kind === "coworking" ? "#/coworking" : "#/business";
  const backLabel = product.kind === "fnb" ? "Food & Beverage" : product.kind === "coworking" ? "Coworking Space" : "Business Service";

  return (
    <>
      <Nav />
      <section className="com-page">
        <div className="container">
          <a className="com-back" href={backHref}>
            <Icon.ChevLeft /> Kembali ke {backLabel}
          </a>
          <div className="pd-grid">
            <PDGallery product={product} active={activeImg} onSelect={setActiveImg} />
            <PDInfo
              product={product}
              variant={variant}
              setVariant={setVariant}
              qty={qty}
              setQty={setQty}
              onAddCart={onAddCart}
              onBuyNow={onBuyNow}
            />
          </div>
          <PDTabs product={product} includedList={includedList} />
          <PDRelated product={product} onOpen={openProduct} />
        </div>
      </section>
      <Footer />
      <a className="wa-float" href="#" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["product"] = PDApp;
