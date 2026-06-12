import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { fetchArticles, ArticleApi } from '../lib/publicApi';

/* ── Avatar helpers ──────────────────────────────────────── */
const AVATAR_COLORS = [
  'linear-gradient(135deg,#2563eb,#60a5fa)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#0e9f6e,#34d399)',
  'linear-gradient(135deg,#d97706,#fbbf24)',
  'linear-gradient(135deg,#db2777,#f472b6)',
  'linear-gradient(135deg,#0891b2,#22d3ee)',
];
const ksAvatar   = (name: string) => AVATAR_COLORS[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
const ksInitials = (name: string) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

function MediaAvatar({ name, size = 42 }: { name: string; size?: number }) {
  return (
    <div className="media-avatar" style={{ background: ksAvatar(name), width: size, height: size, fontSize: size * 0.33 }}>
      {ksInitials(name)}
    </div>
  );
}

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=60';

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export default function MediaPage() {
  const [articles, setArticles] = useState<ArticleApi[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [cat,      setCat]      = useState('Semua');
  const [email,    setEmail]    = useState('');

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const cats = ['Semua', ...Array.from(new Set(articles.map(a => a.category)))];
  const featured = articles.find(a => a.featured) ?? articles[0];
  const rest = articles.filter(a => a !== featured);
  const list = cat === 'Semua' ? rest : rest.filter(a => a.category === cat);

  return (
    <div>
      <Navbar />

      {/* Sub-hero */}
      <section className="subhero">
        <div className="subhero-bg">
          <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2000&q=80" alt="Media Kaspa Space" />
        </div>
        <div className="container subhero-inner">
          <div className="breadcrumb">
            <Link to="/">Beranda</Link>
            <span className="sep">/</span>
            <span className="current">Media</span>
          </div>
          <span className="chip chip-dot chip-uppercase">Media &amp; Pers</span>
          <h1 className="subhero-title">Kabar &amp; <em>Cerita</em><br />dari Kaspa Space</h1>
          <p className="subhero-lede">
            Berita perusahaan, pembaruan produk, tips produktivitas, dan kisah dari komunitas yang tumbuh bersama kami.
          </p>
        </div>
      </section>

      {loading ? (
        <section className="media-section">
          <div className="container" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
            Memuat artikel...
          </div>
        </section>
      ) : articles.length === 0 ? (
        <section className="media-section">
          <div className="container" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
            Belum ada artikel yang dipublikasikan.
          </div>
        </section>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <section className="media-section">
              <div className="container">
                <div className="media-feature">
                  <div className="media-feature-media">
                    <span className="media-feature-flag"><Icon.Star /> Sorotan</span>
                    <img src={featured.image_url ?? PLACEHOLDER_IMG} alt={featured.title} loading="lazy" />
                  </div>
                  <div className="media-feature-body">
                    <div className="media-feature-cat">{featured.category} · {fmtDate(featured.published_at)} · {featured.read_time} baca</div>
                    <h2 className="media-feature-title">{featured.title}</h2>
                    <p className="media-feature-excerpt">{featured.excerpt}</p>
                    <div className="media-feature-foot">
                      <div className="media-author">
                        <MediaAvatar name={featured.author_name} />
                        <div>
                          <p className="media-author-name">{featured.author_name}</p>
                          <p className="media-author-meta">{featured.author_role} · Kaspa Space</p>
                        </div>
                      </div>
                      <span className="btn btn-primary">Baca Artikel <Icon.Arrow /></span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Article grid */}
          <section className="media-section tight">
            <div className="container">
              <div className="media-toolbar">
                <div className="media-filters">
                  {cats.map(c => (
                    <button key={c} type="button" className={`qtag${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="media-count">{list.length} artikel</div>
              </div>

              <div className="media-grid">
                {list.length === 0 ? (
                  <div className="media-empty">Belum ada artikel pada kategori ini.</div>
                ) : list.map(a => (
                  <div className="art-card" key={a.id}>
                    <div className="art-media">
                      <span className="art-cat">{a.category}</span>
                      <img src={a.image_url ?? PLACEHOLDER_IMG} alt={a.title} loading="lazy" />
                    </div>
                    <div className="art-body">
                      <div className="art-meta">{fmtDate(a.published_at)} · {a.read_time} baca</div>
                      <h3 className="art-title">{a.title}</h3>
                      <p className="art-excerpt">{a.excerpt}</p>
                      <div className="art-foot">
                        <MediaAvatar name={a.author_name} size={32} />
                        <span className="art-foot-name">{a.author_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Newsletter */}
      <section className="media-section">
        <div className="container">
          <div className="media-newsletter">
            <div className="media-newsletter-inner">
              <span className="eyebrow">Newsletter Mingguan</span>
              <h2>Cerita terbaik, <em>langsung ke inbox</em></h2>
              <p>Tips produktivitas, kabar komunitas, dan promo eksklusif setiap Senin pagi. Tanpa spam.</p>
              <form className="media-sub-form" onSubmit={e => { e.preventDefault(); setEmail(''); }}>
                <input type="email" placeholder="email@anda.com" value={email} onChange={e => setEmail(e.target.value)} aria-label="Email" required />
                <button type="submit" className="btn btn-primary">Berlangganan</button>
              </form>
              <div className="media-sub-note">Bergabung dengan 3.200+ pembaca. Berhenti kapan saja.</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
