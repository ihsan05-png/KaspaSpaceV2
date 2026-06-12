/* Vite eager import of all logo images */
const mitraModules = import.meta.glob<{ default: string }>('../../img/mitrakami/*.png', { eager: true });
const clientModules = import.meta.glob<{ default: string }>('../../img/client/*.png', { eager: true });
const diliputModules = import.meta.glob<{ default: string }>('../../img/diliput/*.png', { eager: true });

/* Extract [url, altName] pairs from a glob module map */
function extractLogos(modules: Record<string, { default: string }>): { src: string; alt: string }[] {
  return Object.entries(modules).map(([path, mod]) => {
    const filename = path.split('/').pop() ?? '';
    const alt = filename
      .replace(/\.[^.]+$/, '')
      .replace(/-[A-Za-z0-9]{8,}$/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return { src: mod.default, alt };
  });
}

const mitraLogos  = extractLogos(mitraModules);
const clientLogos = extractLogos(clientModules);
const diliputLogos = extractLogos(diliputModules);

/* Double list for seamless loop */
const clientDoubled = [...clientLogos, ...clientLogos];

export default function Partners() {
  return (
    <>
      {/* ---- Mitra Kami ---- */}
      <section className="section mitra-section">
        <div className="container">
          <div className="section-head-center">
            <span className="eyebrow">Didukung Oleh</span>
            <h2 className="section-title">Mitra <em>Terpercaya</em> Kami</h2>
            <p className="section-sub mitra-sub">
              Kolaborasi strategis yang memperkuat ekosistem Kaspa Space untuk member kami.
            </p>
          </div>
          <div className="mitra-grid">
            {mitraLogos.map((logo, i) => (
              <div key={i} className="mitra-logo">
                <img src={logo.src} alt={logo.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Klien Kami ---- */}
      <section className="client-section">
        <div className="container">
          <div className="section-head-center">
            <span className="eyebrow">Telah Dipercaya</span>
            <h2 className="section-title">Klien <em>Kami</em></h2>
          </div>
        </div>
        <div className="client-marquee-wrap">
          <div className="client-marquee">
            {clientDoubled.map((logo, i) => (
              <div key={i} className="client-logo">
                <img src={logo.src} alt={logo.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Diliput Oleh ---- */}
      {diliputLogos.length > 0 && (
        <section className="diliput-section">
          <div className="container">
            <div className="section-head-center">
              <span className="eyebrow">Liputan Media</span>
              <h2 className="section-title">Diliput <em>Oleh</em></h2>
            </div>
            <div className="diliput-grid">
              {diliputLogos.map((logo, i) => (
                <div key={i} className="diliput-logo">
                  <img src={logo.src} alt={logo.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
