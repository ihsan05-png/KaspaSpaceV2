import { useApiGet } from '../hooks/useApiGet';
import { apiFetch } from '../lib/api';
import { Icon } from './icons';

interface ApiLocation {
  label:   string;
  name:    string;
  city:    string;
  address: string;
}

export default function Contact() {
  const { data: locs } = useApiGet<ApiLocation[]>(
    () => apiFetch<ApiLocation[]>('/api/locations')
  );

  const main = locs?.[0];
  const addressLine = main
    ? `${main.name} — ${main.address}`
    : 'Manahan, Solo, Jawa Tengah';

  return (
    <section className="contact-section" id="kontak" style={{ background: 'var(--bg-base)' }}>
      <div className="container">
        <div className="contact-intro">
          <span className="eyebrow">Hubungi Kami</span>
          <h2 className="section-title">Mari <em>Terhubung</em></h2>
          <p className="section-sub contact-sub">
            Punya pertanyaan tentang ruang, paket, atau ingin kunjungan langsung? Kami siap membantu.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-media">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
              alt="Tim Kaspa Space"
            />
            <div className="contact-media-overlay">
              <h3 className="contact-visit-title">Kunjungi Kami</h3>
              <div className="contact-info">
                <div className="contact-info-row">
                  <div className="contact-info-icon"><Icon.Phone /></div>
                  +62 812-3456-7890
                </div>
                <div className="contact-info-row">
                  <div className="contact-info-icon"><Icon.Mail /></div>
                  cs@kaspaspace.com
                </div>
                <div className="contact-info-row">
                  <div className="contact-info-icon"><Icon.Pin /></div>
                  {addressLine}
                </div>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <h3 className="contact-form-title">Kirim Pesan</h3>
            <p className="contact-form-sub">
              Isi form di bawah — tim kami akan balas dalam 1×24 jam.
            </p>
            <div className="form-grid">
              <div className="form-field">
                <label>Nama Lengkap</label>
                <input type="text" placeholder="Nama Anda" />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" placeholder="email@perusahaan.com" />
              </div>
              <div className="form-field">
                <label>No. WhatsApp</label>
                <input type="tel" placeholder="+62" />
              </div>
              <div className="form-field">
                <label>Tertarik Pada</label>
                <select defaultValue="" title="Tertarik Pada">
                  <option value="" disabled>Pilih layanan</option>
                  <option>Coworking Space</option>
                  <option>Virtual Office</option>
                  <option>Private Office</option>
                  <option>Meeting Room</option>
                  <option>Legalitas Bisnis</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Pesan</label>
                <textarea placeholder="Ceritakan kebutuhan tim Anda..."></textarea>
              </div>
              <div className="form-field full">
                <button type="submit" className="btn btn-primary btn-block">
                  Kirim Pesan <Icon.Arrow />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
