import { useState } from 'react';
import { Icon } from './icons';
import { waLink } from '../lib/config';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'Apa itu Kaspa Space?',
    a: 'Kaspa Space adalah ekosistem coworking yang menyediakan ruang kerja fleksibel, virtual office, dan layanan legalitas bisnis dalam satu paket terintegrasi.',
  },
  {
    q: 'Berapa harga sewa coworking per jam?',
    a: 'Mulai dari Rp 5.000/jam untuk share desk dan Rp 75.000/jam untuk meeting room. Tersedia paket harian, mingguan, dan bulanan dengan harga lebih hemat.',
  },
  {
    q: 'Apa benefit menjadi member?',
    a: 'Member mendapat akses internet 1 Gbps, diskon F&B hingga 20%, resepsionis profesional, dan komunitas networking aktif.',
  },
  {
    q: 'Bagaimana cara booking?',
    a: 'Anda bisa booking langsung lewat website, aplikasi mobile, atau WhatsApp. Konfirmasi instan dan pembayaran fleksibel via transfer, QRIS, atau kartu kredit.',
  },
  {
    q: 'Ada paket virtual office?',
    a: 'Ya! Paket virtual office mulai Rp 350.000/bulan dengan alamat prestige, layanan resepsionis, pengelolaan surat, dan support PKP.',
  },
  {
    q: 'Di mana lokasi Kaspa Space?',
    a: 'Kami memiliki 6 lokasi strategis di Jakarta, Bandung, Surabaya, dan Bali. Cek halaman Lokasi untuk detail alamat dan fasilitas tiap cabang.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  const toggleFaq = (index: number) => {
    setOpen(open === index ? -1 : index);
  };

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="faq-section">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="section-title">Pertanyaan yang <em>Sering Ditanyakan</em></h2>
            <p className="section-sub">
              Tidak menemukan jawaban? Hubungi tim kami via WhatsApp — biasanya kami balas
              dalam 5 menit di jam kerja.
            </p>
            <a className="btn btn-primary faq-wa-btn" href={waLink()} target="_blank" rel="noopener noreferrer">
              <Icon.Whatsapp /> Chat WhatsApp
            </a>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
                <button
                  type="button"
                  className="faq-q"
                  onClick={() => toggleFaq(i)}
                >
                  {faq.q}
                  <span className="faq-toggle"><Icon.Plus /></span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
