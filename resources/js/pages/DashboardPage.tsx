import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/icons';
import { useAuth } from '../contexts/AuthContext';
import { useApiGet } from '../hooks/useApiGet';
import { fetchUserBookings, BookingApi, fetchActiveDiscounts, DiscountPublicApi, fetchUserBizOrders, UserBizOrderApi, fetchUserFnbOrders, UserFnbOrderApi, submitReview } from '../lib/publicApi';
import { waLink } from '../lib/config';

/* ---- Helpers ---- */
const fmt = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');
const fmtDate = (s: string) => {
  try { return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return s; }
};
const initials = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

type SvgProps = React.SVGProps<SVGSVGElement>;
function CheckSmIcon(p: SvgProps) {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>;
}

/* ---- Booking → UI Order mapping ---- */
interface OrderItem { cat: string; title: string; variantName: string; qty: number; price: number; }
interface Order {
  id: string;
  invoiceNo: string | null;
  createdAt: string;
  paidAt: string | null;
  bookingDate: string | null;
  method: string;
  items: OrderItem[];
  subtotal: number;
  adminFee: number;
  total: number;
  statusStep: number;
  statusLabel: string;
  roomLocation: string | null;
  notes: string | null;
}

function bookingToOrder(b: BookingApi): Order {
  const itemTitle = b.room?.title
    ?? (b.vo_package ? `Virtual Office ${b.vo_package.tier}` : null)
    ?? (b.vo_bundle?.name ?? b.product_type_key);

  const variantName = b.start_time && b.end_time
    ? `${b.start_time}–${b.end_time}`
    : b.product_type_key;

  const stepMap: Record<string, number> = {
    pending:       0,
    paid:          1,
    'checked-in':  2,
    'checked-out': 3,
    cancelled:     4,
  };
  const labelMap: Record<string, string> = {
    pending:       'Menunggu Pembayaran',
    paid:          'Dibayar',
    'checked-in':  'Check In',
    'checked-out': 'Selesai',
    cancelled:     'Dibatalkan',
  };

  return {
    id:           b.code,
    invoiceNo:    b.invoice_no ?? null,
    createdAt:    b.created_at,
    paidAt:       b.paid_at ?? null,
    bookingDate:  b.booking_date ?? null,
    method:       '—',
    items: [{
      cat:         b.product_type_key,
      title:       itemTitle,
      variantName,
      qty:         b.qty_desks || 1,
      price:       b.total_price,
    }],
    subtotal:     b.total_price,
    adminFee:     b.admin_fee,
    total:        b.total_price + b.admin_fee,
    statusStep:   stepMap[b.status] ?? 0,
    statusLabel:  labelMap[b.status] ?? b.status,
    roomLocation: b.room?.location ?? null,
    notes:        b.notes ?? null,
  };
}

/* ---- Shared invoice opener ---- */
const CW_STEP_STATUS: Record<number, string> = { 0: 'pending', 1: 'paid', 2: 'checked-in', 3: 'checked-out', 4: 'cancelled' };

function openCwInvoice(order: Order, userName: string) {
  localStorage.setItem('ks_booking_result', JSON.stringify({
    code:        order.id,
    invoiceNo:   order.invoiceNo,
    productType: order.items[0]?.cat ?? 'Coworking',
    productName: order.items[0]?.title ?? 'Booking',
    totalPrice:  order.subtotal,
    adminFee:    order.adminFee,
    status:      CW_STEP_STATUS[order.statusStep] ?? 'pending',
    paidAt:      order.paidAt,
    createdAt:   order.createdAt,
    guestName:   userName,
    notes:       order.notes,
  }));
  window.open('/invoice', '_blank');
}

interface AllOrders { cw: Order[]; fnb: UserFnbOrderApi[]; biz: UserBizOrderApi[]; }

function parseLinkedCw(note: string | null): string | null {
  if (!note) return null;
  const m = note.match(/\[LinkedCW:([A-Z0-9-]+)\]/);
  return m ? m[1] : null;
}

