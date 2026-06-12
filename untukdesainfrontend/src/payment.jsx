/* global React, ReactDOM, Icon, Nav, Footer */
const { useState: useStatePay, useEffect: useEffectPay } = React;

const PayIcon = {
  Copy: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  Chev: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>,
  Refresh: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Info: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

const STEPS = ["Pilih Produk", "Data & Pembayaran", "Bayar", "Selesai"];
function PayStepsBar({ active }) {
  return (
    <div className="steps-bar">
      {STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`steps-step ${i < active ? "done" : ""} ${i === active ? "active" : ""}`}>
            <div className="n">{i < active ? <PayIcon.Check /> : i + 1}</div>
            <span>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div className="steps-sep"></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* Countdown */
function useCountdown(expireAt) {
  const [now, setNow] = useStatePay(Date.now());
  useEffectPay(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, expireAt - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return { text: `${pad(h)}:${pad(m)}:${pad(s)}`, expired: diff === 0 };
}

/* Instructions per method group */
function getInstructions(methodId) {
  if (methodId.startsWith("va-")) {
    return [
      {
        t: "ATM",
        steps: [
          "Masukkan kartu ATM & PIN Anda",
          "Pilih menu Transfer → ke rek. Virtual Account",
          "Masukkan nomor Virtual Account di atas",
          "Pastikan nominal & nama penerima sesuai (Kaspa Space)",
          "Konfirmasi transaksi & simpan struk",
        ],
      },
      {
        t: "Mobile Banking",
        steps: [
          "Buka aplikasi mobile banking Anda",
          "Pilih menu Transfer → Virtual Account",
          "Masukkan nomor Virtual Account",
          "Periksa detail transaksi, lalu masukkan PIN",
          "Transaksi selesai — bukti tersimpan di history",
        ],
      },
      {
        t: "Internet Banking",
        steps: [
          "Login ke internet banking via browser",
          "Pilih menu Transfer → Virtual Account",
          "Masukkan 16 digit nomor Virtual Account",
          "Konfirmasi dengan token / OTP",
          "Status pembayaran otomatis terupdate",
        ],
      },
    ];
  }
  if (methodId === "qris") {
    return [
      {
        t: "Bayar via QRIS",
        steps: [
          "Buka aplikasi pembayaran (GoPay, OVO, ShopeePay, m-Banking, dll)",
          "Pilih menu Bayar / Scan QR",
          "Scan QR code di samping",
          "Periksa nominal & nama merchant (Kaspa Space)",
          "Konfirmasi pembayaran",
        ],
      },
    ];
  }
  if (methodId === "gopay" || methodId === "ovo" || methodId === "shopeepay") {
    return [
      {
        t: `Bayar via ${methodId === "gopay" ? "GoPay" : methodId === "ovo" ? "OVO" : "ShopeePay"}`,
        steps: [
          `Buka aplikasi ${methodId === "gopay" ? "Gojek" : methodId === "ovo" ? "OVO" : "Shopee"}`,
          "Ketuk notifikasi pembayaran yang masuk",
          "Periksa detail pesanan & nominal",
          "Masukkan PIN untuk konfirmasi",
          "Pembayaran selesai dalam hitungan detik",
        ],
      },
    ];
  }
  if (methodId === "indomaret" || methodId === "alfamart") {
    return [
      {
        t: methodId === "indomaret" ? "Bayar di Indomaret" : "Bayar di Alfamart",
        steps: [
          "Tunjukkan kode pembayaran di atas ke kasir",
          "Sebutkan nominal Rp pembayaran Anda",
          "Bayar tunai ke kasir",
          "Simpan struk sebagai bukti — verifikasi otomatis max 30 menit",
        ],
      },
    ];
  }
  return [];
}

function PaymentApp() {
  const [order, setOrder] = useStatePay(null);
  const [copied, setCopied] = useStatePay(false);
  const [openAcc, setOpenAcc] = useStatePay(0);
  const [checking, setChecking] = useStatePay(false);

  useEffectPay(() => {
    try {
      const raw = localStorage.getItem("ks_order");
      if (raw) setOrder(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const expireAt = order?.expireAt || (Date.now() + 24 * 60 * 60 * 1000);
  const { text: timer, expired } = useCountdown(expireAt);

  if (!order) {
    return (
      <>
        <Nav />
        <section className="com-page">
          <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
            <h2 className="section-title">Sesi pembayaran <em>tidak ditemukan</em></h2>
            <p style={{ color: "var(--text-tertiary)", margin: "12px 0 28px" }}>
              Sepertinya sesi telah kedaluwarsa. Silakan mulai ulang pemesanan.
            </p>
            <a className="btn btn-primary" href="#/business">Mulai Lagi <Icon.Arrow /></a>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const m = order.method || { id: "va-bca", name: "BCA Virtual Account", logo: "BCA" };
  const orderTail = String(order.id || "12345678").replace(/\D/g, "").padStart(8, "0").slice(-8);
  const vaPrefix = m.id === "va-bca" ? "8808" : m.id === "va-mandiri" ? "8909" : m.id === "va-bni" ? "8888" : m.id === "va-bri" ? "7878" : "8808";
  const vaNumber = `${vaPrefix}${orderTail}`;
  const retailCode = `KSPA-${orderTail}`;

  const deposit = order.payNow != null ? order.payNow : Math.round((order.total || 0) * 0.5);
  const remaining = order.remaining != null ? order.remaining : (order.total || 0) - deposit;

  const onCopy = (val) => {
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(val);
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSudahBayar = () => {
    setChecking(true);
    setTimeout(() => {
      const paid = { ...order, paymentStatus: "paid", paidAt: new Date().toISOString() };
      try { localStorage.setItem("ks_order", JSON.stringify(paid)); } catch (e) {}
      window.location.href = "#/success";
    }, 1400);
  };

  const isVA = m.id.startsWith("va-");
  const isQRIS = m.id === "qris" || m.id === "gopay" || m.id === "ovo" || m.id === "shopeepay";
  const isRetail = m.id === "indomaret" || m.id === "alfamart";
  const instructions = getInstructions(m.id);

  return (
    <>
      <Nav />
      <section className="com-page">
        <div className="container">
          <a className="com-back" href="#/checkout">
            <Icon.ChevLeft /> Ganti metode pembayaran
          </a>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span className="com-eyebrow">Pembayaran</span>
            <h1 className="section-title" style={{ marginTop: 10 }}>
              Selesaikan <em>Pembayaran</em>
            </h1>
          </div>
          <PayStepsBar active={2} />

          <div className="pay-grid">
            <div>
              {/* Status */}
              <div className="pay-status-bar">
                <div className="pay-status-dot"></div>
                <div className="pay-status-text">
                  <strong>{expired ? "Pembayaran kedaluwarsa" : "Menunggu pembayaran"}</strong>
                  <span>
                    {expired
                      ? "Silakan mulai pesanan baru atau hubungi customer service."
                      : "Selesaikan pembayaran sebelum waktu habis."}
                  </span>
                </div>
                <div className="pay-timer">{timer}</div>
              </div>

              <div className="pay-card">
                <div className="pay-method-head">
                  <div className="pay-method-logo">{m.logo}</div>
                  <div>
                    <h3>{m.name}</h3>
                    <div className="sub">Order ID: <strong style={{ color: "var(--text-primary)" }}>{order.id}</strong></div>
                  </div>
                </div>

                {isVA && (
                  <>
                    <div className="pay-va">
                      <div>
                        <div className="lab">Nomor Virtual Account</div>
                        <div className="num">{vaNumber.replace(/(.{4})/g, "$1 ").trim()}</div>
                      </div>
                      <button
                        className={`pay-copy ${copied ? "copied" : ""}`}
                        onClick={() => onCopy(vaNumber)}
                        type="button"
                      >
                        {copied ? <><PayIcon.Check /> Tersalin</> : <><PayIcon.Copy /> Salin</>}
                      </button>
                    </div>
                  </>
                )}

                {isQRIS && (
                  <div className="pay-qris">
                    <div className="pay-qris-code">
                      <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        {/* Pseudo QR — decorative only */}
                        <rect x="0" y="0" width="200" height="200" fill="#fff"/>
                        {Array.from({ length: 21 }).map((_, r) =>
                          Array.from({ length: 21 }).map((_, c) => {
                            const seed = (r * 31 + c * 17 + orderTail.charCodeAt((r + c) % orderTail.length)) % 7;
                            return seed > 3 ? (
                              <rect key={`${r}-${c}`} x={10 + c * 8.5} y={10 + r * 8.5} width="8" height="8" fill="#0d1a36"/>
                            ) : null;
                          })
                        )}
                        {/* corners */}
                        <g fill="#0d1a36">
                          <rect x="10" y="10" width="50" height="50" rx="6"/>
                          <rect x="140" y="10" width="50" height="50" rx="6"/>
                          <rect x="10" y="140" width="50" height="50" rx="6"/>
                        </g>
                        <g fill="#fff">
                          <rect x="20" y="20" width="30" height="30" rx="3"/>
                          <rect x="150" y="20" width="30" height="30" rx="3"/>
                          <rect x="20" y="150" width="30" height="30" rx="3"/>
                        </g>
                        <g fill="#0d1a36">
                          <rect x="26" y="26" width="18" height="18" rx="2"/>
                          <rect x="156" y="26" width="18" height="18" rx="2"/>
                          <rect x="26" y="156" width="18" height="18" rx="2"/>
                        </g>
                      </svg>
                    </div>
                    <div className="pay-qris-info">
                      <h4>Scan QRIS</h4>
                      <p>Bayar dari aplikasi e-wallet atau mobile banking apa saja yang mendukung QRIS.</p>
                      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--text-tertiary)" }}>
                        ID Merchant: KSPA-{orderTail} · NMID: ID20{orderTail.slice(0,7)}
                      </p>
                      <button
                        className={`pay-copy ${copied ? "copied" : ""}`}
                        onClick={() => onCopy(`KSPA-${orderTail}`)}
                        type="button"
                        style={{ marginTop: 8 }}
                      >
                        {copied ? <><PayIcon.Check /> Tersalin</> : <><PayIcon.Copy /> Salin Kode</>}
                      </button>
                    </div>
                  </div>
                )}

                {isRetail && (
                  <div className="pay-va">
                    <div>
                      <div className="lab">Kode Pembayaran</div>
                      <div className="num">{retailCode}</div>
                    </div>
                    <button
                      className={`pay-copy ${copied ? "copied" : ""}`}
                      onClick={() => onCopy(retailCode)}
                      type="button"
                    >
                      {copied ? <><PayIcon.Check /> Tersalin</> : <><PayIcon.Copy /> Salin</>}
                    </button>
                  </div>
                )}

                <div className="pay-amount">
                  <div className="l">Total yang harus dibayar sekarang</div>
                  <div className="v">Rp{deposit.toLocaleString("id-ID")}</div>
                </div>

                {/* Instructions */}
                {instructions.length > 0 && (
                  <>
                    <div className="pay-instr-title">Cara <span style={{ fontStyle: "italic", color: "var(--brand-glow)" }}>Pembayaran</span></div>
                    <div className="pay-acc">
                      {instructions.map((ins, i) => (
                        <div key={i} className={`pay-acc-item ${openAcc === i ? "open" : ""}`}>
                          <button
                            type="button"
                            className="pay-acc-head"
                            onClick={() => setOpenAcc(openAcc === i ? -1 : i)}
                          >
                            <span>{ins.t}</span>
                            <span className="tog"><PayIcon.Chev /></span>
                          </button>
                          <div className="pay-acc-body">
                            <div className="pay-acc-inner">
                              <ol>
                                {ins.steps.map((s, j) => <li key={j}>{s}</li>)}
                              </ol>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{
                  marginTop: 24, padding: "14px 18px",
                  background: "rgba(59,130,246,.06)",
                  border: "1px solid rgba(59,130,246,.18)",
                  borderRadius: 12,
                  display: "flex", gap: 10, alignItems: "flex-start",
                  fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55,
                }}>
                  <span style={{ color: "var(--brand-glow)", marginTop: 2 }}><PayIcon.Info /></span>
                  <span>
                    Setelah membayar, klik <strong>Saya Sudah Bayar</strong> di samping.
                    Verifikasi biasanya berlangsung otomatis dalam beberapa detik —
                    jika lewat 15 menit belum berubah, hubungi kami via WhatsApp.
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT — summary */}
            <aside className="pay-summary">
              <div className="co-summary">
                <div className="co-summary-head">
                  <h3>Detail <em>Pesanan</em></h3>
                </div>
                <div className="co-summary-body">
                  {(order.items || []).map(it => (
                    <div className="co-line" key={it.uid}>
                      <div
                        className="co-line-img"
                        style={it.product && it.product.img ? { backgroundImage: `url(${it.product.img})`, backgroundSize: "cover", backgroundPosition: "center" } : null}
                      ></div>
                      <div className="co-line-info">
                        <div className="co-line-cat">{it.product.cat}</div>
                        <div className="co-line-title">{it.product.title}</div>
                        <div className="co-line-var">{it.variant.name} × {it.qty}</div>
                      </div>
                      <div className="co-line-price">{it.price === 0 ? "Gratis" : "Rp" + (it.price * it.qty).toLocaleString("id-ID")}</div>
                    </div>
                  ))}

                  <div className="co-row">
                    <span>Subtotal</span>
                    <span className="v">Rp{order.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="co-row muted">
                    <span>Admin & layanan</span>
                    <span>Rp{order.adminFee.toLocaleString("id-ID")}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="co-row" style={{ color: "var(--success)" }}>
                      <span>Diskon ({order.discountCode})</span>
                      <span style={{ color: "var(--success)" }}>−Rp{order.discount.toLocaleString("id-ID")}</span>
                    </div>
                  )}

                  <div className="co-row total">
                    <span className="l">Total Pesanan</span>
                    <span className="v">Rp{order.total.toLocaleString("id-ID")}</span>
                  </div>

                  {remaining > 0 ? (
                    <div style={{
                      marginTop: 14, padding: "12px 14px",
                      background: "rgba(251,191,36,.08)",
                      border: "1px solid rgba(251,191,36,.25)",
                      borderRadius: 12, fontSize: 12.5,
                      color: "var(--text-secondary)", lineHeight: 1.5,
                    }}>
                      <strong style={{ color: "#fbbf24" }}>Bayar sebagian dulu</strong>
                      {" "}— sisa Rp{remaining.toLocaleString("id-ID")} ditagih saat proses selesai.
                    </div>
                  ) : (
                    <div style={{
                      marginTop: 14, padding: "12px 14px",
                      background: "rgba(52,211,153,.08)",
                      border: "1px solid rgba(52,211,153,.25)",
                      borderRadius: 12, fontSize: 12.5,
                      color: "var(--text-secondary)", lineHeight: 1.5,
                    }}>
                      <strong style={{ color: "var(--success)" }}>Pembayaran penuh</strong>
                      {" "}— tidak ada sisa tagihan.
                    </div>
                  )}
                </div>

                <div className="co-foot">
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={onSudahBayar}
                    disabled={checking || expired}
                  >
                    {checking ? <><PayIcon.Refresh /> Memverifikasi…</> : "Saya Sudah Bayar"}
                  </button>
                  <a
                    href="#"
                    className="btn btn-ghost"
                    style={{ width: "100%", justifyContent: "center", marginTop: 10, padding: "12px 18px", fontSize: 13 }}
                  >
                    <Icon.Whatsapp /> Butuh Bantuan?
                  </a>
                  <div style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "var(--text-muted)", letterSpacing: ".06em" }}>
                    PEMBAYARAN DIPROSES MELALUI MIDTRANS
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["payment"] = PaymentApp;
