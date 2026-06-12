/* global React, ReactDOM, Icon, Nav, Footer */
const { useState: useStateOS, useEffect: useEffectOS } = React;

const OSIcon = {
  Check: (p) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  CheckSm: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  Download: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Mail: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
};

const OS_STEPS = ["Pilih Produk", "Data & Pembayaran", "Bayar", "Selesai"];
function OSStepsBar({ active }) {
  return (
    <div className="steps-bar">
      {OS_STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`steps-step ${i < active ? "done" : ""} ${i === active ? "active" : ""}`}>
            <div className="n">{i < active ? <OSIcon.CheckSm /> : i === active ? <OSIcon.CheckSm /> : i + 1}</div>
            <span>{s}</span>
          </div>
          {i < OS_STEPS.length - 1 && <div className="steps-sep"></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

function OrderSuccessApp() {
  const [order, setOrder] = useStateOS(null);

  useEffectOS(() => {
    try {
      const raw = localStorage.getItem("ks_order");
      if (raw) {
        const o = JSON.parse(raw);
        setOrder(o);
        if (o.paymentStatus === "paid") {
          window.KaspaSession.recordOrder(o);
          window.KaspaCart.clear();
        }
      }
    } catch (e) {}
  }, []);

  if (!order) {
    return (
      <>
        <Nav />
        <section className="com-page">
          <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
            <h2 className="section-title">Tidak ada <em>pesanan aktif</em></h2>
            <p style={{ color: "var(--text-tertiary)", margin: "12px 0 28px" }}>
              Mulai pesan layanan untuk melihat halaman konfirmasi.
            </p>
            <a className="btn btn-primary" href="#/business">
              Lihat Layanan <Icon.Arrow />
            </a>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const deposit = order.payNow != null ? order.payNow : Math.round((order.total || 0) * 0.5);
  const remaining = order.remaining != null ? order.remaining : (order.total || 0) - deposit;
  const paidAt = order.paidAt ? new Date(order.paidAt) : new Date();
  const paidStr = paidAt.toLocaleString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const invoiceId = "INV-" + (order.id || "00000000").replace(/\D/g, "").slice(-8);

  return (
    <>
      <Nav />
      <section className="com-page">
        <div className="container">
          <OSStepsBar active={3} />

          <div className="os-wrap">
            <div className="os-check">
              <OSIcon.Check />
            </div>
            <h1 className="os-title">Pembayaran <em>Berhasil</em></h1>
            <p className="os-sub">
              Terima kasih, <strong style={{ color: "var(--text-primary)" }}>{order.buyer?.name || "Sobat Kaspa"}</strong>!
              Pesanan Anda sudah kami terima dan tersimpan di dashboard. Tim kami akan menghubungi Anda
              maksimal <strong style={{ color: "var(--text-primary)" }}>1×24 jam kerja</strong>.
            </p>

            {/* Order card */}
            <div className="os-card">
              <div className="os-meta-grid">
                <div className="os-meta">
                  <div className="l">Order ID</div>
                  <div className="v">{order.id}</div>
                </div>
                <div className="os-meta">
                  <div className="l">No. Invoice</div>
                  <div className="v">{invoiceId}</div>
                </div>
                <div className="os-meta">
                  <div className="l">Waktu Bayar</div>
                  <div className="v" style={{ fontSize: 13.5 }}>{paidStr}</div>
                </div>
              </div>

              {(order.items || []).map(it => (
                <div className="co-line" key={it.uid} style={{ marginBottom: 14 }}>
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
              {order.discount > 0 && (
                <div className="co-row" style={{ color: "var(--success)" }}>
                  <span>Diskon ({order.discountCode})</span>
                  <span style={{ color: "var(--success)" }}>−Rp{order.discount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="co-row">
                <span>Total Pesanan</span>
                <span className="v">Rp{order.total.toLocaleString("id-ID")}</span>
              </div>
              <div className="co-row" style={{ color: "var(--success)" }}>
                <span>Sudah dibayar</span>
                <span className="v" style={{ color: "var(--success)" }}>−Rp{deposit.toLocaleString("id-ID")}</span>
              </div>
              <div className="co-row total" style={{ marginTop: 12, paddingTop: 12 }}>
                <span className="l">Sisa Pembayaran</span>
                <span className="v" style={{ fontSize: 20 }}>Rp{remaining.toLocaleString("id-ID")}</span>
              </div>
              <div style={{
                marginTop: 10, fontSize: 12, color: "var(--text-tertiary)",
                textAlign: "right",
              }}>
                {remaining > 0 ? "Ditagih saat proses pesanan selesai" : "Pembayaran lunas — tidak ada sisa"}
              </div>
            </div>

            {/* Next steps timeline */}
            <div className="os-card">
              <h3 style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 500, fontSize: 22, margin: "0 0 18px",
              }}>
                Langkah <span style={{ fontStyle: "italic", color: "var(--brand-glow)" }}>Berikutnya</span>
              </h3>
              <ul className="os-steps">
                <li className="done">
                  <div className="num"><OSIcon.CheckSm /></div>
                  <div>
                    <strong>Pesanan terkonfirmasi</strong>
                    <span>
                      Invoice & bukti pesanan dikirim ke email{" "}
                      <strong style={{ color: "var(--text-primary)" }}>{order.buyer?.email || "Anda"}</strong>{" "}
                      dan tersimpan di dashboard Anda.
                    </span>
                  </div>
                </li>
                <li>
                  <div className="num">2</div>
                  <div>
                    <strong>Tim kami menghubungi Anda</strong>
                    <span>Maksimal 1×24 jam kerja via WhatsApp untuk konfirmasi & validasi data.</span>
                  </div>
                </li>
                <li>
                  <div className="num">3</div>
                  <div>
                    <strong>Pesanan diproses</strong>
                    <span>Update progres dikirim rutin dan dapat Anda pantau di dashboard kapan saja.</span>
                  </div>
                </li>
                <li>
                  <div className="num">4</div>
                  <div>
                    <strong>Selesai</strong>
                    <span>{remaining > 0
                      ? `Bayar sisa Rp${remaining.toLocaleString("id-ID")} saat pesanan selesai, lalu dokumen/tiket diserahkan.`
                      : "Pesanan tuntas — tiket/dokumen siap digunakan."}</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="os-actions">
              <a className="btn btn-primary" href="#/dashboard?tab=orders">
                Lihat Pesanan Saya <Icon.Arrow />
              </a>
              <a className="btn btn-ghost" href="#/invoice">
                <OSIcon.Download /> Lihat &amp; Unduh Invoice
              </a>
              <a className="btn btn-ghost" href="#/home">
                Kembali ke Beranda
              </a>
            </div>

            <p style={{
              marginTop: 36, color: "var(--text-tertiary)", fontSize: 13,
            }}>
              <OSIcon.Mail style={{ verticalAlign: "middle", marginRight: 4, color: "var(--brand-glow)" }} />
              Belum terima email? Cek folder spam atau hubungi{" "}
              <a href="mailto:cs@kaspaspace.com" style={{ color: "var(--brand-glow)" }}>cs@kaspaspace.com</a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["success"] = OrderSuccessApp;
