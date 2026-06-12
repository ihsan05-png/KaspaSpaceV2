/* global React, ReactDOM, Icon, Nav, Footer */
const { useState: useStateCO, useEffect: useEffectCO, useMemo: useMemoCO } = React;

const COIcon = {
  Upload: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Check: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  Lock: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Ticket: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/></svg>,
  Trash: (p) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>,
};

/* Dokumen yang diunggah, beda-beda per jenis produk */
const DOC_SETS = {
  establishment: [
    { k: "ktp",  t: "KTP Pendiri",   d: "Semua pendiri · JPG/PNG/PDF · max 5MB", req: true },
    { k: "npwp", t: "NPWP Pribadi",  d: "Setiap pendiri & direktur · max 5MB",  req: true },
    { k: "foto", t: "Foto Pendiri",  d: "Latar polos · JPG/PNG · max 5MB" },
  ],
  vo: [
    { k: "ktp",   t: "KTP Penanggung Jawab",                d: "JPG/PNG/PDF · max 5MB", req: true },
    { k: "npwp",  t: "NPWP Pribadi / Badan",                d: "JPG/PNG/PDF · max 5MB" },
    { k: "surat", t: "Surat Pernyataan Penggunaan Alamat",  d: "Template kami kirim setelah pesan · max 5MB" },
  ],
  po: [
    { k: "ktp",  t: "KTP Penyewa / PIC",          d: "JPG/PNG/PDF · max 5MB", req: true },
    { k: "npwp", t: "NPWP Pribadi / Badan",       d: "JPG/PNG/PDF · max 5MB" },
    { k: "akta", t: "Akta / Legalitas Perusahaan", d: "Opsional · untuk surat domisili gedung" },
  ],
};

const PAYMENT_METHODS = [
  {
    group: "Transfer Virtual Account",
    methods: [
      { id: "va-bca",     name: "BCA Virtual Account",      desc: "Verifikasi otomatis · max 24 jam", logo: "BCA" },
      { id: "va-mandiri", name: "Mandiri Virtual Account",  desc: "Verifikasi otomatis · max 24 jam", logo: "MDR" },
      { id: "va-bni",     name: "BNI Virtual Account",      desc: "Verifikasi otomatis · max 24 jam", logo: "BNI" },
      { id: "va-bri",     name: "BRI Virtual Account",      desc: "Verifikasi otomatis · max 24 jam", logo: "BRI" },
    ],
  },
  {
    group: "QRIS & E-Wallet",
    methods: [
      { id: "qris",       name: "QRIS",                     desc: "Scan dari semua aplikasi pembayaran", logo: "QRIS" },
      { id: "gopay",      name: "GoPay",                    desc: "Bayar dari aplikasi Gojek",          logo: "GO" },
      { id: "ovo",        name: "OVO",                      desc: "Bayar dari aplikasi OVO",            logo: "OVO" },
      { id: "shopeepay",  name: "ShopeePay",                desc: "Bayar dari aplikasi Shopee",         logo: "SPY" },
    ],
  },
  {
    group: "Gerai Retail",
    methods: [
      { id: "indomaret",  name: "Indomaret",                desc: "Bayar di kasir Indomaret terdekat",  logo: "IDM" },
      { id: "alfamart",   name: "Alfamart",                 desc: "Bayar di kasir Alfamart terdekat",   logo: "ALF" },
    ],
  },
];

const COWORK_CATS = ["Share Desk", "Private Room", "Meeting Room", "Private Office", "Virtual Office", "Business Signage", "Overtime"];

/* What extra data does an item need? */
function itemDataKind(item) {
  const cat = (item.product && item.product.cat) || "";
  const vid = (item.variant && item.variant.id) || "";
  const isLegal = cat === "Legalitas Usaha";
  const isBundle = /^vo-(pt|cv)/.test(vid);
  if (isLegal || isBundle) return "establishment";
  if (cat === "Virtual Office") return "vo";
  if (cat === "Private Office") return "po";
  return null;
}

/* ============================================
   STEPS BAR
   ============================================ */
