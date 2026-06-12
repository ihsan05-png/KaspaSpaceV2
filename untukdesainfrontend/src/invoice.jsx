/* global React, ReactDOM, Icon, Nav, Footer */
const { useState: useStateInv, useEffect: useEffectInv } = React;

const InvIcon = {
  Print: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Download: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Whatsapp: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2"/></svg>,
  Seal: (p) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2l2.4 1.8 3 .1 1 2.8 2.4 1.8-1 2.8 1 2.8-2.4 1.8-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.2 15l1-2.8-1-2.8 2.4-1.8 1-2.8 3-.1z"/><polyline points="8.5 12 11 14.5 15.5 9.5"/></svg>,
};

/* Resolve which order to render: ?id= → ks_order or session order; else ks_order or latest session order */
function resolveInvoiceOrder() {
  const q = (window.location.hash.split("?")[1]) || "";
  const wantId = new URLSearchParams(q).get("id");

  let active = null;
  try { const r = localStorage.getItem("ks_order"); if (r) active = JSON.parse(r); } catch (e) {}

  const user = window.KaspaSession && window.KaspaSession.user ? window.KaspaSession.user() : null;
  const history = (user && user.orders) || [];

  if (wantId) {
    if (active && active.id === wantId) return { order: active, full: true, user };
    const found = history.find(o => o.id === wantId);
    if (found) return { order: found, full: false, user };
    return { order: null, full: false, user };
  }
  if (active) return { order: active, full: true, user };
  if (history.length) return { order: history[0], full: false, user };
  return { order: null, full: false, user };
}

/* Normalize the two order shapes into one invoice model */
function buildInvoiceModel(raw, full, user) {
  const idDigits = String(raw.id || "00000000").replace(/\D/g, "").slice(-8).padStart(8, "0");
  const invoiceNo = "INV/" + idDigits.slice(0, 4) + "/" + idDigits.slice(4);

  const issued = new Date(raw.createdAt || raw.paidAt || Date.now());
  const paidAt = raw.paidAt ? new Date(raw.paidAt) : null;
  const due = raw.expireAt ? new Date(raw.expireAt) : new Date(issued.getTime() + 24 * 60 * 60 * 1000);

  let lines;
  if (full) {
    lines = (raw.items || []).map(it => ({
      cat: it.product.cat,
      title: it.product.title,
      variant: [it.variant && it.variant.name, it.variant && it.variant.unit].filter(Boolean).join(" · "),
      qty: it.qty,
      price: it.price,
      amount: it.price * it.qty,
    }));
  } else {
    lines = (raw.items || []).map(it => ({
      cat: it.cat,
      title: it.title,
      variant: it.variantName || "",
      qty: it.qty,
      price: it.price,
      amount: it.price * it.qty,
    }));
  }

  const subtotal = raw.subtotal != null ? raw.subtotal : lines.reduce((s, l) => s + l.amount, 0);
  const adminFee = raw.adminFee || 0;
  const discount = raw.discount || 0;
  const total = raw.total != null ? raw.total : Math.max(0, subtotal + adminFee - discount);
  const paid = raw.payNow != null ? raw.payNow : (raw.paymentStatus === "paid" ? total : 0);
  const remaining = raw.remaining != null ? raw.remaining : Math.max(0, total - paid);

  const cancelled = /batal/i.test(raw.statusLabel || "");
  let status;
  if (cancelled) status = "cancel";
  else if (remaining <= 0 && paid > 0) status = "paid";
  else if (paid > 0) status = "partial";
  else status = "pending";

  const buyer = full ? (raw.buyer || {}) : (user || {});
  const company = buyer.companyName || buyer.company1 || (user && user.company) || "";
  const address = buyer.address || buyer.suratAddress || (user && user.address) || "";
  const methodName = typeof raw.method === "string" ? raw.method : (raw.method && raw.method.name) || "—";

  return {
    id: raw.id, invoiceNo, issued, paidAt, due,
    lines, subtotal, adminFee, discount, discountCode: raw.discountCode,
    total, paid, remaining, status, methodName,
    buyer: {
      name: buyer.name || (user && user.name) || "Pelanggan Kaspa",
      email: buyer.email || (user && user.email) || "",
      phone: buyer.phone || (user && user.phone) || "",
      company, address,
    },
  };
}

const rpInv = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");
const fmtDateInv = (d) => d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
const fmtDateTimeInv = (d) => d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const STATUS_LABEL = { paid: "Lunas", partial: "DP / Sebagian", pending: "Menunggu Bayar", cancel: "Dibatalkan" };
const STAMP_LABEL = { paid: "Lunas", partial: "DP Diterima", pending: "Belum Lunas", cancel: "Batal" };

