import { Icon } from './icons';

interface BenefitItem {
  n: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const items: BenefitItem[] = [
  {
    n: '01',
    icon: <Icon.Briefcase />,
    title: 'Coworking Space',
    desc: 'Akses harian dan bulanan ke ruang kerja kolaboratif dengan internet 1 Gbps.',
  },
  {
    n: '02',
    icon: <Icon.Building />,
    title: 'Microsoft Key',
    desc: 'Office, Teams, dan tools produktivitas Microsoft untuk semua member.',
  },
  {
    n: '03',
    icon: <Icon.Tag />,
    title: 'Signage',
    desc: 'Plang nama perusahaan terpasang di front desk untuk citra profesional Anda.',
  },
  {
    n: '04',
    icon: <Icon.Users />,
    title: 'Resepsionis',
    desc: 'Resepsionis profesional yang menerima tamu dan paket atas nama bisnis Anda.',
  },
  {
    n: '05',
    icon: <Icon.Award />,
    title: 'PKP',
    desc: 'Pengurusan PKP untuk perusahaan dengan support tim akuntan kami.',
  },
  {
    n: '06',
    icon: <Icon.Shield />,
    title: 'Sertifikasi ISO',
    desc: 'Pendampingan sertifikasi ISO 9001:2015 untuk member yang memenuhi syarat.',
  },
  {
    n: '07',
    icon: <Icon.Pin />,
    title: 'Alamat Prestige',
    desc: 'Alamat bisnis di lokasi premium untuk kebutuhan domisili dan legalitas usaha.',
  },
  {
    n: '08',
    icon: <Icon.Sparkles />,
    title: 'Event Komunitas',
    desc: 'Networking event, workshop, dan mentoring rutin bersama komunitas member.',
  },
  {
    n: '09',
    icon: <Icon.Coffee />,
    title: 'Food & Beverage',
    desc: 'Kafe internal dengan menu specialty dan diskon eksklusif untuk member aktif.',
  },
];

export default function Benefits() {
  return (
    <section className="section benefits-section">
      <div className="container">
        <div className="benefits-head">
          <div>
            <div className="benefits-mark">
              <span className="benefits-mark-num">9×</span>
              <span className="benefits-mark-label">Keunggulan</span>
            </div>
            <h2 className="section-title">Mengapa Memilih <em>Kaspa Space?</em></h2>
          </div>
          <div>
            <p className="section-sub">
              Sembilan benefit eksklusif yang kami berikan secara{' '}
              <strong className="benefits-highlight">gratis</strong> untuk
              setiap member aktif. Bukan basa-basi — setiap layanan dirancang untuk membantu
              tim Anda tumbuh lebih cepat dan lebih jauh.
            </p>
          </div>
        </div>

        <div className="benefits-grid">
          {items.map((b) => (
            <div key={b.n} className="benefit-card">
              <div className="benefit-num">{b.n}</div>
              <div className="benefit-icon">{b.icon}</div>
              <h3 className="benefit-title">
                {b.title} <span className="gratis">gratis</span>
              </h3>
              <p className="benefit-desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
