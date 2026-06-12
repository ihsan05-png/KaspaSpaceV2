import { Icon } from './icons';

export default function Hero() {
  return (
    <section className="hero" id="beranda">
      <div className="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80"
          alt="Modern coworking space"
        />
      </div>
      <div className="hero-inner container">
        <div className="hero-grid hero-grid-single">
          <div>
            <span className="chip chip-dot chip-uppercase">Coworking Space Profesional</span>
            <h1 className="hero-title">
              Ruang Kerja
              <em className="serif-italic">Masa Depan</em>
              Ada di Sini
            </h1>
            <p className="hero-lede">
              Ekosistem kerja modern yang menggabungkan ruang fleksibel, layanan bisnis,
              dan komunitas profesional — semua dalam satu tempat.{' '}
              <span className="hashtag">#GrowingWithUs</span>
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#booking">
                Mulai Booking <Icon.Arrow />
              </a>
              <a className="btn btn-ghost" href="#tentang">Kenali Kami</a>
            </div>
          </div>
        </div>
      </div>
      <div className="scroll-indicator">SCROLL</div>
    </section>
  );
}
