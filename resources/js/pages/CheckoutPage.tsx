import { useState, useEffect, useRef, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import LegalModal from '../components/LegalModal';
import { PAYMENT_METHODS } from '../data/products';
import { validateDiscount, createBizOrder, createFnbOrder, uploadDocument, fetchPpnSettings, PpnSettings, createBooking, fetchPaymentMethods, PaymentMethodsSettings, fetchMidtransToken, fetchPublicProductTypes } from '../lib/publicApi';
import { useAuth } from '../contexts/AuthContext';

declare global { interface Window { snap?: { pay: (token: string, cb: Record<string, (r?: unknown) => void>) => void } } }
import { useCart, CartItem } from '../contexts/CartContext';

type SvgProps = React.SVGProps<SVGSVGElement>;
function CheckIcon(p: SvgProps) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>;
}
function UploadIcon(p: SvgProps) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
}
function TrashIcon(p: SvgProps) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}

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

interface StoredOrder {
  id: string;
  product: { id: string; cat: string; title: string; loc?: string | null; img?: string | null };
  variant: { id: string; name: string; desc?: string; price: number; unit?: string };
  qty: number;
  subtotal: number;
  adminFee: number;
  total: number;
  createdAt: string;
  requiresDocs?: boolean;
  bizServiceId?: number | null;
}

interface UploadedDoc { name: string; url: string; label: string; }

const DOC_SLOTS = [
  { key: 'ktp',     label: 'KTP / Identitas',   hint: 'JPG, PNG, atau PDF · maks. 5 MB', required: true },
  { key: 'npwp',    label: 'NPWP (jika ada)',    hint: 'JPG, PNG, atau PDF · maks. 5 MB · opsional', required: false },
  { key: 'support', label: 'Dokumen Pendukung',  hint: 'Akta, NIB, atau dokumen usaha lainnya · opsional', required: false },
];

interface CWPending {
  room_id: number | null;
  room_title: string | null;
  room_location: string | null;
  product_type_key: string;
  productName: string;
  productLabel: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  qty_desks: number;
  notes: string | null;
  price: number;
  unit: string;
  requires_documents?: boolean;
  duration_months?: number;
}