function parseGroup(note: string | null): string | null {
  if (!note) return null;
  const m = note.match(/\[Group:([A-Z0-9-]+)\]/);
  return m ? m[1] : null;
}

function parseFnbDiscount(note: string | null): { code: string; amount: number } | null {
  if (!note) return null;
  const m = note.match(/\[Diskon:([^,]+),Rp([\d.]+)\]/);
  if (!m) return null;
  return { code: m[1], amount: parseInt(m[2].replace(/\./g, ''), 10) };
}

function openFnbInvoice(order: UserFnbOrderApi, userName: string, all: AllOrders) {
  // 1. Linked to CW booking → open combined CW invoice
  const linkedCw = parseLinkedCw(order.note);
  if (linkedCw) {
    const cwOrder = all.cw.find(o => o.id === linkedCw);
    if (cwOrder) { openCwInvoice(cwOrder, userName); return; }
  }

  // 2. Part of a FnB+Biz group → combine all group orders
  const groupId = parseGroup(order.note);
  if (groupId) {
    const groupBiz = all.biz.filter(b => b.note?.includes(`[Group:${groupId}]`));
    if (groupBiz.length > 0) {
      const fnbDisc = parseFnbDiscount(order.note);
      const fnbItems = order.items.map(i => ({
        cat: 'Food & Beverage', title: i.name, variantName: '', qty: i.qty, price: i.price * i.qty, discount: 0,
      }));
      const bizItems = groupBiz.map(b => ({
        cat: 'Business Service', title: b.service?.name ?? 'Layanan Bisnis',
        variantName: b.package_name ?? '', qty: 1, price: b.price, discount: b.discount_amount,
      }));
      const bizNet = groupBiz.reduce((s, b) => s + b.price - b.discount_amount, 0);
      localStorage.setItem('ks_order', JSON.stringify({
        id: order.code, orderItems: [...fnbItems, ...bizItems], adminFee: 0,
        discount: fnbDisc?.amount ?? 0, coupon: fnbDisc?.code ?? '',
        total: order.total + bizNet,
        paymentStatus: order.status === 'paid' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'pending',
        buyer: { name: userName, email: '', phone: '' }, method: { name: '—' },
        createdAt: order.created_at,
      }));
      window.open('/invoice', '_blank');
      return;
    }
  }

  // 3. Standalone FnB invoice — each item as its own line
  const fnbDisc = parseFnbDiscount(order.note);
  localStorage.setItem('ks_order', JSON.stringify({
    id: order.code,
    orderItems: order.items.map(i => ({
      cat: 'Food & Beverage', title: i.name, variantName: '', qty: i.qty, price: i.price * i.qty, discount: 0,
    })),
    adminFee: 0,
    discount: fnbDisc?.amount ?? 0, coupon: fnbDisc?.code ?? '',
    total: order.total,
    paymentStatus: order.status === 'paid' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'pending',
    buyer: { name: userName, email: '', phone: '' }, method: { name: '—' },
    createdAt: order.created_at,
  }));
  window.open('/invoice', '_blank');
}