function StepsBar({ active }) {
  const steps = ["Keranjang", "Data & Pembayaran", "Bayar", "Selesai"];
  return (
    <div className="steps-bar">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`steps-step ${i < active ? "done" : ""} ${i === active ? "active" : ""}`}>
            <div className="n">{i < active ? <COIcon.Check /> : i + 1}</div>
            <span>{s}</span>
          </div>
          {i < steps.length - 1 && <div className="steps-sep"></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ============================================
   PER-ITEM DATA CARD (adaptive)
   ============================================ */
function ItemDataCard({ item, kind, form, setForm, docs, setDocs }) {
  const set = (patch) => setForm({ ...form, ...patch });
  const setDoc = (k) => setDocs({ ...docs, [k]: !docs[k] });
  const docSet = DOC_SETS[kind];
  const needEstablishment = kind === "establishment";
  const isVO = kind === "vo";
  const isPO = kind === "po";

  return (
    <div className="co-card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
        <span style={{
          fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, letterSpacing: ".14em",
          textTransform: "uppercase", color: "var(--brand-glow)",
          background: "rgba(59,130,246,.12)", border: "1px solid rgba(59,130,246,.25)",
          padding: "4px 10px", borderRadius: 999,
        }}>Detail Pesanan</span>
      </div>
      <h3 style={{ marginTop: 6 }}>{item.product.title}</h3>
      <p className="sub">
        {needEstablishment
          ? "Tim notaris akan memvalidasi nama & data badan usaha yang Anda ajukan."
          : isVO
          ? "Dipakai untuk surat keterangan domisili & pencatatan alamat usaha Anda."
          : "Data penanggung jawab tim untuk surat domisili gedung & kontrak sewa."}
      </p>

      <div className="co-form-grid">
        {needEstablishment ? (
          <>
            <div className="co-field full">
              <label>Usulan Nama (3 pilihan) <span className="req">*</span></label>
              <input placeholder="1. PT Sentra Niaga Jaya" value={form.company1 || ""} onChange={e => set({ company1: e.target.value })} />
            </div>
            <div className="co-field"><input placeholder="2. PT Niaga Sentra Bersama" value={form.company2 || ""} onChange={e => set({ company2: e.target.value })} /></div>
            <div className="co-field"><input placeholder="3. PT Bersama Niaga Sentra" value={form.company3 || ""} onChange={e => set({ company3: e.target.value })} /></div>
          </>
        ) : (
          <div className="co-field full">
            <label>Nama Usaha / Perusahaan <span className="req">*</span></label>
            <input placeholder={isVO ? "PT Sentra Niaga / nama brand Anda" : "Nama tim / perusahaan"} value={form.companyName || ""} onChange={e => set({ companyName: e.target.value })} />
          </div>
        )}

        {!needEstablishment && (
          <div className="co-field">
            <label>Bentuk Usaha</label>
            <select value={form.badanType || ""} onChange={e => set({ badanType: e.target.value })}>
              <option value="">— Pilih —</option>
              <option>Perorangan / belum berbadan</option>
              <option>CV</option>
              <option>PT Perorangan</option>
              <option>PT</option>
              <option>Yayasan / Lainnya</option>
            </select>
          </div>
        )}

        {isPO && (
          <div className="co-field">
            <label>Jumlah Anggota Tim</label>
            <input type="number" min="1" placeholder="mis. 4" value={form.teamSize || ""} onChange={e => set({ teamSize: e.target.value })} />
          </div>
        )}

        <div className="co-field full">
          <label>Bidang Usaha (KBLI)</label>
          <select value={form.bidang || ""} onChange={e => set({ bidang: e.target.value })}>
            <option value="">— Pilih atau biarkan tim kami menyarankan —</option>
            <option>47—Perdagangan Eceran</option>
            <option>56—Penyediaan Makanan & Minuman</option>
            <option>62—Aktivitas Pemrograman & Konsultansi Komputer</option>
            <option>71—Aktivitas Arsitektur & Konsultansi Teknis</option>
            <option>74—Aktivitas Profesional & Ilmiah Lainnya</option>
          </select>
        </div>

        {needEstablishment ? (
          <div className="co-field full">
            <label>Alamat Domisili Usaha</label>
            <input placeholder="Atau pakai alamat Kaspa Space (gratis untuk pelanggan PT)" value={form.address || ""} onChange={e => set({ address: e.target.value })} />
          </div>
        ) : isVO ? (
          <div className="co-field full">
            <label>Alamat Penerusan Surat</label>
            <input placeholder="Alamat tujuan pengiriman surat/paket yang kami terima" value={form.suratAddress || ""} onChange={e => set({ suratAddress: e.target.value })} />
          </div>
        ) : null}

        <div className="co-field full">
          <label>Catatan untuk Tim Kami</label>
          <textarea placeholder="Kebutuhan khusus, susunan pengurus, target waktu, dll." value={form.notes || ""} onChange={e => set({ notes: e.target.value })}></textarea>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
        <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--text-tertiary)", fontWeight: 600 }}>
          Unggah Dokumen
        </label>
        {docSet.map(d => (
          <label
            key={d.k}
            className="co-drop"
            onClick={(e) => { e.preventDefault(); setDoc(d.k); }}
            style={docs[d.k] ? { borderColor: "var(--success)", background: "rgba(52,211,153,.05)" } : null}
          >
            <div className="ic" style={docs[d.k] ? { background: "rgba(52,211,153,.18)", color: "var(--success)" } : null}>
              {docs[d.k] ? <COIcon.Check /> : <COIcon.Upload />}
            </div>
            <div style={{ flex: 1 }}>
              <strong>
                {d.t}{d.req && <span className="req"> *</span>}
                {docs[d.k] && <span style={{ color: "var(--success)", fontSize: 12 }}> · terunggah</span>}
              </strong>
              <span>{d.d}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ============================================
   APP
   ============================================ */
function CheckoutApp() {
  const [items, setItems] = useStateCO(() => window.KaspaCart.items());
  const [user] = useStateCO(() => window.KaspaSession.user());
  const [method, setMethod] = useStateCO("va-bca");
  const [agree, setAgree] = useStateCO(false);
  const [coupon, setCoupon] = useStateCO("");
  const [appliedDisc, setAppliedDisc] = useStateCO(null);
  const [couponErr, setCouponErr] = useStateCO("");
  const [form, setForm] = useStateCO({
    name: (user && user.name) || "", email: (user && user.email) || "",
    phone: (user && user.phone) || "", nik: (user && user.nik) || "",
  });
  const [itemForms, setItemForms] = useStateCO({});
  const [itemDocs, setItemDocs] = useStateCO({});

  useEffectCO(() => {
    const h = () => setItems(window.KaspaCart.items());
    window.addEventListener("ks:cart", h);
    return () => window.removeEventListener("ks:cart", h);
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const adminFee = items.reduce((s, i) => s + (i.adminFee || 0), 0);

  const discountFor = (disc) => {
    if (!disc) return 0;
    const scoped = items.filter(i => {
      if (disc.scope === "all") return true;
      if (disc.scope === "fnb") return i.product.cat === "Food & Beverage";
      if (disc.scope === "coworking") return COWORK_CATS.includes(i.product.cat);
      return false;
    });
    const base = scoped.reduce((s, i) => s + i.price * i.qty, 0);
    return Math.round(base * (disc.percent / 100));
  };
  const discount = discountFor(appliedDisc);
  const total = Math.max(0, subtotal + adminFee - discount);

  const depositRaw = items.reduce((s, i) => s + Math.round(i.price * i.qty * (i.depositPct != null ? i.depositPct : 0.5)), 0);
  const isFullPay = depositRaw >= subtotal;
  const payNow = Math.max(0, Math.min(total, depositRaw - discount));
  const remaining = total - payNow;

  const activeVouchers = (user && user.discounts) ? user.discounts.filter(d => d.status === "active") : [];

  const applyDisc = (disc) => {
    setAppliedDisc(disc);
    setCoupon(disc.code);
    setCouponErr("");
  };
  const applyCoupon = () => {
    const up = coupon.trim().toUpperCase();
    if (!up) { setAppliedDisc(null); setCouponErr(""); return; }
    const list = (user && user.discounts) || [];
    const found = list.find(d => d.code === up && d.status === "active");
    if (found) { applyDisc(found); return; }
    if (up === "KASPA10") { applyDisc({ code: "KASPA10", label: "Kupon Sambutan", percent: 10, scope: "all", scopeLabel: "Semua layanan", kind: "voucher" }); return; }
    setAppliedDisc(null);
    setCouponErr("Kode tidak valid atau sudah tidak berlaku.");
  };

  /* items needing extra data */
  const dataItems = useMemoCO(() => items.map(it => ({ it, kind: itemDataKind(it) })).filter(x => x.kind), [items]);

  if (items.length === 0) {
    return (
      <>
        <Nav />
        <section className="com-page">
          <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
            <h2 className="section-title">Keranjang <em>masih kosong</em></h2>
            <p style={{ color: "var(--text-tertiary)", margin: "12px 0 28px" }}>
              Tambahkan produk terlebih dahulu untuk melanjutkan ke pembayaran.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a className="btn btn-primary" href="#/coworking">Lihat Coworking <Icon.Arrow /></a>
              <a className="btn btn-ghost" href="#/business">Layanan Bisnis</a>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const onBayar = (e) => {
    e.preventDefault();
    if (!agree) { alert("Mohon setujui Syarat & Ketentuan untuk melanjutkan"); return; }
    if (!form.name || !form.email || !form.phone) { alert("Mohon lengkapi data pemesan"); return; }
    const all = PAYMENT_METHODS.flatMap(g => g.methods);
    const m = all.find(x => x.id === method);
    const order = {
      id: "KS-" + Date.now().toString().slice(-8),
      items: items.map(it => ({
        ...it,
        perItem: itemForms[it.uid] || null,
        perDocs: itemDocs[it.uid] || null,
      })),
      buyer: form,
      method: m,
      subtotal,
      adminFee,
      discount,
      discountCode: appliedDisc ? appliedDisc.code : null,
      total,
      payNow,
      remaining,
      isFullPay,
      paymentStatus: "pending",
      paidAt: null,
      createdAt: new Date().toISOString(),
      expireAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    try { localStorage.setItem("ks_order", JSON.stringify(order)); } catch (err) {}
    window.location.href = "#/payment";
  };

  return (
    <>
      <Nav />
      <section className="com-page">
        <div className="container">
          <a className="com-back" href="#" onClick={(e) => { e.preventDefault(); window.openCart(); }}>
            <Icon.ChevLeft /> Kembali ke keranjang
          </a>

          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span className="com-eyebrow">Checkout</span>
            <h1 className="section-title" style={{ marginTop: 10 }}>
              Selesaikan <em>Pesanan</em>
            </h1>
          </div>
          <StepsBar active={1} />

          <form className="co-grid" onSubmit={onBayar}>
            {/* LEFT */}
            <div>
              {/* Data Pemesan */}
              <div className="co-card">
                <h3>Data <em>Pemesan</em></h3>
                <p className="sub">Data ini akan digunakan untuk surat & invoice resmi.</p>
                <div className="co-form-grid">
                  <div className="co-field">
                    <label>Nama Lengkap <span className="req">*</span></label>
                    <input type="text" placeholder="Sesuai KTP" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="co-field">
                    <label>NIK (16 digit)</label>
                    <input type="text" placeholder="35....." maxLength={16} value={form.nik} onChange={e => setForm({ ...form, nik: e.target.value })} />
                  </div>
                  <div className="co-field">
                    <label>Email <span className="req">*</span></label>
                    <input type="email" placeholder="anda@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <span className="hint">Invoice & update progress dikirim ke email ini.</span>
                  </div>
                  <div className="co-field">
                    <label>WhatsApp <span className="req">*</span></label>
                    <input type="tel" placeholder="+62 8xx-xxxx-xxxx" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                </div>
              </div>

              {/* Per-item data cards */}
              {dataItems.map(({ it, kind }) => (
                <ItemDataCard
                  key={it.uid}
                  item={it}
                  kind={kind}
                  form={itemForms[it.uid] || {}}
                  setForm={(f) => setItemForms(prev => ({ ...prev, [it.uid]: f }))}
                  docs={itemDocs[it.uid] || {}}
                  setDocs={(d) => setItemDocs(prev => ({ ...prev, [it.uid]: d }))}
                />
              ))}

              {dataItems.length === 0 && (
                <div className="co-card">
                  <h3>Tanpa <em>Dokumen Tambahan</em></h3>
                  <p className="sub" style={{ margin: 0 }}>
                    Produk di keranjang Anda tidak memerlukan dokumen khusus. Tinggal pilih metode bayar
                    dan selesaikan pembayaran.
                  </p>
                </div>
              )}

              {/* Payment method */}
              <div className="co-card">
                <h3>Metode <em>Pembayaran</em></h3>
                <p className="sub">Pilih cara bayar — instruksi muncul di langkah berikutnya.</p>
                <div className="co-pay-group">
                  {PAYMENT_METHODS.map(g => (
                    <React.Fragment key={g.group}>
                      <h5>{g.group}</h5>
                      {g.methods.map(m => (
                        <label key={m.id} className={`co-pay ${method === m.id ? "active" : ""}`} onClick={() => setMethod(m.id)}>
                          <div className="co-pay-logo">{m.logo}</div>
                          <div className="co-pay-info">
                            <div className="nm">{m.name}</div>
                            <div className="ds">{m.desc}</div>
                          </div>
                          <div className="co-pay-radio"></div>
                        </label>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Summary */}
            <aside className="co-summary">
              <div className="co-summary-head">
                <h3>Ringkasan <em>Pesanan</em></h3>
              </div>
              <div className="co-summary-body">
                {items.map(it => (
                  <div className="co-line" key={it.uid}>
                    <div
                      className="co-line-img"
                      style={it.product.img ? { backgroundImage: `url(${it.product.img})`, backgroundSize: "cover", backgroundPosition: "center" } : null}
                    ></div>
                    <div className="co-line-info">
                      <div className="co-line-cat">{it.product.cat}</div>
                      <div className="co-line-title">{it.product.title}</div>
                      <div className="co-line-var">{it.variant.name} × {it.qty}</div>
                      {it.product.loc && <div className="co-line-var" style={{ marginTop: 2 }}>📍 {it.product.loc}</div>}
                    </div>
                    <div className="co-line-price">{it.price === 0 ? "Gratis" : window.ksRp(it.price * it.qty)}</div>
                  </div>
                ))}

                <div className="co-row">
                  <span>Subtotal ({items.reduce((n, i) => n + i.qty, 0)} item)</span>
                  <span className="v">{window.ksRp(subtotal)}</span>
                </div>
                <div className="co-row muted">
                  <span>Biaya admin & layanan</span>
                  <span>{window.ksRp(adminFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="co-row" style={{ color: "var(--success)" }}>
                    <span>Diskon ({appliedDisc.code})</span>
                    <span className="v" style={{ color: "var(--success)" }}>−{window.ksRp(discount)}</span>
                  </div>
                )}

                {/* Vouchers belonging to the user */}
                {activeVouchers.length > 0 && (
                  <div className="co-vouchers">
                    <div className="co-vouchers-label"><COIcon.Ticket /> Diskon kamu</div>
                    {activeVouchers.map(v => {
                      const amt = discountFor(v);
                      const on = appliedDisc && appliedDisc.code === v.code;
                      return (
                        <button
                          type="button"
                          key={v.code}
                          className={`co-voucher ${on ? "on" : ""}`}
                          onClick={() => on ? (setAppliedDisc(null), setCoupon("")) : applyDisc(v)}
                          disabled={amt === 0 && !on}
                        >
                          <div className="co-voucher-l">
                            <div className="co-voucher-nm">{v.label} · {v.percent}%</div>
                            <div className="co-voucher-sc">{v.scopeLabel}{amt === 0 ? " · tak berlaku utk item ini" : ` · hemat ${window.ksRp(amt)}`}</div>
                          </div>
                          <span className="co-voucher-pick">{on ? "Dipakai" : "Pakai"}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="co-coupon">
                  <input placeholder="Punya kode lain? (coba KASPA10)" value={coupon} onChange={e => { setCoupon(e.target.value); setCouponErr(""); }} />
                  <button type="button" onClick={applyCoupon}>Pakai</button>
                </div>
                {couponErr && <div style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{couponErr}</div>}

                <div className="co-row total">
                  <span className="l">Total</span>
                  <span className="v">{window.ksRp(total)}</span>
                </div>

                <div style={{
                  marginTop: 14, padding: "12px 14px",
                  background: isFullPay ? "rgba(59,130,246,.08)" : "rgba(52,211,153,.08)",
                  border: `1px solid ${isFullPay ? "rgba(59,130,246,.22)" : "rgba(52,211,153,.25)"}`,
                  borderRadius: 12, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5,
                }}>
                  {isFullPay ? (
                    <>Bayar penuh <strong style={{ color: "var(--brand-glow)" }}>{window.ksRp(payNow)}</strong> sekarang.</>
                  ) : (
                    <>
                      <strong style={{ color: "var(--success)" }}>Cukup bayar {window.ksRp(payNow)} dulu</strong>
                      {" "}— sebagian item bisa DP. Sisa {window.ksRp(remaining)} menyusul saat proses selesai.
                    </>
                  )}
                </div>
              </div>

              <div className="co-foot">
                <div className="co-tnc">
                  <input id="agree" type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
                  <label htmlFor="agree">
                    Saya setuju dengan <a href="#" onClick={(e) => { e.preventDefault(); window.openLegal("terms"); }}>Syarat & Ketentuan</a> dan{" "}
                    <a href="#" onClick={(e) => { e.preventDefault(); window.openLegal("privacy"); }}>Kebijakan Privasi</a> Kaspa Space.
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  <COIcon.Lock /> Bayar {window.ksRp(payNow)}
                </button>
                <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "var(--text-muted)", letterSpacing: ".06em" }}>
                  TRANSAKSI AMAN · SSL 256-BIT · MIDTRANS
                </div>
              </div>
            </aside>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["checkout"] = CheckoutApp;
