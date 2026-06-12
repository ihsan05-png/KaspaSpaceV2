import { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { cancelBookingByCode, trackBooking } from '../lib/publicApi';
import { useCart } from '../contexts/CartContext';

type SvgProps = React.SVGProps<SVGSVGElement>;
function CheckIcon(p: SvgProps) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>; }
function CopyIcon(p: SvgProps) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>; }
function ChevronIcon(p: SvgProps) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9" /></svg>; }
function RefreshIcon(p: SvgProps) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>; }

const STEPS = ['Pilih Produk', 'Data & Pembayaran', 'Bayar', 'Selesai'];
function StepsBar({ active }: { active: number }) {
  return (
    <div className="steps-bar">
      {STEPS.map((s, i) => (
        <Fragment key={i}>
          <div className={`steps-step${i < active ? ' done' : ''}${i === active ? ' active' : ''}`}>
            <div className="n">{i < active ? <CheckIcon /> : i + 1}</div>
            <span>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div className="steps-sep" />}
        </Fragment>
      ))}
    </div>
  );
}

function useCountdown(expireAt: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, expireAt - now);
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { text: `${pad(h)}:${pad(m)}:${pad(s)}`, expired: diff === 0 };
}

function getVaInstructions() {
  return [
    { t: 'ATM', steps: ['Masukkan kartu ATM & PIN Anda', 'Pilih menu Transfer → ke rek. Virtual Account', `Masukkan nomor Virtual Account di atas`, 'Pastikan nominal & nama penerima sesuai (Kaspa Space)', 'Konfirmasi transaksi & simpan struk'] },
    { t: 'Mobile Banking', steps: ['Buka aplikasi mobile banking Anda', 'Pilih menu Transfer → Virtual Account', 'Masukkan nomor Virtual Account', 'Periksa detail transaksi, lalu masukkan PIN', 'Transaksi selesai — bukti tersimpan di history'] },
  ];
}

const fmtRp = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');

/* ─────────────────────────────────────────────────────────────
   CW Payment (booking) — baca dari ks_cw_payment
───────────────────────────────────────────────────────────── */
interface CwPaymentData {
  bookingCode: string;
  productType: string;
  productName?: string;
  productImg?: string | null;
  room: { title: string; location: string } | null;
  date: string;
  dateDisplay: string;
  startTime: string | null;
  endTime: string | null;
  qty: number;
  totalPrice: number;
  adminFee: number;
  ppnRate?: number;
  ppnAmount?: number;
  status: string;
  paymentMethod: string;
  paymentLabel?: string;
  qrisImageUrl: string | null;
  rekening: { bank: string; number: string; holder: string } | null;
  expiresAt?: number;
  otherItems?: Array<{ cat: string; title: string; variantName: string; img: string | null; price: number; discount: number; discountCode: string }>;
}

