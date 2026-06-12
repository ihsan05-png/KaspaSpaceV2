/* global React, ReactDOM, Icon, Nav, Footer, KCartIcon */
const { useState: useDashState, useEffect: useDashEffect } = React;

const DBIcon = {
  Grid: KCartIcon.Grid,
  Receipt: KCartIcon.Receipt,
  Ticket: KCartIcon.Ticket,
  Settings: KCartIcon.Settings,
  Crown: KCartIcon.Crown,
  Check: (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  Download: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Track: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Bag: KCartIcon.Bag,
  Gift: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  Star: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Lock: (p) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
};

const TRACK = ["Dipesan", "Dibayar", "Diproses", "Selesai"];
const fmtDate = (s) => {
  try { return new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }); }
  catch (e) { return s; }
};
const initials = (name) => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

function initialTab() {
  const q = window.location.hash.split("?")[1] || "";
  const t = new URLSearchParams(q).get("tab");
  return ["overview", "orders", "vouchers", "settings"].includes(t) ? t : "overview";
}

/* ---- Order tracker ---- */
function OrderTracker({ step, cancelled }) {
  const cur = Math.min(step, 3);
  return (
    <div className={`dash-track ${cancelled ? "cancelled" : ""}`}>
      {TRACK.map((s, i) => {
        const cls = cancelled ? "" : (i < cur ? "done" : i === cur ? "active" : "");
        return (
          <div className={`dash-track-step ${cls}`} key={i}>
            <span className="dot">{(!cancelled && i < cur) ? <DBIcon.Check /> : i + 1}</span>
            <span>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Order card ---- */
function OrderCard({ order }) {
  const cancelled = /batal/i.test(order.statusLabel || "");
  const done = order.statusStep >= 3 && !cancelled;
  const sc = cancelled ? "cancel" : done ? "done" : "process";
  return (
    <div className="dash-order">
      <div className="dash-order-top">
        <div>
          <div className="dash-order-id">{order.id}</div>
          <div className="dash-order-date">{fmtDate(order.createdAt)} · {order.method}</div>
        </div>
        <span className={`dash-order-status ${sc}`}>
          <span className="dot"></span>{order.statusLabel}
        </span>
      </div>

      <div className="dash-order-items">
        {order.items.map((it, i) => (
          <div className="dash-order-line" key={i}>
            <span className="nm"><b>{it.title}</b> · {it.variantName} × {it.qty}</span>
            <span className="pr">{it.price === 0 ? "Gratis" : window.ksRp(it.price * it.qty)}</span>
          </div>
        ))}
      </div>

      {cancelled
        ? <div style={{ fontSize: 12.5, color: "#f87171" }}>Pesanan ini dibatalkan. Dana DP dikembalikan sesuai kebijakan.</div>
        : <OrderTracker step={order.statusStep} />}

      <div className="dash-order-foot">
        <div className="dash-order-total">
          Total <b>{window.ksRp(order.total)}</b>
          {order.discount > 0 && <span style={{ color: "var(--success)", marginLeft: 8, fontSize: 12 }}>hemat {window.ksRp(order.discount)}</span>}
        </div>
        <div className="dash-order-actions">
          <a className="dash-mini-btn" href={`#/invoice?id=${order.id}`}><DBIcon.Download /> Invoice</a>
          {!cancelled && !done && <a className="dash-mini-btn" href="#"><DBIcon.Track /> Lacak</a>}
        </div>
      </div>
    </div>
  );
}

/* ---- Voucher card ---- */
function VoucherCard({ v }) {
  const used = v.status === "used";
  const personal = v.kind === "personal";
  return (
    <div className={`dash-voucher ${personal ? "personal" : ""} ${used ? "used" : ""}`}>
      <div className="dash-voucher-top">
        <div className="dash-voucher-pct">{v.percent}%</div>
        <span className="dash-voucher-kind">{used ? "Terpakai" : v.kind === "personal" ? "Loyalitas" : v.kind === "member" ? "Member" : "Voucher"}</span>
      </div>
      <h4>{v.label}</h4>
      <p>{v.desc}</p>
      <div className="dash-voucher-scope"><DBIcon.Ticket /> {v.scopeLabel}</div>
      <div className="dash-voucher-foot">
        <span className="dash-voucher-code">{v.code}</span>
        <span className="dash-voucher-exp">
          {used ? `Dipakai ${fmtDate(v.usedOn)}` : `Berlaku s/d ${fmtDate(v.validUntil)}`}
        </span>
      </div>
    </div>
  );
}

/* ---- Settings ---- */
function SettingsForm({ user }) {
  const [f, setF] = useDashState({
    name: user.name, email: user.email, phone: user.phone || "",
    nik: user.nik || "", address: user.address || "",
  });
  const [saved, setSaved] = useDashState(false);
  const save = (e) => {
    e.preventDefault();
    window.KaspaSession.saveUser({ ...user, ...f });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };
  return (
    <form className="dash-card" onSubmit={save}>
      <div className="dash-card-head"><h3>Data <em>Diri</em></h3></div>
      <div className="dash-form-grid">
        <div className="dash-field">
          <label>Nama Lengkap</label>
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        </div>
        <div className="dash-field">
          <label>NIK</label>
          <input value={f.nik} maxLength={16} placeholder="16 digit" onChange={e => setF({ ...f, nik: e.target.value })} />
        </div>
        <div className="dash-field">
          <label>Email</label>
          <input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
        </div>
        <div className="dash-field">
          <label>WhatsApp</label>
          <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
        </div>
        <div className="dash-field full">
          <label>Alamat</label>
          <textarea value={f.address} onChange={e => setF({ ...f, address: e.target.value })}></textarea>
        </div>
      </div>
      <div className="dash-save-row">
        <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
        <span className={`dash-saved-note ${saved ? "show" : ""}`}><DBIcon.Check /> Tersimpan</span>
      </div>
    </form>
  );
}

/* ---- Login gate ---- */
function DashGate() {
  return (
    <>
      <Nav />
      <section className="dash-page">
        <div className="container">
          <div className="dash-gate">
            <div className="ic"><DBIcon.Lock /></div>
            <h2>Masuk untuk lihat <em>Dashboard</em></h2>
            <p>Dashboard berisi riwayat pesanan, status proses, dan diskon yang Anda miliki. Masuk dulu untuk mengaksesnya.</p>
            <a className="btn btn-primary" href="#/auth">Masuk / Daftar <Icon.Arrow /></a>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

/* ---- App ---- */
function DashboardApp() {
  const user = window.useKsSession();
  const [tab, setTab] = useDashState(initialTab);

  if (!user) return <DashGate />;

  const orders = user.orders || [];
  const vouchers = user.discounts || [];
  const activeVouchers = vouchers.filter(v => v.status === "active");
  const personal = vouchers.find(v => v.kind === "personal" && v.status === "active");
  const activeOrders = orders.filter(o => o.statusStep < 3 && !/batal/i.test(o.statusLabel || "")).length;

  const NAV = [
    { id: "overview", label: "Ringkasan", icon: <DBIcon.Grid /> },
    { id: "orders", label: "Pesanan Saya", icon: <DBIcon.Receipt />, badge: orders.length },
    { id: "vouchers", label: "Diskon & Voucher", icon: <DBIcon.Ticket />, badge: activeVouchers.length },
    { id: "settings", label: "Pengaturan", icon: <DBIcon.Settings /> },
  ];

  return (
    <>
      <Nav />
      <section className="dash-page">
        <div className="container">

          {/* Hero */}
          <div className="dash-hero">
            <div className="dash-hero-top">
              <div className="dash-hero-av">{initials(user.name)}</div>
              <div className="dash-hero-greet">
                <div className="hi">Dashboard Member</div>
                <h1>Halo, <em>{user.name.split(" ")[0]}</em></h1>
              </div>
              <span className="dash-tier-chip"><DBIcon.Crown /> Member {user.member.tier}</span>
            </div>
            <div className="dash-hero-stats">
              <div className="dash-hero-stat"><div className="v">{orders.length}</div><div className="l">Total pesanan</div></div>
              <div className="dash-hero-stat"><div className="v">{activeOrders}</div><div className="l">Sedang diproses</div></div>
              <div className="dash-hero-stat"><div className="v">{activeVouchers.length}</div><div className="l">Diskon aktif</div></div>
              <div className="dash-hero-stat"><div className="v">{user.member.points.toLocaleString("id-ID")}</div><div className="l">Poin loyalitas</div></div>
            </div>
          </div>

          <div className="dash-layout">
            {/* Sidebar */}
            <nav className="dash-nav">
              {NAV.map(n => (
                <button key={n.id} className={`dash-nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
                  {n.icon} {n.label}
                  {n.badge > 0 && <span className="badge">{n.badge}</span>}
                </button>
              ))}
              <div className="dash-nav-sep"></div>
              <button className="dash-nav-item" onClick={() => { window.KaspaSession.logout(); window.location.href = "#/home"; }}>
                <KCartIcon.Logout /> Keluar
              </button>
            </nav>

            {/* Main */}
            <div className="dash-main">
              {tab === "overview" && (
                <>
                  {personal && (
                    <div className="dash-promo">
                      <div className="dash-promo-badge">
                        <span className="pct">{personal.percent}%</span>
                        <span className="off">OFF</span>
                      </div>
                      <div className="dash-promo-body">
                        <div className="tag">Diskon spesial untukmu</div>
                        <h3>{personal.label}</h3>
                        <p>{personal.desc} — {personal.source}.</p>
                        <div className="dash-promo-code">
                          <code>{personal.code}</code>
                          <span className="exp">berlaku s/d {fmtDate(personal.validUntil)}</span>
                        </div>
                      </div>
                      <a className="btn btn-primary" href="#/coworking" style={{ alignSelf: "center" }}>Pakai Sekarang <Icon.Arrow /></a>
                    </div>
                  )}

                  <div className="dash-stat-grid">
                    <div className="dash-stat">
                      <div className="ic"><DBIcon.Bag /></div>
                      <div className="v">{orders.length}</div>
                      <div className="l">Pesanan sepanjang waktu</div>
                    </div>
                    <div className="dash-stat">
                      <div className="ic"><DBIcon.Gift /></div>
                      <div className="v">{activeVouchers.length}</div>
                      <div className="l">Voucher siap dipakai</div>
                    </div>
                    <div className="dash-stat">
                      <div className="ic"><DBIcon.Star /></div>
                      <div className="v">{user.member.tier}</div>
                      <div className="l">Status keanggotaan</div>
                    </div>
                  </div>

                  <div className="dash-card">
                    <div className="dash-card-head">
                      <h3>Pesanan <em>Terbaru</em></h3>
                      <a href="#" onClick={(e) => { e.preventDefault(); setTab("orders"); }}>Lihat semua →</a>
                    </div>
                    {orders.length === 0 ? (
                      <div className="dash-empty">
                        <h4>Belum ada pesanan</h4>
                        <p style={{ margin: "0 0 18px" }}>Mulai pesan ruang kerja, menu kafe, atau layanan bisnis.</p>
                        <a className="btn btn-primary" href="#/coworking">Mulai Belanja <Icon.Arrow /></a>
                      </div>
                    ) : (
                      orders.slice(0, 2).map(o => <OrderCard key={o.id} order={o} />)
                    )}
                  </div>
                </>
              )}

              {tab === "orders" && (
                <>
                  <h2 className="dash-section-title">Pesanan <em>Saya</em></h2>
                  <p className="dash-section-sub">Lacak status setiap pesanan dari dipesan hingga selesai.</p>
                  {orders.length === 0 ? (
                    <div className="dash-card"><div className="dash-empty">
                      <h4>Belum ada pesanan</h4>
                      <p style={{ margin: "0 0 18px" }}>Pesanan yang Anda buat akan muncul di sini.</p>
                      <a className="btn btn-primary" href="#/coworking">Mulai Belanja <Icon.Arrow /></a>
                    </div></div>
                  ) : (
                    orders.map(o => <OrderCard key={o.id} order={o} />)
                  )}
                </>
              )}

              {tab === "vouchers" && (
                <>
                  <h2 className="dash-section-title">Diskon &amp; <em>Voucher</em></h2>
                  <p className="dash-section-sub">Pakai kode ini di halaman checkout. Diskon loyalitas dari admin tampil paling atas.</p>
                  {personal && (
                    <div className="dash-promo" style={{ marginBottom: 24 }}>
                      <div className="dash-promo-badge">
                        <span className="pct">{personal.percent}%</span>
                        <span className="off">OFF</span>
                      </div>
                      <div className="dash-promo-body">
                        <div className="tag">Hadiah dari admin</div>
                        <h3>{personal.label}</h3>
                        <p>{personal.desc}</p>
                        <div className="dash-promo-code">
                          <code>{personal.code}</code>
                          <span className="exp">berlaku s/d {fmtDate(personal.validUntil)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="dash-voucher-grid">
                    {vouchers.filter(v => !(v.kind === "personal" && v.status === "active")).map(v => (
                      <VoucherCard key={v.code} v={v} />
                    ))}
                  </div>
                </>
              )}

              {tab === "settings" && (
                <>
                  <h2 className="dash-section-title">Pengaturan <em>Akun</em></h2>
                  <p className="dash-section-sub">Perbarui data diri Anda. Data ini dipakai saat checkout & untuk dokumen resmi.</p>
                  <SettingsForm user={user} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["dashboard"] = DashboardApp;
