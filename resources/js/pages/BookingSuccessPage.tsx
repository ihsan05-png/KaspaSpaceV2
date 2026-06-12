import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { trackBooking, BookingTrack } from '../lib/publicApi';
import { useAuth } from '../contexts/AuthContext';

type SvgProps = React.SVGProps<SVGSVGElement>;
function CheckBigIcon(p: SvgProps) {
  return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>;
}
function CheckSmIcon(p: SvgProps) {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>;
}

function RefreshIcon(p: SvgProps) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>;
}

const fmt = (n: number) => 'Rp' + n.toLocaleString('id-ID');

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

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  'pending':     { label: 'Menunggu Konfirmasi', cls: 'pending'   },
  'confirmed':   { label: 'Dikonfirmasi',         cls: 'confirmed' },
  'paid':        { label: 'Lunas',                cls: 'paid'     },
  'checked-in':  { label: 'Sudah Check-in',       cls: 'paid'     },
  'checked-out': { label: 'Selesai',              cls: 'muted'    },
  'cancelled':   { label: 'Dibatalkan',           cls: 'cancelled'},
};

const STEPS_NEXT = [
  { n: 1, title: 'Pesanan terkonfirmasi',  desc: 'Kode booking tersimpan — screenshot atau catat untuk referensi.' },
  { n: 2, title: 'Tim kami memverifikasi', desc: 'Admin akan mengonfirmasi dan mengubah status menjadi "Dikonfirmasi".' },
  { n: 3, title: 'Pembayaran dilakukan',   desc: 'Bayar sesuai metode yang Anda pilih, kemudian konfirmasi ke admin.' },
  { n: 4, title: 'Sudah Terbayar',         desc: 'Pembayaran berhasil dikonfirmasi. Datang dan tunjukkan kode booking ke resepsionis.' },
];

type OtherItem = { cat: string; title: string; variantName: string; price: number; discount?: number; discountCode?: string };

interface StoredResult {
  code: string;
  productType: string;
  productName?: string;
  room: { title: string; location: string } | null;
  date: string;
  dateDisplay: string;
  startTime: string | null;
  endTime: string | null;
  otherItems?: OtherItem[];
  qty: number;
  totalPrice: number;
  adminFee: number;
  ppnRate?: number;
  ppnAmount?: number;
  status: string;
}

function statusInfo(s: string) {
  return STATUS_MAP[s] ?? { label: s, cls: 'muted' };
}

