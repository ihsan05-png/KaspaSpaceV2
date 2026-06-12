import { useState, useEffect, useMemo, Fragment } from 'react';
import type { SVGProps } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { useApiGet } from '../hooks/useApiGet';
import { fetchMatrix, MatrixRoomApi } from '../lib/publicApi';
import { apiFetch } from '../lib/api';
import { waLink } from '../lib/config';

interface PriceTier { label: string; price: number; unit: string; booking_type?: string; is_share_desk?: boolean; duration_months?: number; }
interface PublicProductType {
  id: number; key: string; name: string; description: string | null;
  unit: string; suggested_price: number; location: string | null;
  images: string[] | null; image: string | null;
  amenity: string | null; capacity: string | null; badge: string | null;
  prices: PriceTier[] | null; rating: number; reviews: number;
  requires_documents: boolean;
}

/* ============================================================
   EXTRA ICONS
   ============================================================ */
type SVGIconProps = SVGProps<SVGSVGElement>;

const CWIcon = {
  Heart: (p: SVGIconProps) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Filter: (p: SVGIconProps) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Check: (p: SVGIconProps) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: (p: SVGIconProps) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Tilde: (p: SVGIconProps) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  ),
};

/* ============================================================
   TYPES
   ============================================================ */
interface BookingStep  { n: string; title: string; desc: string; }
interface CompareRow   { label: string; v: string[]; m: MarkKey[]; }
interface Faq          { q: string; a: string; }
type MarkKey = 'good' | 'warn' | 'bad';

/* ============================================================
   PRODUCT TYPE → DISPLAY LABEL
   ============================================================ */
const PRODUCT_TYPE_LABELS: Record<string, string> = {
  'Share Desk':     'Coworking',
  'Private Room':   'Private Room',
  'Meeting Room':   'Meeting Room',
  'Private Office': 'Private Office',
  'Virtual Office': 'Virtual Office',
  'Overtime':       'Overtime',
};



/* ============================================================
   FILTER CONFIG  (using actual product type keys)
   ============================================================ */
const FILTER_TYPES = [
  'Semua Tipe',
  'Share Desk',
  'Private Room',
  'Private Office',
  'Meeting Room',
  'Virtual Office',
  'Overtime',
];

const QUICK_TYPE_CHIPS = ['Share Desk', 'Meeting Room', 'Virtual Office', 'Private Office'];


const BOOKING_STEPS: BookingStep[] = [
  { n: '01', title: 'Pilih Ruangan',     desc: 'Cek ketersediaan ruangan dari katalog atau jadwal real-time di atas.' },
  { n: '02', title: 'Pilih Tanggal & Slot', desc: 'Klik slot waktu yang berwarna hijau (tersedia) sesuai kebutuhan.' },
  { n: '03', title: 'Isi Form & Bayar',  desc: 'Lengkapi data pemesan dan pilih metode pembayaran — QRIS, transfer, atau kartu.' },
  { n: '04', title: 'Datang & Check-in', desc: 'Tunjukkan e-tiket ke resepsionis. Tim kami siap menyambut Anda.' },
];

const COMPARE_COLS = [
  { key: 'private',   name: 'Private Office', tag: 'Premium'              },
  { key: 'coworking', name: 'Coworking Space', tag: 'Fleksibel', featured: true },
  { key: 'virtual',   name: 'Virtual Office',  tag: 'Ekonomis'             },
];