function openBizInvoice(order: UserBizOrderApi, userName: string, all: AllOrders) {
  // 1. Linked to CW booking → open combined CW invoice
  const linkedCw = parseLinkedCw(order.note);
  if (linkedCw) {
    const cwOrder = all.cw.find(o => o.id === linkedCw);
    if (cwOrder) { openCwInvoice(cwOrder, userName); return; }
  }

  // 2. Part of a group → combine all group orders (FnB+Biz or Biz+Biz)
  const groupId = parseGroup(order.note);
  if (groupId) {
    const groupFnb = all.fnb.filter(f => f.note?.includes(`[Group:${groupId}]`));
    const groupBiz = all.biz.filter(b => b.note?.includes(`[Group:${groupId}]`));
    if (groupFnb.length > 0 || groupBiz.length > 1) {
      const fnbDisc  = groupFnb.length > 0 ? parseFnbDiscount(groupFnb[0].note) : null;
      const fnbItems = groupFnb.flatMap(f => f.items.map(i => ({
        cat: 'Food & Beverage', title: i.name, variantName: '', qty: i.qty, price: i.price * i.qty, discount: 0,
      })));
      const bizItems = groupBiz.map(b => ({
        cat: 'Business Service', title: b.service?.name ?? 'Layanan Bisnis',
        variantName: b.package_name ?? '', qty: 1, price: b.price, discount: b.discount_amount,
      }));
      const fnbNet = groupFnb.reduce((s, f) => s + f.total, 0);
      const bizNet = groupBiz.reduce((s, b) => s + b.price - b.discount_amount, 0);
      localStorage.setItem('ks_order', JSON.stringify({
        id: order.code, orderItems: [...fnbItems, ...bizItems], adminFee: 0,
        discount: fnbDisc?.amount ?? 0, coupon: fnbDisc?.code ?? '',
        total: fnbNet + bizNet,
        paymentStatus: order.status === 'selesai' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'pending',
        buyer: { name: userName, email: '', phone: '' }, method: { name: '—' },
        createdAt: order.created_at,
      }));
      window.open('/invoice', '_blank');
      return;
    }
  }

  // 3. Standalone Biz invoice
  localStorage.setItem('ks_order', JSON.stringify({
    id: order.code,
    orderItems: [{
      cat: 'Business Service', title: order.service?.name ?? 'Layanan Bisnis',
      variantName: order.package_name ?? '', qty: 1, price: order.price, discount: order.discount_amount,
    }],
    adminFee: 0, discount: 0, coupon: '',
    total: order.price - order.discount_amount,
    paymentStatus: order.status === 'selesai' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'pending',
    buyer: { name: userName, email: '', phone: '' }, method: { name: '—' },
    createdAt: order.created_at,
  }));
  window.open('/invoice', '_blank');
}


