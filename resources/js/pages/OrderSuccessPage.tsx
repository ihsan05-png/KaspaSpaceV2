import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { trackBizOrder, cancelBizOrder, trackFnbOrder, cancelFnbOrder, BizOrderTrack, FnbOrderTrack } from '../lib/publicApi';
import { waLink } from '../lib/config';
import { useAuth } from '../contexts/AuthContext';

type SvgProps = React.SVGProps<SVGSVGElement>;
function CheckBigIcon(p: SvgProps) { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>; }
function CheckSmIcon(p: SvgProps) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>; }
function DownloadIcon(p: SvgProps) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>; }
function RefreshIcon(p: SvgProps) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>; }

const STEPS = ['Pilih Produk', 'Data & Pembayaran', 'Bayar', 'Selesai'];
function StepsBar({ active }: { active: number }) {
  return (
    <div className="steps-bar">
      {STEPS.map((s, i) => (
        <Fragment key={i}>
          <div className={`steps-step${i < active ? ' done' : ''}${i === active ? ' active' : ''}`}>
            <div className="n">{i <= active ? <CheckSmIcon /> : i + 1}</div>
            <span>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div className="steps-sep" />}
        </Fragment>
      ))}
    </div>
  );
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  'pending':   { label: 'Menunggu Konfirmasi', cls: 'pending'   },
  'confirmed': { label: 'Dikonfirmasi',         cls: 'confirmed' },
  'paid':      { label: 'Lunas',                cls: 'paid'     },
  'completed': { label: 'Selesai',              cls: 'paid'     },
  'cancelled': { label: 'Dibatalkan',           cls: 'cancelled'},
};

function statusInfo(s: string) {
  return STATUS_MAP[s] ?? { label: s, cls: 'muted' };
}