const COMPARE_ROWS: CompareRow[] = [
  { label: 'Biaya Renovasi',       v: ['Rp0',           'Rp0',              'Rp0'          ], m: ['good', 'good', 'good'] },
  { label: 'Biaya Langganan',      v: ['Rp2–4jt/bln',   'Rp25rb–Rp1jt',    'Rp200rb/bln'  ], m: ['warn', 'good', 'good'] },
  { label: 'Waktu Setup',          v: ['Siap pakai',    'Siap pakai',       'Siap pakai'   ], m: ['good', 'good', 'good'] },
  { label: 'Fleksibilitas',        v: ['Fleksibel',     'Sangat fleksibel', 'Sangat fleksibel'], m: ['warn', 'good', 'good'] },
  { label: 'Kredibilitas',         v: ['Sangat kredibel','Sangat kredibel', 'Sangat kredibel'], m: ['good', 'good', 'good'] },
  { label: 'Privasi',              v: ['Tinggi',        'Sedang',           'Tinggi'       ], m: ['good', 'warn', 'good'] },
  { label: 'Gangguan Operasional', v: ['Rendah',        'Rendah',           'Sangat rendah'], m: ['good', 'good', 'good'] },
  { label: 'Risiko Keuangan',      v: ['Rendah',        'Sangat rendah',    'Sangat rendah'], m: ['warn', 'good', 'good'] },
  { label: 'Produktivitas',        v: ['Sangat tinggi', 'Sangat tinggi',    'Tergantung tim'], m: ['good', 'good', 'warn'] },
];

const CW_FAQS: Faq[] = [
  { q: 'Bagaimana cara mengetahui ketersediaan ruangan?', a: 'Lihat tabel jadwal & ketersediaan di atas — slot hijau berarti tersedia, slot merah sudah terisi. Jika ruangan yang Anda butuhkan penuh, tim kami bisa membantu mencarikan alternatif.' },
  { q: 'Bagaimana prosedur booking?',                     a: 'Pilih produk atau layanan yang Anda butuhkan → masuk ke keranjang → isi formulir data pemesan → pilih metode pembayaran → setujui Syarat & Ketentuan → bayar. E-tiket otomatis dikirim ke email Anda.' },
  { q: 'Bagaimana konfirmasi setelah pembayaran?',        a: 'Setelah pembayaran berhasil, Anda akan menerima email invoice & e-tiket dalam 5 menit. Tunjukkan e-tiket ke resepsionis saat datang — tidak perlu konfirmasi manual.' },
  { q: 'Apakah ada surat perjanjian sewa?',               a: 'Ya. Untuk paket bulanan & tahunan, kami sediakan surat perjanjian resmi yang dapat diunduh dari dashboard member setelah pembayaran.' },
  { q: 'Apakah kantor dapat diakses 24 jam?',             a: 'Coworking standar buka jam 08:00–22:00. Untuk akses 24 jam, ambil paket Overtime atau Private Office yang sudah include akses 24/7.' },
  { q: 'Bisa upgrade paket di tengah jalan?',             a: 'Tentu. Anda bisa upgrade dari paket harian ke bulanan, atau dari coworking ke private office kapan saja. Selisih biaya akan dihitung pro-rata.' },
];

/* ============================================================
   SUB-HERO
   ============================================================ */