const fmtRp = (n: number) => 'Rp' + n.toLocaleString('id-ID');

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { remove: cartRemove, items: cartItems } = useCart();

  // Coworking pending booking
  const [cwPending, setCwPending]         = useState<CWPending | null>(null);
  const [cwCartUid, setCwCartUid]         = useState<string | null>(null);
  const [cwForm, setCwForm]               = useState({ name: '', email: '', phone: '' });
  const [cwAgree, setCwAgree]             = useState(false);
  const [cwPaymentMethod, setCwPaymentMethod] = useState('');
  const [cwSubmitting, setCwSubmitting]   = useState(false);
  const [cwError, setCwError]             = useState('');
  const [cwCoupon, setCwCoupon]           = useState('');
  const [cwDiscount, setCwDiscount]       = useState(0);
  const [cwCouponLoading, setCwCouponLoading] = useState(false);
  const [cwCouponError, setCwCouponError]     = useState('');
  const [paymentMethods, setPaymentMethods]   = useState<PaymentMethodsSettings | null>(null);
  const [cwRequiresDocs, setCwRequiresDocs]   = useState(false);
  const [sharedDocs, setSharedDocs]           = useState<Record<string, UploadedDoc | null>>({ ktp: null, npwp: null, support: null });
  const [sharedUploading, setSharedUploading] = useState<Record<string, boolean>>({});
  const [cwProductImg, setCwProductImg]       = useState<string | null>(null);

  // Load Midtrans Snap.js ketika diaktifkan admin
  useEffect(() => {
    const m = paymentMethods?.midtrans;
    if (!m?.enabled || !m.client_key) return;
    if (document.getElementById('midtrans-snap')) return;
    const s = document.createElement('script');
    s.id = 'midtrans-snap';
    s.src = m.is_production
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    s.setAttribute('data-client-key', m.client_key);
    document.head.appendChild(s);
  }, [paymentMethods?.midtrans?.enabled, paymentMethods?.midtrans?.client_key]);

  // Non-coworking cart items (fnb / business)
  const [nonCwItems, setNonCwItems] = useState<CartItem[]>([]);
  const [itemDiscounts, setItemDiscounts] = useState<Record<string, { code: string; amount: number; loading: boolean; error: string }>>({});

  // FnB/Biz order
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [method, setMethod] = useState('va-bca');
  const [agree, setAgree] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [legalKey, setLegalKey] = useState<'terms' | 'privacy' | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [docs, setDocs] = useState<Record<string, UploadedDoc | null>>({ ktp: null, npwp: null, support: null });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [ppn, setPpn] = useState<PpnSettings>({ enabled: false, rate: 11 });

  useEffect(() => {
    try {
      const cartRaw = localStorage.getItem('ks_cart_v1');
      if (cartRaw) {
        const allItems: CartItem[] = JSON.parse(cartRaw);
        const cwItem   = allItems.find(i => i.kind === 'coworking');
        const nonCw    = allItems.filter(i => i.kind !== 'coworking');
        if (nonCw.length) setNonCwItems(nonCw);
        if (cwItem) {
          setCwPending(cwItem.descriptor as CWPending);
          setCwCartUid(cwItem.uid);
          setCwProductImg(cwItem.product.img ?? null);
        }
        if (cwItem || nonCw.length) {
          fetchPpnSettings().then(setPpn).catch(() => {});
          fetchPaymentMethods().then(setPaymentMethods).catch(() => {});
          if (cwItem) {
            const pending = cwItem.descriptor as CWPending;
            if (pending.requires_documents) {
              setCwRequiresDocs(true);
            } else {
              // fallback: cek dari API jika descriptor lama tidak punya field ini
              fetchPublicProductTypes().then(types => {
                const pt = types.find(t => t.key === pending.product_type_key);
                if (pt?.requires_documents) setCwRequiresDocs(true);
              }).catch(() => {});
            }
          }
          return;
        }
      }
    } catch { /* ignore */ }
    try {
      const cwRaw = localStorage.getItem('ks_cw_pending');
      if (cwRaw) {
        const pending: CWPending = JSON.parse(cwRaw);
        setCwPending(pending);
        fetchPpnSettings().then(setPpn).catch(() => {});
        fetchPaymentMethods().then(setPaymentMethods).catch(() => {});
        if (pending.requires_documents) {
          setCwRequiresDocs(true);
        } else {
          fetchPublicProductTypes().then(types => {
            const pt = types.find(t => t.key === pending.product_type_key);
            if (pt?.requires_documents) setCwRequiresDocs(true);
          }).catch(() => {});
        }
        return;
      }
      const raw = localStorage.getItem('ks_order');
      if (raw) setOrder(JSON.parse(raw));
    } catch { /* ignore */ }
    fetchPpnSettings().then(setPpn).catch(() => {});
  }, []);

  // Navigate back only if the CW cart item was previously confirmed present, then removed
  const cwItemSeenInCart = useRef(false);
  const cwSubmittedRef   = useRef(false);
  useEffect(() => {
    if (!cwCartUid || cwSubmittedRef.current) return;
    const found = cartItems.some(i => i.uid === cwCartUid);
    if (found) {
      cwItemSeenInCart.current = true;
    } else if (cwItemSeenInCart.current) {
      navigate(-1);
    }
  }, [cartItems, cwCartUid, navigate]);

  const applyItemDiscount = async (uid: string, code: string, subtotal: number, category: string, productId?: string | number) => {
    if (!code.trim()) return;
    setItemDiscounts(d => ({ ...d, [uid]: { ...(d[uid] ?? { code: '', amount: 0, error: '' }), loading: true, error: '' } }));
    try {
      const res = await validateDiscount(code.trim(), subtotal, category, productId);
      setItemDiscounts(d => ({ ...d, [uid]: { code: code.trim().toUpperCase(), amount: res.discount_amount, loading: false, error: '' } }));
    } catch (err: unknown) {
      setItemDiscounts(d => ({ ...d, [uid]: { code: code.trim().toUpperCase(), amount: 0, loading: false, error: (err as { message?: string })?.message ?? 'Kode tidak valid.' } }));
    }
  };

  // Pre-fill form from logged-in user
  useEffect(() => {
    if (user) {
      setCwForm(f => ({ ...f, name: (user as { name?: string }).name ?? '', email: (user as { email?: string }).email ?? '' }));
      setForm(f => ({ ...f, name: (user as { name?: string }).name ?? '', email: (user as { email?: string }).email ?? '' }));
    }
  }, [user]);

  // ── Coworking checkout ────────────────────────────────────────
  if (cwPending) {
    const subtotal  = cwPending.price * (cwPending.qty_desks ?? 1);
    const ppnBase   = subtotal - cwDiscount;
    const ppnAmount = ppn.enabled ? Math.round(ppnBase * ppn.rate / 100) : 0;
    const total     = ppnBase + ppnAmount;
    const dateStr   = cwPending.booking_date
      ? new Date(cwPending.booking_date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : '-';

    const applyCwCoupon = async () => {
      if (!cwCoupon.trim()) return;
      setCwCouponLoading(true); setCwCouponError('');
      try {
        const res = await validateDiscount(cwCoupon.trim(), subtotal, 'coworking', cwPending.product_type_key);
        setCwDiscount(res.discount_amount);
      } catch (err: unknown) {
        setCwCouponError((err as { message?: string })?.message ?? 'Kode kupon tidak valid.');
        setCwDiscount(0);
      } finally { setCwCouponLoading(false); }
    };

    const hasPaymentOptions = paymentMethods && (
      paymentMethods.qris.enabled || paymentMethods.tunai.enabled ||
      paymentMethods.rekening.length > 0 || paymentMethods.midtrans.enabled
    );

    const handleSharedDocUpload = async (key: string, label: string, file: File) => {
      setSharedUploading(u => ({ ...u, [key]: true }));
      try {
        const res = await uploadDocument(file);
        setSharedDocs(d => ({ ...d, [key]: { name: res.name, url: res.url, label } }));
      } catch {
        alert('Upload gagal. Pastikan file JPG/PNG/PDF dan maks. 5 MB.');
      } finally {
        setSharedUploading(u => ({ ...u, [key]: false }));
      }
    };

    const handleCwSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!cwAgree) { alert('Mohon setujui Syarat & Ketentuan untuk melanjutkan'); return; }
      if (!user && (!cwForm.name || !cwForm.email || !cwForm.phone)) { alert('Mohon lengkapi data pemesan'); return; }
      if (hasPaymentOptions && !cwPaymentMethod) { alert('Mohon pilih metode pembayaran'); return; }
      const anyNeedsDocs = cwRequiresDocs || nonCwItems.some(i => i.kind === 'business' && (i.descriptor as { requiresDocs?: boolean }).requiresDocs);
      if (anyNeedsDocs && !sharedDocs.ktp) { alert('KTP / Identitas wajib diunggah untuk melanjutkan pemesanan.'); return; }
      setCwSubmitting(true); setCwError('');

      const paymentLabel = (() => {
        if (!cwPaymentMethod) return null;
        if (cwPaymentMethod === 'qris') return 'QRIS';
        if (cwPaymentMethod === 'tunai') return 'Tunai';
        if (cwPaymentMethod === 'midtrans') return 'Midtrans';
        const idx = parseInt(cwPaymentMethod.replace('rek-', ''));
        const rek = paymentMethods?.rekening[idx];
        return rek ? `Transfer ${rek.bank} (${rek.number} a.n. ${rek.holder})` : null;
      })();
      const baseNotes  = cwPending.notes ?? (cwForm as { notes?: string }).notes ?? null;
      const finalNotes = [paymentLabel ? `[Pembayaran: ${paymentLabel}]` : null, baseNotes].filter(Boolean).join(' ') || null;

      try {
        const cwUploadedDocs = Object.values(sharedDocs).filter(Boolean) as UploadedDoc[];
        const result = await createBooking({
          room_id:          cwPending.room_id,
          product_type_key: cwPending.product_type_key,
          booking_date:     cwPending.booking_date,
          start_time:       cwPending.start_time,
          end_time:         cwPending.end_time,
          qty_desks:        cwPending.qty_desks,
          notes:            finalNotes,
          unit_price:       cwPending.price,
          duration_months:  cwPending.duration_months,
          discount_code:    cwDiscount > 0 && cwCoupon.trim() ? cwCoupon.trim().toUpperCase() : null,
          documents:        cwUploadedDocs.length ? cwUploadedDocs.map(d => ({ name: d.label, url: d.url })) : null,
          bundled_items:    nonCwItems.length > 0 ? nonCwItems.map(i => ({
            cat:         i.product.cat,
            title:       i.product.title,
            variantName: i.variant.name,
            price:       i.price * i.qty,
            discount:    itemDiscounts[i.uid]?.amount ?? 0,
            discountCode: (itemDiscounts[i.uid]?.amount ?? 0) > 0 ? (itemDiscounts[i.uid]?.code ?? '') : '',
          })) : null,
          ...(!user && { guest_name: cwForm.name, guest_email: cwForm.email, guest_phone: cwForm.phone }),
        });
        cwSubmittedRef.current = true;
        if (cwCartUid) { cartRemove(cwCartUid); } else { localStorage.removeItem('ks_cw_pending'); }

        // Proses FnB items dari cart
        const fnbItems = nonCwItems.filter(i => i.kind === 'fnb');
        if (fnbItems.length > 0) {
          const fnbDiscountTotal = fnbItems.reduce((s, i) => s + (itemDiscounts[i.uid]?.amount ?? 0), 0);
          const fnbDiscountCodes = fnbItems.map(i => itemDiscounts[i.uid]).filter(d => d?.amount > 0 && d.code).map(d => d.code).join('+');
          await createFnbOrder({
            member_name:     user ? (user as { name?: string }).name ?? cwForm.name : cwForm.name,
            booking_date:    cwPending.booking_date,
            items:           fnbItems.map(i => ({
              id:           (i.descriptor as { fnbItemId: number }).fnbItemId,
              qty:          i.qty,
              package_name: i.variant.name !== 'Reguler' ? i.variant.name : undefined,
            })),
            discount_code:   fnbDiscountCodes || undefined,
            discount_amount: fnbDiscountTotal > 0 ? fnbDiscountTotal : undefined,
            linked_cw:       result.code,
          });
          fnbItems.forEach(i => cartRemove(i.uid));
        }

        // Proses Biz items dari cart
        const bizItems = nonCwItems.filter(i => i.kind === 'business');
        for (const item of bizItems) {
          const desc = item.descriptor as { bizServiceId: number | null; requiresDocs?: boolean };
          if (!desc.bizServiceId) continue;
          const disc = itemDiscounts[item.uid];
          const itemBizDocs = desc.requiresDocs ? (Object.values(sharedDocs).filter(Boolean) as UploadedDoc[]) : [];
          await createBizOrder({
            biz_service_id: desc.bizServiceId,
            member_name:    user ? (user as { name?: string }).name ?? cwForm.name : cwForm.name,
            member_email:   user ? (user as { email?: string }).email ?? cwForm.email : cwForm.email,
            member_phone:   cwForm.phone || undefined,
            package_name:   item.variant.name,
            discount_code:  disc?.code && disc.amount > 0 ? disc.code : undefined,
            documents:      itemBizDocs.length > 0 ? itemBizDocs : undefined,
            linked_cw:      result.code,
          });
          cartRemove(item.uid);
        }

        // ── Midtrans Snap payment ────────────────────────────────
        if (cwPaymentMethod === 'midtrans') {
          let snapToken: string;
          try {
            const tokenRes = await fetchMidtransToken(result.code);
            snapToken = tokenRes.snap_token;
          } catch {
            setCwError('Gagal memulai sesi pembayaran Midtrans.');
            setCwSubmitting(false);
            return;
          }
          setCwSubmitting(false);
          const paymentBase = {
            bookingCode: result.code, productType: cwPending.product_type_key,
            productName: cwPending.productName, productImg: cwProductImg,
            room: cwPending.room_title ? { title: cwPending.room_title, location: cwPending.room_location } : null,
            date: cwPending.booking_date, dateDisplay: dateStr,
            startTime: cwPending.start_time, endTime: cwPending.end_time,
            qty: cwPending.qty_desks, totalPrice: total, adminFee: result.admin_fee,
            expiresAt: Date.now() + 12 * 60 * 60 * 1000, status: result.status,
            paymentMethod: 'midtrans',
            otherItems: nonCwItems.map(i => ({ cat: i.product.cat, title: i.product.title, variantName: i.variant.name, img: i.product.img ?? null, price: i.price * i.qty, discount: itemDiscounts[i.uid]?.amount ?? 0, discountCode: (itemDiscounts[i.uid]?.amount ?? 0) > 0 ? (itemDiscounts[i.uid]?.code ?? '') : '' })),
          };
          window.snap?.pay(snapToken, {
            onSuccess: () => {
              try {
                localStorage.setItem('ks_booking_result', JSON.stringify({
                  code:        paymentBase.bookingCode,
                  productType: paymentBase.productType,
                  productName: paymentBase.productName,
                  productImg:  paymentBase.productImg ?? null,
                  room:        paymentBase.room,
                  date:        paymentBase.date,
                  dateDisplay: paymentBase.dateDisplay,
                  startTime:   paymentBase.startTime,
                  endTime:     paymentBase.endTime,
                  qty:         paymentBase.qty,
                  totalPrice:  paymentBase.totalPrice,
                  adminFee:    paymentBase.adminFee,
                  ppnRate:     ppn.enabled ? ppn.rate : 0,
                  ppnAmount,
                  paymentMethod: 'Midtrans',
                  status:      'paid',
                  otherItems:  paymentBase.otherItems ?? [],
                }));
                localStorage.removeItem('ks_cw_payment');
              } catch { /* ignore */ }
              navigate('/pesan-sukses', { replace: true });
            },
            onPending: () => {
              try { localStorage.setItem('ks_cw_payment', JSON.stringify(paymentBase)); } catch { /* ignore */ }
              navigate('/payment', { replace: true });
            },
            onError: () => { setCwError('Pembayaran gagal. Silakan coba lagi.'); },
            onClose: () => { /* booking tetap pending, user bisa bayar nanti */ },
          });
          return;
        }

        const rekIdx = cwPaymentMethod.startsWith('rek-') ? parseInt(cwPaymentMethod.replace('rek-', '')) : -1;
        const otherItems = nonCwItems.map(i => ({ cat: i.product.cat, title: i.product.title, variantName: i.variant.name, img: i.product.img ?? null, price: i.price * i.qty, discount: itemDiscounts[i.uid]?.amount ?? 0, discountCode: (itemDiscounts[i.uid]?.amount ?? 0) > 0 ? (itemDiscounts[i.uid]?.code ?? '') : '' }));
        try {
          localStorage.setItem('ks_cw_payment', JSON.stringify({
            bookingCode:   result.code,
            productType:   cwPending.product_type_key,
            productName:   cwPending.productName,
            productImg:    cwProductImg,
            room:          cwPending.room_title ? { title: cwPending.room_title, location: cwPending.room_location } : null,
            date:          cwPending.booking_date,
            dateDisplay:   dateStr,
            startTime:     cwPending.start_time,
            endTime:       cwPending.end_time,
            qty:           cwPending.qty_desks,
            totalPrice:    total,
            adminFee:      result.admin_fee,
            ppnRate:        ppn.enabled ? ppn.rate : 0,
            ppnAmount,
            expiresAt:      Date.now() + 12 * 60 * 60 * 1000,
            status:         result.status,
            paymentMethod:  cwPaymentMethod,
            paymentLabel:   paymentLabel ?? cwPaymentMethod,
            qrisImageUrl:  cwPaymentMethod === 'qris' ? (paymentMethods?.qris.image_url ?? '') : null,
            rekening:      rekIdx >= 0 ? (paymentMethods?.rekening[rekIdx] ?? null) : null,
            otherItems,
          }));
        } catch { /* ignore */ }
        navigate('/payment', { replace: true });
      } catch (err: unknown) {
        setCwError((err as { message?: string })?.message ?? 'Gagal membuat pesanan. Coba lagi.');
      } finally {
        setCwSubmitting(false);
      }
    };

    return (
      <div>
        <Navbar />
        <section className="com-page">
          <div className="container">
            <button type="button" className="com-back" onClick={() => { navigate(-1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14, padding: 0, marginBottom: 24 }}>
              <Icon.ChevLeft /> Kembali
            </button>

            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <span className="com-eyebrow">Checkout</span>
              <h1 className="section-title" style={{ marginTop: 10 }}>Konfirmasi <em>Booking</em></h1>
            </div>
            <StepsBar active={1} />

            <form className="co-grid" onSubmit={handleCwSubmit}>
              <div>
                {/* Data pemesan */}
                <div className="co-card">
                  <h3>Data <em>Pemesan</em></h3>
                  <div className="sub">{user ? 'Data dari akun Anda' : 'Isi data kontak untuk konfirmasi booking Anda'}</div>
                  <div className="co-form-grid" style={{ marginTop: 16 }}>
                    <div className="co-field">
                      <label>Nama Lengkap {!user && <span className="req">*</span>}</label>
                      <input type="text" placeholder="Nama Anda"
                        value={user ? ((user as { name?: string }).name ?? '') : cwForm.name}
                        onChange={e => { if (!user) setCwForm(f => ({ ...f, name: e.target.value })); }}
                        readOnly={!!user} required={!user}
                        style={user ? { opacity: 0.7, cursor: 'default' } : undefined} />
                    </div>
                    <div className="co-field">
                      <label>Email {!user && <span className="req">*</span>}</label>
                      <input type="email" placeholder="email@anda.com"
                        value={user ? ((user as { email?: string }).email ?? '') : cwForm.email}
                        onChange={e => { if (!user) setCwForm(f => ({ ...f, email: e.target.value })); }}
                        readOnly={!!user} required={!user}
                        style={user ? { opacity: 0.7, cursor: 'default' } : undefined} />
                    </div>
                    <div className="co-field full">
                      <label>No. WhatsApp {!user && <span className="req">*</span>}</label>
                      <input type="tel" placeholder="08xxxxxxxxxx"
                        value={user ? ((user as { phone?: string }).phone ?? '') : cwForm.phone}
                        onChange={e => { if (!user) setCwForm(f => ({ ...f, phone: e.target.value })); }}
                        readOnly={!!user} required={!user}
                        style={user ? { opacity: 0.7, cursor: 'default' } : undefined} />
                    </div>
                  </div>
                  {!user && (
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10, marginBottom: 0 }}>
                      Sudah punya akun? <Link to={`/masuk?redirect=${encodeURIComponent('/checkout')}`}>Masuk sekarang</Link>
                    </p>
                  )}
                </div>

                {/* Dokumen — tampil jika CW atau salah satu Biz memerlukan dokumen */}
                {(cwRequiresDocs || nonCwItems.some(i => i.kind === 'business' && (i.descriptor as { requiresDocs?: boolean }).requiresDocs)) && (
                  <div className="co-card">
                    <h3>Unggah <em>Dokumen</em></h3>
                    <div className="sub">Dokumen berlaku untuk semua layanan dalam pesanan ini. KTP wajib, lainnya opsional.</div>
                    <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                      {DOC_SLOTS.map(slot => {
                        const uploaded = sharedDocs[slot.key];
                        const loading  = sharedUploading[slot.key];
                        return (
                          <label key={slot.key} className="co-drop" style={{ cursor: 'pointer', position: 'relative' }}>
                            <input
                              type="file" accept=".jpg,.jpeg,.png,.pdf"
                              style={{ display: 'none' }}
                              onChange={e => {
                                const f = e.target.files?.[0];
                                if (f) handleSharedDocUpload(slot.key, slot.label, f);
                                e.target.value = '';
                              }}
                            />
                            {uploaded ? (
                              <>
                                <div className="ic" style={{ color: 'var(--success)' }}><CheckIcon /></div>
                                <div>
                                  <strong style={{ color: 'var(--success)' }}>{slot.label}</strong>
                                  <span style={{ display: 'block', fontSize: 12, marginTop: 2 }}>{uploaded.name} · Klik untuk ganti</span>
                                </div>
                                <button
                                  type="button"
                                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}
                                  onClick={e => { e.preventDefault(); setSharedDocs(d => ({ ...d, [slot.key]: null })); }}
                                >
                                  <TrashIcon />
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="ic"><UploadIcon /></div>
                                <div>
                                  <strong>{slot.label}{slot.key === 'ktp' ? ' *' : ''}</strong>
                                  <span>{loading ? 'Mengunggah...' : slot.hint}</span>
                                </div>
                              </>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Metode Pembayaran */}
                {paymentMethods && (paymentMethods.qris.enabled || paymentMethods.tunai.enabled || paymentMethods.rekening.length > 0 || paymentMethods.midtrans.enabled) && (
                  <div className="co-card">
                    <h3>Metode <em>Pembayaran</em></h3>
                    <div className="sub" style={{ marginBottom: 12 }}>Pilih cara pembayaran yang Anda inginkan</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {paymentMethods.qris.enabled && (
                        <label className={`co-pay${cwPaymentMethod === 'qris' ? ' active' : ''}`} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="cw-payment" value="qris" checked={cwPaymentMethod === 'qris'}
                            onChange={() => setCwPaymentMethod('qris')} style={{ display: 'none' }} />
                          <span style={{ fontSize: 22 }}>📱</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>QRIS</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Scan QR dari semua aplikasi pembayaran</div>
                          </div>
                          {cwPaymentMethod === 'qris' && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
                        </label>
                      )}
                      {paymentMethods.tunai.enabled && (
                        <label className={`co-pay${cwPaymentMethod === 'tunai' ? ' active' : ''}`} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="cw-payment" value="tunai" checked={cwPaymentMethod === 'tunai'}
                            onChange={() => setCwPaymentMethod('tunai')} style={{ display: 'none' }} />
                          <span style={{ fontSize: 22 }}>💵</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>Tunai / Cash</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Bayar langsung di kasir</div>
                          </div>
                          {cwPaymentMethod === 'tunai' && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
                        </label>
                      )}
                      {paymentMethods.rekening.map((r, i) => (
                        <label key={i} className={`co-pay${cwPaymentMethod === `rek-${i}` ? ' active' : ''}`} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="cw-payment" value={`rek-${i}`} checked={cwPaymentMethod === `rek-${i}`}
                            onChange={() => setCwPaymentMethod(`rek-${i}`)} style={{ display: 'none' }} />
                          <span style={{ fontSize: 22 }}>🏦</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>Transfer {r.bank}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.number} · a.n. {r.holder}</div>
                          </div>
                          {cwPaymentMethod === `rek-${i}` && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
                        </label>
                      ))}
                      {paymentMethods.midtrans.enabled && (
                        <label className={`co-pay${cwPaymentMethod === 'midtrans' ? ' active' : ''}`} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="cw-payment" value="midtrans" checked={cwPaymentMethod === 'midtrans'}
                            onChange={() => setCwPaymentMethod('midtrans')} style={{ display: 'none' }} />
                          <span style={{ fontSize: 22 }}>💳</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>Bayar Online</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Kartu kredit, transfer bank, GoPay, OVO, dll via Midtrans</div>
                          </div>
                          {cwPaymentMethod === 'midtrans' && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* S&K */}
                <div className="co-card">
                  <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input type="checkbox" checked={cwAgree} onChange={e => setCwAgree(e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Saya menyetujui <button type="button" className="co-link" onClick={() => setLegalKey('terms')}>Syarat & Ketentuan</button> dan memahami bahwa booking ini bersifat mengikat setelah dikonfirmasi.
                    </span>
                  </label>
                </div>

                {cwError && (
                  <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 12, color: 'var(--error)', fontSize: 14 }}>
                    {cwError}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div>
                <div className="co-summary" style={{ position: 'sticky', top: 100 }}>
                  <div className="co-summary-head"><h3>Ringkasan <em>Pesanan</em></h3></div>
                  <div className="co-summary-body">
                    {/* CW booking item */}
                    <div className="co-line" style={{ marginBottom: 8 }}>
                      <div className="co-line-info">
                        <div className="co-line-cat">{cwPending.product_type_key}</div>
                        <div className="co-line-title">{cwPending.productLabel}</div>
                        {cwPending.room_title && <div className="co-line-var">{cwPending.room_title}{cwPending.room_location ? ` · ${cwPending.room_location}` : ''}</div>}
                        <div className="co-line-var">{dateStr}</div>
                        {cwPending.start_time && cwPending.end_time && (
                          <div className="co-line-var">{cwPending.start_time.slice(0,5)} – {cwPending.end_time.slice(0,5)}</div>
                        )}
                        {cwPending.qty_desks > 1 && <div className="co-line-var">{cwPending.qty_desks} meja</div>}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>{fmtRp(subtotal)}</span>
                    </div>
                    <div className="co-row" style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 13 }}>Coworking</span>
                      <span className="v">{fmtRp(subtotal - cwDiscount)}</span>
                    </div>
                    {cwDiscount > 0 && <div className="co-row muted" style={{ color: 'var(--success)', marginBottom: 4 }}><span>Diskon coworking</span><span>−{fmtRp(cwDiscount)}</span></div>}

                    {/* Diskon inline coworking */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      <input
                        type="text"
                        placeholder="Kode diskon item ini"
                        value={cwCoupon}
                        onChange={e => { setCwCoupon(e.target.value.toUpperCase()); setCwCouponError(''); if (!e.target.value) setCwDiscount(0); }}
                        style={{ flex: 1, fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-2, var(--bg-card))', color: 'var(--text-primary)' }}
                      />
                      <button type="button" className="btn btn-ghost"
                        style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0 }}
                        disabled={cwCouponLoading || !cwCoupon.trim()}
                        onClick={applyCwCoupon}>
                        {cwCouponLoading ? '...' : 'Pakai'}
                      </button>
                    </div>
                    {cwCouponError && <p style={{ fontSize: 11, color: 'var(--error)', margin: '0 0 4px' }}>{cwCouponError}</p>}

                    {/* Non-CW items (FnB / Biz) dari cart */}
                    {nonCwItems.map(item => {
                      const disc = itemDiscounts[item.uid] ?? { code: '', amount: 0, loading: false, error: '' };
                      return (
                        <div key={item.uid} style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div>
                              <div className="co-line-cat">{item.product.cat}</div>
                              <div className="co-line-title" style={{ fontSize: 13 }}>{item.product.title}</div>
                              <div className="co-line-var">{item.variant.name}{item.qty > 1 ? ` × ${item.qty}` : ''}</div>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>{fmtRp(item.price * item.qty)}</span>
                          </div>
                          {/* Diskon per-item */}
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input
                              type="text"
                              placeholder="Kode diskon item ini"
                              value={disc.code}
                              onChange={e => setItemDiscounts(d => ({ ...d, [item.uid]: { ...(d[item.uid] ?? { amount: 0, loading: false, error: '' }), code: e.target.value.toUpperCase(), error: '' } }))}
                              style={{ flex: 1, fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                            />
                            <button type="button" className="btn btn-ghost"
                              style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0 }}
                              disabled={disc.loading || !disc.code}
                              onClick={() => {
                                const cat = item.kind === 'business' ? 'biz' : item.kind;
                                const pid = item.kind === 'fnb'
                                  ? (item.descriptor as { fnbItemId: number }).fnbItemId
                                  : item.kind === 'business'
                                  ? (item.descriptor as { bizServiceId: number }).bizServiceId
                                  : undefined;
                                applyItemDiscount(item.uid, disc.code, item.price * item.qty, cat, pid);
                              }}>
                              {disc.loading ? '...' : 'Pakai'}
                            </button>
                          </div>
                          {disc.error && <p style={{ fontSize: 11, color: 'var(--error)', margin: '4px 0 0' }}>{disc.error}</p>}
                          {disc.amount > 0 && (
                            <div className="co-row muted" style={{ color: 'var(--success)', marginTop: 4, fontSize: 12 }}>
                              <span>Diskon</span><span>−{fmtRp(disc.amount)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Gabungan total */}
                    {ppn.enabled && <div className="co-row muted" style={{ marginTop: 8 }}><span>PPN {ppn.rate}%</span><span>{fmtRp(ppnAmount)}</span></div>}
                    <div className="co-row total" style={{ marginTop: 16 }}>
                      <span className="l">Total</span>
                      <span className="v">{fmtRp(
                        total +
                        nonCwItems.reduce((s, i) => s + i.price * i.qty, 0) -
                        Object.values(itemDiscounts).reduce((s, d) => s + (d.amount || 0), 0)
                      )}</span>
                    </div>
                  </div>
                  {/* Info pembayaran terpilih */}
                  {cwPaymentMethod === 'qris' && paymentMethods?.qris.image_url && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Scan QRIS setelah pesanan dikonfirmasi</p>
                      <img src={paymentMethods.qris.image_url} alt="QRIS"
                        style={{ maxWidth: 160, borderRadius: 8, border: '1px solid var(--border)' }} />
                    </div>
                  )}
                  {cwPaymentMethod.startsWith('rek-') && (() => {
                    const idx = parseInt(cwPaymentMethod.replace('rek-', ''));
                    const rek = paymentMethods?.rekening[idx];
                    return rek ? (
                      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>Transfer ke rekening</p>
                        <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>{rek.bank}</p>
                        <p style={{ fontSize: 14, margin: '0 0 2px' }}>{rek.number}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>a.n. {rek.holder}</p>
                      </div>
                    ) : null;
                  })()}
                  <div className="co-foot">
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                      disabled={!cwAgree || cwSubmitting || (hasPaymentOptions ? !cwPaymentMethod : false)}>
                      {cwSubmitting ? 'Memproses...' : <>Buat Pesanan <Icon.Arrow /></>}
                    </button>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                      Status awal: <strong>Pending</strong>. Tim kami akan mengkonfirmasi segera.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
        <Footer />
        {legalKey && <LegalModal docKey={legalKey} onClose={() => setLegalKey(null)} />}
      </div>
    );
  }

  // ── Checkout khusus non-CW (FnB / Biz tanpa booking coworking) ────────────
  if (nonCwItems.length > 0) {
    const nonCwTotal = nonCwItems.reduce((s, i) => s + i.price * i.qty, 0);
    const nonCwDiscountTotal = Object.values(itemDiscounts).reduce((s, d) => s + (d.amount || 0), 0);
    const nonCwGrandTotal = nonCwTotal - nonCwDiscountTotal;
    const hasPaymentOpts = paymentMethods && (paymentMethods.qris.enabled || paymentMethods.tunai.enabled || paymentMethods.rekening.length > 0);

    const handleNonCwSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!cwAgree) { alert('Mohon setujui Syarat & Ketentuan'); return; }
      if (!user && (!cwForm.name || !cwForm.email || !cwForm.phone)) { alert('Mohon lengkapi data pemesan'); return; }
      if (hasPaymentOpts && !cwPaymentMethod) { alert('Mohon pilih metode pembayaran'); return; }
      setCwSubmitting(true); setCwError('');
      try {
        const memberName  = user ? (user as { name?: string }).name ?? cwForm.name : cwForm.name;
        const memberEmail = user ? (user as { email?: string }).email ?? cwForm.email : cwForm.email;
        const memberPhone = cwForm.phone || undefined;

        const fnbItems = nonCwItems.filter(i => i.kind === 'fnb');
        const bizItems = nonCwItems.filter(i => i.kind === 'business');
        const isMultiOrder = (fnbItems.length > 0 && bizItems.length > 0) || bizItems.length > 1;
        const groupId  = isMultiOrder
          ? 'GRP-' + Math.random().toString(36).slice(2, 10).toUpperCase()
          : undefined;

        let fnbCode: string | null = null;
        if (fnbItems.length > 0) {
          const fnbDiscountTotal = fnbItems.reduce((s, i) => s + (itemDiscounts[i.uid]?.amount ?? 0), 0);
          const fnbDiscountCodes = fnbItems.map(i => itemDiscounts[i.uid]).filter(d => d?.amount > 0 && d.code).map(d => d.code).join('+');
          const fnbRes = await createFnbOrder({
            member_name:     memberName,
            booking_date:    (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(),
            items:           fnbItems.map(i => ({
              id:           (i.descriptor as { fnbItemId: number }).fnbItemId,
              qty:          i.qty,
              package_name: i.variant.name !== 'Reguler' ? i.variant.name : undefined,
            })),
            discount_code:   fnbDiscountCodes || undefined,
            discount_amount: fnbDiscountTotal > 0 ? fnbDiscountTotal : undefined,
            linked_group:    groupId,
          });
          fnbCode = fnbRes.code;
          fnbItems.forEach(i => cartRemove(i.uid));
        }

        const createdBizCodes: string[] = [];
        for (const item of bizItems) {
          const desc = item.descriptor as { bizServiceId: number | null };
          if (!desc.bizServiceId) continue;
          const disc = itemDiscounts[item.uid];
          const bizRes = await createBizOrder({
            biz_service_id: desc.bizServiceId,
            member_name:    memberName,
            member_email:   memberEmail,
            member_phone:   memberPhone,
            package_name:   item.variant.name,
            discount_code:  disc?.code && disc.amount > 0 ? disc.code : undefined,
            linked_group:   groupId,
          });
          createdBizCodes.push(bizRes.code);
          cartRemove(item.uid);
        }

        // Simpan ke ks_order agar OrderSuccessPage bisa buka combined invoice
        if (groupId) {
          const fnbOrderItems = fnbItems.map(i => ({
            cat: 'Food & Beverage', title: i.product.title,
            variantName: i.variant.name !== 'Reguler' ? i.variant.name : '',
            qty: i.qty, price: i.price * i.qty, discount: itemDiscounts[i.uid]?.amount ?? 0,
          }));
          const bizOrderItems = bizItems.map(i => ({
            cat: 'Business Service', title: i.product.title,
            variantName: i.variant.name,
            qty: 1, price: i.price * i.qty, discount: itemDiscounts[i.uid]?.amount ?? 0,
          }));
          localStorage.setItem('ks_order', JSON.stringify({
            id: fnbCode ?? createdBizCodes[0] ?? 'GRP',
            orderItems: [...fnbOrderItems, ...bizOrderItems],
            adminFee: 0,
            discount: 0,
            coupon: '',
            total: nonCwGrandTotal,
            paymentStatus: 'pending',
            buyer: { name: memberName, email: memberEmail, phone: memberPhone ?? '' },
            method: { name: '—' },
            createdAt: new Date().toISOString(),
          }));
        }

        navigate('/sukses');
      } catch (err: unknown) {
        setCwError((err as { message?: string })?.message ?? 'Gagal membuat pesanan. Coba lagi.');
      } finally { setCwSubmitting(false); }
    };

    return (
      <div>
        <Navbar />
        <section className="com-page">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <span className="com-eyebrow">Checkout</span>
              <h1 className="section-title" style={{ marginTop: 10 }}>Konfirmasi <em>Pesanan</em></h1>
            </div>

            <form className="co-grid" onSubmit={handleNonCwSubmit}>
              <div>
                {/* Data pemesan */}
                <div className="co-card">
                  <h3>Data <em>Pemesan</em></h3>
                  <div className="sub">{user ? 'Data dari akun Anda' : 'Isi data kontak untuk konfirmasi pesanan Anda'}</div>
                  <div className="co-form-grid" style={{ marginTop: 16 }}>
                    <div className="co-field">
                      <label>Nama Lengkap {!user && <span className="req">*</span>}</label>
                      <input type="text" placeholder="Nama Anda"
                        value={user ? ((user as { name?: string }).name ?? '') : cwForm.name}
                        onChange={e => { if (!user) setCwForm(f => ({ ...f, name: e.target.value })); }}
                        readOnly={!!user} required={!user}
                        style={user ? { opacity: 0.7, cursor: 'default' } : undefined} />
                    </div>
                    <div className="co-field">
                      <label>Email {!user && <span className="req">*</span>}</label>
                      <input type="email" placeholder="email@anda.com"
                        value={user ? ((user as { email?: string }).email ?? '') : cwForm.email}
                        onChange={e => { if (!user) setCwForm(f => ({ ...f, email: e.target.value })); }}
                        readOnly={!!user} required={!user}
                        style={user ? { opacity: 0.7, cursor: 'default' } : undefined} />
                    </div>
                    <div className="co-field full">
                      <label>No. WhatsApp {!user && <span className="req">*</span>}</label>
                      <input type="tel" placeholder="08xxxxxxxxxx"
                        value={user ? ((user as { phone?: string }).phone ?? '') : cwForm.phone}
                        onChange={e => { if (!user) setCwForm(f => ({ ...f, phone: e.target.value })); }}
                        readOnly={!!user} required={!user}
                        style={user ? { opacity: 0.7, cursor: 'default' } : undefined} />
                    </div>
                  </div>
                  {!user && (
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10, marginBottom: 0 }}>
                      Sudah punya akun? <Link to="/masuk">Masuk sekarang</Link>
                    </p>
                  )}
                </div>

                {/* Metode Pembayaran */}
                {hasPaymentOpts && (
                  <div className="co-card">
                    <h3>Metode <em>Pembayaran</em></h3>
                    <div className="sub" style={{ marginBottom: 12 }}>Pilih cara pembayaran yang Anda inginkan</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {paymentMethods!.qris.enabled && (
                        <label className={`co-pay${cwPaymentMethod === 'qris' ? ' active' : ''}`} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="nc-payment" value="qris" checked={cwPaymentMethod === 'qris'} onChange={() => setCwPaymentMethod('qris')} style={{ display: 'none' }} />
                          <span style={{ fontSize: 22 }}>📱</span>
                          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>QRIS</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Scan QR dari semua aplikasi pembayaran</div></div>
                          {cwPaymentMethod === 'qris' && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
                        </label>
                      )}
                      {paymentMethods!.tunai.enabled && (
                        <label className={`co-pay${cwPaymentMethod === 'tunai' ? ' active' : ''}`} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="nc-payment" value="tunai" checked={cwPaymentMethod === 'tunai'} onChange={() => setCwPaymentMethod('tunai')} style={{ display: 'none' }} />
                          <span style={{ fontSize: 22 }}>💵</span>
                          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>Tunai / Cash</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Bayar langsung di kasir</div></div>
                          {cwPaymentMethod === 'tunai' && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
                        </label>
                      )}
                      {paymentMethods!.rekening.map((r, i) => (
                        <label key={i} className={`co-pay${cwPaymentMethod === `rek-${i}` ? ' active' : ''}`} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="nc-payment" value={`rek-${i}`} checked={cwPaymentMethod === `rek-${i}`} onChange={() => setCwPaymentMethod(`rek-${i}`)} style={{ display: 'none' }} />
                          <span style={{ fontSize: 22 }}>🏦</span>
                          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>Transfer {r.bank}</div><div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{r.number} · a.n. {r.holder}</div></div>
                          {cwPaymentMethod === `rek-${i}` && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* S&K */}
                <div className="co-card">
                  <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input type="checkbox" checked={cwAgree} onChange={e => setCwAgree(e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Saya menyetujui <button type="button" className="co-link" onClick={() => setLegalKey('terms')}>Syarat & Ketentuan</button>
                    </span>
                  </label>
                </div>
                {cwError && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 12, color: 'var(--error)', fontSize: 14 }}>{cwError}</div>}
              </div>

              {/* Summary */}
              <div>
                <div className="co-summary" style={{ position: 'sticky', top: 100 }}>
                  <div className="co-summary-head"><h3>Ringkasan <em>Pesanan</em></h3></div>
                  <div className="co-summary-body">
                    {nonCwItems.map(item => {
                      const disc = itemDiscounts[item.uid] ?? { code: '', amount: 0, loading: false, error: '' };
                      return (
                        <div key={item.uid} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div>
                              <div className="co-line-cat">{item.product.cat}</div>
                              <div className="co-line-title" style={{ fontSize: 13 }}>{item.product.title}</div>
                              <div className="co-line-var">{item.variant.name}{item.qty > 1 ? ` × ${item.qty}` : ''}</div>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{fmtRp(item.price * item.qty)}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input
                              type="text"
                              placeholder="Kode diskon item ini"
                              value={disc.code}
                              onChange={e => setItemDiscounts(d => ({ ...d, [item.uid]: { ...(d[item.uid] ?? { amount: 0, loading: false, error: '' }), code: e.target.value.toUpperCase(), error: '' } }))}
                              style={{ flex: 1, fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                            />
                            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0 }}
                              disabled={disc.loading || !disc.code}
                              onClick={() => {
                                const cat = item.kind === 'business' ? 'biz' : item.kind;
                                const pid = item.kind === 'fnb'
                                  ? (item.descriptor as { fnbItemId: number }).fnbItemId
                                  : item.kind === 'business'
                                  ? (item.descriptor as { bizServiceId: number }).bizServiceId
                                  : undefined;
                                applyItemDiscount(item.uid, disc.code, item.price * item.qty, cat, pid);
                              }}>
                              {disc.loading ? '...' : 'Pakai'}
                            </button>
                          </div>
                          {disc.error && <p style={{ fontSize: 11, color: 'var(--error)', margin: '4px 0 0' }}>{disc.error}</p>}
                          {disc.amount > 0 && <div className="co-row muted" style={{ color: 'var(--success)', fontSize: 12, marginTop: 4 }}><span>Diskon</span><span>−{fmtRp(disc.amount)}</span></div>}
                        </div>
                      );
                    })}
                    {nonCwDiscountTotal > 0 && <div className="co-row muted" style={{ color: 'var(--success)' }}><span>Total Diskon</span><span>−{fmtRp(nonCwDiscountTotal)}</span></div>}
                    <div className="co-row total" style={{ marginTop: 12 }}>
                      <span className="l">Total</span>
                      <span className="v">{fmtRp(nonCwGrandTotal)}</span>
                    </div>
                  </div>
                  <div className="co-foot">
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                      disabled={!cwAgree || cwSubmitting || (hasPaymentOpts ? !cwPaymentMethod : false)}>
                      {cwSubmitting ? 'Memproses...' : <>Buat Pesanan <Icon.Arrow /></>}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
        <Footer />
        {legalKey && <LegalModal docKey={legalKey} onClose={() => setLegalKey(null)} />}
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <Navbar />
        <section className="com-page">
          <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
            <h2 className="section-title">Belum ada <em>pesanan</em></h2>
            <p style={{ color: 'var(--text-tertiary)', margin: '12px 0 28px' }}>Silakan pilih produk terlebih dahulu.</p>
            <Link to="/bisnis" className="btn btn-primary">Lihat Layanan <Icon.Arrow /></Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const discount   = couponApplied;
  const ppnBase    = order.subtotal - discount;
  const ppnAmount  = ppn.enabled ? Math.round(ppnBase * ppn.rate / 100) : 0;
  const total      = ppnBase + order.adminFee + ppnAmount;
  const deposit    = order.adminFee > 0 ? Math.round(total * 0.5) : total;
  const isBiz      = !!order.bizServiceId;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true); setCouponError('');
    try {
      const cat = order.bizServiceId ? 'biz' : order.product.cat;
      const pid = order.bizServiceId ?? undefined;
      const res = await validateDiscount(coupon.trim(), order.subtotal, cat, pid);
      setCouponApplied(res.discount_amount);
    } catch (err: any) {
      setCouponError(err?.message ?? 'Kode kupon tidak valid.');
      setCouponApplied(0);
    } finally { setCouponLoading(false); }
  };

  const handleDocUpload = async (key: string, label: string, file: File) => {
    setUploading(u => ({ ...u, [key]: true }));
    try {
      const res = await uploadDocument(file);
      setDocs(d => ({ ...d, [key]: { name: res.name, url: res.url, label } }));
    } catch {
      alert('Upload gagal. Pastikan file JPG/PNG/PDF dan maks. 5 MB.');
    } finally {
      setUploading(u => ({ ...u, [key]: false }));
    }
  };

  const onBayar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { alert('Mohon setujui Syarat & Ketentuan untuk melanjutkan'); return; }
    if (!form.name || !form.email || !form.phone) { alert('Mohon lengkapi data pemesan'); return; }
    if (order.requiresDocs && !docs.ktp) { alert('KTP / Identitas wajib diunggah untuk layanan ini.'); return; }

    setSubmitting(true); setSubmitError('');
    try {
      let orderCode = order.id;

      if (isBiz && order.bizServiceId) {
        const uploadedDocs = Object.values(docs).filter(Boolean) as UploadedDoc[];
        const res = await createBizOrder({
          biz_service_id: order.bizServiceId,
          member_name:    form.name,
          member_email:   form.email,
          member_phone:   form.phone,
          package_name:   order.variant.name !== order.product.title ? order.variant.name : undefined,
          note:           form.notes || undefined,
          documents:      uploadedDocs.length ? uploadedDocs.map(d => ({ name: d.label, url: d.url })) : undefined,
          discount_code:  couponApplied && coupon.trim() ? coupon.trim().toUpperCase() : undefined,
        });
        orderCode = res.code;
      }

      const allMethods = PAYMENT_METHODS.flatMap(g => g.methods);
      const m = allMethods.find(x => x.id === method);
      const payload = {
        ...order,
        code:          orderCode,
        buyer:         form,
        method:        m,
        discount,
        coupon:        couponApplied ? coupon.trim().toUpperCase() : null,
        ppnRate:       ppn.enabled ? ppn.rate : 0,
        ppnAmount,
        total,
        deposit,
        paymentStatus: 'pending',
        paidAt:        null,
        expireAt:      Date.now() + 24 * 60 * 60 * 1000,
      };
      try { localStorage.setItem('ks_order', JSON.stringify(payload)); } catch { /* ignore */ }
      navigate('/payment', { replace: true });
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Gagal membuat pesanan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <section className="com-page">
        <div className="container">
          <Link to="/produk" className="com-back"><Icon.ChevLeft /> Kembali ke detail produk</Link>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="com-eyebrow">Checkout</span>
            <h1 className="section-title" style={{ marginTop: 10 }}>Selesaikan <em>Pesanan</em></h1>
          </div>
          <StepsBar active={1} />

          <form className="co-grid" onSubmit={onBayar}>
            <div>
              {/* Data pemesan */}
              <div className="co-card">
                <h3>Data <em>Pemesan</em></h3>
                <div className="sub">Isi data pemesan yang benar untuk pengiriman konfirmasi</div>
                <div className="co-form-grid">
                  <div className="co-field">
                    <label>Nama Lengkap <span className="req">*</span></label>
                    <input type="text" placeholder="Nama Anda" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="co-field">
                    <label>Email <span className="req">*</span></label>
                    <input type="email" placeholder="email@anda.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="co-field">
                    <label>No. WhatsApp <span className="req">*</span></label>
                    <input type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                  </div>
                  <div className="co-field full">
                    <label>Catatan (opsional)</label>
                    <textarea placeholder="Permintaan khusus atau informasi tambahan..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
                  </div>
                </div>
              </div>

              {/* Dokumen — hanya tampil jika requiresDocs */}
              {order.requiresDocs && (
                <div className="co-card">
                  <h3>Unggah <em>Dokumen</em></h3>
                  <div className="sub">Dokumen diperlukan untuk memproses layanan Anda. KTP wajib, lainnya opsional.</div>
                  <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                    {DOC_SLOTS.map(slot => {
                      const uploaded = docs[slot.key];
                      const loading  = uploading[slot.key];
                      return (
                        <label key={slot.key} className="co-drop" style={{ cursor: 'pointer', position: 'relative' }}>
                          <input
                            type="file" accept=".jpg,.jpeg,.png,.pdf"
                            style={{ display: 'none' }}
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) handleDocUpload(slot.key, slot.label, f);
                              e.target.value = '';
                            }}
                          />
                          {uploaded ? (
                            <>
                              <div className="ic" style={{ color: 'var(--success)' }}><CheckIcon /></div>
                              <div>
                                <strong style={{ color: 'var(--success)' }}>{slot.label}</strong>
                                <span style={{ display: 'block', fontSize: 12, marginTop: 2 }}>{uploaded.name} · Klik untuk ganti</span>
                              </div>
                              <button
                                type="button"
                                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}
                                onClick={e => { e.preventDefault(); setDocs(d => ({ ...d, [slot.key]: null })); }}
                              >
                                <TrashIcon />
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="ic"><UploadIcon /></div>
                              <div>
                                <strong>{slot.label}{slot.key === 'ktp' ? ' *' : ''}</strong>
                                <span>{loading ? 'Mengunggah...' : slot.hint}</span>
                              </div>
                            </>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Metode pembayaran */}
              <div className="co-card">
                <h3>Metode <em>Pembayaran</em></h3>
                <div className="sub">Pilih cara pembayaran yang paling nyaman</div>
                {PAYMENT_METHODS.map(group => (
                  <div key={group.group} className="co-pay-group">
                    <h5>{group.group}</h5>
                    {group.methods.map(m => (
                      <div key={m.id} className={`co-pay${method === m.id ? ' active' : ''}`} onClick={() => setMethod(m.id)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setMethod(m.id)}>
                        <div className="co-pay-logo">{m.logo}</div>
                        <div className="co-pay-info">
                          <div className="nm">{m.name}</div>
                          <div className="ds">{m.desc}</div>
                        </div>
                        <div className="co-pay-radio" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="co-summary">
                <div className="co-summary-head">
                  <h3>Detail <em>Pesanan</em></h3>
                </div>
                <div className="co-summary-body">
                  <div className="co-line">
                    <div className="co-line-img" />
                    <div className="co-line-info">
                      <div className="co-line-cat">{order.product.cat}</div>
                      <div className="co-line-title">{order.product.title}</div>
                      <div className="co-line-var">Paket: {order.variant.name} × {order.qty}</div>
                    </div>
                    <div className="co-line-price">Rp{order.subtotal.toLocaleString('id-ID')}</div>
                  </div>

                  <div className="co-row"><span>Subtotal</span><span className="v">Rp{order.subtotal.toLocaleString('id-ID')}</span></div>
                  {order.adminFee > 0 && <div className="co-row muted"><span>Admin &amp; layanan</span><span>Rp{order.adminFee.toLocaleString('id-ID')}</span></div>}
                  {discount > 0 && <div className="co-row" style={{ color: 'var(--success)' }}><span>Diskon ({coupon.toUpperCase()})</span><span>−Rp{discount.toLocaleString('id-ID')}</span></div>}
                  {ppn.enabled && <div className="co-row muted"><span>PPN {ppn.rate}%</span><span>Rp{ppnAmount.toLocaleString('id-ID')}</span></div>}

                  <div className="co-coupon">
                    <input
                      type="text" placeholder="Kode kupon"
                      value={coupon}
                      onChange={e => { setCoupon(e.target.value); if (couponApplied) { setCouponApplied(0); setCouponError(''); } }}
                    />
                    <button type="button" onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? '...' : 'Terapkan'}
                    </button>
                  </div>
                  {couponError && <p style={{ color: 'var(--error)', fontSize: 12, margin: '4px 0 0' }}>{couponError}</p>}

                  <div className="co-row total" style={{ marginTop: 16 }}>
                    <span className="l">Total Pesanan</span>
                    <span className="v">Rp{total.toLocaleString('id-ID')}</span>
                  </div>

                  {order.adminFee > 0 && (
                    <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 12, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong style={{ color: '#fbbf24' }}>Bayar DP 50% dulu</strong>
                      {' '}— sisa Rp{(total - deposit).toLocaleString('id-ID')} ditagih saat selesai.
                    </div>
                  )}
                </div>

                <div className="co-foot">
                  {submitError && <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 10 }}>{submitError}</p>}
                  <div className="co-tnc">
                    <input type="checkbox" id="tnc" checked={agree} onChange={e => setAgree(e.target.checked)} />
                    <label htmlFor="tnc">
                      Saya menyetujui{' '}
                      <a href="#" onClick={e => { e.preventDefault(); setLegalKey('terms'); }}>Syarat &amp; Ketentuan</a>
                      {' '}dan{' '}
                      <a href="#" onClick={e => { e.preventDefault(); setLegalKey('privacy'); }}>Kebijakan Privasi</a>
                      {' '}Kaspa Space.
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                    {submitting ? 'Memproses...' : order.adminFee > 0 ? `Bayar Rp${deposit.toLocaleString('id-ID')} (DP 50%)` : `Pesan Sekarang`}
                    {!submitting && <Icon.Arrow />}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
      <Footer />
      {legalKey && <LegalModal docKey={legalKey} onClose={() => setLegalKey(null)} />}
    </div>
  );
}
