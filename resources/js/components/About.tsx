import { Icon } from './icons';

export default function About() {
  return (
    <section className="section" id="tentang" style={{ background: 'var(--bg-base)' }}>
      <div className="container">
        <div className="about-grid">
          <div className="about-media">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
              alt="Komunitas Kaspa Space"
            />
            <div className="about-stats">
              <div>
                <div className="about-stat-num">500<em>+</em></div>
                <div className="about-stat-label">Member Aktif</div>
              </div>
              <div>
                <div className="about-stat-num">4.9<em>★</em></div>
                <div className="about-stat-label">Rating Member</div>
              </div>
              <div>
                <div className="about-stat-num">3<em>Thn</em></div>
                <div className="about-stat-label">Pengalaman</div>
              </div>
            </div>
          </div>

          <div className="about-body">
            <span className="eyebrow">Tentang Kaspa Space</span>
            <h2 className="section-title">Tumbuh Bersama <em>Komunitas Kami</em></h2>
            <div className="about-pills">
              <span className="chip">Coworking</span>
              <span className="chip">Virtual Office</span>
              <span className="chip">Meeting Room</span>
              <span className="chip">Legalitas Bisnis</span>
            </div>
            <p className="about-text">
              Kaspa Space adalah ekosistem kerja profesional yang menggabungkan ruang
              kerja fleksibel, perizinan usaha, sertifikasi ISO, hingga layanan resepsionis —
              mendukung pekerjaan Anda dari hari pertama.
            </p>
            <p className="about-text">
              Lewat lebih dari 6 lokasi dan komunitas yang aktif, Kaspa Space telah menjadi
              tempat bertumbuh ribuan ide, brand, dan peluang — di satu ekosistem yang saling menguatkan.
            </p>
            <div className="about-actions">
              <a className="btn btn-primary" href="#">
                Pelajari Lebih Lanjut <Icon.Arrow />
              </a>
              <button className="play-btn">
                <span className="play-btn-icon"><Icon.Play /></span>
                Tonton Video Profil
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
