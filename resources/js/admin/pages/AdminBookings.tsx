import { useState, useMemo, useRef, useEffect } from 'react';
import { AdminIcon } from '../AdminIcons';
import { useApiGet } from '../../hooks/useApiGet';
import {
  fetchAdminBookings, updateBookingStatus, ApiBooking,
  fetchFnbOrders, updateFnbOrderStatus, ApiFnbOrder,
  fetchBizOrders, updateBizOrderStatus, ApiBizOrder,
} from '../../lib/adminApi';
import { trackBooking } from '../../lib/publicApi';

const fmt = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');
const fmtDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (s: string) => new Date(s).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const extractPaymentMethod = (notes: string | null): string => {
  if (!notes) return '—';
  const m = notes.match(/\[Pembayaran:\s*([^\]]+)\]/);
  return m ? m[1].trim() : '—';
};

const extractCwDiscount = (notes: string | null): { code: string; amount: number } | null => {
  if (!notes) return null;
  const m = notes.match(/\[Diskon:([^,]+),Rp([\d.]+)\]/);
  if (!m) return null;
  return { code: m[1], amount: parseInt(m[2].replace(/\./g, ''), 10) };
};

const BOOKING_STATUS_LABEL: Record<string, string> = {
  paid: 'Paid', pending: 'Pending', 'checked-in': 'Checked In', 'checked-out': 'Checked Out', cancelled: 'Cancelled',
};
const FNB_STATUS_LABEL: Record<string, string> = { paid: 'Paid', pending: 'Pending', cancelled: 'Cancelled' };
const BIZ_STATUS_LABEL: Record<string, string> = { pending: 'Pending', proses: 'Proses', selesai: 'Selesai', cancelled: 'Cancelled' };

type SvgP = React.SVGProps<SVGSVGElement>;
const PrintIcon = (p: SvgP) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;

