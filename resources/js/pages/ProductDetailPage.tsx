import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { buildProduct, Product, ProductDescriptor, ProductVariant } from '../data/products';
import { waLink } from '../lib/config';
import { type FnbItemApi, type BizServiceApi, type ReviewApi, type ReviewEligibility, type RoomApi, type AvailabilityResult, type OvertimeScheduleApi, type ProductTypeApi, fetchReviews, checkReviewEligibility, submitReview, fetchPublicRooms, checkRoomAvailability, fetchOvertimeSchedules, fetchPublicFnbItems, fetchPublicBizServices, fetchPublicProductTypes } from '../lib/publicApi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useApiGet } from '../hooks/useApiGet';

type SvgProps = React.SVGProps<SVGSVGElement>;

function CheckIcon(p: SvgProps) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>;
}
function ShieldCheckIcon(p: SvgProps) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" /><polyline points="9 12 11 14 15 10" /></svg>;
}
function ClockIcon(p: SvgProps) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function HeadsetIcon(p: SvgProps) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1v-7h3v5zM3 19a2 2 0 0 0 2 2h1v-7H3v5z" /></svg>;
}
function FileIcon(p: SvgProps) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
}

/* ---- API-sourced product builders ---- */

const TERMS_FNB_STATIC = [
  "Pesanan diproses setelah pembayaran dikonfirmasi di kasir atau melalui aplikasi.",
  "Diskon 20% member berlaku dengan menunjukkan/scan QR member aktif.",
  "Estimasi waktu penyajian dapat berubah saat jam sibuk.",
  "Makanan/minuman yang sudah disajikan tidak dapat dikembalikan kecuali ada kesalahan dari dapur.",
];

const TERMS_BIZ_STATIC = [
  "Pemesanan dianggap sah setelah pembayaran (atau DP) berhasil diverifikasi sistem.",
  "Invoice resmi dikirim otomatis ke email yang Anda daftarkan saat checkout.",
  "Proses dimulai setelah DP 50% dibayar dan dokumen persyaratan diterima lengkap.",
  "Garansi refund 100% bila pesanan tidak dapat kami proses sama sekali.",
];

function buildProductFromFnbItem(item: FnbItemApi): Product {
  const unit = item.unit ?? 'porsi';
  const variants = item.packages?.length
    ? item.packages.map((p, i) => ({
        id: `pkg-${i}`,
        name: p.name,
        desc: `1 ${unit}`,
        price: p.price,
        unit,
        popular: i === 0,
      }))
    : [{ id: 'reg', name: 'Reguler', desc: `1 ${unit}`, price: item.price, unit, popular: true }];

  return {
    kind: 'fnb',
    id: 'fnb-api-' + item.id,
    cat: 'Food & Beverage',
    catForCheckout: 'Food & Beverage',
    title: item.name,
    titleEm: item.category,
    rating: 4.8,
    reviewCount: 0,
    heroImg: item.image ?? null,
    heroImages: item.images?.length ? item.images : (item.image ? [item.image] : []),
    desc: item.description ?? 'Disajikan segar oleh kafe internal Kaspa Space.',
    priceNote: 'Harga normal — member otomatis hemat 20% di kasir.',
    adminFee: 2000,
    depositPct: 1,
    variants,
    included: [
      { t: 'Dibuat fresh saat dipesan', d: 'Tanpa bahan pengawet, kualitas terjaga' },
      { t: 'Bahan pilihan lokal',        d: 'Disuplai dari rekanan lokal terpercaya' },
      { t: 'Diskon 20% untuk member',    d: 'Scan QR member aktif di kasir' },
    ],
    steps: [
      { t: 'Pilih Menu',          d: 'Pesan via halaman ini atau langsung ke counter.' },
      { t: 'Tunjukkan Member',    d: 'Scan QR member untuk diskon 20% otomatis.' },
      { t: 'Bayar',               d: 'QRIS, e-wallet, transfer, atau tunai.' },
      { t: 'Diantar / Pickup',    d: 'Diantar ke desk Anda atau ambil di counter.' },
    ],
    terms: TERMS_FNB_STATIC,
    reviews: [],
  };
}

function buildProductFromBizService(service: BizServiceApi): Product {
  const variants = service.packages?.length
    ? service.packages.map((p, i) => ({
        id: `pkg-${i}`,
        name: p.name,
        desc: service.duration ?? '',
        price: p.price,
        unit: 'paket',
        popular: i === 0,
      }))
    : [{
        id: 'default',
        name: service.name,
        desc: service.duration ?? '',
        price: service.price,
        unit: 'paket',
        popular: true,
      }];

  return {
    kind: 'business',
    id: service.id.toString(),
    cat: 'Business Service',
    requiresDocs: service.requires_documents,
    heroImg: service.photo ?? null,
    heroImages: service.photos?.length ? service.photos : (service.photo ? [service.photo] : []),
    catForCheckout: 'Business Service',
    title: service.name,
    titleEm: service.location ?? 'Kaspa Space',
    rating: 5.0,
    reviewCount: 0,
    badge: null,
    desc: service.description ?? 'Hubungi tim kami untuk informasi lebih lanjut.',
    priceNote: service.price > 0
      ? 'Harga sudah termasuk semua biaya layanan.'
      : 'Harga menyesuaikan kebutuhan — konsultasi gratis.',
    adminFee: 0,
    depositPct: 0.5,
    variants,
    steps: [
      { t: 'Pesan & Bayar DP',    d: 'Pilih layanan, isi formulir, bayar DP 50%.' },
      { t: 'Konsultasi',          d: 'Tim kami hubungi Anda max 1×24 jam kerja.' },
      { t: 'Proses Layanan',      d: service.duration ? `Estimasi ${service.duration}.` : 'Proses berlangsung sesuai antrian.' },
      { t: 'Selesai',             d: 'Pelunasan, lalu dokumen/hasil dikirim ke Anda.' },
    ],
    terms: TERMS_BIZ_STATIC,
    reviews: [],
  };
}

