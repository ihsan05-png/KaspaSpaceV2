import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { useApiGet } from '../hooks/useApiGet';
import { fetchPublicFnbItems, FnbItemApi } from '../lib/publicApi';
import { apiFetch } from '../lib/api';
import { waLink } from '../lib/config';

interface OperationalSettings {
  display_text: string;
  active_days:  string[];
}

function useOperationalHours() {
  return useApiGet<OperationalSettings>(
    () => apiFetch<OperationalSettings>('/api/settings/operational-hours')
  );
}

/* ============================================
   LOCAL SVG ICONS
   ============================================ */
type SvgProps = React.SVGProps<SVGSVGElement>;

function CupIcon(p: SvgProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
    </svg>
  );
}

function UtensilsIcon(p: SvgProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  );
}

function SaladIcon(p: SvgProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7 21h10" />
      <path d="M19.5 12 22 6H2l2.5 6" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="7" cy="9" r="1.5" />
      <circle cx="17" cy="9" r="1.5" />
    </svg>
  );
}

function CookieIcon(p: SvgProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="9" r=".8" fill="currentColor" />
      <circle cx="14" cy="14" r=".8" fill="currentColor" />
      <circle cx="15" cy="9" r=".8" fill="currentColor" />
      <circle cx="9" cy="15" r=".8" fill="currentColor" />
    </svg>
  );
}


/* ============================================
   CATEGORY CONFIG (icon mapping)
   ============================================ */
interface FnbCat { id: string; icon: React.ReactNode; }

const CAT_ICONS: Record<string, React.ReactNode> = {
  'Semua':    <UtensilsIcon />,
  'Kopi':    <Icon.Coffee />,
  'Non-Kopi': <CupIcon />,
  'Makanan': <SaladIcon />,
  'Snack':   <CookieIcon />,
};

function getCatIcon(id: string): React.ReactNode {
  return CAT_ICONS[id] ?? <UtensilsIcon />;
}

/* ============================================
   STATIC CONTENT
   ============================================ */
interface InfoCard { icon: React.ReactNode; title: string; desc: string; }

const INFO_CARDS: InfoCard[] = [
  {
    icon: <UtensilsIcon />,
    title: "Menu Lengkap",
    desc: "Tersedia aneka makanan berat, minuman segar, dan camilan favorit — semua dalam satu tempat yang nyaman.",
  },
  {
    icon: <SaladIcon />,
    title: "Bahan Segar Lokal",
    desc: "Sayuran dari kebun lokal, telur free range, dan bahan berkualitas tanpa pengawet. Enak dan sehat.",
  },
  {
    icon: <Icon.Tag />,
    title: "Harga Bersahabat",
    desc: "Member dapat diskon 20% otomatis. Non-member tetap dapat harga yang fair tanpa biaya tersembunyi.",
  },
];

interface HowToStep { n: string; title: string; desc: string; }

const HOW_TO_STEPS: HowToStep[] = [
  { n: "01", title: "Pilih Menu",       desc: "Browse menu di app atau langsung ke counter — semua menu sama harganya." },
  { n: "02", title: "Tunjukkan Member", desc: "Scan QR member di kasir untuk diskon 20% otomatis." },
  { n: "03", title: "Bayar",            desc: "QRIS, e-wallet, transfer, atau tunai — pilih yang paling nyaman." },
  { n: "04", title: "Diantar atau Pickup", desc: "Pesanan diantar ke desk Anda, atau ambil sendiri di counter." },
];

/* ============================================
   HERO
   ============================================ */