/* ── Confirm dialog ──────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal modal-confirm" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Konfirmasi <em>Aksi</em></h3>
          <button type="button" className="close" title="Tutup" onClick={onCancel}><AdminIcon.X /></button>
        </div>
        <div className="modal-body confirm-body">
          <p>{message}</p>
        </div>
        <div className="modal-foot confirm-foot">
          <button type="button" className="btn-adm" onClick={onCancel}>Batal</button>
          <button type="button" className="btn-adm primary" onClick={onConfirm}>Ya, Lanjutkan</button>
        </div>
      </div>
    </div>
  );
}

/* ── Status select ───────────────────────────────────────── */
type StatusOption = { value: string; label: string; };
function StatusSelect({ value, options, onChange }: { value: string; options: StatusOption[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (open && menuRef.current && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      menuRef.current.style.top = `${r.bottom + 4}px`;
      menuRef.current.style.left = `${r.left}px`;
    }
  }, [open]);

  return (
    <div className="ss-wrap" ref={wrapRef}>
      <button ref={btnRef} type="button" className={`ss-pill ss-pill--${value}`} onClick={() => setOpen(o => !o)}>
        <span className="ss-dot" />
        {current?.label ?? value}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>
      {open && (
        <div className="ss-menu" ref={menuRef}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`ss-item ss-item--${opt.value}${opt.value === value ? ' active' : ''}`}
              onClick={() => { setOpen(false); if (opt.value !== value) onChange(opt.value); }}
            >
              <span className="ss-dot" />{opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Shared info-row ─────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

/* ── Coworking detail modal ──────────────────────────────── */
function BookingDetailModal({ b, onClose, onStatusChange }: { b: ApiBooking; onClose: () => void; onStatusChange: () => void }) {
  const doStatus = async (status: string) => {
    await updateBookingStatus(b.id, status);
    onStatusChange();
    onClose();
  };

  const parseBundled = (notes: string | null) => {
    if (!notes) return [];
    const m = notes.match(/\[BundledItems:([A-Za-z0-9+/=]+)\]/);
    if (!m) return [];
    try { return JSON.parse(atob(m[1])) as unknown[]; } catch { return []; }
  };

  const openInvoice = () => {
    const bundledItems = parseBundled(b.notes);
    localStorage.setItem('ks_booking_result', JSON.stringify({
      code: b.code,
      productType: b.product_type_key,
      productName: b.room?.title ?? b.product_type_key,
      room: b.room,
      startTime: b.start_time,
      endTime: b.end_time,
      qty: b.qty_desks,
      totalPrice: b.total_price,
      adminFee: b.admin_fee,
      status: b.status,
      notes: b.notes,
      otherItems: bundledItems,
      guestName: b.guest_name ?? b.user?.name ?? 'Pelanggan',
      guestEmail: b.guest_email ?? b.user?.email ?? '',
      guestPhone: b.guest_phone ?? '',
      createdAt: b.created_at,
      paidAt: b.paid_at,
      invoiceNo: b.invoice_no,
    }));
    window.open('/invoice', '_blank');
  };

  const cwDiscount = extractCwDiscount(b.notes);
  const cleanCwNotes = b.notes
    ? b.notes.replace(/\[Pembayaran:[^\]]+\]/g, '').replace(/\[Diskon:[^\]]+\]/g, '').replace(/\[BundledItems:[^\]]+\]/g, '').trim() || null
    : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Detail <em>Booking</em></h3>
          <button type="button" className="close" title="Tutup" onClick={onClose}><AdminIcon.X /></button>
        </div>
        <div className="modal-body">
          <div className="detail-code-bar">
            <span className="detail-code">{b.code}</span>
            <span className={`status ${b.status}`}>{BOOKING_STATUS_LABEL[b.status] ?? b.status}</span>
          </div>

          <div className="detail-grid">
            <InfoRow label="Produk" value={b.product_type_key} />
            <InfoRow label="Ruangan" value={b.room ? `${b.room.title} — ${b.room.location}` : '—'} />
            <InfoRow label="Tanggal Mulai" value={fmtDate(b.booking_date)} />
            {b.end_date && <InfoRow label="Tanggal Selesai" value={fmtDate(b.end_date)} />}
            <InfoRow label="Waktu" value={b.start_time ? `${b.start_time} – ${b.end_time}` : '—'} />
            <InfoRow label="Jumlah Meja" value={b.qty_desks} />
            <InfoRow label="Member" value={
              b.user ? `${b.user.name} (${b.user.email})` :
              b.guest_name ? `${b.guest_name}${b.guest_email ? ` · ${b.guest_email}` : ''}${b.guest_phone ? ` · ${b.guest_phone}` : ''}` : '—'
            } />
            <InfoRow label="Metode Bayar" value={extractPaymentMethod(b.notes)} />
            {cwDiscount && <InfoRow label="Harga Dasar" value={fmt(b.total_price + cwDiscount.amount)} />}
            {cwDiscount && <InfoRow label="Diskon" value={<span className="text-success">−{fmt(cwDiscount.amount)} ({cwDiscount.code})</span>} />}
            <InfoRow label={cwDiscount ? 'Subtotal' : 'Subtotal'} value={fmt(b.total_price)} />
            {b.admin_fee > 0 && <InfoRow label="Biaya Admin" value={fmt(b.admin_fee)} />}
            <InfoRow label="Total" value={<strong>{fmt(b.total_price + b.admin_fee)}</strong>} />
            <InfoRow label="Dibuat" value={fmtDateTime(b.created_at)} />
            {cleanCwNotes && <InfoRow label="Catatan" value={cleanCwNotes} />}
          </div>

          {b.documents && b.documents.length > 0 && (
            <div className="detail-docs" style={{ marginTop: 16 }}>
              <div className="detail-items-title">Dokumen Pendukung</div>
              {b.documents.map((doc, i) => (
                <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="detail-doc-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  {doc.name}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <div className="detail-actions">
            {b.status === 'pending' && (
              <button type="button" className="btn-adm primary" onClick={() => doStatus('paid')}>Konfirmasi Paid</button>
            )}
            {(b.status === 'paid' || b.status === 'pending') && (
              <button type="button" className="btn-adm" onClick={() => doStatus('checked-in')}>Check In</button>
            )}
            {b.status === 'checked-in' && (
              <button type="button" className="btn-adm primary" onClick={() => doStatus('checked-out')}>Check Out</button>
            )}
            {b.status !== 'cancelled' && b.status !== 'checked-out' && (
              <button type="button" className="btn-adm danger" onClick={() => doStatus('cancelled')}>Batalkan</button>
            )}
          </div>
          <button type="button" className="btn-adm inv" onClick={openInvoice}>
            <PrintIcon /> Lihat / Unduh Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── FnB detail modal ────────────────────────────────────── */
function parseFnbDiscount(note: string | null): { code: string; amount: number } | null {
  if (!note) return null;
  const m = note.match(/\[Diskon:([^,]+),Rp([\d.]+)\]/);
  if (!m) return null;
  return { code: m[1], amount: parseInt(m[2].replace(/\./g, ''), 10) };
}

function FnbDetailModal({ o, onClose, onStatusChange }: { o: ApiFnbOrder; onClose: () => void; onStatusChange: () => void }) {
  const doStatus = async (status: string) => {
    await updateFnbOrderStatus(o.id, status);
    onStatusChange();
    onClose();
  };

  const discount  = parseFnbDiscount(o.note);
  const subtotal  = discount ? o.total + discount.amount : o.total;
  const cleanNote = o.note ? o.note.replace(/\[Diskon:[^\]]+\]/g, '').trim() : null;

  const openInvoice = async () => {
    const linkedCwMatch = o.note?.match(/\[LinkedCW:([A-Z0-9-]+)\]/);
    if (linkedCwMatch) {
      try {
        const track = await trackBooking(linkedCwMatch[1]);
        localStorage.setItem('ks_booking_result', JSON.stringify({
          code: track.code, invoiceNo: track.invoice_no,
          productType: track.product_type_key,
          productName: track.room?.title ?? track.product_type_key,
          room: track.room, startTime: track.start_time, endTime: track.end_time,
          qty: track.qty_desks, totalPrice: track.total_price, adminFee: track.admin_fee,
          status: track.status, notes: track.notes,
          guestName: o.member_name, createdAt: track.created_at,
        }));
        window.open('/invoice', '_blank');
        return;
      } catch { /* fallthrough ke invoice FnB biasa */ }
    }
    localStorage.setItem('ks_order', JSON.stringify({
      id: o.code,
      orderItems: o.items.map(i => ({
        cat: 'Food & Beverage', title: i.name, variantName: '', qty: i.qty,
        price: i.price * i.qty, discount: 0,
      })),
      adminFee: 0,
      discount: discount?.amount ?? 0,
      coupon: discount?.code ?? '',
      total: o.total,
      paymentStatus: o.status === 'paid' ? 'paid' : o.status === 'cancelled' ? 'cancelled' : 'pending',
      buyer: { name: o.member_name, email: '', phone: '' },
      method: { name: '—' },
      createdAt: o.created_at,
    }));
    window.open('/invoice', '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Detail <em>F&amp;B Order</em></h3>
          <button type="button" className="close" title="Tutup" onClick={onClose}><AdminIcon.X /></button>
        </div>
        <div className="modal-body">
          <div className="detail-code-bar">
            <span className="detail-code">{o.code}</span>
            <span className={`status ${o.status}`}>{FNB_STATUS_LABEL[o.status] ?? o.status}</span>
          </div>

          <div className="detail-grid">
            <InfoRow label="Member" value={o.member_name} />
            <InfoRow label="Tanggal" value={fmtDate(o.booking_date)} />
            <InfoRow label="Dibuat" value={fmtDateTime(o.created_at)} />
            {cleanNote && <InfoRow label="Catatan" value={cleanNote} />}
          </div>

          <div className="detail-items-title">Item Pesanan</div>
          <table className="detail-items-table">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {o.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td className="tc">{item.qty}</td>
                  <td className="tr">{fmt(item.price)}</td>
                  <td className="tr">{fmt(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {discount && <tr><td colSpan={3} className="tr">Subtotal</td><td className="tr">{fmt(subtotal)}</td></tr>}
              {discount && <tr><td colSpan={3} className="tr" style={{ color: 'var(--success)' }}>Diskon ({discount.code})</td><td className="tr" style={{ color: 'var(--success)' }}>−{fmt(discount.amount)}</td></tr>}
              <tr><td colSpan={3} className="tr"><strong>Total</strong></td><td className="tr"><strong>{fmt(o.total)}</strong></td></tr>
            </tfoot>
          </table>
        </div>
        <div className="modal-foot">
          <div className="detail-actions">
            {o.status === 'pending' && (
              <button type="button" className="btn-adm primary" onClick={() => doStatus('paid')}>Konfirmasi Paid</button>
            )}
            {o.status !== 'cancelled' && (
              <button type="button" className="btn-adm danger" onClick={() => doStatus('cancelled')}>Batalkan</button>
            )}
          </div>
          <button type="button" className="btn-adm inv" onClick={openInvoice}>
            <PrintIcon /> Lihat / Unduh Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Business Service detail modal ───────────────────────── */
function BizDetailModal({ o, onClose, onStatusChange }: { o: ApiBizOrder; onClose: () => void; onStatusChange: () => void }) {
  const doStatus = async (status: string) => {
    await updateBizOrderStatus(o.id, status);
    onStatusChange();
    onClose();
  };

  const openInvoice = async () => {
    const linkedCwMatch = o.note?.match(/\[LinkedCW:([A-Z0-9-]+)\]/);
    if (linkedCwMatch) {
      try {
        const track = await trackBooking(linkedCwMatch[1]);
        localStorage.setItem('ks_booking_result', JSON.stringify({
          code: track.code, invoiceNo: track.invoice_no,
          productType: track.product_type_key,
          productName: track.room?.title ?? track.product_type_key,
          room: track.room, startTime: track.start_time, endTime: track.end_time,
          qty: track.qty_desks, totalPrice: track.total_price, adminFee: track.admin_fee,
          status: track.status, notes: track.notes,
          guestName: o.member_name, createdAt: track.created_at,
        }));
        window.open('/invoice', '_blank');
        return;
      } catch { /* fallthrough ke invoice Biz biasa */ }
    }
    localStorage.setItem('ks_order', JSON.stringify({
      id: o.code,
      product: { cat: 'Business Service', title: o.service?.name ?? 'Layanan Bisnis' },
      variant: { name: o.package_name ?? 'Standar' },
      subtotal: o.price,
      adminFee: 0,
      discount: o.discount_amount,
      total: o.price - o.discount_amount,
      qty: 1,
      paymentStatus: o.status === 'selesai' ? 'paid' : o.status === 'cancelled' ? 'cancelled' : 'pending',
      coupon: o.discount_code ?? '',
      buyer: { name: o.member_name, email: o.member_email ?? '', phone: o.member_phone ?? '' },
      method: { name: '—' },
      createdAt: o.created_at,
    }));
    window.open('/invoice', '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Detail <em>Business Service</em></h3>
          <button type="button" className="close" title="Tutup" onClick={onClose}><AdminIcon.X /></button>
        </div>
        <div className="modal-body">
          <div className="detail-code-bar">
            <span className="detail-code">{o.code}</span>
            <span className={`status ${o.status}`}>{BIZ_STATUS_LABEL[o.status] ?? o.status}</span>
          </div>

          <div className="detail-grid">
            <InfoRow label="Layanan" value={o.service?.name ?? '—'} />
            {o.package_name && <InfoRow label="Paket" value={o.package_name} />}
            <InfoRow label="Pemesan" value={o.member_name} />
            {o.member_email && <InfoRow label="Email" value={o.member_email} />}
            {o.member_phone && <InfoRow label="Telepon" value={o.member_phone} />}
            <InfoRow label="Harga" value={fmt(o.price)} />
            {o.discount_amount > 0 && (
              <InfoRow label="Diskon" value={<span className="text-success">−{fmt(o.discount_amount)}{o.discount_code ? ` (${o.discount_code})` : ''}</span>} />
            )}
            <InfoRow label="Total" value={<strong>{fmt(o.price - o.discount_amount)}</strong>} />
            <InfoRow label="Dibuat" value={fmtDateTime(o.created_at)} />
            {o.note && <InfoRow label="Catatan" value={o.note} />}
          </div>

          {o.documents && o.documents.length > 0 && (
            <div className="detail-docs">
              <div className="detail-items-title">Dokumen</div>
              {o.documents.map((doc, i) => (
                <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="detail-doc-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  {doc.name}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <div className="detail-actions">
            {o.status === 'pending' && (
              <button type="button" className="btn-adm primary" onClick={() => doStatus('proses')}>Konfirmasi → Proses</button>
            )}
            {o.status === 'proses' && (
              <button type="button" className="btn-adm primary" onClick={() => doStatus('selesai')}>Tandai Selesai</button>
            )}
            {o.status !== 'cancelled' && o.status !== 'selesai' && (
              <button type="button" className="btn-adm danger" onClick={() => doStatus('cancelled')}>Batalkan</button>
            )}
          </div>
          <button type="button" className="btn-adm inv" onClick={openInvoice}>
            <PrintIcon /> Lihat / Unduh Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Coworking tab ───────────────────────────────────────── */
function CoworkingTab() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [detail, setDetail]       = useState<ApiBooking | null>(null);
  const [confirm, setConfirm]     = useState<{ id: number; status: string; label: string } | null>(null);
  const { data: res, loading, refetch } = useApiGet(() => fetchAdminBookings());
  const bookings: ApiBooking[] = res?.data ?? [];

  const filtered = useMemo(() => bookings.filter(b => {
    if (statusFilter !== 'Semua' && b.status !== statusFilter) return false;
    if (search && !`${b.code} ${b.user?.name ?? ''} ${b.room?.title ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [bookings, search, statusFilter]);

  const doStatus = async (id: number, status: string) => {
    await updateBookingStatus(id, status);
    refetch();
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    await doStatus(confirm.id, confirm.status);
    setConfirm(null);
  };

  return (
    <>
      <div className="admin-toolbar">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input className="search" placeholder="Cari kode, member, atau ruangan..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select aria-label="Filter status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>Semua</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? <p className="panel-sub">Memuat...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Kode</th><th>Produk</th><th>Akun</th><th>Metode Bayar</th><th>Tanggal</th><th>Waktu</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="row-clickable" onClick={() => setDetail(b)}>
                  <td className="col-title col-num">{b.code}</td>
                  <td>
                    <div className="cell-media-meta">
                      <span className="t">{b.product_type_key}</span>
                      {b.room && <span className="s">{b.room.title}</span>}
                    </div>
                  </td>
                  <td>
                    {b.user
                      ? <div className="cell-media-meta"><span className="t">{b.user.name}</span><span className="s">{b.user.email}</span></div>
                      : b.guest_name
                      ? <div className="cell-media-meta"><span className="t">{b.guest_name}</span><span className="s">{b.guest_email ?? 'Tamu'}</span></div>
                      : '—'}
                  </td>
                  <td>{extractPaymentMethod(b.notes)}</td>
                  <td>{fmtDate(b.booking_date)}</td>
                  <td className="col-num">{b.start_time ? `${b.start_time}–${b.end_time}` : '—'}</td>
                  <td className="col-price">{fmt(b.total_price)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <StatusSelect
                      value={b.status}
                      options={[
                        { value: 'pending',      label: 'Pending' },
                        { value: 'paid',         label: 'Paid' },
                        { value: 'checked-in',   label: 'Checked In' },
                        { value: 'checked-out',  label: 'Checked Out' },
                        { value: 'cancelled',    label: 'Cancelled' },
                      ]}
                      onChange={s => {
                        const labels: Record<string, string> = {
                          pending:      `Ubah status ${b.code} ke Pending?`,
                          paid:         `Konfirmasi ${b.code} sebagai Paid?`,
                          'checked-in': `Check In booking ${b.code}?`,
                          'checked-out':`Check Out booking ${b.code}?`,
                          cancelled:    `Batalkan booking ${b.code}? Tindakan ini tidak bisa diurungkan.`,
                        };
                        setConfirm({ id: b.id, status: s, label: labels[s] ?? `Ubah status ke ${s}?` });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="panel-sub order-summary">Menampilkan <strong className="count-hl">{filtered.length}</strong> dari {bookings.length} booking</p>

      {detail && (
        <BookingDetailModal
          b={detail}
          onClose={() => setDetail(null)}
          onStatusChange={() => { refetch(); setDetail(null); }}
        />
      )}
      {confirm && (
        <ConfirmDialog
          message={confirm.label}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}

/* ── FnB tab ─────────────────────────────────────────────── */
function FnbTab() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [detail, setDetail]       = useState<ApiFnbOrder | null>(null);
  const [confirm, setConfirm]     = useState<{ id: number; status: string; label: string } | null>(null);
  const { data: res, loading, refetch } = useApiGet(() => fetchFnbOrders());
  const orders: ApiFnbOrder[] = res?.data ?? [];

  const filtered = useMemo(() => orders.filter(o => {
    if (statusFilter !== 'Semua' && o.status !== statusFilter) return false;
    if (search && !`${o.code} ${o.member_name}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [orders, search, statusFilter]);

  const doStatus = async (id: number, status: string) => { await updateFnbOrderStatus(id, status); refetch(); };
  const handleConfirm = async () => { if (!confirm) return; await doStatus(confirm.id, confirm.status); setConfirm(null); };

  return (
    <>
      <div className="admin-toolbar">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input className="search" placeholder="Cari kode atau member..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select aria-label="Filter status FnB" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>Semua</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? <p className="panel-sub">Memuat...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Kode</th><th>Item Pesanan</th><th>Member</th><th>Tanggal</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="row-clickable" onClick={() => setDetail(o)}>
                  <td className="col-title col-num">{o.code}</td>
                  <td>
                    <div className="cell-media-meta">
                      <span className="t">{o.items.map(i => i.name).join(', ')}</span>
                      <span className="s">{o.items.map(i => `${i.name} ×${i.qty}`).join(' · ')}</span>
                    </div>
                  </td>
                  <td>{o.member_name}</td>
                  <td>{fmtDate(o.booking_date)}</td>
                  <td className="col-price">{fmt(o.total)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <StatusSelect
                      value={o.status}
                      options={[
                        { value: 'pending',   label: 'Pending' },
                        { value: 'paid',      label: 'Paid' },
                        { value: 'cancelled', label: 'Cancelled' },
                      ]}
                      onChange={s => {
                        const labels: Record<string, string> = {
                          pending:   `Ubah status ${o.code} ke Pending?`,
                          paid:      `Konfirmasi order ${o.code} sebagai Paid?`,
                          cancelled: `Batalkan order ${o.code}? Tindakan ini tidak bisa diurungkan.`,
                        };
                        setConfirm({ id: o.id, status: s, label: labels[s] ?? `Ubah status ke ${s}?` });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="panel-sub order-summary">Menampilkan <strong className="count-hl">{filtered.length}</strong> dari {orders.length} pesanan</p>

      {detail && (
        <FnbDetailModal
          o={detail}
          onClose={() => setDetail(null)}
          onStatusChange={() => { refetch(); setDetail(null); }}
        />
      )}
      {confirm && (
        <ConfirmDialog
          message={confirm.label}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}

/* ── Business Service tab ────────────────────────────────── */
function BizTab() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [detail, setDetail]       = useState<ApiBizOrder | null>(null);
  const [confirm, setConfirm]     = useState<{ id: number; status: string; label: string } | null>(null);
  const { data: res, loading, refetch } = useApiGet(() => fetchBizOrders());
  const orders: ApiBizOrder[] = res?.data ?? [];

  const filtered = useMemo(() => orders.filter(o => {
    if (statusFilter !== 'Semua' && o.status !== statusFilter) return false;
    if (search && !`${o.code} ${o.member_name} ${o.service?.name ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [orders, search, statusFilter]);

  const doStatus = async (id: number, status: string) => { await updateBizOrderStatus(id, status); refetch(); };
  const handleConfirm = async () => { if (!confirm) return; await doStatus(confirm.id, confirm.status); setConfirm(null); };

  return (
    <>
      <div className="admin-toolbar">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input className="search" placeholder="Cari kode, member, atau layanan..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select aria-label="Filter status Business" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>Semua</option>
          <option value="pending">Pending</option>
          <option value="proses">Proses</option>
          <option value="selesai">Selesai</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? <p className="panel-sub">Memuat...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kode</th><th>Layanan / Paket</th><th>Pemesan</th>
                <th>Harga</th><th>Dokumen</th><th>Tanggal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} className="row-clickable" onClick={() => setDetail(o)}>
                  <td className="col-title col-num">{o.code}</td>
                  <td>
                    <div className="cell-media-meta">
                      <span className="t">{o.service?.name ?? '—'}</span>
                      {o.package_name && <span className="s">Paket: {o.package_name}</span>}
                      {o.note && <span className="s cell-note">{o.note}</span>}
                    </div>
                  </td>
                  <td>
                    <div className="cell-media-meta">
                      <span className="t">{o.member_name}</span>
                      {o.member_email && <span className="s">{o.member_email}</span>}
                      {o.member_phone && <span className="s">{o.member_phone}</span>}
                    </div>
                  </td>
                  <td className="col-price">
                    {fmt(o.price)}
                    {o.discount_amount > 0 && (
                      <div className="booking-discount">−{fmt(o.discount_amount)} ({o.discount_code})</div>
                    )}
                  </td>
                  <td>
                    {o.documents?.length ? (
                      <div className="doc-list">
                        {o.documents.map((doc, i) => (
                          <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="doc-link"
                            title={`Unduh ${doc.name}`}
                            onClick={e => e.stopPropagation()}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            {doc.name}
                          </a>
                        ))}
                      </div>
                    ) : <span className="doc-empty">—</span>}
                  </td>
                  <td>{fmtDate(o.created_at)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <StatusSelect
                      value={o.status}
                      options={[
                        { value: 'pending',   label: 'Pending' },
                        { value: 'proses',    label: 'Proses' },
                        { value: 'selesai',   label: 'Selesai' },
                        { value: 'cancelled', label: 'Cancelled' },
                      ]}
                      onChange={s => {
                        const labels: Record<string, string> = {
                          pending:   `Ubah status ${o.code} ke Pending?`,
                          proses:    `Konfirmasi order ${o.code} masuk ke tahap Proses?`,
                          selesai:   `Tandai order ${o.code} sebagai Selesai?`,
                          cancelled: `Batalkan order ${o.code}? Tindakan ini tidak bisa diurungkan.`,
                        };
                        setConfirm({ id: o.id, status: s, label: labels[s] ?? `Ubah status ke ${s}?` });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="panel-sub order-summary">Menampilkan <strong className="count-hl">{filtered.length}</strong> dari {orders.length} pesanan</p>

      {detail && (
        <BizDetailModal
          o={detail}
          onClose={() => setDetail(null)}
          onStatusChange={() => { refetch(); setDetail(null); }}
        />
      )}
      {confirm && (
        <ConfirmDialog
          message={confirm.label}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}

type TabKey = 'coworking' | 'fnb' | 'biz';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'coworking', label: 'Coworking' },
  { key: 'fnb',       label: 'Food & Beverage' },
  { key: 'biz',       label: 'Business Service' },
];

export default function AdminBookings() {
  const [tab, setTab] = useState<TabKey>('coworking');
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manajemen <em>Pesanan</em></h1>
          <p className="admin-page-sub">Kelola semua transaksi produk Kaspa Space</p>
        </div>
      </div>
      <div className="prod-tabs">
        {TABS.map(t => (
          <button key={t.key} type="button" className={`prod-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>
      {tab === 'coworking' && <CoworkingTab />}
      {tab === 'fnb'       && <FnbTab />}
      {tab === 'biz'       && <BizTab />}
    </>
  );
}
