/* global React, ReactDOM, Icon, Nav, Footer */
const { useState: useStateMedia } = React;

function MediaAvatar({ name }) {
  return <div className="media-avatar" style={{ background: window.ksAvatar(name) }}>{window.ksInitials(name)}</div>;
}

const MEDIA_CATS = ["Semua", "Penghargaan", "Produk", "Kolaborasi", "Komunitas", "Tips", "Event"];

function MediaApp() {
  const [cat, setCat] = useStateMedia("Semua");

  const articles = window.KaspaArticles || [];
  const featured = articles.find(a => a.featured) || articles[0];
  const rest = articles.filter(a => a !== featured);
  const list = cat === "Semua" ? rest : rest.filter(a => a.cat === cat);

  return (
    <>
      <Nav />

      {/* Sub-hero */}
      <section className="subhero">
        <div className="subhero-bg">
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2000&q=80"
            alt="Ruang kerja Kaspa Space"
          />
        </div>
        <div className="container subhero-inner">
          <div className="breadcrumb">
            <a href="#/home">Beranda</a>
            <span className="sep">/</span>
            <span className="current">Media</span>
          </div>
          <span className="chip chip-dot chip-uppercase">Media &amp; Pers</span>
          <h1 className="subhero-title">
            Kabar &amp; <em>Cerita</em><br />dari Kaspa Space
          </h1>
          <p className="subhero-lede">
            Berita perusahaan, pembaruan produk, tips produktivitas, dan kisah dari
            komunitas yang tumbuh bersama kami.
          </p>
        </div>
      </section>

      {/* Featured */}
      <section className="media-section">
        <div className="container">
          <a className="media-feature" href={`#/article?a=${featured.slug}`}>
            <div className="media-feature-media">
              <span className="media-feature-flag"><Icon.Star /> Sorotan</span>
              <img src={featured.img} alt={featured.title} loading="lazy" />
            </div>
            <div className="media-feature-body">
              <div className="media-feature-cat">{featured.cat} · {featured.date} · {featured.read} baca</div>
              <h2 className="media-feature-title">{featured.title}</h2>
              <p className="media-feature-excerpt">{featured.excerpt}</p>
              <div className="media-feature-foot">
                <div className="media-author">
                  <MediaAvatar name={featured.author} />
                  <div>
                    <p className="media-author-name">{featured.author}</p>
                    <p className="media-author-meta">{featured.role} · Kaspa Space</p>
                  </div>
                </div>
                <span className="btn btn-primary">Baca Artikel <Icon.Arrow /></span>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Article grid */}
      <section className="media-section tight">
        <div className="container">
          <div className="media-toolbar">
            <div className="media-filters">
              {MEDIA_CATS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`qtag ${cat === c ? "active" : ""}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="media-count">{list.length} artikel</div>
          </div>

          <div className="media-grid">
            {list.length === 0 ? (
              <div className="media-empty">Belum ada artikel pada kategori ini.</div>
            ) : (
              list.map((a, i) => (
                <a className="art-card" key={i} href={`#/article?a=${a.slug}`}>
                  <div className="art-media">
                    <span className="art-cat">{a.cat}</span>
                    <img src={a.img} alt={a.title} loading="lazy" />
                  </div>
                  <div className="art-body">
                    <div className="art-meta">{a.date} · {a.read} baca</div>
                    <h3 className="art-title">{a.title}</h3>
                    <p className="art-excerpt">{a.excerpt}</p>
                    <div className="art-foot">
                      <MediaAvatar name={a.author} />
                      <span className="art-foot-name">{a.author}</span>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="media-section">
        <div className="container">
          <div className="media-newsletter">
            <div className="media-newsletter-inner">
              <span className="eyebrow">Newsletter Mingguan</span>
              <h2>Cerita terbaik, <em>langsung ke inbox</em></h2>
              <p>Tips produktivitas, kabar komunitas, dan promo eksklusif setiap Senin pagi. Tanpa spam.</p>
              <form className="media-sub-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="email@anda.com" aria-label="Email" />
                <button type="submit" className="btn btn-primary">Berlangganan</button>
              </form>
              <div className="media-sub-note">Bergabung dengan 3.200+ pembaca. Berhenti kapan saja.</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <a className="wa-float" href="#" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["media"] = MediaApp;