function CWSubHero() {
  return (
    <section className="subhero">
      <div className="subhero-bg">
        <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=80" alt="Coworking space" />
      </div>
      <div className="container subhero-inner">
        <div className="breadcrumb">
          <Link to="/">Beranda</Link>
          <span className="sep">/</span>
          <span className="current">Coworking Space</span>
        </div>
        <span className="chip chip-dot chip-uppercase">Ruangan tersedia di berbagai lokasi</span>
        <h1 className="subhero-title">Coworking <em>Space</em></h1>
        <p className="subhero-lede">
          Booking online lebih mudah. Sewa kantor per jam, harian, bulanan, atau tahunan —
          sesuaikan dengan kebutuhan tim dan ritme kerja Anda.
        </p>
        <div className="hero-cta cw-subhero-cta">
          <a className="btn btn-primary" href="#rooms">Lihat Ruangan <Icon.Arrow /></a>
          <a className="btn btn-ghost" href="#schedule">Cek Jadwal</a>
        </div>
        <div className="subhero-stats">
          <div className="subhero-stat">
            <div className="subhero-stat-num">4.9<em>★</em></div>
            <div className="subhero-stat-label">Rating</div>
          </div>
          <div className="subhero-stat-divider" />
          <div className="subhero-stat">
            <div className="subhero-stat-num">500<em>+</em></div>
            <div className="subhero-stat-label">Member</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PRODUCT CARD  (satu card per product type)
   ============================================================ */
interface ProductCardProps {
  pt: PublicProductType;
  onOrder: () => void;
}

function ProductCard({ pt, onOrder }: ProductCardProps) {
  const heroImg = pt.images?.[0] ?? pt.image ?? null;
  const loc     = pt.location ?? '';

  return (
    <div className="room-card room-card-clickable" onClick={onOrder}>
      <div className="room-media">
        {heroImg
          ? <img src={heroImg} alt={pt.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : (
            <div className="bs-card-placeholder">
              <div className="ph-mark">{pt.name}</div>
              <div className="ph-sub">{loc.toUpperCase()}</div>
            </div>
          )
        }
        {pt.badge && <span className={`room-badge${pt.badge === 'Populer' ? ' featured' : ''}`}>{pt.badge}</span>}
      </div>
      <div className="room-body">
        <div className="room-body-top">
          <span className="room-type">{pt.name}{loc && <span className="room-type-loc"> · {loc}</span>}</span>
          <span className="room-rating">
            <Icon.Star /> {pt.rating > 0 ? pt.rating.toFixed(1) : '—'}
            <span className="room-rating-count">({pt.reviews})</span>
          </span>
        </div>
        <h3 className="room-title">{pt.name}</h3>
        {loc && (
          <div className="room-meta">
            <span className="room-meta-item"><Icon.Pin /> {loc}</span>
          </div>
        )}
        <div className="room-amenities">
          {pt.capacity && <span><Icon.Users /> {pt.capacity}</span>}
          {pt.amenity  && <span><Icon.Wifi /> {pt.amenity}</span>}
        </div>
        <div className="room-foot">
          <div>
            <div className="room-price-label">Mulai</div>
            <div className="room-price">
              Rp{pt.suggested_price.toLocaleString('id-ID')} <small>/ {pt.unit}</small>
            </div>
          </div>
          <button type="button" className="room-btn-pesan" onClick={e => { e.stopPropagation(); onOrder(); }}>
            Pesan <Icon.Arrow />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FILTER + PRODUCT GRID  ← data from /api/product-types
   ============================================================ */
function CWFilterAndGrid() {
  const navigate = useNavigate();
  const { data: apiTypes, loading, error } = useApiGet<PublicProductType[]>(
    () => apiFetch<PublicProductType[]>('/api/product-types')
  );

  const [searchParams] = useSearchParams();
  const initSearch = searchParams.get('search') || '';

  const [location, setLocation] = useState('Semua Lokasi');
  const [type, setType]         = useState('Semua Tipe');
  const [sort, setSort]         = useState('rekomendasi');
  const [search, setSearch]     = useState(initSearch);

  const products = apiTypes ?? [];

  const locations = useMemo(() => {
    const seen = new Set<string>();
    products.forEach(p => { if (p.location) seen.add(p.location); });
    return ['Semua Lokasi', ...Array.from(seen)];
  }, [products]);

  const openCoworking = (pt: PublicProductType) => {
    try {
      localStorage.setItem('ks_product', JSON.stringify({
        kind:               'coworking',
        type:               pt.key,
        roomId:             null,
        requires_documents: pt.requires_documents ?? false,
        prices:             pt.prices,
        room: {
          title:    pt.name,
          loc:      pt.location,
          rating:   pt.rating,
          reviews:  pt.reviews,
          price:    pt.suggested_price,
          unit:     pt.unit,
          badge:    pt.badge,
          capacity: pt.capacity,
          amenity:  pt.amenity,
          images:   pt.images ?? [],
        },
      }));
    } catch { /* ignore */ }
    navigate('/produk');
  };

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchesLocation = location === 'Semua Lokasi' || p.location === location;
      const matchesType     = type === 'Semua Tipe' || p.key === type;
      const searchTerm      = search.toLowerCase();
      const matchesSearch   = !search || `${p.name} ${p.location ?? ''}`.toLowerCase().includes(searchTerm);
      return matchesLocation && matchesType && matchesSearch;
    });

    if (sort === 'harga-rendah') list = [...list].sort((a, b) => a.suggested_price - b.suggested_price);
    if (sort === 'harga-tinggi') list = [...list].sort((a, b) => b.suggested_price - a.suggested_price);
    if (sort === 'rating')       list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [products, location, type, sort, search]);

  const resetFilters = () => {
    setLocation('Semua Lokasi');
    setType('Semua Tipe');
    setSearch('');
  };

  const toggleTypeChip = (chip: string) => {
    setType(type === chip ? 'Semua Tipe' : chip);
  };

  return (
    <section className="filter-section" id="rooms">
      <div className="container">

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-field">
            <label>Cari Ruangan</label>
            <div className="filter-field-inner">
              <Icon.Search />
              <input
                placeholder="Cari nama atau lokasi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-field">
            <label>Lokasi</label>
            <div className="filter-field-inner">
              <Icon.Pin />
              <select value={location} onChange={e => setLocation(e.target.value)} title="Lokasi">
                {locations.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="filter-field">
            <label>Tipe Ruangan</label>
            <div className="filter-field-inner">
              <Icon.Briefcase />
              <select value={type} onChange={e => setType(e.target.value)} title="Tipe Ruangan">
                {FILTER_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t === 'Semua Tipe' ? t : (PRODUCT_TYPE_LABELS[t] ?? t)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="qs-search-btn">
            <CWIcon.Filter /> Terapkan
          </button>
        </div>

        {/* Quick type chips */}
        <div className="filter-chips">
          <span className="filter-label">Cepat</span>
          {QUICK_TYPE_CHIPS.map(chip => (
            <button
              key={chip}
              type="button"
              className={`qtag${type === chip ? ' active' : ''}`}
              onClick={() => toggleTypeChip(chip)}
            >
              {PRODUCT_TYPE_LABELS[chip] ?? chip}
            </button>
          ))}
          <div className="filter-sort">
            <span>Urutkan:</span>
            <select value={sort} onChange={e => setSort(e.target.value)} title="Urutkan">
              <option value="rekomendasi">Rekomendasi</option>
              <option value="harga-rendah">Harga: Terendah</option>
              <option value="harga-tinggi">Harga: Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
            Memuat ruangan...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
            Gagal memuat data ruangan. Silakan muat ulang halaman.
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Results count */}
            <div className="results-count">
              <span className="results-count-label">
                Menampilkan <strong>{filtered.length}</strong> dari <strong>{products.length}</strong> produk
                {location !== 'Semua Lokasi' && <> di <strong>{location}</strong></>}
              </span>
            </div>

            {/* Product grid */}
            <div className="room-grid">
              {filtered.map(pt => (
                <ProductCard
                  key={pt.id}
                  pt={pt}
                  onOrder={() => openCoworking(pt)}
                />
              ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="rooms-empty">
                <div className="rooms-empty-title">Tidak ada produk ditemukan</div>
                <p>Coba ubah filter atau cari dengan kata kunci lain.</p>
                <button type="button" className="btn btn-ghost" onClick={resetFilters}>Reset Filter</button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}

/* ============================================================
   SCHEDULE  (real-time dari database)
   ============================================================ */
function addDays(base: Date, n: number): Date {
  const d = new Date(base); d.setDate(d.getDate() + n); return d;
}
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateStr(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, day] = iso.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function MatrixStatusBadge({ pt }: { pt: MatrixRoomApi['product_types'][number] }) {
  if (pt.status === 'available') {
    const label = pt.key === 'Share Desk' && pt.total_desks
      ? `${pt.available_desks}/${pt.total_desks} meja tersedia`
      : 'Tersedia';
    return <span className="avail-badge avail-badge--available">{label}</span>;
  }
  return <span className="avail-badge avail-badge--full">Terisi</span>;
}

function CWSchedule() {
  const today = useMemo(() => new Date(new Date().toDateString()), []);
  const [offset, setOffset] = useState(0);
  const [matrix, setMatrix] = useState<MatrixRoomApi[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDate = useMemo(() => addDays(today, offset), [today, offset]);
  const dateStr     = toDateStr(currentDate);

  useEffect(() => {
    setLoading(true);
    fetchMatrix(dateStr)
      .then((res: { rooms: MatrixRoomApi[] }) => setMatrix(res.rooms))
      .catch(() => setMatrix([]))
      .finally(() => setLoading(false));
  }, [dateStr]);

  return (
    <section className="schedule-section" id="schedule">
      <div className="container">

        <div className="schedule-head">
          <span className="eyebrow">Cek Ketersediaan</span>
          <h2 className="section-title">Ketersediaan <em>Ruangan</em></h2>
          <p className="section-sub schedule-sub">
            Data real-time dari database. Slot merah sudah terisi booking aktif.
          </p>
        </div>

        <div className="schedule-toolbar">
          <div className="schedule-date-nav">
            <button type="button" onClick={() => setOffset(o => Math.max(0, o - 1))} aria-label="Sebelumnya" disabled={offset === 0}><Icon.ChevLeft /></button>
            <div className="schedule-date-display"><em>{fmtDate(currentDate)}</em></div>
            <button type="button" onClick={() => setOffset(o => o + 1)} aria-label="Berikutnya"><Icon.ChevRight /></button>
          </div>
          <div style={{ flex: 1 }} />
        </div>

        <div className="schedule-table">
          {loading ? (
            <div className="sched-placeholder">Memuat data...</div>
          ) : matrix.length === 0 ? (
            <div className="sched-placeholder">Tidak ada ruangan aktif.</div>
          ) : (
            <table className="avail-matrix">
              <thead>
                <tr>
                  <th>Ruangan</th>
                  <th>Sub Tipe</th>
                  <th>Status</th>
                  <th>INV</th>
                  <th>Jam Mulai</th>
                  <th>Jam Selesai</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map(room => room.product_types.map((pt, pi) => (
                  <tr key={`${room.id}-${pt.key}`} className={pi === 0 ? 'avail-row-first' : ''}>
                    {pi === 0 && (
                      <td className="avail-room-cell" rowSpan={room.product_types.length}>
                        <div className="avail-room-name">{room.title}</div>
                        <div className="avail-room-loc">{room.location}</div>
                      </td>
                    )}
                    <td className="avail-subtype">{pt.key}</td>
                    <td><MatrixStatusBadge pt={pt} /></td>
                    <td className="avail-meta">{pt.booking?.inv ?? '—'}</td>
                    <td className="avail-meta">
                      {pt.booking?.start_time ?? fmtDateStr(pt.booking?.booking_date)}
                    </td>
                    <td className="avail-meta">
                      {pt.booking?.end_time ?? fmtDateStr(pt.booking?.end_date)}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          )}
        </div>
        <div className="schedule-legend">
          <span className="legend-dot avail">Tersedia</span>
          <span className="legend-dot book">Terisi</span>
        </div>

        <div className="procedure-head">
          <span className="eyebrow">Cara Booking</span>
          <h3 className="section-title procedure-title">Hanya <em>4 Langkah</em></h3>
        </div>
        <div className="procedure">
          {BOOKING_STEPS.map(step => (
            <div key={step.n} className="procedure-step">
              <div className="procedure-num">{step.n}</div>
              <h4 className="procedure-step-title">{step.title}</h4>
              <p className="procedure-desc">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ============================================================
   COMPARISON TABLE
   ============================================================ */
function CWCompare() {
  const Mark = ({ k }: { k: MarkKey }) => {
    const map: Record<MarkKey, React.ReactElement> = {
      good: <span className="compare-icon good"><CWIcon.Check /></span>,
      warn: <span className="compare-icon warn"><CWIcon.Tilde /></span>,
      bad:  <span className="compare-icon bad"><CWIcon.X /></span>,
    };
    return map[k];
  };

  return (
    <section className="compare-section">
      <div className="container">
        <div className="compare-head">
          <span className="eyebrow">Perbandingan</span>
          <h2 className="section-title">Kenapa <em>Coworking?</em></h2>
          <p className="section-sub compare-sub">
            Bandingkan dengan opsi lain — kami transparan dengan angka & realita.
          </p>
        </div>

        <div className="compare-wrap">
          <div className="compare-table">
            <div className="compare-cell compare-head-cell">
              <span className="compare-head-tag">Kategori</span>
              <span className="compare-head-name">Aspek</span>
            </div>
            {COMPARE_COLS.map(col => (
              <div key={col.key} className={`compare-cell compare-head-cell${col.featured ? ' featured' : ''}`}>
                <span className="compare-head-tag">{col.tag}</span>
                <span className="compare-head-name">{col.name}</span>
              </div>
            ))}
            {COMPARE_ROWS.map((row, rowIdx) => (
              <Fragment key={rowIdx}>
                <div className="compare-cell compare-label">{row.label}</div>
                {row.v.map((val, colIdx) => (
                  <div key={colIdx} className={`compare-cell compare-value${COMPARE_COLS[colIdx].featured ? ' featured' : ''}`}>
                    <Mark k={row.m[colIdx]} />
                    {val}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="compare-cta">
          <a className="btn btn-primary" href="#rooms">Mulai dengan Coworking <Icon.Arrow /></a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FEATURED TESTIMONIAL
   ============================================================ */
function CWFeatureTesti() {
  return (
    <section className="feature-testi">
      <div className="container">
        <div className="feature-testi-card">
          <div className="feature-testi-media">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80" alt="Member Kaspa Space" />
          </div>
          <div className="feature-testi-body">
            <div className="feature-testi-stars">
              {[0, 1, 2, 3, 4].map(s => <Icon.Star key={s} />)}
            </div>
            <p className="feature-testi-quote">
              "Coworking space-nya sangat strategis dan terjangkau di jantung Kota Solo.
              Akses jalan mudah, fasilitas juga lengkap. Tidak perlu pusing soal listrik
              karena sudah termasuk — bahkan akses meeting room ikut di-include."
            </p>
            <div className="feature-testi-author">
              <div className="feature-testi-avatar">K</div>
              <div>
                <div className="feature-testi-name">Kevin Virdianto</div>
                <div className="feature-testi-role">Notaris · Member sejak 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */
function CWFAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="faq-section">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="section-title">Pertanyaan <em>Umum</em></h2>
            <p className="section-sub">Belum menemukan jawaban? Tim kami siap bantu lewat WhatsApp.</p>
            <a className="btn btn-primary faq-wa-btn" href={waLink()} target="_blank" rel="noopener noreferrer"><Icon.Whatsapp /> Chat WhatsApp</a>
          </div>
          <div className="faq-list">
            {CW_FAQS.map((faq, i) => (
              <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
                <button type="button" className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  {faq.q}
                  <span className="faq-toggle"><Icon.Plus /></span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function CoworkingPage() {
  return (
    <div>
      <Navbar />
      <CWSubHero />
      <CWFilterAndGrid />
      <CWSchedule />
      <CWCompare />
      <CWFeatureTesti />
      <CWFAQ />
      <Footer />
      <a className="wa-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </div>
  );
}
