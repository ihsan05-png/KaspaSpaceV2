/* global React, ReactDOM, Icon, Nav, Footer */
const { useState: useStateArt, useEffect: useEffectArt } = React;

function ArtAvatar({ name, lg }) {
  return (
    <div className={`media-avatar ${lg ? "lg" : ""}`} style={{ background: window.ksAvatar(name) }}>
      {window.ksInitials(name)}
    </div>
  );
}

function getArticleSlug() {
  const q = (window.location.hash.split("?")[1]) || "";
  return new URLSearchParams(q).get("a");
}

function ArtBlock({ block }) {
  if (block.h) return <h2 className="art-h2">{block.h}</h2>;
  if (block.quote) return (
    <blockquote className="art-quote">
      <p>{block.quote}</p>
      {block.by && <cite>— {block.by}</cite>}
    </blockquote>
  );
  if (block.list) return (
    <ul className="art-list">
      {block.list.map((li, i) => <li key={i}>{li}</li>)}
    </ul>
  );
  return <p>{block.p}</p>;
}

function ArticleApp() {
  const [slug, setSlug] = useStateArt(getArticleSlug());
  const [copied, setCopied] = useStateArt(false);

  useEffectArt(() => {
    const onHash = () => setSlug(getArticleSlug());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const article = window.KaspaArticleBySlug ? window.KaspaArticleBySlug(slug) : null;

  if (!article) {
    return (
      <>
        <Nav />
        <section className="art-read">
          <div className="container">
            <div className="media-empty" style={{ padding: "80px 0" }}>
              <h2 className="section-title">Artikel <em>tidak ditemukan</em></h2>
              <p style={{ color: "var(--text-tertiary)", margin: "12px 0 28px" }}>
                Artikel yang Anda cari mungkin sudah dipindahkan.
              </p>
              <a className="btn btn-primary" href="#/media">Kembali ke Media <Icon.Arrow /></a>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const all = window.KaspaArticles || [];
  const related = [
    ...all.filter(a => a.slug !== article.slug && a.cat === article.cat),
    ...all.filter(a => a.slug !== article.slug && a.cat !== article.cat),
  ].slice(0, 3);

  const onCopy = (e) => {
    e.preventDefault();
    try { if (navigator.clipboard) navigator.clipboard.writeText(window.location.href); } catch (err) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <Nav />

      <article className="art-read">
        {/* Header */}
        <div className="container">
          <div className="art-read-head">
            <div className="breadcrumb" style={{ justifyContent: "flex-start" }}>
              <a href="#/home">Beranda</a>
              <span className="sep">/</span>
              <a href="#/media">Media</a>
              <span className="sep">/</span>
              <span className="current">{article.cat}</span>
            </div>
            <span className="art-read-cat">{article.cat}</span>
            <h1 className="art-read-title">{article.title}</h1>
            <p className="art-read-dek">{article.excerpt}</p>
            <div className="art-read-byline">
              <div className="media-author">
                <ArtAvatar name={article.author} />
                <div>
                  <p className="media-author-name">{article.author}</p>
                  <p className="media-author-meta">{article.role} · {article.date} · {article.read} baca</p>
                </div>
              </div>
              <div className="art-share">
                <span className="art-share-label">Bagikan</span>
                <a className="art-share-btn" href="#" onClick={(e) => e.preventDefault()} aria-label="Twitter"><Icon.Twitter /></a>
                <a className="art-share-btn" href="#" onClick={(e) => e.preventDefault()} aria-label="LinkedIn"><Icon.Linkedin /></a>
                <a className="art-share-btn" href="#" onClick={(e) => e.preventDefault()} aria-label="WhatsApp"><Icon.Whatsapp /></a>
                <button className={`art-share-btn ${copied ? "ok" : ""}`} type="button" onClick={onCopy} aria-label="Salin tautan">
                  {copied ? <Icon.Star /> : <ArtLinkIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cover */}
        <div className="container">
          <div className="art-read-cover">
            <img src={article.img.replace(/w=\d+/, "w=1600")} alt={article.title} />
          </div>
        </div>

        {/* Body */}
        <div className="container">
          <div className="art-read-body">
            <p className="art-lede">{article.lede}</p>
            {article.body.map((b, i) => <ArtBlock key={i} block={b} />)}

            <div className="art-read-tags">
              <a className="art-tag" href={`#/media`}>#{article.cat}</a>
              <a className="art-tag" href="#/media">#KaspaSpace</a>
            </div>

            {/* Author card */}
            <div className="art-author-card">
              <ArtAvatar name={article.author} lg />
              <div className="art-author-card-body">
                <div className="art-author-card-role">Ditulis oleh</div>
                <h4 className="art-author-card-name">{article.author}</h4>
                <p className="art-author-card-bio">{window.KaspaAuthorBio(article.author)}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="media-section">
          <div className="container">
            <div className="news-head" style={{ marginBottom: 32 }}>
              <div>
                <span className="eyebrow">Lanjut Membaca</span>
                <h2 className="section-title" style={{ fontSize: "clamp(26px,3vw,36px)" }}>Artikel <em>Lainnya</em></h2>
              </div>
              <a className="btn btn-ghost" href="#/media">Semua Artikel <Icon.Arrow /></a>
            </div>
            <div className="media-grid">
              {related.map((a, i) => (
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
                      <ArtAvatar name={a.author} />
                      <span className="art-foot-name">{a.author}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="media-section">
        <div className="container">
          <div className="media-newsletter">
            <div className="media-newsletter-inner">
              <span className="eyebrow">Newsletter Mingguan</span>
              <h2>Suka artikel ini? <em>Dapatkan lebih banyak</em></h2>
              <p>Cerita, tips, dan kabar komunitas Kaspa Space langsung ke inbox setiap Senin pagi.</p>
              <form className="media-sub-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="email@anda.com" aria-label="Email" />
                <button type="submit" className="btn btn-primary">Berlangganan</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <a className="wa-float" href="#" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </>
  );
}

function ArtLinkIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}

(window.KaspaPages = window.KaspaPages || {})["article"] = ArticleApp;
