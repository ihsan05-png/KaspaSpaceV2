import { useEffect } from 'react';

const ELFSIGHT_APP_ID = 'elfsight-app-59e880af-6b30-4a5c-84da-b56eda05c7e5';
const MAPS_URL = 'https://www.google.com/maps/place/Coworking+%26+Virtual+Office+-+Kaspa+Space+Manahan/@-7.5611401,110.6555759,20z/data=!4m8!3m7!1s0x2e7a150836ddfc5f:0x6a0a0e823bb991f2!8m2!3d-7.5543959!4d110.8008344!9m1!1b1!16s%2Fg%2F11y82l07jk';

export default function Testimonials() {
  useEffect(() => {
    if (document.querySelector('script[src*="elfsightcdn.com"]')) return;

    const script = document.createElement('script');
    script.src   = 'https://elfsightcdn.com/platform.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="testi-head">
          <div>
            <span className="eyebrow">Apa Kata Mereka</span>
            <h2 className="section-title">
              Ulasan <em>Member Kami</em>
            </h2>
          </div>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Tulis Ulasan di Google
          </a>
        </div>

        {/* Elfsight Google Reviews Widget */}
        <div className={ELFSIGHT_APP_ID} data-elfsight-app-lazy />
      </div>
    </section>
  );
}