function getProduct(desc: ProductDescriptor): Product | null {
  if (desc.kind === 'fnb') {
    try {
      const raw = localStorage.getItem('ks_fnb_item');
      if (raw) {
        const item: FnbItemApi = JSON.parse(raw);
        if (item.name === desc.name) return buildProductFromFnbItem(item);
      }
    } catch { /* ignore */ }
    return buildProduct(desc);
  }

  if (desc.kind === 'business') {
    const isNumericId = !isNaN(Number(desc.id));
    if (isNumericId) {
      try {
        const raw = localStorage.getItem('ks_biz_service');
        if (raw) {
          const service: BizServiceApi = JSON.parse(raw);
          if (service.id.toString() === desc.id) return buildProductFromBizService(service);
        }
      } catch { /* ignore */ }
    }
    return buildProduct(desc);
  }

  return buildProduct(desc);
}

/* ---- Descriptor helpers ---- */

function readDescriptor(): ProductDescriptor {
  try {
    const raw = localStorage.getItem('ks_product');
    if (raw) return JSON.parse(raw) as ProductDescriptor;
  } catch { /* ignore */ }
  return { kind: 'business', id: 'legalitas' };
}

function saveDescriptor(desc: ProductDescriptor) {
  try { localStorage.setItem('ks_product', JSON.stringify(desc)); } catch { /* ignore */ }
}