function CwPaymentPage({ data }: { data: CwPaymentData }) {
  const navigate = useNavigate();
  const { clear: cartClear } = useCart();
  const [checking,   setChecking]   = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [openAcc,    setOpenAcc]    = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [cancelErr,  setCancelErr]  = useState('');

  const expireAt = data.expiresAt ?? (Date.now() + 12 * 60 * 60 * 1000);
  const { text: timer, expired } = useCountdown(expireAt);

  const saveAndGo = () => {
    try {
      localStorage.setItem('ks_booking_result', JSON.stringify({
        code:        data.bookingCode,
        productType: data.productType,
        productName: data.productName,
        productImg:  data.productImg ?? null,
        room:        data.room,
        date:        data.date,
        dateDisplay: data.dateDisplay,
        startTime:   data.startTime,
        endTime:     data.endTime,
        qty:         data.qty,
        totalPrice:  data.totalPrice,
        adminFee:    data.adminFee,
        ppnRate:      data.ppnRate ?? 0,
        ppnAmount:    data.ppnAmount ?? 0,
        paymentMethod: data.paymentLabel ?? data.paymentMethod,
        status:       data.status,
        otherItems:   data.otherItems ?? [],
      }));
      localStorage.removeItem('ks_cw_payment');
    } catch { /* ignore */ }
    cartClear();
    navigate('/pesan-sukses', { replace: true });
  };

  useEffect(() => {
    trackBooking(data.bookingCode).then(res => {
      if (res.status === 'cancelled') {
        localStorage.removeItem('ks_cw_payment');
        cartClear();
        navigate('/', { replace: true });
      } else if (res.status === 'paid' || res.status === 'checked-in' || res.status === 'checked-out') {
        saveAndGo();
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!expired) return;
    cancelBookingByCode(data.bookingCode).catch(() => {});
    localStorage.removeItem('ks_cw_payment');
    cartClear();
    navigate('/', { replace: true });
  }, [expired]);

  const otherItemsTotal = (data.otherItems ?? []).reduce((s, i) => s + i.price - i.discount, 0);
  const total = data.totalPrice + data.adminFee + otherItemsTotal;
  const pm    = data.paymentMethod;
  const isQris   = pm === 'qris';
  const isTunai  = pm === 'tunai';
  const isRek    = pm.startsWith('rek-');

  const onCopy = (val: string) => {
    try { if (navigator.clipboard) navigator.clipboard.writeText(val); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onBatalkan = async () => {
    if (!window.confirm('Yakin ingin membatalkan booking ini?')) return;
    setCancelling(true); setCancelErr('');
    try {
      await cancelBookingByCode(data.bookingCode);
      localStorage.removeItem('ks_cw_payment');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setCancelErr((err as { message?: string })?.message ?? 'Gagal membatalkan. Coba lagi.');
    } finally {
      setCancelling(false);
    }
  };

  const onKonfirmasi = () => {
    setChecking(true);
    setTimeout(saveAndGo, 1200);
  };

  return (
    <div>
      <Navbar />
      <section className="com-page">
        <div className="container">
          <button
            type="button"
            className="com-back"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--error)', fontSize: 14, padding: 0, marginBottom: 24, opacity: cancelling ? 0.6 : 1 }}
            onClick={onBatalkan}
            disabled={cancelling}
          >
            <Icon.ChevLeft /> {cancelling ? 'Membatalkan…' : 'Batalkan Booking'}
          </button>
          {cancelErr && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 12 }}>{cancelErr}</p>}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="com-eyebrow">Pembayaran</span>
            <h1 className="section-title" style={{ marginTop: 10 }}>Selesaikan <em>Pembayaran</em></h1>
          </div>
          <StepsBar active={2} />

          <div className="pay-grid">
            <div>
              <div className="pay-status-bar">
                <div className="pay-status-dot" />
                <div className="pay-status-text">
                  <strong>{expired ? 'Tenggat pembayaran habis' : 'Booking dibuat — menunggu pembayaran'}</strong>
                  <span>{expired ? 'Booking ini akan otomatis dibatalkan.' : <>Selesaikan sebelum waktu habis · Kode: <strong style={{ fontFamily: 'monospace' }}>{data.bookingCode}</strong></>}</span>
                </div>
                <div className="pay-timer">{timer}</div>
              </div>

              <div className="pay-card">
                <div className="pay-method-head">
                  <div className="pay-method-logo">
                    {isQris ? 'QRIS' : isTunai ? 'CASH' : data.rekening?.bank ?? 'TRF'}
                  </div>
                  <div>
                    <h3>{isQris ? 'QRIS' : isTunai ? 'Tunai / Cash' : `Transfer ${data.rekening?.bank ?? ''}`}</h3>
                    <div className="sub">Booking: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{data.bookingCode}</strong></div>
                  </div>
                </div>

                {/* QRIS */}
                {isQris && (
                  <div className="pay-qris">
                    {data.qrisImageUrl ? (
                      <img src={data.qrisImageUrl} alt="QRIS" style={{ width: 180, height: 180, borderRadius: 10, border: '1px solid var(--border)' }} />
                    ) : (
                      <div className="pay-qris-code">
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: 16 }}>
                          Gambar QRIS belum dikonfigurasi admin
                        </p>
                      </div>
                    )}
                    <div className="pay-qris-info">
                      <h4>Scan QRIS</h4>
                      <p>Buka aplikasi e-wallet atau mobile banking yang mendukung QRIS, lalu scan kode di samping.</p>
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
                        Nominal: <strong>{fmtRp(total)}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Tunai */}
                {isTunai && (
                  <div style={{ padding: '16px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💵</div>
                    <h4 style={{ margin: '0 0 8px' }}>Bayar Tunai di Kasir</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 12px' }}>
                      Tunjukkan kode booking ke resepsionis dan bayar langsung di kasir.
                    </p>
                    <div className="pay-va">
                      <div>
                        <div className="lab">Kode Booking</div>
                        <div className="num" style={{ fontFamily: 'monospace' }}>{data.bookingCode}</div>
                      </div>
                      <button type="button" className={`pay-copy${copied ? ' copied' : ''}`} onClick={() => onCopy(data.bookingCode)}>
                        {copied ? <><CheckIcon /> Tersalin</> : <><CopyIcon /> Salin</>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Rekening transfer */}
                {isRek && data.rekening && (
                  <>
                    <div className="pay-va">
                      <div>
                        <div className="lab">Nomor Rekening {data.rekening.bank}</div>
                        <div className="num">{data.rekening.number}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>a.n. {data.rekening.holder}</div>
                      </div>
                      <button type="button" className={`pay-copy${copied ? ' copied' : ''}`} onClick={() => onCopy(data.rekening!.number)}>
                        {copied ? <><CheckIcon /> Tersalin</> : <><CopyIcon /> Salin</>}
                      </button>
                    </div>
                    <div className="pay-instr-title">Cara <span style={{ fontStyle: 'italic', color: 'var(--brand-glow)' }}>Transfer</span></div>
                    <div className="pay-acc">
                      {[
                        { t: 'Mobile Banking / ATM', steps: [`Transfer ke rek. ${data.rekening.bank} ${data.rekening.number} a.n. ${data.rekening.holder}`, `Nominal: ${fmtRp(total)}`, 'Berita transfer: kode booking ' + data.bookingCode, 'Simpan bukti transfer'] },
                      ].map((ins, i) => (
                        <div key={i} className={`pay-acc-item${openAcc === i ? ' open' : ''}`}>
                          <button type="button" className="pay-acc-head" onClick={() => setOpenAcc(openAcc === i ? -1 : i)}>
                            <span>{ins.t}</span><span className="tog"><ChevronIcon /></span>
                          </button>
                          <div className="pay-acc-body"><div className="pay-acc-inner"><ol>{ins.steps.map((s, j) => <li key={j}>{s}</li>)}</ol></div></div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="pay-amount">
                  <div className="l">Total yang harus dibayar</div>
                  <div className="v">{fmtRp(total)}</div>
                </div>

                <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.18)', borderRadius: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <span style={{ color: 'var(--brand-glow)' }}>ℹ </span>
                  Setelah bayar, klik <strong>Saya Sudah Bayar</strong>. Admin akan memverifikasi dan mengonfirmasi booking Anda.
                </div>
              </div>
            </div>

            <aside className="pay-summary">
              <div className="co-summary">
                <div className="co-summary-head"><h3>Detail <em>Booking</em></h3></div>
                <div className="co-summary-body">
                  <div className="co-line">
                    <div className="co-line-img" style={data.productImg ? { backgroundImage: `url(${data.productImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
                    <div className="co-line-info">
                      <div className="co-line-cat">{data.productType}</div>
                      <div className="co-line-title">{data.productName ?? data.productType}</div>
                      {data.room && <div className="co-line-var">{data.room.title} · {data.room.location}</div>}
                      <div className="co-line-var">{data.dateDisplay}</div>
                      {data.startTime && data.endTime && (
                        <div className="co-line-var">{data.startTime.slice(0,5)} – {data.endTime.slice(0,5)}</div>
                      )}
                      {data.qty > 1 && <div className="co-line-var">{data.qty} meja</div>}
                    </div>
                    <div className="co-line-price">{fmtRp(data.totalPrice)}</div>
                  </div>
                  {data.otherItems?.map((item, idx) => (
                    <div key={idx} className="co-line" style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                      <div className="co-line-img" style={item.img ? { backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
                      <div className="co-line-info">
                        <div className="co-line-cat">{item.cat === 'fnb' ? 'F&B' : 'Business Service'}</div>
                        <div className="co-line-title">{item.title}</div>
                        <div className="co-line-var">{item.variantName}</div>
                      </div>
                      <div className="co-line-price">{fmtRp(item.price)}</div>
                    </div>
                  ))}
                  <div className="co-row"><span>Coworking</span><span className="v">{fmtRp(data.totalPrice)}</span></div>
                  {otherItemsTotal > 0 && <div className="co-row"><span>Layanan lainnya</span><span className="v">{fmtRp(otherItemsTotal)}</span></div>}
                  {data.adminFee > 0 && <div className="co-row muted"><span>Admin & layanan</span><span>{fmtRp(data.adminFee)}</span></div>}
                  <div className="co-row total">
                    <span className="l">Total</span>
                    <span className="v">{fmtRp(total)}</span>
                  </div>
                </div>
                <div className="co-foot">
                  <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={onKonfirmasi} disabled={checking}>
                    {checking ? <><RefreshIcon /> Memproses…</> : 'Saya Sudah Bayar'}
                  </button>
                  <a href="#" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 10, padding: '12px 18px', fontSize: 13 }}>
                    <Icon.Whatsapp /> Butuh Bantuan?
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FnB / Biz Payment — baca dari ks_order (flow lama)
───────────────────────────────────────────────────────────── */
export default function PaymentPage() {
  const navigate = useNavigate();
  const [order, setOrder]   = useState<Record<string, unknown> | null>(null);
  const [cwData, setCwData] = useState<CwPaymentData | null>(null);
  const [copied, setCopied] = useState(false);
  const [openAcc, setOpenAcc] = useState(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    try {
      const cwRaw = localStorage.getItem('ks_cw_payment');
      if (cwRaw) { setCwData(JSON.parse(cwRaw)); return; }
      const raw = localStorage.getItem('ks_order');
      if (raw) setOrder(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const expireAt = (order?.expireAt as number) ?? (Date.now() + 24 * 60 * 60 * 1000);
  const { text: timer, expired } = useCountdown(expireAt);

  // CW booking flow
  if (cwData) return <CwPaymentPage data={cwData} />;

  if (!order) {
    return (
      <div>
        <Navbar />
        <section className="com-page">
          <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
            <h2 className="section-title">Sesi pembayaran <em>tidak ditemukan</em></h2>
            <p style={{ color: 'var(--text-tertiary)', margin: '12px 0 28px' }}>Sepertinya sesi telah kedaluwarsa. Silakan mulai ulang pemesanan.</p>
            <Link to="/bisnis" className="btn btn-primary">Mulai Lagi <Icon.Arrow /></Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const m = (order.method as { id: string; name: string; logo: string }) ?? { id: 'va-bca', name: 'BCA Virtual Account', logo: 'BCA' };
  const orderTail = String(order.id ?? '12345678').replace(/\D/g, '').padStart(8, '0').slice(-8);
  const vaPrefix  = m.id === 'va-bca' ? '8808' : m.id === 'va-mandiri' ? '8909' : m.id === 'va-bni' ? '8888' : '7878';
  const vaNumber  = `${vaPrefix}${orderTail}`;
  const retailCode = `KSPA-${orderTail}`;
  const deposit    = (order.deposit as number) ?? Math.round(((order.total as number) ?? 0) * 0.5);
  const product    = order.product as { cat: string; title: string };
  const variant    = order.variant as { name: string };
  const isVA       = m.id.startsWith('va-');
  const isQRIS     = ['qris', 'gopay', 'ovo', 'shopeepay'].includes(m.id);
  const isRetail   = ['indomaret', 'alfamart'].includes(m.id);

  const instructions = isVA ? getVaInstructions() :
    isQRIS ? [{ t: 'Bayar via QRIS / E-Wallet', steps: ['Buka aplikasi pembayaran yang mendukung QRIS', 'Pilih menu Bayar / Scan QR', 'Scan QR code yang tersedia', 'Periksa nominal & nama merchant (Kaspa Space)', 'Konfirmasi pembayaran'] }] :
    isRetail ? [{ t: `Bayar di ${m.id === 'indomaret' ? 'Indomaret' : 'Alfamart'}`, steps: ['Tunjukkan kode pembayaran ke kasir', 'Sebutkan nominal pembayaran', 'Bayar tunai ke kasir', 'Simpan struk sebagai bukti — verifikasi otomatis max 30 menit'] }] : [];

  const onCopy = (val: string) => {
    try { if (navigator.clipboard) navigator.clipboard.writeText(val); } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const onSudahBayar = () => {
    setChecking(true);
    setTimeout(() => {
      const paid = { ...order, paymentStatus: 'paid', paidAt: new Date().toISOString() };
      try { localStorage.setItem('ks_order', JSON.stringify(paid)); } catch { /* ignore */ }
      navigate('/sukses');
    }, 1400);
  };

  return (
    <div>
      <Navbar />
      <section className="com-page">
        <div className="container">
          <Link to="/checkout" className="com-back"><Icon.ChevLeft /> Ganti metode pembayaran</Link>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="com-eyebrow">Pembayaran</span>
            <h1 className="section-title" style={{ marginTop: 10 }}>Selesaikan <em>Pembayaran</em></h1>
          </div>
          <StepsBar active={2} />

          <div className="pay-grid">
            <div>
              <div className="pay-status-bar">
                <div className="pay-status-dot" />
                <div className="pay-status-text">
                  <strong>{expired ? 'Pembayaran kedaluwarsa' : 'Menunggu pembayaran'}</strong>
                  <span>{expired ? 'Silakan mulai pesanan baru atau hubungi customer service.' : 'Selesaikan pembayaran sebelum waktu habis.'}</span>
                </div>
                <div className="pay-timer">{timer}</div>
              </div>

              <div className="pay-card">
                <div className="pay-method-head">
                  <div className="pay-method-logo">{m.logo}</div>
                  <div>
                    <h3>{m.name}</h3>
                    <div className="sub">Order ID: <strong style={{ color: 'var(--text-primary)' }}>{order.id as string}</strong></div>
                  </div>
                </div>

                {isVA && (
                  <div className="pay-va">
                    <div>
                      <div className="lab">Nomor Virtual Account</div>
                      <div className="num">{vaNumber.replace(/(.{4})/g, '$1 ').trim()}</div>
                    </div>
                    <button type="button" className={`pay-copy${copied ? ' copied' : ''}`} onClick={() => onCopy(vaNumber)}>
                      {copied ? <><CheckIcon /> Tersalin</> : <><CopyIcon /> Salin</>}
                    </button>
                  </div>
                )}

                {isQRIS && (
                  <div className="pay-qris">
                    <div className="pay-qris-code">
                      <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="200" height="200" fill="#fff" />
                        {Array.from({ length: 15 }).map((_, r) => Array.from({ length: 15 }).map((_, c) => {
                          const seed = (r * 31 + c * 17 + (orderTail.charCodeAt((r + c) % orderTail.length) || 0)) % 7;
                          return seed > 3 ? <rect key={`${r}-${c}`} x={14 + c * 12} y={14 + r * 12} width="10" height="10" fill="#0d1a36" /> : null;
                        }))}
                        <g fill="#0d1a36"><rect x="14" y="14" width="46" height="46" rx="4" /><rect x="140" y="14" width="46" height="46" rx="4" /><rect x="14" y="140" width="46" height="46" rx="4" /></g>
                        <g fill="#fff"><rect x="22" y="22" width="30" height="30" rx="2" /><rect x="148" y="22" width="30" height="30" rx="2" /><rect x="22" y="148" width="30" height="30" rx="2" /></g>
                        <g fill="#0d1a36"><rect x="28" y="28" width="18" height="18" rx="1" /><rect x="154" y="28" width="18" height="18" rx="1" /><rect x="28" y="154" width="18" height="18" rx="1" /></g>
                      </svg>
                    </div>
                    <div className="pay-qris-info">
                      <h4>Scan QRIS</h4>
                      <p>Bayar dari aplikasi e-wallet atau mobile banking apa saja yang mendukung QRIS.</p>
                      <button type="button" className={`pay-copy${copied ? ' copied' : ''}`} onClick={() => onCopy(`KSPA-${orderTail}`)} style={{ marginTop: 8 }}>
                        {copied ? <><CheckIcon /> Tersalin</> : <><CopyIcon /> Salin Kode</>}
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
                    <button type="button" className={`pay-copy${copied ? ' copied' : ''}`} onClick={() => onCopy(retailCode)}>
                      {copied ? <><CheckIcon /> Tersalin</> : <><CopyIcon /> Salin</>}
                    </button>
                  </div>
                )}

                <div className="pay-amount">
                  <div className="l">Total yang harus dibayar (DP 50%)</div>
                  <div className="v">Rp{deposit.toLocaleString('id-ID')}</div>
                </div>

                {instructions.length > 0 && (
                  <>
                    <div className="pay-instr-title">Cara <span style={{ fontStyle: 'italic', color: 'var(--brand-glow)' }}>Pembayaran</span></div>
                    <div className="pay-acc">
                      {instructions.map((ins, i) => (
                        <div key={i} className={`pay-acc-item${openAcc === i ? ' open' : ''}`}>
                          <button type="button" className="pay-acc-head" onClick={() => setOpenAcc(openAcc === i ? -1 : i)}>
                            <span>{ins.t}</span><span className="tog"><ChevronIcon /></span>
                          </button>
                          <div className="pay-acc-body"><div className="pay-acc-inner"><ol>{ins.steps.map((s, j) => <li key={j}>{s}</li>)}</ol></div></div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.18)', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <span style={{ color: 'var(--brand-glow)', marginTop: 2 }}>ℹ</span>
                  <span>Setelah membayar, klik <strong>Saya Sudah Bayar</strong> di samping. Verifikasi otomatis dalam beberapa detik — jika lewat 15 menit belum berubah, hubungi kami via WhatsApp.</span>
                </div>
              </div>
            </div>

            <aside className="pay-summary">
              <div className="co-summary">
                <div className="co-summary-head"><h3>Detail <em>Pesanan</em></h3></div>
                <div className="co-summary-body">
                  <div className="co-line">
                    <div className="co-line-img" />
                    <div className="co-line-info">
                      <div className="co-line-cat">{product.cat}</div>
                      <div className="co-line-title">{product.title}</div>
                      <div className="co-line-var">Paket: {variant.name} × {order.qty as number}</div>
                    </div>
                    <div className="co-line-price">Rp{(order.subtotal as number).toLocaleString('id-ID')}</div>
                  </div>
                  <div className="co-row"><span>Subtotal</span><span className="v">Rp{(order.subtotal as number).toLocaleString('id-ID')}</span></div>
                  <div className="co-row muted"><span>Admin & layanan</span><span>Rp{(order.adminFee as number).toLocaleString('id-ID')}</span></div>
                  {(order.discount as number) > 0 && <div className="co-row" style={{ color: 'var(--success)' }}><span>Diskon ({order.coupon as string})</span><span style={{ color: 'var(--success)' }}>−Rp{(order.discount as number).toLocaleString('id-ID')}</span></div>}
                  <div className="co-row total">
                    <span className="l">Total Pesanan</span>
                    <span className="v">Rp{(order.total as number).toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 12, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: '#fbbf24' }}>Bayar DP 50% dulu</strong> — sisa Rp{((order.total as number) - deposit).toLocaleString('id-ID')} ditagih saat selesai.
                  </div>
                </div>
                <div className="co-foot">
                  <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onSudahBayar} disabled={checking || expired}>
                    {checking ? <><RefreshIcon /> Memverifikasi…</> : 'Saya Sudah Bayar'}
                  </button>
                  <a href="#" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 10, padding: '12px 18px', fontSize: 13 }}>
                    <Icon.Whatsapp /> Butuh Bantuan?
                  </a>
                  <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.06em' }}>PEMBAYARAN DIPROSES MELALUI MIDTRANS</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
