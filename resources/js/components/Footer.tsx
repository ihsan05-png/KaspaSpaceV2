import { Icon } from './icons';
import logoImg from '../../img/kaspa-space-logo.png';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#" className="logo">
              <img src={logoImg} alt="Kaspa Space" className="logo-img" />
            </a>
            <p className="footer-brand-text">
              Ekosistem kerja modern yang menggabungkan ruang fleksibel, layanan bisnis,
              dan komunitas profesional.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><Icon.Instagram /></a>
              <a href="#" aria-label="Twitter"><Icon.Twitter /></a>
              <a href="#" aria-label="LinkedIn"><Icon.Linkedin /></a>
              <a href="#" aria-label="YouTube"><Icon.Youtube /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Layanan</h4>
            <ul>
              <li><a href="#">Coworking Space</a></li>
              <li><a href="#">Virtual Office</a></li>
              <li><a href="#">Private Office</a></li>
              <li><a href="#">Meeting Room</a></li>
              <li><a href="#">Legalitas Bisnis</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Perusahaan</h4>
            <ul>
              <li><a href="#">Tentang Kami</a></li>
              <li><a href="#">Karier</a></li>
              <li><a href="#">Media & Press</a></li>
              <li><a href="#">Mitra Bisnis</a></li>
              <li><a href="#">Kontak</a></li>
            </ul>
          </div>

          <div className="footer-cta">
            <h4>Newsletter Mingguan</h4>
            <p>Dapatkan tips produktivitas, event komunitas, dan promo eksklusif setiap Senin.</p>
            <div className="footer-newsletter">
              <input type="email" placeholder="email@anda.com" />
              <button type="button">Berlangganan</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Kaspa Space. Semua hak cipta dilindungi.</span>
          <div className="footer-bottom-links">
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Syarat & Ketentuan</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
