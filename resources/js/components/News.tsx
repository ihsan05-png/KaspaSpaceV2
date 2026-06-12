import { Icon } from './icons';

const articles = [
  {
    cat: 'Penghargaan',
    date: '12 Mei 2026 • 4 min',
    title: 'Kaspa Space Raih Penghargaan Coworking Terbaik 2026',
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    cat: 'Produk',
    date: '5 Mei 2026 • 6 min',
    title: 'Layanan Legalitas Bisnis Kaspa Space Kini Hadir di 6 Kota',
    img: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
  },
  {
    cat: 'Kolaborasi',
    date: '28 April 2026 • 5 min',
    title: 'Kolaborasi Kaspa Space & BRI Buka Layanan Keuangan Terintegrasi',
    img: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function News() {
  return (
    <section className="section" id="media" style={{ background: 'var(--bg-base)' }}>
      <div className="container">
        <div className="news-head">
          <div>
            <span className="eyebrow">Kabar Terbaru</span>
            <h2 className="section-title">Update <em>Terbaru</em></h2>
          </div>
          <a className="btn btn-ghost" href="#">Semua Berita <Icon.Arrow /></a>
        </div>

        <div className="news-grid">
          {articles.map((a, i) => (
            <a className="news-card" key={i} href="#">
              <div className="news-media">
                <img src={a.img} alt={a.title} loading="lazy" />
                <span className="news-cat">{a.cat}</span>
              </div>
              <div className="news-body">
                <div className="news-meta">{a.date}</div>
                <h3 className="news-title">{a.title}</h3>
                <span className="news-link">Baca selengkapnya <Icon.ArrowUR /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