function FnBHero() {
  const { data: ops } = useOperationalHours();
  const hoursText = ops?.display_text ?? '08:00 – 22:00';

  return (
    <section className="fnb-hero">
      <div className="container">
        <div className="breadcrumb fnb-breadcrumb">
          <Link to="/">Beranda</Link>
          <span className="sep">/</span>
          <span>Produk</span>
          <span className="sep">/</span>
          <span className="current fnb-current">Food &amp; Beverage</span>
        </div>

        <div className="fnb-hero-grid">
          <div>
            <span className="chip chip-dot chip-uppercase fnb-chip-amber">
              Buka {hoursText} setiap hari
            </span>
            <h1 className="fnb-hero-title">
              Makan Enak,<br />
              <em>Kerja Lebih Semangat</em>
            </h1>
            <p className="fnb-hero-lede">
              Kafe internal Kaspa Space menyajikan aneka makanan, minuman segar, dan
              camilan favorit — semua dengan diskon 20% untuk member aktif.
            </p>
            <div className="fnb-hero-btns">
              <a className="btn btn-fnb" href="#menu">Lihat Menu <Icon.Arrow /></a>
              <a className="btn btn-ghost" href="#cara">Cara Pesan</a>
            </div>
            <div className="fnb-hero-stats">
              <div>
                <div className="fnb-hero-stat-num">40<em>+</em></div>
                <div className="fnb-hero-stat-label">Menu Pilihan</div>
              </div>
              <div>
                <div className="fnb-hero-stat-num">4.8<em>★</em></div>
                <div className="fnb-hero-stat-label">Rating</div>
              </div>
              <div>
                <div className="fnb-hero-stat-num">20<em>%</em></div>
                <div className="fnb-hero-stat-label">Diskon Member</div>
              </div>
            </div>
          </div>

          <div className="fnb-hero-media">
            <img
              src="https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=80"
              alt="Food & Beverage Kaspa Space"
            />
            <div className="fnb-hero-floater tl">
              <div className="icon"><UtensilsIcon /></div>
              <div>
                <div className="num">40<span className="fnb-floater-accent">+</span></div>
                <div className="label">Menu Tersedia</div>
              </div>
            </div>
            <div className="fnb-hero-floater br">
              <div className="icon"><SaladIcon /></div>
              <div>
                <div className="num">3</div>
                <div className="label">Kategori: Makanan, Minuman, Snack</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PROMO BANNER
   ============================================ */
function FnBPromo() {
  return (
    <section className="fnb-promo">
      <div className="container">
        <div className="fnb-promo-card">
          <div className="fnb-promo-badge">
            20%
            <small>OFF</small>
          </div>
          <div>
            <h3 className="fnb-promo-title">
              Diskon <em>Member</em> Setiap Hari
            </h3>
            <p className="fnb-promo-desc">
              Tunjukkan kartu member di kasir, atau pesan via app untuk otomatis dapat diskon 20%
              di semua menu makanan &amp; minuman.
            </p>
          </div>
          <Link to="/kontak" className="btn btn-fnb">
            Jadi Member <Icon.Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   MENU GRID  ← data from API
   ============================================ */
function FnBMenu() {
  const navigate = useNavigate();
  const { data: items, loading, error } = useApiGet<FnbItemApi[]>(fetchPublicFnbItems);
  const [activeCat, setActiveCat] = useState('Semua');

  const cats = useMemo((): FnbCat[] => {
    if (!items) return [{ id: 'Semua', icon: getCatIcon('Semua') }];
    const seen = new Set<string>();
    const result: FnbCat[] = [{ id: 'Semua', icon: getCatIcon('Semua') }];
    items.forEach(item => {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        result.push({ id: item.category, icon: getCatIcon(item.category) });
      }
    });
    return result;
  }, [items]);

  const visibleItems = useMemo(() => {
    if (!items) return [];
    return activeCat === 'Semua' ? items : items.filter(m => m.category === activeCat);
  }, [items, activeCat]);

  const openFnb = (item: FnbItemApi) => {
    try {
      localStorage.setItem('ks_fnb_item', JSON.stringify(item));
      localStorage.setItem('ks_product', JSON.stringify({ kind: 'fnb', name: item.name }));
    } catch { /* ignore */ }
    navigate('/produk');
  };

  return (
    <section className="menu-section" id="menu">
      <div className="container">
        <div className="menu-head">
          <span className="eyebrow fnb-eyebrow">Menu</span>
          <h2 className="section-title">
            Cita Rasa{' '}
            <em className="fnb-gradient-text">Pilihan</em>
          </h2>
          <p className="section-sub fnb-sub-centered">
            Setiap menu dibuat fresh setiap hari dengan bahan pilihan dari supplier lokal.
          </p>
        </div>

        <div className="menu-categories">
          {cats.map(c => (
            <button
              key={c.id}
              type="button"
              className={`menu-cat${activeCat === c.id ? ' active' : ''}`}
              onClick={() => setActiveCat(c.id)}
            >
              {c.icon} {c.id}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
            Memuat menu...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
            Gagal memuat menu. Silakan muat ulang halaman.
          </div>
        )}

        {!loading && !error && (
          <div className="menu-grid">
            {visibleItems.map(item => (
              <article key={item.id} className="menu-item">
                <div className="menu-media">
                  {item.image
                    ? <img src={item.image} alt={item.name} loading="lazy" />
                    : (
                      <div className="bs-card-placeholder">
                        <div className="ph-mark">{item.category}</div>
                        <div className="ph-sub">{item.name}</div>
                      </div>
                    )
                  }
                </div>
                <div className="menu-body">
                  <div className="menu-name-row">
                    <h3 className="menu-name">{item.name}</h3>
                  </div>
                  {item.description && <p className="menu-desc">{item.description}</p>}
                  <div className="menu-meta">
                    <span><Icon.Tag /> {item.category}</span>
                    <span>{item.unit}</span>
                  </div>
                  <div className="menu-foot">
                    <div>
                      <div className="menu-price-row">
                        <span className="menu-price">
                          Rp{item.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="menu-price-member">-20% untuk member</div>
                    </div>
                    <button
                      type="button"
                      className="menu-add"
                      aria-label={`Tambah ${item.name} ke keranjang`}
                      onClick={() => openFnb(item)}
                    >
                      <Icon.Plus />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && visibleItems.length === 0 && items && items.length > 0 && (
          <div className="rooms-empty">
            <div className="rooms-empty-title">Tidak ada menu di kategori ini</div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================
   CAFE INFO
   ============================================ */
function FnBInfo() {
  return (
    <section className="cafe-info">
      <div className="container">
        <div className="fnb-section-head">
          <span className="eyebrow fnb-eyebrow">Kenapa Kafe Kami</span>
          <h2 className="section-title">
            Lebih dari <em className="fnb-gradient-text">Sekadar Kopi</em>
          </h2>
        </div>
        <div className="cafe-info-grid">
          {INFO_CARDS.map((card, i) => (
            <div key={i} className="cafe-info-card">
              <div className="cafe-info-icon">{card.icon}</div>
              <h3 className="cafe-info-title">{card.title}</h3>
              <p className="cafe-info-desc">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   HOW TO ORDER
   ============================================ */
function FnBHowTo() {
  return (
    <section className="howto-section" id="cara">
      <div className="container">
        <div className="howto-head">
          <span className="eyebrow fnb-eyebrow">Cara Pesan</span>
          <h2 className="section-title">
            Empat <em className="fnb-gradient-text">Langkah Cepat</em>
          </h2>
        </div>
        <div className="howto-grid">
          {HOW_TO_STEPS.map(step => (
            <div key={step.n} className="howto-card">
              <div className="howto-num">{step.n}</div>
              <h4 className="howto-title">{step.title}</h4>
              <p className="howto-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PAGE
   ============================================ */
export default function FnBPage() {
  return (
    <div>
      <Navbar />
      <FnBHero />
      <FnBPromo />
      <FnBMenu />
      <FnBInfo />
      <FnBHowTo />
      <Footer />
      <a className="wa-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp">
        <Icon.Whatsapp />
      </a>
    </div>
  );
}