function dateDisplay(dateStr: string) {
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const CAT_LABEL: Record<string, string> = { fnb: 'Food & Beverage', business: 'Business Service' };

/* ── Komponen hasil booking ── */
function BookingCard({
  code, status, productType, room, dateStr, startTime, endTime,
  qty, totalPrice, adminFee, ppnRate, ppnAmount, otherItems, isNew, onRefresh, refreshing, expiresAt,
}: {
  code: string; status: string; productType: string;
  room: { title: string; location: string } | null;
  dateStr: string; startTime: string | null; endTime: string | null;
  qty: number; totalPrice: number; adminFee: number;
  ppnRate?: number; ppnAmount?: number;
  otherItems: OtherItem[];
  isNew: boolean; onRefresh: () => void; refreshing: boolean;
  expiresAt: string | null;
}) {
  const { user } = useAuth();
  const otherTotal = otherItems.reduce((s, i) => s + i.price - (i.discount ?? 0), 0);
  const total      = totalPrice + adminFee + otherTotal;
  const timeStr   = startTime && endTime ? `${startTime.slice(0, 5)} – ${endTime.slice(0, 5)}` : null;
  const si        = statusInfo(status);
  const countdown = useCountdown(expiresAt);

  return (
    <div className="os-wrap">
      <div className="os-check"><CheckBigIcon /></div>
      <h1 className="os-title">Booking <em>{isNew ? 'Berhasil!' : 'Ditemukan'}</em></h1>
      {isNew && (
        <p className="os-sub">
          Pesanan Anda sudah tersimpan. Admin akan memverifikasi dalam waktu dekat.
        </p>
      )}

      {/* Detail card */}
      <div className="os-card">
        <div className="os-meta-grid">
          <div className="os-meta">
            <div className="l">Kode Booking</div>
            <div className="v" style={{ fontFamily: 'monospace', letterSpacing: '.08em', fontSize: 16 }}>
              {code}
            </div>
          </div>
          <div className="os-meta">
            <div className="l">
              Status
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', verticalAlign: 'middle', padding: 0 }}
                title="Refresh status"
              >
                <RefreshIcon style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>
            <div className="v">
              <span className={`status ${si.cls}`}>{si.label}</span>
              {countdown !== null && status === 'pending' && (
                <div style={{ fontSize: 12, color: countdown === 0 ? 'var(--error)' : 'var(--text-tertiary)', marginTop: 4 }}>
                  ⏱ Batas konfirmasi: {fmtCountdown(countdown)}
                </div>
              )}
            </div>
          </div>
          <div className="os-meta">
            <div className="l">Produk</div>
            <div className="v">{productType}</div>
          </div>
        </div>

        {room && (
          <div className="co-line" style={{ margin: '18px 0' }}>
            <div className="co-line-info">
              <div className="co-line-cat">{productType}</div>
              <div className="co-line-title">{room.title}</div>
              <div className="co-line-var">{room.location}</div>
              <div className="co-line-var">{dateDisplay(dateStr)}</div>
              {timeStr && <div className="co-line-var">{timeStr}</div>}
              {qty > 1 && <div className="co-line-var">{qty} meja</div>}
            </div>
          </div>
        )}

        <div className="co-row"><span>{otherItems.length > 0 ? 'Harga CW' : 'Harga'}</span><span className="v">{fmt(ppnAmount && ppnAmount > 0 ? totalPrice - ppnAmount : totalPrice)}</span></div>
        {ppnAmount && ppnAmount > 0 ? <div className="co-row muted"><span>PPN {ppnRate}%</span><span>{fmt(ppnAmount)}</span></div> : null}
        {adminFee > 0 && <div className="co-row muted"><span>Admin & layanan</span><span>{fmt(adminFee)}</span></div>}

        {otherItems.map((item, idx) => {
          const disc = item.discount ?? 0;
          const net  = item.price - disc;
          return (
            <div key={idx} className="co-line" style={{ borderTop: '1px solid var(--border)', margin: '10px 0 0', paddingTop: 10 }}>
              <div className="co-line-info">
                <div className="co-line-cat">{CAT_LABEL[item.cat] ?? item.cat}</div>
                <div className="co-line-title">{item.title}</div>
                {item.variantName && <div className="co-line-var">{item.variantName}</div>}
                {disc > 0 && <div className="co-line-var" style={{ color: 'var(--brand-glow)' }}>Diskon –{fmt(disc)}</div>}
              </div>
              <div className="co-line-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                {disc > 0 && <span style={{ textDecoration: 'line-through', color: 'var(--text-tertiary)', fontSize: 12 }}>{fmt(item.price)}</span>}
                <span style={disc > 0 ? { color: 'var(--brand-glow)' } : {}}>{fmt(net)}</span>
              </div>
            </div>
          );
        })}

        <div className="co-row total" style={{ marginTop: 12, paddingTop: 12 }}>
          <span className="l">Total</span>
          <span className="v">{fmt(total)}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
          Bayar sesuai metode yang dipilih saat checkout, lalu konfirmasi ke admin.
        </p>
      </div>

      {/* Langkah berikutnya */}
      <div className="os-card">
        <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 22, margin: '0 0 18px' }}>
          Langkah <span style={{ fontStyle: 'italic', color: 'var(--brand-glow)' }}>Berikutnya</span>
        </h3>
        <ul className="os-steps">
          {STEPS_NEXT.map(s => (
            <li key={s.n} className="done">
              <div className="num"><CheckSmIcon /></div>
              <div><strong>{s.title}</strong><span>{s.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="os-actions">
        <Link className="btn btn-primary" to="/" onClick={() => localStorage.removeItem('ks_booking_result')}>Kembali ke Beranda <Icon.Arrow /></Link>
        <a className="btn btn-ghost" href="/invoice" target="_blank" rel="noopener noreferrer">Lihat / Unduh Invoice <Icon.Arrow /></a>
        {user && (
          <Link className="btn btn-ghost" to="/dashboard?tab=orders">Lihat di Dashboard <Icon.Arrow /></Link>
        )}
        <Link className="btn btn-ghost" to="/coworking">Booking Lagi <Icon.Arrow /></Link>
      </div>


      {!user && (
        <p style={{ marginTop: 20, color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
          Simpan kode booking <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{code}</strong> untuk melacak status.
          Klik <strong>Refresh</strong> di samping status untuk memperbarui.
        </p>
      )}
    </div>
  );
}

/* ── Halaman utama ── */
export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const [stored,    setStored]    = useState<StoredResult | null>(null);
  const [liveData,  setLiveData]  = useState<BookingTrack | null>(null);
  const [refreshing,  setRefreshing]  = useState(false);

  const initialized = useRef(false);
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    try {
      const raw = localStorage.getItem('ks_booking_result');
      if (raw) {
        const parsed: StoredResult = JSON.parse(raw);
        setStored(parsed);
        trackBooking(parsed.code).then(live => {
          setLiveData(live);
          if (live.status === 'pending') {
            pollRef.current = setInterval(() => {
              trackBooking(parsed.code).then(res => {
                setLiveData(res);
                if (res.status !== 'pending') stopPolling();
              }).catch(() => {});
            }, 30000);
          }
        }).catch(() => {});
        return;
      }
    } catch { /* ignore */ }
    // Tidak ada data booking — redirect ke home
    navigate('/', { replace: true });
    return () => stopPolling();
  }, []);

  const refreshStatus = async () => {
    const code = liveData?.code ?? stored?.code;
    if (!code) return;
    setRefreshing(true);
    try { setLiveData(await trackBooking(code)); }
    catch { /* ignore */ }
    finally { setRefreshing(false); }
  };


  if (!stored) return null;

  const live   = liveData;
  const status = live?.status ?? stored.status;
  const room   = live?.room ?? stored.room;

  return (
    <div>
      <Navbar />
      <section className="com-page">
        <div className="container">
          <BookingCard
            code={stored.code}
            status={status}
            productType={stored.productType}
            room={room}
            dateStr={stored.date}
            startTime={stored.startTime}
            endTime={stored.endTime}
            qty={stored.qty}
            totalPrice={live?.total_price ?? stored.totalPrice}
            adminFee={live?.admin_fee ?? stored.adminFee}
            ppnRate={stored.ppnRate ?? 0}
            ppnAmount={stored.ppnAmount ?? 0}
            otherItems={stored.otherItems ?? []}
            isNew={true}
            onRefresh={refreshStatus}
            refreshing={refreshing}
            expiresAt={live?.expires_at ?? null}
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}
