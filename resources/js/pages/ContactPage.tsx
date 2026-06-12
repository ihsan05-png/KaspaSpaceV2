import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Icon } from '../components/icons';
import { waLink } from '../lib/config';

/* ---- Sub-hero ---- */
function ContactSubHero() {
  return (
    <section className="subhero">
      <div className="subhero-bg">
        <img
          src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=2000&q=80"
          alt="Tim support Kaspa Space"
        />
      </div>
      <div className="container subhero-inner">
        <div className="breadcrumb">
          <Link to="/">Beranda</Link>
          <span className="sep">/</span>
          <span className="current">Kontak</span>
        </div>
        <span className="chip chip-dot chip-uppercase">Response 5 menit di jam kerja</span>
        <h1 className="subhero-title">
          Hubungi <em>Kami</em>
        </h1>
        <p className="subhero-lede">
          Pertanyaan tentang ruang, paket, kunjungan langsung, atau kemitraan?
          Pilih cara paling nyaman buat Anda — kami siap membantu.
        </p>
      </div>
    </section>
  );
}

/* ---- Quick Contact Methods ---- */
interface Method {
  label: string;
  title: string;
  detail: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
  iconClass?: string;
}

function ContactMethods() {
  const methods: Method[] = [
    {
      label: "Paling Cepat",
      title: "WhatsApp",
      detail: "Balas dalam 5 menit di jam kerja (08:00–22:00 WIB).",
      cta: "Buka WhatsApp",
      href: waLink(),
      icon: <Icon.Whatsapp />,
      iconClass: "green",
    },
    {
      label: "Telepon",
      title: "Hubungi Langsung",
      detail: "+62 812-3456-7890",
      cta: "Telepon",
      href: "tel:+6281234567890",
      icon: <Icon.Phone />,
    },
    {
      label: "Email",
      title: "Tim Customer Care",
      detail: "cs@kaspaspace.com",
      cta: "Kirim Email",
      href: "mailto:cs@kaspaspace.com",
      icon: <Icon.Mail />,
    },
    {
      label: "Datang Langsung",
      title: "Tour Gratis",
      detail: "Lihat fasilitas tanpa perlu booking, di 4 lokasi.",
      cta: "Lihat Lokasi",
      href: "#lokasi",
      icon: <Icon.Pin />,
    },
  ];
  return (
    <section className="contact-methods">
      <div className="container">
        <div className="methods-grid">
          {methods.map((m, i) => (
            <a key={i} className="method-card" href={m.href}>
              <div className={`method-icon ${m.iconClass ?? ""}`}>{m.icon}</div>
              <span className="method-label">{m.label}</span>
              <h3 className="method-title">{m.title}</h3>
              <p className="method-detail">{m.detail}</p>
              <span className="method-cta">{m.cta} <Icon.ArrowUR /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Contact Form Split ---- */
function ContactFormSplit() {
  return (
    <section className="contact-split-section">
      <div className="container">
        <div className="contact-split">
          <div className="contact-side">
            <span className="eyebrow">Detail Kontak</span>
            <h3>Mari <em>Bicara</em></h3>
            <p>
              Tim kami terbagi berdasarkan kebutuhan. Hubungi langsung yang paling
              relevan untuk respons paling cepat.
            </p>

            <div className="contact-direct">
              <a className="contact-direct-row" href="mailto:cs@kaspaspace.com">
                <div className="contact-direct-icon"><Icon.Mail /></div>
                <div>
                  <div className="contact-direct-label">Customer Care</div>
                  <div className="contact-direct-value">cs@kaspaspace.com</div>
                </div>
              </a>
              <a className="contact-direct-row" href="mailto:partner@kaspaspace.com">
                <div className="contact-direct-icon"><Icon.Briefcase /></div>
                <div>
                  <div className="contact-direct-label">Kemitraan & Korporat</div>
                  <div className="contact-direct-value">partner@kaspaspace.com</div>
                </div>
              </a>
              <a className="contact-direct-row" href="mailto:press@kaspaspace.com">
                <div className="contact-direct-icon"><Icon.Sparkles /></div>
                <div>
                  <div className="contact-direct-label">Media & Press</div>
                  <div className="contact-direct-value">press@kaspaspace.com</div>
                </div>
              </a>
              <a className="contact-direct-row" href="tel:+6281234567890">
                <div className="contact-direct-icon"><Icon.Phone /></div>
                <div>
                  <div className="contact-direct-label">Hotline</div>
                  <div className="contact-direct-value">+62 812-3456-7890</div>
                </div>
              </a>
            </div>

            <div className="contact-hours">
              <div className="contact-hours-title">Jam Operasional Support</div>
              <div className="contact-hours-row">
                <span className="day">Senin – Jumat</span>
                <span className="time">08:00 – 22:00</span>
              </div>
              <div className="contact-hours-row">
                <span className="day">Sabtu</span>
                <span className="time">09:00 – 21:00</span>
              </div>
              <div className="contact-hours-row">
                <span className="day">Minggu</span>
                <span className="time">10:00 – 18:00</span>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <span className="eyebrow">Kirim Pesan</span>
            <h3 className="contact-split-form-title">
              Isi <em>Form di Bawah</em>
            </h3>
            <p className="contact-split-form-sub">
              Kami balas semua pesan dalam 1×24 jam, biasanya jauh lebih cepat.
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
                <input type="tel" placeholder="08xxxxxxxxxx" />
              </div>
              <div className="form-field">
                <label>Topik</label>
                <select defaultValue="" title="Topik">
                  <option value="" disabled>Pilih topik</option>
                  <option>Booking & Reservasi</option>
                  <option>Pertanyaan Paket</option>
                  <option>Kunjungan / Tour</option>
                  <option>Kemitraan & Event</option>
                  <option>Media & Press</option>
                  <option>Lainnya</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Lokasi yang Diminati</label>
                <select defaultValue="" title="Lokasi yang Diminati">
                  <option value="" disabled>Pilih lokasi (opsional)</option>
                  <option>Manahan, Solo</option>
                  <option>Citraland, Surabaya</option>
                  <option>Sinarmas, Surabaya</option>
                  <option>Pakuwon, Surabaya</option>
                  <option>Kuningan, Jakarta</option>
                  <option>Canggu, Bali</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Pesan</label>
                <textarea placeholder="Ceritakan kebutuhan tim Anda..." rows={5}></textarea>
              </div>
              <div className="form-field full consent-row">
                <input type="checkbox" id="consent" />
                <label htmlFor="consent" className="consent-label">
                  Saya setuju Kaspa Space menyimpan & memproses data ini untuk membalas pesan saya.
                </label>
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

/* ---- Map / Location Picker ---- */
interface MapLocation { name: string; short: string; mapSrc: string; }

const MAP_LOCATIONS: MapLocation[] = [
  {
    name:   "Kaspa Space Manahan",
    short:  "Manahan",
    mapSrc: "https://maps.google.com/maps?q=Jl.+Adi+Sucipto+No.+12+Manahan+Solo&output=embed&hl=id&z=16",
  },
  {
    name:   "Kaspa Space Citraland",
    short:  "Citraland",
    mapSrc: "https://maps.google.com/maps?q=Citraland+Boulevard+No.+88+Surabaya&output=embed&hl=id&z=16",
  },
  {
    name:   "Kaspa Space Sinarmas",
    short:  "Sinarmas",
    mapSrc: "https://maps.google.com/maps?q=Sinarmas+Tower+Jl.+Pemuda+Surabaya&output=embed&hl=id&z=16",
  },
  {
    name:   "Kaspa Space Pakuwon",
    short:  "Pakuwon",
    mapSrc: "https://maps.google.com/maps?q=Pakuwon+City+Mall+Surabaya&output=embed&hl=id&z=16",
  },
];

function ContactMap() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = MAP_LOCATIONS[activeIdx];

  return (
    <section className="map-section" id="lokasi">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="eyebrow">Lokasi Kami</span>
          <h2 className="section-title">Datang ke <em>Cabang Terdekat</em></h2>
        </div>

        <div className="map-card">
          <div className="map-info">
            <span className="eyebrow">Pilih Cabang</span>
            <h3>Empat <em className="map-accent">Lokasi Strategis</em></h3>
            <div className="map-locations">
              {MAP_LOCATIONS.map((l, i) => (
                <button
                  key={i}
                  type="button"
                  className={`map-loc-btn${activeIdx === i ? " active" : ""}`}
                  onClick={() => setActiveIdx(i)}
                >
                  <Icon.Pin /> {l.name}
                </button>
              ))}
            </div>
            <Link className="btn btn-primary map-book-btn" to="/coworking">
              Booking di {active.short} <Icon.Arrow />
            </Link>
          </div>

          <div className="map-visual" style={{ padding: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
            <iframe
              key={activeIdx}
              src={active.mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 420, display: 'block' }}
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title={active.name}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Contact FAQ ---- */
interface Faq { q: string; a: string; }

function ContactFAQ() {
  const [open, setOpen] = useState<number>(0);
  const faqs: Faq[] = [
    { q: "Berapa lama tim membalas pertanyaan?", a: "Di WhatsApp & jam kerja, kami balas dalam 5 menit. Untuk email, maksimal 1×24 jam — biasanya jauh lebih cepat di hari kerja." },
    { q: "Apa saya bisa tour tanpa reservasi?", a: "Bisa! Tapi untuk memastikan ada tim yang menyambut & menjelaskan fasilitas, kami sarankan untuk menjadwalkan tour gratis via WhatsApp atau form di atas." },
    { q: "Bagaimana cara mendaftarkan event di Kaspa Space?", a: "Hubungi tim Kemitraan di partner@kaspaspace.com dengan informasi event (tanggal, jumlah peserta, kebutuhan ruang). Tim kami akan respon dengan paket & ketersediaan." },
    { q: "Apakah ada paket khusus untuk media & influencer?", a: "Ya — kami punya program collab untuk media, kreator, dan komunitas. Kirim deck atau profil ke press@kaspaspace.com." },
    { q: "Bisa kunjungan untuk evaluasi kantor virtual?", a: "Tentu. Walaupun virtual office tidak butuh kehadiran fisik, kami senang menerima kunjungan untuk verifikasi & tanya-jawab." },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="faq-section">
          <div>
            <span className="eyebrow">FAQ Kontak</span>
            <h2 className="section-title">Pertanyaan <em>Seputar Kontak</em></h2>
            <p className="section-sub">
              Belum menemukan jawaban? Tim Customer Care siap membantu via channel di atas.
            </p>
            <a className="btn btn-primary faq-wa-btn" href={waLink()} target="_blank" rel="noopener noreferrer">
              <Icon.Whatsapp /> Chat WhatsApp
            </a>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item${open === i ? " open" : ""}`}>
                <button type="button" className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  {f.q}
                  <span className="faq-toggle"><Icon.Plus /></span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Page ---- */
export default function ContactPage() {
  return (
    <div>
      <Navbar />
      <ContactSubHero />
      <ContactMethods />
      <ContactFormSplit />
      <ContactMap />
      <ContactFAQ />
      <Footer />
      <a className="wa-float" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat WhatsApp">
        <Icon.Whatsapp />
      </a>
    </div>
  );
}