/* ---- Gallery ---- */
function PDGallery({ product, active, onSelect }: { product: Product; active: number; onSelect: (i: number) => void }) {
  const imgs = product.heroImages?.length ? product.heroImages : (product.heroImg ? [product.heroImg] : []);
  const phs  = product.galleryPlaceholders ?? [{ big: product.title, sub: product.cat, thumb: product.cat }];
  const a    = phs[active] ?? phs[0];

  // Multi-image gallery with real photos
  if (imgs.length > 0) {
    return (
      <div className="pd-gallery">
        <div className="pd-main-img" style={{ overflow: 'hidden' }}>
          {product.badge && <div className="badge">{product.badge}</div>}
          <img src={imgs[active] ?? imgs[0]} alt={product.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {imgs.length > 1 && (
          <div className="pd-thumbs">
            {imgs.map((url, i) => (
              <button key={i} type="button" className={`pd-thumb${active === i ? ' active' : ''}`} onClick={() => onSelect(i)} aria-label={`Foto ${i + 1}`}>
                <img src={url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pd-gallery">
      <div className="pd-main-img">
        {product.badge && <div className="badge">{product.badge}</div>}
        <div className="ph">
          <div className="ph-big">"{a.big}"</div>
          <div className="ph-mono">Photo · {a.sub}</div>
        </div>
      </div>
      {phs.length > 1 && (
        <div className="pd-thumbs">
          {phs.map((g, i) => (
            <button key={i} type="button" className={`pd-thumb${active === i ? ' active' : ''}`} onClick={() => onSelect(i)} aria-label={`Lihat ${g.thumb}`}>
              <div className="ph"><span>{g.thumb}</span></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Info column ---- */
function PDInfo({ product, variantId, setVariantId, qty, setQty, onOrder, roomSlot, canOrder, orderSlot }: {
  product: Product;
  variantId: string;
  setVariantId: (id: string) => void;
  qty: number;
  setQty: (n: number) => void;
  onOrder: () => void;
  roomSlot?: React.ReactNode;
  canOrder?: boolean;
  orderSlot?: React.ReactNode;
}) {
  const v: ProductVariant = product.variants.find(x => x.id === variantId) ?? product.variants[0];
  const total = v.price * qty;
  const isFree = v.price === 0;

  return (
    <div className="pd-info">
      <div className="pd-cat">{product.cat} · Kaspa Space</div>
      <h1 className="pd-title">{product.title}{product.titleEm && <> <em>{product.titleEm}</em></>}</h1>

      <div className="pd-rating-row">
        <span className="stars">{[0,1,2,3,4].map(i => <Icon.Star key={i} style={{ opacity: product.rating > 0 ? 1 : 0.3 }} />)}</span>
        <strong style={{ color: 'var(--text-primary)' }}>
          {product.rating > 0 ? product.rating.toFixed(1) : '—'}
        </strong>
        <a href="#ulasan">{product.reviewCount > 0 ? `${product.reviewCount} ulasan` : 'Belum ada ulasan'}</a>
        <span className="sep">·</span>
        <span>{product.variants.length} {product.kind === 'fnb' ? 'pilihan' : 'paket'} tersedia</span>
        {product.loc && <><span className="sep">·</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.Pin /> {product.loc}</span></>}
        {product.meta && <><span className="sep">·</span><span>{product.meta}</span></>}
      </div>

      <p className="pd-desc">{product.desc}</p>

      <div className="pd-price-card">
        <div className="pd-price-label">Harga untuk "{v.name}"</div>
        <div className="pd-price-row">
          <div className="pd-price">
            {isFree ? 'Gratis' : <>Rp{total.toLocaleString('id-ID')}</>}
            {v.unit && !isFree && <small style={{ fontSize: 15, color: 'var(--text-tertiary)', fontWeight: 500 }}> / {v.unit}</small>}
          </div>
        </div>
        {product.priceNote && <div className="pd-price-note">{product.priceNote}</div>}
      </div>

      <div className="pd-section">
        <h4>{product.kind === 'fnb' ? 'Pilihan' : 'Pilih Paket'} <span className="hint">{product.variants.length} opsi</span></h4>
        <div className="pd-variants">
          {product.variants.map(x => (
            <button key={x.id} type="button" className={`pd-variant${variantId === x.id ? ' active' : ''}`} onClick={() => setVariantId(x.id)}>
              <div className="v-name">
                {x.name}
                {x.bundle && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--success)', letterSpacing: '.12em' }}>BUNDLING</span>}
              </div>
              {x.desc && <div className="v-desc">{x.desc}</div>}
              <div className="v-price">{x.price === 0 ? 'Gratis' : <>Rp{x.price.toLocaleString('id-ID')}{x.unit && <small> / {x.unit}</small>}</>}</div>
            </button>
          ))}
        </div>
      </div>

      {roomSlot}

      {orderSlot ?? (
        <div className="pd-qty-row">
          <div className="pd-qty">
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Kurangi">−</button>
            <input value={qty} readOnly aria-label="Jumlah" />
            <button type="button" onClick={() => setQty(qty + 1)} aria-label="Tambah">+</button>
          </div>
          <button type="button" className="btn btn-primary pd-btn-primary" onClick={onOrder} disabled={canOrder === false}>
            Pesan Sekarang <Icon.Arrow />
          </button>
        </div>
      )}

      <a className="btn btn-ghost" href={waLink()} target="_blank" rel="noopener noreferrer" style={{ width: '100%', justifyContent: 'center' }}>
        <Icon.Whatsapp /> Konsultasi via WhatsApp
      </a>

      <div className="pd-trust">
        <div className="pd-trust-item"><ShieldCheckIcon /><div><strong>Transaksi Aman</strong>Pembayaran terenkripsi</div></div>
        <div className="pd-trust-item"><ClockIcon /><div><strong>Proses Cepat</strong>Konfirmasi otomatis</div></div>
        <div className="pd-trust-item"><HeadsetIcon /><div><strong>Support Responsif</strong>Bantuan via WhatsApp</div></div>
      </div>
    </div>
  );
}

/* ---- Star rating input ---- */
function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, fontSize: 28, color: n <= (hover || value) ? '#f59e0b' : 'var(--border)', lineHeight: 1 }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >★</button>
      ))}
    </div>
  );
}

/* ---- Tabs ---- */
type TabKey = 'desc' | 'incl' | 'docs' | 'steps' | 'terms' | 'reviews';

function PDTabs({ product, includedList }: { product: Product; includedList: { t: string; d?: string }[] }) {
  const [tab, setTab] = useState<TabKey>('desc');
  const { user } = useAuth();

  // Derive review identifiers from product
  const reviewType = product.kind === 'business' ? 'biz' : product.kind === 'fnb' ? 'fnb' : 'product_type';
  const reviewKey  = product.kind === 'fnb' ? product.id.replace('fnb-api-', '') : product.id;

  const [reviews,     setReviews]     = useState<ReviewApi[]>([]);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [reviewRating,  setReviewRating]  = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg,  setSubmitMsg]  = useState('');

  useEffect(() => {
    fetchReviews(reviewType, reviewKey).then(setReviews).catch(() => {});
    if (user) {
      checkReviewEligibility(reviewType, reviewKey).then(setEligibility).catch(() => {});
    }
  }, [reviewType, reviewKey, user]); // eslint-disable-line

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) return;
    setSubmitting(true); setSubmitMsg('');
    try {
      await submitReview({ reviewable_type: reviewType, reviewable_key: reviewKey, rating: reviewRating, comment: reviewComment || undefined });
      setSubmitMsg('Ulasan berhasil dikirim dan sedang menunggu moderasi. Terima kasih!');
      setEligibility(e => e ? { ...e, reviewed: true, my_review: { id: 0, rating: reviewRating, comment: reviewComment, status: 'pending' } } : e);
      fetchReviews(reviewType, reviewKey).then(setReviews).catch(() => {});
    } catch (err: any) {
      setSubmitMsg(err?.message ?? 'Gagal mengirim ulasan.');
    } finally { setSubmitting(false); }
  };

  const stepsLabel = product.kind === 'business' ? 'Proses' : product.kind === 'fnb' ? 'Cara Pesan' : 'Cara Booking';
  const includedLabel = product.kind === 'coworking' ? 'Fasilitas' : 'Yang Termasuk';

  const tabs: { key: TabKey; label: string }[] = [{ key: 'desc', label: 'Deskripsi' }];
  if (includedList.length) tabs.push({ key: 'incl', label: includedLabel });
  if (product.docs?.length) tabs.push({ key: 'docs', label: 'Dokumen' });
  if (product.steps?.length) tabs.push({ key: 'steps', label: stepsLabel });
  tabs.push({ key: 'terms', label: 'Syarat & Ketentuan' });
  tabs.push({ key: 'reviews', label: `Ulasan${reviews.length ? ` (${reviews.length})` : ''}` });

  return (
    <div className="pd-tabs-section" id="ulasan">
      <div className="pd-tabs">
        {tabs.map(t => (
          <button key={t.key} type="button" className={`pd-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'desc' && (
        <div className="pd-tab-body">
          <h3>Tentang <em>{product.title}</em></h3>
          <p style={{ marginBottom: 0 }}>{product.desc}</p>
        </div>
      )}

      {tab === 'incl' && (
        <div className="pd-tab-body">
          <h3>{includedLabel === 'Fasilitas' ? <>Fasilitas yang <em>Anda Dapat</em></> : <>Yang <em>Termasuk</em></>}</h3>
          <ul className="pd-list">
            {includedList.map((it, i) => (
              <li key={i}>
                <span className="ic"><CheckIcon /></span>
                <div><strong>{it.t}</strong>{it.d && <span>{it.d}</span>}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'docs' && product.docs && (
        <div className="pd-tab-body">
          <h3>{product.docsTitle ?? 'Dokumen yang Anda Siapkan'}</h3>
          {product.docsIntro && <p style={{ marginBottom: 18 }}>{product.docsIntro}</p>}
          <ul className="pd-list">
            {product.docs.map((it, i) => (
              <li key={i}>
                <span className="ic" style={{ background: 'rgba(59,130,246,.15)', color: 'var(--brand-glow)' }}><FileIcon /></span>
                <div><strong>{it.t}</strong>{it.d && <span>{it.d}</span>}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'steps' && product.steps && (
        <div className="pd-tab-body">
          <h3>{stepsLabel} <em>{product.steps.length} Langkah</em></h3>
          <div className="pd-steps">
            {product.steps.map((s, i) => (
              <div key={i} className="pd-step">
                <div className="n">0{i + 1}</div>
                <h5>{s.t}</h5>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'terms' && (
        <div className="pd-tab-body">
          <h3>Syarat &amp; <em>Ketentuan</em></h3>
          <p style={{ marginBottom: 18 }}>Dengan melanjutkan pemesanan, Anda dianggap menyetujui ketentuan berikut.</p>
          <ul className="pd-list">
            {product.terms.map((t, i) => (
              <li key={i}>
                <span className="ic" style={{ background: 'rgba(52,211,153,.15)', color: 'var(--success)' }}><FileIcon /></span>
                <div><strong style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{t}</strong></div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="pd-tab-body" style={{ maxWidth: 'none' }}>
          {/* Summary */}
          {reviews.length > 0 && (
            <div className="pd-reviews-head">
              <div>
                <div className="pd-reviews-score">{avgRating.toFixed(1)}</div>
                <div style={{ color: '#fbbf24', marginTop: 6, display: 'flex', gap: 1 }}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{ opacity: i <= Math.round(avgRating) ? 1 : 0.3 }}><Icon.Star /></span>
                  ))}
                </div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 4 }}>{reviews.length} ulasan terverifikasi</div>
              </div>
              <div className="pd-reviews-bars">
                {[5,4,3,2,1].map(n => {
                  const count = reviews.filter(r => r.rating === n).length;
                  const pct   = reviews.length ? Math.round(count / reviews.length * 100) : 0;
                  return (
                    <div key={n} className="pd-reviews-bar">
                      <div>{n} ★</div>
                      <div className="track"><div className="fill" style={{ width: `${pct}%` }} /></div>
                      <div>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review cards */}
          {reviews.map(r => (
            <div key={r.id} className="pd-review">
              <div className="pd-review-head">
                <div className="pd-review-avatar">{r.reviewer_name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="pd-review-name">{r.reviewer_name}</div>
                  <div className="pd-review-meta">
                    {new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div style={{ color: '#f59e0b', display: 'flex', gap: 2, margin: '6px 0' }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ opacity: i <= r.rating ? 1 : 0.25 }}>★</span>)}
              </div>
              {r.comment && <p>"{r.comment}"</p>}
            </div>
          ))}

          {reviews.length === 0 && (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '32px 0' }}>
              Belum ada ulasan untuk produk ini.
            </p>
          )}

          {/* Form tulis ulasan */}
          {!user ? (
            <div style={{ marginTop: 32, padding: '20px 24px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ marginBottom: 12 }}>Masuk untuk menulis ulasan produk ini.</p>
              <Link to="/masuk" className="btn btn-primary">Masuk <Icon.Arrow /></Link>
            </div>
          ) : eligibility === null ? null
          : !eligibility.eligible ? (
            <div style={{ marginTop: 32, padding: '16px 20px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-secondary)' }}>
              Ulasan hanya bisa ditulis setelah pesanan selesai.
            </div>
          ) : eligibility.reviewed && eligibility.my_review ? (
            <div style={{ marginTop: 32, padding: '20px 24px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Ulasan Anda</div>
              <div style={{ color: '#f59e0b', marginBottom: 6 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ opacity: i <= eligibility.my_review!.rating ? 1 : 0.25 }}>★</span>)}
              </div>
              {eligibility.my_review.comment && <p style={{ margin: 0 }}>"{eligibility.my_review.comment}"</p>}
              <p style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 8, marginBottom: 0 }}>
                Status: {eligibility.my_review.status === 'pending' ? 'Menunggu moderasi' : eligibility.my_review.status === 'approved' ? 'Disetujui' : 'Ditolak'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} style={{ marginTop: 32, padding: '20px 24px', background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Tulis Ulasan Anda</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Rating</label>
                <StarInput value={reviewRating} onChange={setReviewRating} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Komentar (opsional)</label>
                <textarea
                  rows={3} placeholder="Ceritakan pengalaman Anda..."
                  value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                  style={{ width: '100%', resize: 'vertical', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14 }}
                />
              </div>
              {submitMsg && <p style={{ color: submitMsg.includes('Terima') ? 'var(--success)' : 'var(--error)', fontSize: 13, marginBottom: 12 }}>{submitMsg}</p>}
              <button type="submit" className="btn btn-primary" disabled={submitting || !reviewRating}>
                {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Coworking booking section ---- */
const NEEDS_TIME_SET = new Set(['Share Desk', 'Private Room', 'Meeting Room', 'Overtime']);
const NEEDS_QTY_SET  = new Set(['Share Desk']);
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const nowRoundedUp = (): string => {
  const d = new Date();
  const h = d.getHours(), m = d.getMinutes();
  if (m === 0)  return `${String(h).padStart(2,'0')}:00`;
  if (m <= 30)  return `${String(h).padStart(2,'0')}:30`;
  const nh = h + 1;
  return nh < 24 ? `${String(nh).padStart(2,'0')}:00` : '23:30';
};
const addHour = (t: string): string => {
  const [h, m] = t.split(':').map(Number);
  const nh = h + 1;
  return nh < 24 ? `${String(nh).padStart(2,'0')}:${String(m).padStart(2,'0')}` : '23:59';
};
const DAY_ID   = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

interface OpHour { day: number; label: string; open: string; close: string; active: boolean; }

function CWBookingSection({ bookingType, roomId, roomTitle, roomLocation, onAddToCart }: {
  bookingType: string;
  roomId: number | null;
  roomTitle?: string;
  roomLocation?: string;
  onAddToCart: (payload: Record<string, unknown>) => void;
}) {
  const needsTime  = NEEDS_TIME_SET.has(bookingType);
  const needsQty   = NEEDS_QTY_SET.has(bookingType);
  const isOvertime = bookingType === 'Overtime';
  const isVO       = bookingType === 'Virtual Office';

  const [date,  setDate]  = useState('');
  const [start, setStart] = useState('08:00');
  const [end,   setEnd]   = useState('09:00');

  // Operational hours for the room's location
  const { data: opsData } = useApiGet<{ by_location: Record<string, OpHour[]> }>(
    () => fetch('/api/settings/operational-hours').then(r => r.json()),
    []
  );

  const todayOps: OpHour | null = (() => {
    if (!opsData?.by_location || !roomLocation || !date) return null;
    const locKey = Object.keys(opsData.by_location).find(k =>
      roomLocation.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(roomLocation.toLowerCase())
    );
    if (!locKey) return null;
    const dow = new Date(date + 'T00:00:00').getDay();
    return opsData.by_location[locKey]?.find(h => h.day === dow && h.active) ?? null;
  })();

  const opOpen  = todayOps?.open  ?? null;
  const opClose = todayOps?.close ?? null;
  const [qty,   setQty]   = useState(1);
  const [notes, setNotes] = useState('');

  const [schedule,        setSchedule]        = useState<OvertimeScheduleApi | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [avail,    setAvail]   = useState<AvailabilityResult | null>(null);
  const [checking, setChecking] = useState(false);

  const hasDateAndTime = !!date && (!needsTime || (!!start && !!end && start < end));

  // Overtime schedule
  useEffect(() => {
    if (!isOvertime || !roomId || !date) { setSchedule(null); return; }
    setLoadingSchedule(true);
    const dow = new Date(date + 'T00:00:00').getDay();
    fetchOvertimeSchedules(roomId)
      .then(list => {
        const s = list.find(x => x.day_of_week === dow && x.active) ?? null;
        setSchedule(s);
        if (s) { setStart(s.start_time.slice(0, 5)); setEnd(s.end_time.slice(0, 5)); }
      })
      .catch(() => setSchedule(null))
      .finally(() => setLoadingSchedule(false));
  }, [isOvertime, roomId, date]);

  // Availability check
  useEffect(() => {
    if (!roomId || !hasDateAndTime || isVO) { setAvail(null); return; }
    setChecking(true); setAvail(null);
    checkRoomAvailability(roomId, {
      product_type: bookingType,
      date,
      ...(needsTime ? { start_time: start, end_time: end } : {}),
    })
      .then(r => setAvail(r))
      .catch(() => setAvail(null))
      .finally(() => setChecking(false));
  }, [roomId, date, start, end, bookingType, hasDateAndTime, isVO, needsTime]);

  const isAvailOk = avail
    ? (bookingType === 'Share Desk' ? (avail.available_desks ?? 0) >= qty : avail.available === true)
    : false;

  // Validate time against operational hours
  const isTimeInOps = !needsTime || isOvertime || !opOpen || !opClose
    ? true
    : start >= opOpen && end <= opClose;

  const canAdd = !!date && (!needsTime || (start < end)) && isTimeInOps
    && (isVO || (!roomId ? false : isAvailOk)) && !checking;

  const handleAddToCart = () => {
    if (!canAdd) return;
    onAddToCart({
      room_id:          isVO ? null : roomId,
      room_title:       roomTitle ?? null,
      product_type_key: bookingType,
      booking_date:     date,
      start_time:       needsTime ? start : null,
      end_time:         needsTime ? end   : null,
      qty_desks:        needsQty ? qty : 1,
      notes:            notes || null,
    });
  };

  return (
    <div className="pd-section" style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
      <h4>Pilih <em>Jadwal</em></h4>

      {/* Date */}
      <div className="co-field" style={{ marginTop: 12 }}>
        <label htmlFor="cw-date">Tanggal Booking</label>
        <input id="cw-date" type="date" min={todayStr()} value={date}
          onChange={e => {
            const d = e.target.value;
            setDate(d); setAvail(null); setSchedule(null);
            if (d === todayStr() && needsTime && !isOvertime) {
              const s = nowRoundedUp();
              setStart(s); setEnd(addHour(s));
            }
          }} />
        {date && <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
          {DAY_ID[new Date(date + 'T00:00:00').getDay()]}
        </span>}
      </div>

      {/* Time */}
      {needsTime && (
        <div style={{ marginTop: 12 }}>
          {isOvertime ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {loadingSchedule ? 'Memuat jadwal overtime...'
                : schedule ? <>Jadwal: <strong>{schedule.start_time.slice(0,5)}–{schedule.end_time.slice(0,5)}</strong> ({DAY_ID[new Date(date+'T00:00:00').getDay()]})</>
                : roomId && date ? 'Tidak ada jadwal overtime hari ini.'
                : 'Pilih ruangan & tanggal untuk melihat jadwal.'}
            </p>
          ) : todayOps && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Jam operasional: <strong>{opOpen} – {opClose}</strong>
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="co-field">
              <label htmlFor="cw-start">Jam Mulai</label>
              <input id="cw-start" type="time" value={start}
                min={isOvertime && schedule ? schedule.start_time.slice(0,5) : (opOpen ?? undefined)}
                max={isOvertime && schedule ? schedule.end_time.slice(0,5)   : (opClose ?? undefined)}
                disabled={isOvertime && !schedule}
                onChange={e => { setStart(e.target.value); setAvail(null); }} />
            </div>
            <div className="co-field">
              <label htmlFor="cw-end">Jam Selesai</label>
              <input id="cw-end" type="time" value={end}
                min={start || (opOpen ?? undefined)}
                max={isOvertime && schedule ? schedule.end_time.slice(0,5) : (opClose ?? undefined)}
                disabled={isOvertime && !schedule}
                onChange={e => { setEnd(e.target.value); setAvail(null); }} />
            </div>
          </div>
          {start && end && start >= end && (
            <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>Jam selesai harus lebih besar dari jam mulai.</p>
          )}
          {!isOvertime && !isTimeInOps && opOpen && opClose && (
            <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
              ⚠ Jam harus dalam jam operasional: {opOpen} – {opClose}.
            </p>
          )}
          {!isOvertime && date && !todayOps && roomLocation && (
            <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>Lokasi tutup pada hari ini.</p>
          )}
        </div>
      )}

      {/* Qty (Share Desk) */}
      {needsQty && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Jumlah Meja</label>
          <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
            style={{ width: 34, height: 34, border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)', cursor: 'pointer', fontSize: 18 }}>−</button>
          <span style={{ fontWeight: 700, fontSize: 20, minWidth: 28, textAlign: 'center' }}>{qty}</span>
          <button type="button" onClick={() => setQty(q => q + 1)}
            style={{ width: 34, height: 34, border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)', cursor: 'pointer', fontSize: 18 }}>+</button>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>meja</span>
        </div>
      )}

      {/* Availability */}
      {!isVO && roomId && hasDateAndTime && (
        <div style={{ marginTop: 10 }}>
          {checking && <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Mengecek ketersediaan...</span>}
          {!checking && avail && (
            <div style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13,
              background: isAvailOk ? 'rgba(52,211,153,.08)' : 'rgba(239,68,68,.08)',
              border: `1px solid ${isAvailOk ? 'rgba(52,211,153,.25)' : 'rgba(239,68,68,.25)'}` }}>
              {isAvailOk
                ? <span style={{ color: 'var(--success)' }}>✓ {bookingType === 'Share Desk' ? `${avail.available_desks} meja tersedia` : 'Ruangan tersedia'}</span>
                : <span style={{ color: 'var(--error)' }}>{avail.reason ?? 'Tidak tersedia di waktu ini'}</span>}
            </div>
          )}
        </div>
      )}

      {/* Catatan */}
      <div className="co-field" style={{ marginTop: 12 }}>
        <label htmlFor="cw-notes">Catatan (opsional)</label>
        <textarea id="cw-notes" rows={2} placeholder="Permintaan khusus, dll."
          value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <button
        type="button"
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
        onClick={handleAddToCart}
        disabled={!canAdd}
      >
        Tambah Pesan <Icon.Arrow />
      </button>
      {!canAdd && date && (
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
          {!roomId && !isVO ? 'Pilih ruangan terlebih dahulu.'
            : checking ? 'Mengecek ketersediaan...'
            : needsTime && start >= end ? 'Perbaiki jam booking.'
            : !isTimeInOps && opOpen && opClose ? `Jam harus dalam ${opOpen} – ${opClose}.`
            : !isVO && !isAvailOk && avail ? 'Ruangan tidak tersedia di waktu ini.'
            : !isVO && !avail ? 'Cek ketersediaan terlebih dahulu.' : ''}
        </p>
      )}
    </div>
  );
}

/* ---- Related products ---- */
function RelatedProductsSection({
  descriptor,
  currentProduct,
  onOpenProduct,
}: {
  descriptor: ProductDescriptor;
  currentProduct: Product;
  onOpenProduct: (desc: ProductDescriptor) => void;
}) {
  const cwDesc = descriptor.kind === 'coworking'
    ? (descriptor as Extract<ProductDescriptor, { kind: 'coworking' }>)
    : null;
  const cwType = cwDesc?.type ?? null;

  // fetch all data regardless of kind so hooks are unconditional
  const { data: cwTypes }     = useApiGet<ProductTypeApi[]>(fetchPublicProductTypes, []);
  const { data: fnbItems }    = useApiGet<FnbItemApi[]>(fetchPublicFnbItems, []);
  const { data: bizServices } = useApiGet<BizServiceApi[]>(fetchPublicBizServices, []);

  /* ── CW: other product types from DB ── */
  if (descriptor.kind === 'coworking') {
    const related = (cwTypes ?? []).filter(pt => pt.key !== cwType).slice(0, 4);
    if (!related.length) return null;

    const openCw = (pt: ProductTypeApi) => {
      const desc: ProductDescriptor = {
        kind:               'coworking',
        type:               pt.key,
        requires_documents: pt.requires_documents,
        prices:             pt.prices,
        room: {
          title:   pt.name,
          loc:     pt.location,
          rating:  pt.rating,
          reviews: pt.reviews,
          price:   pt.suggested_price,
          unit:    pt.unit,
          badge:   pt.badge,
          capacity: pt.capacity,
          amenity: pt.amenity,
          images:  pt.images ?? [],
        },
      };
      onOpenProduct(desc);
    };

    return (
      <div className="pd-related">
        <div className="pd-related-head">
          <div>
            <span className="eyebrow">Coworking Lainnya</span>
            <h2>Pilihan <em>Tipe Lain</em></h2>
          </div>
          <Link to="/coworking" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 13 }}>
            Lihat Semua <Icon.Arrow />
          </Link>
        </div>
        <div className="bs-grid">
          {related.map(pt => {
            const img = pt.images?.[0] ?? pt.image ?? null;
            const price = pt.prices?.[0]?.price ?? pt.suggested_price;
            return (
              <article key={pt.id} className="bs-card" style={{ cursor: 'pointer' }} onClick={() => openCw(pt)}>
                <div className="bs-card-media">
                  {img
                    ? <img src={img} alt={pt.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div className="bs-card-placeholder"><div className="ph-mark">{pt.key}</div><div className="ph-sub">{pt.name}</div></div>
                  }
                  {pt.badge && <span className="bs-card-new">{pt.badge}</span>}
                </div>
                <div className="bs-card-body">
                  <span className="bs-card-cat">Coworking Space</span>
                  <h3 className="bs-card-title">{pt.name}</h3>
                  {pt.location && <p className="bs-card-desc" style={{ fontSize: 12, margin: '0 0 8px' }}>{pt.location}</p>}
                  <div className="bs-card-price">
                    <div>
                      <div className="bs-card-price-label">Mulai dari</div>
                      <div className="bs-card-price-val">
                        {price > 0 ? <>Rp{price.toLocaleString('id-ID')}<small style={{ fontWeight: 400, fontSize: 12 }}> / {pt.unit}</small></> : <em>Konsultasi</em>}
                      </div>
                    </div>
                  </div>
                  <span className="bs-card-cta">Lihat Detail <Icon.Arrow /></span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── FnB: same-category items from DB ── */
  if (descriptor.kind === 'fnb') {
    const currentId  = currentProduct.id.replace('fnb-api-', '');
    const currentCat = currentProduct.titleEm; // set to item.category in buildProductFromFnbItem
    const byCat      = (fnbItems ?? []).filter(i => i.id.toString() !== currentId && i.category === currentCat);
    const related    = (byCat.length >= 2 ? byCat : (fnbItems ?? []).filter(i => i.id.toString() !== currentId)).slice(0, 4);
    if (!related.length) return null;

    const openFnb = (item: FnbItemApi) => {
      try { localStorage.setItem('ks_fnb_item', JSON.stringify(item)); } catch { /* */ }
      onOpenProduct({ kind: 'fnb', name: item.name });
    };

    return (
      <div className="pd-related">
        <div className="pd-related-head">
          <div>
            <span className="eyebrow">Menu {currentCat ?? 'Lainnya'}</span>
            <h2>Mungkin <em>Anda Suka</em></h2>
          </div>
          <Link to="/fnb" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 13 }}>
            Lihat Semua <Icon.Arrow />
          </Link>
        </div>
        <div className="bs-grid">
          {related.map(item => (
            <article key={item.id} className="bs-card" style={{ cursor: 'pointer' }} onClick={() => openFnb(item)}>
              <div className="bs-card-media">
                {item.image
                  ? <img src={item.image} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div className="bs-card-placeholder"><div className="ph-mark">{item.category}</div><div className="ph-sub">{item.name}</div></div>
                }
              </div>
              <div className="bs-card-body">
                <span className="bs-card-cat">{item.category}</span>
                <h3 className="bs-card-title">{item.name}</h3>
                <div className="bs-card-price">
                  <div>
                    <div className="bs-card-price-label">Harga</div>
                    <div className="bs-card-price-val">Rp{item.price.toLocaleString('id-ID')}</div>
                  </div>
                </div>
                <span className="bs-card-cta">Lihat Detail <Icon.Arrow /></span>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  /* ── Biz: same-category services from DB ── */
  if (descriptor.kind === 'business') {
    const currentId = currentProduct.id;
    const storedCat = (() => {
      try { const r = localStorage.getItem('ks_biz_service'); return r ? (JSON.parse(r) as BizServiceApi).category : null; } catch { return null; }
    })();
    const byCat  = (bizServices ?? []).filter(s => s.id.toString() !== currentId && (!storedCat || s.category === storedCat));
    const related = (byCat.length >= 1 ? byCat : (bizServices ?? []).filter(s => s.id.toString() !== currentId)).slice(0, 4);
    if (!related.length) return null;

    const openBiz = (service: BizServiceApi) => {
      try { localStorage.setItem('ks_biz_service', JSON.stringify(service)); } catch { /* */ }
      onOpenProduct({ kind: 'business', id: service.id.toString() });
    };

    return (
      <div className="pd-related">
        <div className="pd-related-head">
          <div>
            <span className="eyebrow">{storedCat ?? 'Layanan'} Lainnya</span>
            <h2>Mungkin <em>Anda Butuh</em></h2>
          </div>
          <Link to="/bisnis" className="btn btn-ghost" style={{ padding: '10px 18px', fontSize: 13 }}>
            Lihat Semua <Icon.Arrow />
          </Link>
        </div>
        <div className="bs-grid">
          {related.map(service => (
            <article key={service.id} className="bs-card" style={{ cursor: 'pointer' }} onClick={() => openBiz(service)}>
              <div className="bs-card-media">
                {service.photo
                  ? <img src={service.photo} alt={service.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div className="bs-card-placeholder"><div className="ph-mark">{service.name.split(' ')[0]}</div></div>
                }
              </div>
              <div className="bs-card-body">
                <span className="bs-card-cat">{service.category || 'Business Service'}</span>
                <h3 className="bs-card-title">{service.name}</h3>
                <div className="bs-card-price">
                  <div>
                    <div className="bs-card-price-label">{service.price > 0 ? 'Mulai dari' : 'Harga'}</div>
                    <div className="bs-card-price-val">
                      {service.price > 0 ? <>Rp{service.price.toLocaleString('id-ID')}</> : <em>Konsultasi</em>}
                    </div>
                  </div>
                  {service.duration && <div className="bs-card-duration">{service.duration}</div>}
                </div>
                <span className="bs-card-cta">Lihat Detail <Icon.Arrow /></span>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/* ---- Page ---- */
export default function ProductDetailPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const [descriptor, setDescriptor] = useState<ProductDescriptor>(readDescriptor);
  const product = getProduct(descriptor);
  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState('');
  const [qty, setQty] = useState(1);

  // Room selector — only for coworking
  const isCW = descriptor.kind === 'coworking';
  const cwDesc = isCW ? (descriptor as Extract<ProductDescriptor, { kind: 'coworking' }>) : null;
  const cwType = cwDesc?.type ?? null;
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(cwDesc?.roomId ?? null);

  const { data: cwRooms } = useApiGet<RoomApi[]>(
    () => cwType ? fetchPublicRooms({ product_type: cwType }) : Promise.resolve([]),
    [cwType]
  );

  // Reset when descriptor changes
  useEffect(() => {
    setSelectedRoomId(cwDesc?.roomId ?? null);
  }, [descriptor]); // eslint-disable-line

  useEffect(() => {
    if (!product) return;
    const def = product.variants.find(v => v.popular) ?? product.variants[0];
    setVariantId(def?.id ?? '');
    setQty(1);
    setActiveImg(0);
  }, [descriptor]); // eslint-disable-line

  if (!product) {
    return (
      <div>
        <Navbar />
        <section className="com-page">
          <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
            <h2 className="section-title">Produk tidak <em>ditemukan</em></h2>
            <Link className="btn btn-primary" to="/bisnis" style={{ marginTop: 20 }}>Lihat Layanan <Icon.Arrow /></Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const v = product.variants.find(x => x.id === variantId) ?? product.variants[0];
  const includedList = (v?.features ? v.features.map(f => ({ t: f })) : product.included) ?? [];

  const openProduct = (desc: ProductDescriptor) => {
    saveDescriptor(desc);
    setDescriptor(desc);
    window.scrollTo(0, 0);
  };

  const onOrder = () => {
    if (product.kind === 'coworking') {
      const bookingType = v.bookingType ?? cwDesc?.type;
      if (bookingType && bookingType !== 'Virtual Office') {
        navigate(`/pesan?type=${encodeURIComponent(bookingType)}${selectedRoomId ? `&roomId=${selectedRoomId}` : ''}`);
        return;
      }
    }

    const bizId = product.kind === 'business' && !isNaN(Number(product.id)) ? Number(product.id) : null;

    // FnB: ambil ID database dari ks_fnb_item (product.id hanya slug, bukan numeric ID)
    let fnbDbId: number | null = null;
    if (product.kind === 'fnb') {
      try {
        const raw = localStorage.getItem('ks_fnb_item');
        if (raw) fnbDbId = (JSON.parse(raw) as { id: number }).id;
      } catch { /* ignore */ }
    }

    cart.add({
      descriptor: {
        bizServiceId:  bizId,
        fnbItemId:     fnbDbId,
        requiresDocs:  product.requiresDocs ?? false,
        category:      product.catForCheckout,
      },
      kind:       product.kind,
      product: {
        id:    product.id,
        cat:   product.catForCheckout,
        title: product.titleEm ? `${product.title} — ${product.titleEm}` : product.title,
        loc:   product.loc ?? null,
        img:   product.heroImg ?? null,
        kind:  product.kind,
      },
      variant: { id: String(v.id), name: v.name, price: v.price, unit: v.unit ?? null },
      price:      v.price,
      qty,
      adminFee:   product.adminFee ?? 0,
      depositPct: (product.requiresDocs ?? false) ? 50 : 0,
    });
    window.dispatchEvent(new CustomEvent('ks:open-cart'));
  };

  const backTo    = product.kind === 'fnb' ? '/fnb' : product.kind === 'coworking' ? '/coworking' : '/bisnis';
  const backLabel = product.kind === 'fnb' ? 'Food & Beverage' : product.kind === 'coworking' ? 'Coworking Space' : 'Business Service';

  const cwBookingType = isCW ? (v.bookingType ?? cwDesc?.type ?? '') : '';
  const selectedRoom  = cwRooms?.find(r => r.id === selectedRoomId) ?? null;

  const handleAddToCart = (payload: Record<string, unknown>) => {
    const qtyDesks = (payload.qty_desks as number) || 1;
    cart.add({
      descriptor: {
        room_id:            payload.room_id ?? null,
        room_title:         payload.room_title ?? null,
        room_location:      selectedRoom?.location ?? null,
        product_type_key:   payload.product_type_key,
        productName:        product.title,
        productLabel:       v.name,
        booking_date:       payload.booking_date,
        start_time:         payload.start_time ?? null,
        end_time:           payload.end_time   ?? null,
        qty_desks:          qtyDesks,
        notes:              payload.notes ?? null,
        price:              v.price,
        unit:               v.unit,
        requires_documents: cwDesc?.requires_documents ?? false,
        duration_months:    v.durationMonths ?? undefined,
      },
      kind: 'coworking',
      product: {
        id: product.id,
        cat: cwDesc?.type ?? 'Coworking',
        title: product.title,
        loc: selectedRoom?.location ?? null,
        img: product.heroImg ?? (product.heroImages?.[0] ?? null),
        kind: 'coworking',
      },
      variant: {
        id: String(v.id),
        name: v.name,
        price: v.price,
        unit: v.unit ?? null,
      },
      price: v.price * qtyDesks,
      qty: 1,
      adminFee: 0,
      depositPct: 0,
    });
    window.dispatchEvent(new CustomEvent('ks:open-cart'));
  };

  const orderSlot = isCW ? (
    <CWBookingSection
      key={`${cwBookingType}-${selectedRoomId}`}
      bookingType={cwBookingType}
      roomId={cwBookingType === 'Virtual Office' ? null : selectedRoomId}
      roomTitle={selectedRoom?.title}
      roomLocation={selectedRoom?.location}
      onAddToCart={handleAddToCart}
    />
  ) : undefined;

  const roomSlot = isCW && cwBookingType !== 'Virtual Office' ? (
    <div className="pd-section">
      <h4>Pilih <em>Ruangan</em> <span className="hint">{cwRooms ? `${cwRooms.length} ruangan` : '...'}</span></h4>
      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {!cwRooms && <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Memuat ruangan...</p>}
        {cwRooms?.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Tidak ada ruangan tersedia.</p>}
        {cwRooms?.map(r => (
          <label
            key={r.id}
            className={`co-pay${selectedRoomId === r.id ? ' active' : ''}`}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14, padding: 14 }}
          >
            <input
              type="radio"
              name="cw-room"
              value={r.id}
              checked={selectedRoomId === r.id}
              onChange={() => setSelectedRoomId(r.id)}
              style={{ display: 'none' }}
            />
            <div className="co-pay-radio" style={{ marginTop: 3, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {r.location}
                {r.capacity ? ` · ${r.capacity}` : ''}
                {r.amenity  ? ` · ${r.amenity}`  : ''}
              </div>
              {r.desks_total > 0 && (
                <div style={{ fontSize: 12, color: r.desks_avail > 0 ? 'var(--success)' : 'var(--error)', marginTop: 2 }}>
                  {r.desks_avail}/{r.desks_total} meja tersedia
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
      {isCW && !selectedRoomId && (
        <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 8 }}>Pilih ruangan untuk melanjutkan.</p>
      )}
    </div>
  ) : undefined;

  return (
    <div>
      <Navbar />
      <section className="com-page">
        <div className="container">
          <Link to={backTo} className="com-back">
            <Icon.ChevLeft /> Kembali ke {backLabel}
          </Link>
          <div className="pd-grid">
            <PDGallery product={product} active={activeImg} onSelect={setActiveImg} />
            <PDInfo
              product={product}
              variantId={variantId}
              setVariantId={setVariantId}
              qty={qty}
              setQty={setQty}
              onOrder={onOrder}
              roomSlot={roomSlot}
              canOrder={!isCW || !!selectedRoomId}
              orderSlot={orderSlot}
            />
          </div>
          <PDTabs product={product} includedList={includedList} />
          <RelatedProductsSection
            descriptor={descriptor}
            currentProduct={product}
            onOpenProduct={openProduct}
          />
        </div>
      </section>
      <Footer />
      <a className="wa-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </div>
  );
}