function InvoiceApp() {
  const [state, setState] = useStateInv(null);

  useEffectInv(() => { setState(resolveInvoiceOrder()); }, []);

  if (state === null) {
    return (<><Nav /><section className="inv-stage"><div className="container" /></section><Footer /></>);
  }

  if (!state.order) {
    return (
      <>
        <Nav />
        <section className="inv-stage">
          <div className="container">
            <div className="inv-empty">
              <h2 className="section-title">Invoice <em>tidak ditemukan</em></h2>
              <p style={{ color: "var(--text-tertiary)", margin: "12px 0 28px" }}>
                Belum ada pesanan untuk ditagihkan. Mulai pesan layanan untuk menerbitkan invoice.
              </p>
              <a className="btn btn-primary" href="#/business">Lihat Layanan <Icon.Arrow /></a>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const inv = buildInvoiceModel(state.order, state.full, state.user);
  const settled = inv.remaining <= 0 && inv.status !== "cancel";

  return (
    <>
      <Nav />
      <section className="inv-stage">
        <div className="container">

          {/* Toolbar (screen only) */}
          <div className="inv-toolbar">
            <div className="inv-toolbar-left">
              <span className="inv-toolbar-eyebrow">Invoice · {inv.invoiceNo}</span>
              <h1 className="inv-toolbar-title">Tagihan <em>Pesanan</em></h1>
            </div>
            <div className="inv-toolbar-actions">
              <a className="btn btn-ghost" href={state.full ? "#/success" : "#/dashboard?tab=orders"}>
                <Icon.ChevLeft /> Kembali
              </a>
              <button className="btn btn-primary" type="button" onClick={() => window.print()}>
                <InvIcon.Print /> Cetak / Simpan PDF
              </button>
            </div>
          </div>

          {/* Sheet */}
          <div className={`inv-sheet ${settled ? "is-paid" : ""}`}>
            {settled && <div className="inv-watermark" aria-hidden="true">LUNAS</div>}
            {/* Header band */}
            <div className="inv-band">
              <div className="inv-band-left">
                <div className="inv-brand-mark">Kaspa<em>Space</em></div>
                <div className="inv-brand-tag">Ruang Kerja Masa Depan</div>
                <div className="inv-brand-contact">
                  Jl. Adi Sucipto No. 24, Manahan, Solo<br />
                  cs@kaspaspace.com · +62 812-3456-7890<br />
                  NPWP 09.254.881.7-526.000
                </div>
              </div>
              <div className="inv-band-right">
                <div className="inv-word">INVOICE</div>
                <div className="inv-no"><span>No.</span> {inv.invoiceNo}</div>
                <span className={`inv-status ${inv.status}`}>
                  <span className="dot" />{STATUS_LABEL[inv.status]}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="inv-body">
              {settled && (
                <div className="inv-paid-banner">
                  <div className="inv-paid-seal"><InvIcon.Seal /></div>
                  <div className="inv-paid-text">
                    <div className="inv-paid-title">Pembayaran Lunas</div>
                    <div className="inv-paid-sub">
                      Telah dibayar penuh{inv.paidAt ? ` pada ${fmtDateTimeInv(inv.paidAt)}` : ""} · {inv.methodName}
                    </div>
                  </div>
                  <div className="inv-paid-amount">
                    <div className="l">Total Dibayar</div>
                    <div className="v">{rpInv(inv.total)}</div>
                  </div>
                </div>
              )}
              <div className="inv-parties">
                <div>
                  <div className="inv-party-label">Ditagihkan kepada</div>
                  <p className="inv-party-name">{inv.buyer.name}</p>
                  <div className="inv-party-line">
                    {inv.buyer.company && <>{inv.buyer.company}<br /></>}
                    {inv.buyer.email && <>{inv.buyer.email}<br /></>}
                    {inv.buyer.phone && <>{inv.buyer.phone}<br /></>}
                    {inv.buyer.address && <>{inv.buyer.address}</>}
                  </div>
                </div>
                <div>
                  <div className="inv-party-label">Diterbitkan oleh</div>
                  <p className="inv-party-name">PT Kaspa Ruang Kreatif</p>
                  <div className="inv-party-line">
                    Kaspa Space — Coworking & Layanan Bisnis<br />
                    Bank BCA 8808 0254 1190<br />
                    a.n. PT Kaspa Ruang Kreatif
                  </div>
                </div>
                <div className="inv-dates">
                  <div className="inv-date-row">
                    <span className="l">Order ID</span>
                    <span className="v">{inv.id}</span>
                  </div>
                  <div className="inv-date-row">
                    <span className="l">Tgl Terbit</span>
                    <span className="v">{fmtDateInv(inv.issued)}</span>
                  </div>
                  <div className="inv-date-row">
                    <span className="l">{inv.paidAt ? "Tgl Bayar" : "Jatuh Tempo"}</span>
                    <span className="v">{fmtDateInv(inv.paidAt || inv.due)}</span>
                  </div>
                  <div className="inv-date-row">
                    <span className="l">Metode</span>
                    <span className="v">{inv.methodName}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <table className="inv-table">
                <thead>
                  <tr>
                    <th className="l inv-row-num">#</th>
                    <th className="l">Deskripsi</th>
                    <th className="inv-qty-col">Qty</th>
                    <th className="inv-price-col">Harga</th>
                    <th className="inv-amount-col">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="l inv-row-num">{String(i + 1).padStart(2, "0")}</td>
                      <td className="l">
                        <div className="inv-item-cat">{l.cat}</div>
                        <div className="inv-item-title">{l.title}</div>
                        {l.variant && <div className="inv-item-variant">{l.variant}</div>}
                      </td>
                      <td className="inv-cell-num">{l.qty}</td>
                      <td className="inv-cell-num">{l.price === 0 ? "Gratis" : rpInv(l.price)}</td>
                      <td className="inv-cell-num inv-cell-amount">{l.amount === 0 ? "Gratis" : rpInv(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="inv-totals-wrap">
                <div className="inv-totals">
                  <div className="inv-total-row">
                    <span className="l">Subtotal</span>
                    <span className="v">{rpInv(inv.subtotal)}</span>
                  </div>
                  {inv.adminFee > 0 && (
                    <div className="inv-total-row">
                      <span className="l">Admin &amp; layanan</span>
                      <span className="v">{rpInv(inv.adminFee)}</span>
                    </div>
                  )}
                  {inv.discount > 0 && (
                    <div className="inv-total-row discount">
                      <span className="l">Diskon{inv.discountCode ? ` (${inv.discountCode})` : ""}</span>
                      <span className="v">−{rpInv(inv.discount)}</span>
                    </div>
                  )}
                  <div className="inv-total-row grand">
                    <span className="l">Total</span>
                    <span className="v">{rpInv(inv.total)}</span>
                  </div>
                  {inv.paid > 0 && (
                    <div className="inv-total-row paid">
                      <span className="l">Sudah dibayar</span>
                      <span className="v">−{rpInv(inv.paid)}</span>
                    </div>
                  )}
                  <div className={`inv-total-row due ${settled ? "settled" : ""}`}>
                    <span className="l">{settled ? "Status" : "Sisa Tagihan"}</span>
                    <span className="v">{settled ? "LUNAS" : rpInv(inv.remaining)}</span>
                  </div>
                </div>
              </div>

              {/* Payment band + stamp */}
              <div className="inv-payband">
                <div className="inv-pay-meta">
                  <div className="inv-pay-item">
                    <div className="l">Metode Bayar</div>
                    <div className="v">{inv.methodName}</div>
                  </div>
                  <div className="inv-pay-item">
                    <div className="l">Status</div>
                    <div className="v">{STATUS_LABEL[inv.status]}</div>
                  </div>
                  {inv.paidAt && (
                    <div className="inv-pay-item">
                      <div className="l">Waktu Bayar</div>
                      <div className="v">{fmtDateTimeInv(inv.paidAt)}</div>
                    </div>
                  )}
                </div>
                <div className={`inv-stamp ${inv.status}`}>{STAMP_LABEL[inv.status]}</div>
              </div>

              {/* Notes */}
              <div className="inv-notes">
                <div>
                  <h4>Catatan</h4>
                  <p>
                    {settled
                      ? "Pembayaran telah kami terima penuh. Invoice ini sah sebagai bukti pembayaran tanpa memerlukan tanda tangan basah."
                      : `Mohon selesaikan sisa tagihan ${rpInv(inv.remaining)} saat proses pesanan selesai. Tim kami akan menghubungi Anda maksimal 1×24 jam kerja.`}
                  </p>
                </div>
                <div>
                  <h4>Syarat &amp; Ketentuan</h4>
                  <ul>
                    <li>Pembayaran diproses aman melalui Midtrans.</li>
                    <li>Simpan invoice ini sebagai bukti transaksi resmi.</li>
                    <li>Pertanyaan? Hubungi cs@kaspaspace.com.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="inv-foot">
              <div className="inv-foot-main">
                <div className="inv-thanks">Terima kasih telah memilih <span>Kaspa Space</span>.</div>
                <p className="inv-foot-sub">
                  Dokumen ini dihasilkan secara elektronik dan sah tanpa tanda tangan basah.
                  Pantau status pesanan kapan saja melalui dashboard Anda.
                </p>
              </div>
              <div className="inv-sign">
                <div className="inv-sign-mark">Kaspa Space</div>
                <div className="inv-sign-label">Authorized · Solo</div>
              </div>
            </div>
          </div>

          {/* Help (screen only) */}
          <div className="inv-toolbar" style={{ marginTop: 22, justifyContent: "center" }}>
            <a className="btn btn-ghost" href="#"><InvIcon.Whatsapp /> Ada pertanyaan soal invoice ini?</a>
          </div>

        </div>
      </section>
      <Footer />
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["invoice"] = InvoiceApp;