/* ---- Order card ---- */
function OrderCard({ order, userName }: { order: Order; userName: string }) {
  const cancelled = /batal/i.test(order.statusLabel);
  const done = order.statusStep >= 3 && !cancelled;
  const sc = cancelled ? 'cancel' : done ? 'done' : 'process';

  return (
    <div className="dash-order">
      <div className="dash-order-top">
        <div>
          <div className="dash-order-id">{order.invoiceNo ?? order.id}</div>
          <div className="dash-order-date">{fmtDate(order.createdAt)}</div>
        </div>
        <span className={`dash-order-status ${sc}`}>
          <span className="dot" /> {order.statusLabel}
        </span>
      </div>
      <div className="dash-order-items">
        {order.items.map((it, i) => (
          <div key={i} className="dash-order-line">
            <span className="nm"><b>{it.title}</b> · {it.variantName} × {it.qty}</span>
            <span className="pr">{it.price === 0 ? 'Gratis' : fmt(it.price)}</span>
          </div>
        ))}
      </div>
      {cancelled && (
        <div className="dash-order-cancel-note">Pesanan ini dibatalkan. Dana DP dikembalikan sesuai kebijakan.</div>
      )}
      <div className="dash-order-foot">
        <div className="dash-order-total">
          Total <b>{fmt(order.total)}</b>
        </div>
        <div className="dash-order-actions">
          <button type="button" className="dash-mini-btn" onClick={() => openCwInvoice(order, userName)}>
            <Icon.Download /> Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Settings form ---- */
function SettingsForm({ name, email }: { name: string; email: string }) {
  const [f, setF] = useState({ name, email, phone: '', nik: '', address: '' });
  const [saved, setSaved] = useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <form className="dash-card" onSubmit={save}>
      <div className="dash-card-head"><h3>Data <em>Diri</em></h3></div>
      <div className="dash-form-grid">
        <div className="dash-field">
          <label htmlFor="sf-name">Nama Lengkap</label>
          <input id="sf-name" placeholder="Nama Lengkap" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        </div>
        <div className="dash-field">
          <label htmlFor="sf-nik">NIK</label>
          <input id="sf-nik" value={f.nik} maxLength={16} placeholder="16 digit" onChange={e => setF({ ...f, nik: e.target.value })} />
        </div>
        <div className="dash-field">
          <label htmlFor="sf-email">Email</label>
          <input id="sf-email" type="email" placeholder="email@anda.com" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
        </div>
        <div className="dash-field">
          <label htmlFor="sf-phone">WhatsApp</label>
          <input id="sf-phone" placeholder="08xxxxxxxxxx" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
        </div>
        <div className="dash-field full">
          <label htmlFor="sf-address">Alamat</label>
          <textarea id="sf-address" placeholder="Alamat lengkap Anda" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />
        </div>
      </div>
      <div className="dash-save-row">
        <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
        <span className={`dash-saved-note${saved ? ' show' : ''}`}><CheckSmIcon /> Tersimpan</span>
      </div>
    </form>
  );
}

/* ---- Discount Card ---- */
function DiscountCard({ d }: { d: DiscountPublicApi }) {
  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
  const valueLabel = d.type === 'percentage' ? `${d.value}% OFF` : `Hemat Rp${d.value.toLocaleString('id-ID')}`;
  const bg = d.color || '#6366f1';

  return (
    <div style={{ borderRadius: 14, padding: '18px 20px', background: `linear-gradient(135deg, ${bg}dd, ${bg}77)`, color: '#fff', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 110 }}>
      <div style={{ position: 'absolute', right: -16, top: -16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div>
        <div style={{ fontSize: 10, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Promo Kaspa Space</div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{valueLabel}</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>{d.name}</div>
        {d.description && <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{d.description}</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 14 }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '3px 10px', fontFamily: 'monospace', fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>{d.code}</div>
        <div style={{ fontSize: 10, opacity: 0.75 }}>
          {d.valid_until ? `s/d ${fmtDate(d.valid_until)}` : 'Tanpa batas'}
        </div>
      </div>
    </div>
  );
}

/* ---- Review Modal ---- */
type ReviewTarget =
  | { type: 'biz'; order: UserBizOrderApi }
  | { type: 'fnb'; order: UserFnbOrderApi };

function ReviewModal({ target, onClose, onDone }: {
  target: ReviewTarget;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState('');
  const [hover, setHover]     = useState(0);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const title = target.type === 'biz'
    ? (target.order.service?.name ?? 'Layanan Bisnis')
    : 'Food & Beverage';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const key = target.type === 'biz'
      ? String((target.order as UserBizOrderApi).biz_service_id)
      : (target.order as UserFnbOrderApi).code;
    try {
      await submitReview({
        reviewable_type: target.type,
        reviewable_key:  key,
        rating,
        comment: comment.trim() || undefined,
      });
      onDone();
    } catch (err: any) {
      setError(err?.message ?? 'Gagal mengirim ulasan.');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-head">
          <div>
            <h3>Beri <em>Ulasan</em></h3>
            <p className="panel-sub">{title}</p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Tutup">✕</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Rating</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, color: n <= (hover || rating) ? '#f59e0b' : 'var(--border)', lineHeight: 1, padding: 0 }}
                  onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                >★</button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Komentar (opsional)</label>
            <textarea rows={4} placeholder="Ceritakan pengalaman Anda dengan layanan ini..." value={comment} onChange={e => setComment(e.target.value)} style={{ width: '100%', resize: 'vertical' }} />
          </div>
          {error && <p style={{ color: 'var(--error)', fontSize: 13 }}>{error}</p>}
        </div>
        <div className="modal-foot">
          <div />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !rating}>
              {saving ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---- Biz Order Card ---- */
const BIZ_STATUS: Record<string, string> = { pending: 'Menunggu Konfirmasi', proses: 'Diproses', selesai: 'Selesai', cancelled: 'Dibatalkan' };
const BIZ_STATUS_CLS: Record<string, string> = { pending: 'pending', proses: 'checked-in', selesai: 'paid', cancelled: 'cancelled' };

function BizOrderCard({ order, userName, all, onReview }: { order: UserBizOrderApi; userName: string; all: AllOrders; onReview: (o: UserBizOrderApi) => void }) {
  return (
    <div className="dash-card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{order.service?.name ?? 'Layanan Bisnis'}</div>
          {order.package_name && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Paket: {order.package_name}</div>}
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {order.code} · {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ marginTop: 8, fontWeight: 600 }}>{fmt(order.price - order.discount_amount)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <span className={`status ${BIZ_STATUS_CLS[order.status] ?? 'draft'}`}>{BIZ_STATUS[order.status] ?? order.status}</span>
          <button type="button" className="dash-mini-btn" onClick={() => openBizInvoice(order, userName, all)}>
            <Icon.Download /> Invoice
          </button>
          {order.status === 'selesai' && (
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => onReview(order)}>
              ★ Beri Ulasan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FnbOrderCard({ order, userName, all, onReview }: { order: UserFnbOrderApi; userName: string; all: AllOrders; onReview: (o: UserFnbOrderApi) => void }) {
  const isCancelled = order.status === 'cancelled';
  const statusLabel = order.status === 'paid' ? 'Selesai' : order.status === 'cancelled' ? 'Dibatalkan' : 'Pending';
  const statusCls   = order.status === 'paid' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'pending';
  return (
    <div className="dash-card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Food &amp; Beverage</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {order.items.map(i => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join(', ')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {order.code} · {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ marginTop: 8, fontWeight: 600 }}>{fmt(order.total)}</div>
          {isCancelled && <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>Pesanan dibatalkan.</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <span className={`status ${statusCls}`}>{statusLabel}</span>
          <button type="button" className="dash-mini-btn" onClick={() => openFnbInvoice(order, userName, all)}>
            <Icon.Download /> Invoice
          </button>
          {order.status === 'paid' && (
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => onReview(order)}>
              ★ Beri Ulasan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Login gate ---- */
function DashGate() {
  return (
    <section className="dash-page">
      <div className="container">
        <div className="dash-gate">
          <div className="ic"><Icon.LogOut /></div>
          <h2>Masuk untuk lihat <em>Dashboard</em></h2>
          <p>Dashboard berisi riwayat pesanan, status proses, dan informasi akun Anda.</p>
          <Link className="btn btn-primary" to="/masuk">Masuk / Daftar <Icon.Arrow /></Link>
        </div>
      </div>
    </section>
  );
}

/* ---- Main Page ---- */
type TabKey = 'overview' | 'orders' | 'vouchers' | 'settings';

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const paramTab = searchParams.get('tab');
  const [tab, setTab] = useState<TabKey>(
    ['overview', 'orders', 'vouchers', 'settings'].includes(paramTab ?? '') ? paramTab as TabKey : 'overview'
  );

  const { data: apiBookings, loading: bookingsLoading } = useApiGet<BookingApi[]>(fetchUserBookings, [user?.id]);
  const { data: bizOrders, loading: bizLoading, refetch: refetchBiz } = useApiGet<UserBizOrderApi[]>(fetchUserBizOrders, [user?.id]);
  const { data: fnbOrders, loading: fnbLoading, refetch: refetchFnb } = useApiGet<UserFnbOrderApi[]>(fetchUserFnbOrders, [user?.id]);
  const { data: discounts } = useApiGet<DiscountPublicApi[]>(fetchActiveDiscounts);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);

  if (!user) return <DashGate />;

  const orders       = (apiBookings ?? []).map(bookingToOrder);
  const bizList      = bizOrders ?? [];
  const fnbList      = fnbOrders ?? [];
  const activeCw     = orders.filter(o => o.statusStep === 2).length;
  const activeFnb    = fnbList.filter(o => o.status === 'pending').length;
  const activeBiz    = bizList.filter(o => o.status === 'proses').length;
  const activeOrders = activeCw + activeFnb + activeBiz;
  const totalOrders  = orders.length + bizList.length + fnbList.length;

  // Unified recent items for overview tab (mixed, sorted by date)
  const recentAll = [
    ...orders.map(o => ({ key: o.id, node: <OrderCard key={o.id} order={o} userName={user?.name ?? ''} />, at: o.createdAt })),
    ...fnbList.map(o => ({ key: `fnb-${o.id}`, node: <FnbOrderCard key={`fnb-${o.id}`} order={o} userName={user?.name ?? ''} all={{ cw: orders, fnb: fnbList, biz: bizList }} onReview={(fo) => setReviewTarget({ type: 'fnb', order: fo })} />, at: o.created_at })),
    ...bizList.map(o => ({ key: `biz-${o.id}`, node: <BizOrderCard key={`biz-${o.id}`} order={o} userName={user?.name ?? ''} all={{ cw: orders, fnb: fnbList, biz: bizList }} onReview={(bo) => setReviewTarget({ type: 'biz', order: bo })} />, at: o.created_at })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 3);

  const NAV: { id: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',  label: 'Ringkasan',       icon: <Icon.Grid />    },
    { id: 'orders',    label: 'Pesanan Saya',    icon: <Icon.Receipt />, badge: totalOrders },
    { id: 'vouchers',  label: 'Diskon & Voucher', icon: <Icon.Ticket />  },
    { id: 'settings',  label: 'Pengaturan',      icon: <Icon.Cog />     },
  ];

  return (
    <div>
      <section className="dash-page">
        <div className="container">

          {/* Hero */}
          <div className="dash-hero">
            <div className="dash-hero-top">
              <div className="dash-hero-av">{initials(user.name)}</div>
              <div className="dash-hero-greet">
                <div className="hi">Dashboard Member</div>
                <h1>Halo, <em>{user.name.split(' ')[0]}</em></h1>
              </div>
            </div>
            <div className="dash-hero-stats">
              <div className="dash-hero-stat"><div className="v">{totalOrders}</div><div className="l">Total pesanan</div></div>
              <div className="dash-hero-stat"><div className="v">{activeOrders}</div><div className="l">Sedang diproses</div></div>
            </div>
          </div>

          <div className="dash-layout">
            {/* Sidebar nav */}
            <nav className="dash-nav">
              {NAV.map(n => (
                <button key={n.id} type="button" className={`dash-nav-item${tab === n.id ? ' active' : ''}`} onClick={() => setTab(n.id)}>
                  {n.icon} {n.label}
                  {(n.badge ?? 0) > 0 && <span className="badge">{n.badge}</span>}
                </button>
              ))}
              <div className="dash-nav-sep" />
              <Link className="dash-nav-item" to="/masuk">
                <Icon.LogOut /> Keluar
              </Link>
            </nav>

            {/* Main content */}
            <div className="dash-main">

              {tab === 'overview' && (
                <>
                  <div className="dash-stat-grid">
                    <div className="dash-stat">
                      <div className="ic"><Icon.Bag /></div>
                      <div className="v">{totalOrders}</div>
                      <div className="l">Total pesanan</div>
                    </div>
                    <div className="dash-stat">
                      <div className="ic"><Icon.Receipt /></div>
                      <div className="v">{activeOrders}</div>
                      <div className="l">Sedang diproses</div>
                    </div>
                  </div>

                  {discounts && discounts.length > 0 && (
                    <div className="dash-card">
                      <div className="dash-card-head">
                        <h3>Promo <em>Tersedia</em></h3>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Gunakan kode saat checkout</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 4 }}>
                        {discounts.map(d => <DiscountCard key={d.id} d={d} />)}
                      </div>
                    </div>
                  )}

                  <div className="dash-card">
                    <div className="dash-card-head">
                      <h3>Pesanan <em>Terbaru</em></h3>
                      <a href="#" onClick={e => { e.preventDefault(); setTab('orders'); }}>Lihat semua →</a>
                    </div>
                    {(bookingsLoading || fnbLoading || bizLoading)
                      ? <p style={{ color: 'var(--text-tertiary)', padding: '16px 0' }}>Memuat pesanan...</p>
                      : recentAll.length === 0
                        ? (
                          <div className="dash-empty">
                            <h4>Belum ada pesanan</h4>
                            <p>Mulai pesan ruang kerja, menu kafe, atau layanan bisnis.</p>
                            <Link className="btn btn-primary" to="/coworking">Mulai Belanja <Icon.Arrow /></Link>
                          </div>
                        )
                        : recentAll.map(r => r.node)
                    }
                  </div>
                </>
              )}

              {tab === 'orders' && (
                <>
                  <h2 className="dash-section-title">Pesanan <em>Saya</em></h2>
                  <p className="dash-section-sub">Lacak status setiap pesanan dari dipesan hingga selesai.</p>

                  {/* Coworking bookings */}
                  {bookingsLoading
                    ? <p style={{ color: 'var(--text-tertiary)' }}>Memuat pesanan...</p>
                    : orders.length > 0
                      ? orders.map(o => <OrderCard key={o.id} order={o} userName={user.name} />)
                      : null
                  }

                  {/* FnB orders */}
                  {!fnbLoading && fnbList.length > 0 && (
                    <>
                      <h3 className="dash-section-title" style={{ marginTop: 24, fontSize: 16 }}>Food &amp; <em>Beverage</em></h3>
                      {fnbList.map(o => <FnbOrderCard key={o.id} order={o} userName={user?.name ?? ''} all={{ cw: orders, fnb: fnbList, biz: bizList }} onReview={(fo) => setReviewTarget({ type: 'fnb', order: fo })} />)}
                    </>
                  )}

                  {/* Biz orders */}
                  {!bizLoading && bizList.length > 0 && (
                    <>
                      <h3 className="dash-section-title" style={{ marginTop: 24, fontSize: 16 }}>Layanan <em>Bisnis</em></h3>
                      {bizList.map(o => (
                        <BizOrderCard key={o.id} order={o} userName={user?.name ?? ''} all={{ cw: orders, fnb: fnbList, biz: bizList }} onReview={(bo) => setReviewTarget({ type: 'biz', order: bo })} />
                      ))}
                    </>
                  )}

                  {!bookingsLoading && !fnbLoading && !bizLoading && orders.length === 0 && fnbList.length === 0 && bizList.length === 0 && (
                    <div className="dash-card">
                      <div className="dash-empty">
                        <h4>Belum ada pesanan</h4>
                        <p>Pesanan yang Anda buat akan muncul di sini.</p>
                        <Link className="btn btn-primary" to="/coworking">Mulai Belanja <Icon.Arrow /></Link>
                      </div>
                    </div>
                  )}
                </>
              )}

              {tab === 'vouchers' && (
                <>
                  <h2 className="dash-section-title">Diskon <em>&amp; Voucher</em></h2>
                  <p className="dash-section-sub">Promo aktif yang bisa digunakan saat checkout.</p>
                  {discounts && discounts.length > 0
                    ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                        {discounts.map(d => <DiscountCard key={d.id} d={d} />)}
                      </div>
                    )
                    : (
                      <div className="dash-card">
                        <div className="dash-empty">
                          <h4>Belum ada promo</h4>
                          <p>Pantau terus halaman ini untuk promo dan diskon terbaru.</p>
                        </div>
                      </div>
                    )
                  }
                </>
              )}

              {tab === 'settings' && (
                <>
                  <h2 className="dash-section-title">Pengaturan <em>Akun</em></h2>
                  <p className="dash-section-sub">Perbarui data diri Anda. Data ini dipakai saat checkout & untuk dokumen resmi.</p>
                  <SettingsForm name={user.name} email={user.email} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <a className="wa-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>

      {reviewTarget && (
        <ReviewModal
          target={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onDone={() => { setReviewTarget(null); reviewTarget.type === 'biz' ? refetchBiz() : refetchFnb(); }}
        />
      )}
    </div>
  );
}
