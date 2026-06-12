import { useState, useMemo, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { useApiGet } from '../hooks/useApiGet';
import { fetchPublicBizServices, BizServiceApi } from '../lib/publicApi';
import { waLink } from '../lib/config';

/* ============================================
   LOCAL SVG ICONS
   ============================================ */
type SvgProps = React.SVGProps<SVGSVGElement>;

function CheckIcon(p: SvgProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon(p: SvgProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TildeIcon(p: SvgProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}

/* ============================================
   STATIC COMPARISON DATA
   ============================================ */
type MarkKey = 'good' | 'warn' | 'bad';

interface CompareRow {
  label: string;
  them: [string, MarkKey];
  us:   [string, MarkKey];
}

const ROW_LEGAL: CompareRow[] = [
  { label: "Biaya Total",          them: ["Kurang transparan", "bad"],             us: ["Terjangkau & transparan", "good"] },
  { label: "Kecepatan Pengerjaan", them: ["Lamban jika banyak antrean", "warn"],   us: ["Lebih cepat, banyak rekan notaris", "good"] },
  { label: "Keandalan",            them: ["Tergantung skill notaris", "warn"],     us: ["Dikerjakan notaris pilihan", "good"] },
  { label: "Transparansi Proses",  them: ["Tergantung kebijakan", "warn"],         us: ["Detail proses dijabarkan", "good"] },
  { label: "Komunikasi & Support", them: ["Tergantung skill", "warn"],             us: ["Responsif & terstandar", "good"] },
  { label: "Efisiensi Waktu",      them: ["Offline & menyita waktu", "bad"],       us: ["Proses online, terima jadi", "good"] },
  { label: "Integrasi Layanan",    them: ["Hanya beberapa layanan", "warn"],       us: ["Banyak layanan dalam 1 tempat", "good"] },
  { label: "Keamanan Data",        them: ["Biasanya aman", "warn"],                us: ["Dilindungi kebijakan privasi", "good"] },
  { label: "Keberlanjutan",        them: ["Selama notaris bekerja", "warn"],       us: ["Terus berlanjut sampai sekarang", "good"] },
];

const ROW_BACKOFFICE: CompareRow[] = [
  { label: "Biaya Total",          them: ["Sangat tinggi", "bad"],                 us: ["Hemat 20% – 70%", "good"] },
  { label: "Kecepatan Pengerjaan", them: ["Tergantung skill", "warn"],             us: ["Cepat & terjadwal", "good"] },
  { label: "Keandalan",            them: ["Tergantung skill", "warn"],             us: ["Tim berpengalaman", "good"] },
  { label: "Transparansi Proses",  them: ["Tergantung prosedur", "warn"],          us: ["Detail proses dijabarkan", "good"] },
  { label: "Komunikasi & Support", them: ["Tergantung skill", "warn"],             us: ["Responsif & terstandar", "good"] },
  { label: "Efisiensi Waktu",      them: ["Perlu pengawasan & pelatihan", "bad"],  us: ["Proses online, terima jadi", "good"] },
  { label: "Integrasi Layanan",    them: ["1 staf pegang sedikit tugas", "warn"],  us: ["Banyak layanan dalam 1 tempat", "good"] },
  { label: "Keamanan Data",        them: ["Potensi dibocorkan staf", "bad"],       us: ["Dilindungi kebijakan privasi", "good"] },
  { label: "Keberlanjutan",        them: ["Tergantung manajemen SDM", "warn"],     us: ["Terus berlanjut sampai sekarang", "good"] },
];

interface FaqItem { q: string; a: string; }

const BS_FAQS: FaqItem[] = [
  { q: "Pelayanan online atau onsite?",           a: "Kami mengedepankan pelayanan secara online untuk mendukung digitalisasi, lebih cepat, dan efisien. Pelayanan secara onsite tetap tersedia untuk kondisi tertentu." },
  { q: "Bagaimana prosedur pemesanan?",           a: "Silakan pilih produk atau layanan yang Anda butuhkan. Setelah masuk ke keranjang, Anda dapat melanjutkan pengisian formulir, memilih metode pembayaran, menyetujui S&K, dan melakukan pembayaran." },
  { q: "Cara konfirmasi setelah pembayaran?",     a: "Setelah melakukan pembayaran, Anda akan menerima email invoice. Setelah itu Anda hanya perlu konfirmasi kepada layanan pelanggan kami." },
  { q: "Apakah ada uang muka?",                   a: "Untuk memproses layanan yang Anda butuhkan, kami meminta 50% uang muka. Pelunasan dapat dilakukan setelah proses selesai." },
  { q: "Bagaimana jika layanan tidak tersedia?",  a: "Jika layanan yang dibutuhkan tidak tersedia di situs web, Anda bisa menghubungi layanan pelanggan. Kami memiliki beberapa layanan tambahan yang tidak dicantumkan dalam daftar." },
];

/* ============================================
   MARK BADGE (comparison table)
   ============================================ */
function Mark({ k }: { k: MarkKey }) {
  if (k === 'good') return <span className="mk good"><CheckIcon /></span>;
  if (k === 'warn') return <span className="mk warn"><TildeIcon /></span>;
  return <span className="mk bad"><XIcon /></span>;
}

/* ============================================
   SUB-HERO
   ============================================ */
function BSSubHero() {
  return (
    <section className="subhero bs-hero">
      <div className="subhero-bg">
        <img
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=2000&q=80"
          alt="Layanan bisnis"
        />
      </div>
      <div className="container subhero-inner">
        <div className="breadcrumb">
          <Link to="/">Beranda</Link>
          <span className="sep">/</span>
          <span>Produk</span>
          <span className="sep">/</span>
          <span className="current">Business Service</span>
        </div>
        <span className="bs-eyebrow">Layanan Bisnis Terpadu</span>
        <h1 className="subhero-title bs-subhero-title">Business <em>Service</em></h1>
        <p className="subhero-lede">
          Kami siap mendampingi proses legalitas usaha, perpajakan, keuangan,
          akuntansi, hingga coaching pembukuan — satu pintu untuk semua kebutuhan
          administrasi bisnis Anda.
        </p>
        <div className="hero-cta cw-subhero-cta">
          <a className="btn btn-primary" href="#produk">Lihat Layanan <Icon.Arrow /></a>
          <a className="btn btn-ghost" href="#compare">Bandingkan</a>
        </div>
        <div className="subhero-stats">
          <div className="subhero-stat">
            <div className="subhero-stat-num">20<em>-70%</em></div>
            <div className="subhero-stat-label">Hemat Biaya</div>
          </div>
          <div className="subhero-stat-divider" />
          <div className="subhero-stat">
            <div className="subhero-stat-num">100<em>%</em></div>
            <div className="subhero-stat-label">Online</div>
          </div>
          <div className="subhero-stat-divider" />
          <div className="subhero-stat">
            <div className="subhero-stat-num">5.0<em>★</em></div>
            <div className="subhero-stat-label">Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   SEARCH + PRODUCT GRID  ← data from API
   ============================================ */
function BSSearchAndGrid() {
  const navigate = useNavigate();
  const { data: services, loading, error } = useApiGet<BizServiceApi[]>(fetchPublicBizServices);
  const [query, setQuery]       = useState('');
  const [activecat, setActivecat] = useState('Semua');

  const categories = useMemo(() => {
    const cats = new Set((services ?? []).map(s => s.category).filter(Boolean));
    return ['Semua', ...Array.from(cats)];
  }, [services]);

  const filtered = useMemo(() => {
    const list = services ?? [];
    const q    = query.trim().toLowerCase();
    return list.filter(s => {
      const matchCat    = activecat === 'Semua' || s.category === activecat;
      const matchSearch = !q || `${s.name} ${s.description ?? ''}`.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [services, query, activecat]);

  const openBiz = (service: BizServiceApi) => {
    try {
      localStorage.setItem('ks_biz_service', JSON.stringify(service));
      localStorage.setItem('ks_product', JSON.stringify({ kind: 'business', id: service.id.toString() }));
    } catch { /* ignore */ }
    navigate('/produk');
  };

  return (
    <section className="bs-grid-section bs-grid-top" id="produk">
      <div className="container">
        <div className="bs-search-wrap">
          <div className="bs-search">
            <Icon.Search />
            <input
              type="search"
              placeholder="Cari produk atau layanan…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="bs-search-meta">
            {loading ? 'Memuat...' : `${filtered.length} produk tersedia`}
          </div>
        </div>

        {categories.length > 1 && (
          <div className="bs-cats">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`bs-cat-chip${activecat === cat ? ' active' : ''}`}
                onClick={() => setActivecat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
            Memuat layanan...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
            Gagal memuat layanan. Silakan muat ulang halaman.
          </div>
        )}

        {!loading && !error && (
          <div className="bs-grid">
            {filtered.map(service => (
              <article key={service.id} className="bs-card">
                <div className="bs-card-media">
                  {service.photo ? (
                    <img
                      src={service.photo}
                      alt={service.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div className="bs-card-placeholder">
                      <div className="ph-mark">{service.name.split(' ')[0]}</div>
                    </div>
                  )}
                </div>
                <div className="bs-card-body">
                  <span className="bs-card-cat">{service.category || 'Business Service'}</span>
                  <h3 className="bs-card-title">{service.name}</h3>
                  {service.description && (
                    <p className="bs-card-desc">{service.description}</p>
                  )}
                  <div className="bs-card-price">
                    <div>
                      <div className="bs-card-price-label">
                        {service.price > 0 ? 'Mulai dari' : 'Harga'}
                      </div>
                      <div className="bs-card-price-val">
                        {service.price > 0
                          ? <>Rp{service.price.toLocaleString('id-ID')}</>
                          : <em>Konsultasi</em>
                        }
                      </div>
                    </div>
                    {service.duration && (
                      <div className="bs-card-duration">{service.duration}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="bs-card-cta"
                    onClick={() => openBiz(service)}
                  >
                    Pesan <Icon.Arrow />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (services ?? []).length > 0 && (
          <div className="bs-empty">
            <div className="bs-empty-title">Tidak ada produk ditemukan</div>
            <p>Coba kata kunci lain, atau hubungi tim kami via WhatsApp.</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================================
   COMPARE CARD
   ============================================ */
interface CompareCardProps {
  title: string;
  titleEm: string;
  themLabel: string;
  rows: CompareRow[];
}

function BSCompareCard({ title, titleEm, themLabel, rows }: CompareCardProps) {
  return (
    <div className="bs-compare-card">
      <div className="bs-compare-card-head">
        <div className="ttl">Perbandingan</div>
        <h3>{title} <em>{titleEm}</em></h3>
      </div>
      <div className="bs-compare-cols">
        <div className="bs-h">Aspek</div>
        <div className="bs-h them">{themLabel}</div>
        <div className="bs-h us">Kaspa Space</div>
        {rows.map((row, i) => (
          <Fragment key={i}>
            <div className="label">{row.label}</div>
            <div className="them"><Mark k={row.them[1]} />{row.them[0]}</div>
            <div className="us"><Mark k={row.us[1]} />{row.us[0]}</div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function BSCompare() {
  return (
    <section className="bs-compare-section" id="compare">
      <div className="container">
        <div className="compare-head">
          <span className="eyebrow">Kenapa Kaspa</span>
          <h2 className="section-title">Transparan, <em>Terukur</em></h2>
          <p className="section-sub compare-sub">
            Bandingkan dengan opsi konvensional — kami terbuka soal proses,
            biaya, dan jaminan kualitas.
          </p>
        </div>
        <div className="bs-compare-grid">
          <BSCompareCard title="Legalitas" titleEm="Usaha"  themLabel="Notaris"    rows={ROW_LEGAL} />
          <BSCompareCard title="Back"      titleEm="Office" themLabel="Staf Tetap" rows={ROW_BACKOFFICE} />
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURED TESTIMONIAL
   ============================================ */
function BSFeatureTesti() {
  return (
    <section className="bs-testi">
      <div className="container">
        <div className="bs-testi-card">
          <div className="bs-testi-media">
            <div className="ph">
              <div className="ph-big">"Sukses selalu"</div>
              <div className="ph-mono">Photo · Penandatanganan dokumen</div>
            </div>
          </div>
          <div className="bs-testi-body">
            <div className="stars">
              {[0, 1, 2, 3, 4].map(s => <Icon.Star key={s} />)}
            </div>
            <p className="quote">
              Pelayanan legal pembuatan <em>CV yang cepat dan amanah</em>.
              Tim Kaspa Space sangat profesional dari awal sampai dokumen
              jadi. Sukses selalu!
            </p>
            <div>
              <div className="avatar">P</div>
              <div className="who">Pratyaksa Fendhy Artadi</div>
              <div className="role">Owner · Klien Legalitas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FAQ
   ============================================ */
function BSFAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="faq-section">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="section-title">Pertanyaan <em>Umum</em></h2>
            <p className="section-sub">
              Belum menemukan jawaban? Tim kami siap bantu lewat WhatsApp dengan
              respons cepat di jam kerja.
            </p>
            <a className="btn btn-primary faq-wa-btn" href={waLink()} target="_blank" rel="noopener noreferrer">
              <Icon.Whatsapp /> Chat WhatsApp
            </a>
          </div>
          <div className="faq-list">
            {BS_FAQS.map((f, i) => (
              <div key={i} className={`faq-item${openIdx === i ? ' open' : ''}`}>
                <button
                  type="button"
                  className="faq-q"
                  onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                >
                  {f.q}
                  <span className="faq-toggle"><Icon.Plus /></span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PAGE
   ============================================ */
export default function BusinessServicePage() {
  return (
    <div>
      <Navbar />
      <BSSubHero />
      <BSSearchAndGrid />
      <BSCompare />
      <BSFeatureTesti />
      <BSFAQ />
      <Footer />
      <a className="wa-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp">
        <Icon.Whatsapp />
      </a>
    </div>
  );
}