function useCountdown(expiresAt: string | null) {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    if (!expiresAt) { setMs(null); return; }
    const tick = () => setMs(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return ms;
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return 'Batas waktu habis';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h} jam ${m} menit lagi`;
  if (m > 0) return `${m} menit ${s} detik lagi`;
  return `${s} detik lagi`;
}

type LiveData = BizOrderTrack | FnbOrderTrack | null;

function getLiveStatus(live: LiveData): string | null {
  return live?.status ?? null;
}
function getLiveExpires(live: LiveData): string | null {
  return live?.expires_at ?? null;
}

export default function OrderSuccessPage() {
  const { user } = useAuth();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [live, setLive]   = useState<LiveData>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ks_order');
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      setOrder(parsed);

      const code = parsed.code as string | undefined;
      if (!code) return;
      if (code.startsWith('BS-')) {
        trackBizOrder(code).then(setLive).catch(() => {});
      } else if (code.startsWith('FO-')) {
        trackFnbOrder(code).then(setLive).catch(() => {});
      }
    } catch { /* ignore */ }
  }, []);

  const handleRefresh = async () => {
    const code = order?.code as string | undefined;
    if (!code) return;
    setRefreshing(true);
    try {
      if (code.startsWith('BS-')) setLive(await trackBizOrder(code));
      else if (code.startsWith('FO-')) setLive(await trackFnbOrder(code));
    } catch { /* ignore */ }
    finally { setRefreshing(false); }
  };

  const handleCancel = async () => {
    const code = order?.code as string | undefined;
    if (!code) return;
    if (!window.confirm('Yakin ingin membatalkan pesanan ini?')) return;
    setCancelling(true);
    try {
      if (code.startsWith('BS-')) await cancelBizOrder(code);
      else if (code.startsWith('FO-')) await cancelFnbOrder(code);
      await handleRefresh();
    } catch { /* ignore */ }
    finally { setCancelling(false); }
  };

  const countdown = useCountdown(getLiveExpires(live));

  if (!order) {
    return (
      <div>
        <Navbar />
        <section className="com-page">
          <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
            <h2 className="section-title">Tidak ada <em>pesanan aktif</em></h2>
            <p style={{ color: 'var(--text-tertiary)', margin: '12px 0 28px' }}>Mulai pesan layanan untuk melihat halaman konfirmasi.</p>
            <Link to="/bisnis" className="btn btn-primary">Lihat Layanan <Icon.Arrow /></Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const liveStatus = getLiveStatus(live);
  const displayStatus = liveStatus ?? (order.paymentStatus as string | undefined) ?? 'pending';
  const si = statusInfo(displayStatus);

  const total   = (order.total as number) ?? 0;
  const deposit = (order.deposit as number) ?? Math.round(total * 0.5);
  const remaining = total - deposit;
  const paidAt  = order.paidAt ? new Date(order.paidAt as string) : new Date();
  const paidStr = paidAt.toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const invoiceId = 'INV-' + String(order.id ?? '00000000').replace(/\D/g, '').slice(-8);
  const buyer   = (order.buyer as { name?: string; email?: string }) ?? {};
  const product = (order.product as { cat: string; title: string }) ?? { cat: '', title: '' };
  const variant = (order.variant as { name: string }) ?? { name: '' };
  const code    = order.code as string | undefined;
  const isBizOrFnb = code?.startsWith('BS-') || code?.startsWith('FO-');
  const canCancel = isBizOrFnb && !['completed', 'cancelled'].includes(displayStatus);

  return (
    <div>
      <Navbar />
      <section className="com-page">
        <div className="container">
          <StepsBar active={3} />

          <div className="os-wrap">
            <div className="os-check"><CheckBigIcon /></div>
            <h1 className="os-title">Pesanan <em>Berhasil!</em></h1>
            <p className="os-sub">
              Terima kasih, <strong style={{ color: 'var(--text-primary)' }}>{buyer.name ?? 'Sobat Kaspa'}</strong>!
              Pesanan Anda sudah kami terima. Tim kami akan menghubungi Anda maksimal{' '}
              <strong style={{ color: 'var(--text-primary)' }}>1×24 jam kerja</strong>.
            </p>

            <div className="os-card">
              <div className="os-meta-grid">
                <div className="os-meta">
                  <div className="l">Order ID</div>
                  <div className="v" style={{ fontFamily: 'monospace', letterSpacing: '.05em' }}>{order.code as string ?? order.id as string}</div>
                </div>
                <div className="os-meta">
                  <div className="l">
                    Status
                    {isBizOrFnb && (
                      <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', verticalAlign: 'middle', padding: 0 }}
                        title="Refresh status"
                      >
                        <RefreshIcon style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                      </button>
                    )}
                  </div>
                  <div className="v">
                    <span className={`status ${si.cls}`}>{si.label}</span>
                    {countdown !== null && displayStatus === 'pending' && (
                      <div style={{ fontSize: 12, color: countdown === 0 ? 'var(--error)' : 'var(--text-tertiary)', marginTop: 4 }}>
                        ⏱ Batas konfirmasi: {fmtCountdown(countdown)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="os-meta"><div className="l">No. Invoice</div><div className="v">{invoiceId}</div></div>
                <div className="os-meta"><div className="l">Waktu Bayar</div><div className="v" style={{ fontSize: 13.5 }}>{paidStr}</div></div>
              </div>

              <div className="co-line" style={{ marginBottom: 18 }}>
                <div className="co-line-img" />
                <div className="co-line-info">
                  <div className="co-line-cat">{product.cat}</div>
                  <div className="co-line-title">{product.title}</div>
                  <div className="co-line-var">Paket: {variant.name} × {order.qty as number}{buyer.email ? ` · ${buyer.email}` : ''}</div>
                </div>
                <div className="co-line-price">Rp{(order.subtotal as number ?? 0).toLocaleString('id-ID')}</div>
              </div>

              {(order.ppnAmount as number ?? 0) > 0 && (
                <div className="co-row muted"><span>PPN {order.ppnRate as number ?? 0}%</span><span>Rp{(order.ppnAmount as number).toLocaleString('id-ID')}</span></div>
              )}
              <div className="co-row"><span>Total Pesanan</span><span className="v">Rp{total.toLocaleString('id-ID')}</span></div>
              {deposit > 0 && (
                <div className="co-row" style={{ color: 'var(--success)' }}>
                  <span>Dibayar (DP 50%)</span>
                  <span className="v" style={{ color: 'var(--success)' }}>−Rp{deposit.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="co-row total" style={{ marginTop: 12, paddingTop: 12 }}>
                <span className="l">Sisa Pembayaran</span>
                <span className="v" style={{ fontSize: 20 }}>Rp{remaining.toLocaleString('id-ID')}</span>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'right' }}>Ditagih saat dokumen siap diambil</div>
            </div>

            <div className="os-card">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 22, margin: '0 0 18px' }}>
                Langkah <span style={{ fontStyle: 'italic', color: 'var(--brand-glow)' }}>Berikutnya</span>
              </h3>
              <ul className="os-steps">
                <li className="done">
                  <div className="num"><CheckSmIcon /></div>
                  <div>
                    <strong>Pesanan terkonfirmasi</strong>
                    <span>Invoice & e-tiket dikirim ke email <strong style={{ color: 'var(--text-primary)' }}>{buyer.email ?? 'Anda'}</strong> dalam 5 menit.</span>
                  </div>
                </li>
                <li>
                  <div className="num">2</div>
                  <div>
                    <strong>Tim kami menghubungi Anda</strong>
                    <span>Maksimal 1×24 jam kerja via WhatsApp untuk konsultasi awal & validasi data.</span>
                  </div>
                </li>
                <li>
                  <div className="num">3</div>
                  <div>
                    <strong>Proses pengerjaan</strong>
                    <span>Kami kerjakan pesanan Anda dan kirim update progres secara rutin.</span>
                  </div>
                </li>
                <li>
                  <div className="num">4</div>
                  <div>
                    <strong>Pelunasan & serah terima</strong>
                    <span>Bayar sisa Rp{remaining.toLocaleString('id-ID')}. Hasil dikirim digital & fisik ke alamat Anda.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="os-actions">
              {user ? (
                <Link className="btn btn-primary" to="/dashboard?tab=orders">
                  Lihat di Dashboard <Icon.Arrow />
                </Link>
              ) : (
                <Link className="btn btn-primary" to="/masuk">
                  Masuk untuk Lacak Pesanan <Icon.Arrow />
                </Link>
              )}
              <a className="btn btn-ghost" href={waLink()} target="_blank" rel="noopener noreferrer"><Icon.Whatsapp /> Chat Tim Kaspa</a>
              <Link to="/bisnis" className="btn btn-ghost">Kembali ke Layanan <Icon.Arrow /></Link>
              <button type="button" className="btn btn-ghost" onClick={() => { localStorage.removeItem('ks_booking_result'); window.open('/invoice', '_blank'); }}>
                <DownloadIcon /> Lihat / Unduh Invoice
              </button>
            </div>

            {canCancel && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ color: 'var(--error, #e55)', marginTop: 8 }}
                disabled={cancelling}
                onClick={handleCancel}
              >
                {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
              </button>
            )}

            {!user && isBizOrFnb && (
              <p style={{ marginTop: 20, color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
                Simpan kode pesanan <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{code}</strong>.
                Klik <strong>Refresh</strong> di samping status untuk memperbarui.
              </p>
            )}

            <p style={{ marginTop: 28, color: 'var(--text-tertiary)', fontSize: 13 }}>
              Belum terima email? Cek folder spam atau hubungi{' '}
              <a href="mailto:cs@kaspaspace.com" style={{ color: 'var(--brand-glow)' }}>cs@kaspaspace.com</a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
