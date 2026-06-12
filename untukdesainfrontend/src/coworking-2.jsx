/* global React, Icon, CWIcon */
const { useState: useStateCW2 } = React;

/* ============================================
   SCHEDULE / AVAILABILITY
   ============================================ */
const SCHEDULE_ROOMS = [
  { name: "Coworking Hall", sub: "Share desk · 40 seat", icon: <Icon.Briefcase /> },
  { name: "Private Room 1", sub: "2-4 orang · Quiet", icon: <Icon.Building /> },
  { name: "Meeting Room A", sub: "6 orang · Projector", icon: <Icon.Users /> },
  { name: "Meeting Room B", sub: "10 orang · TV 55″", icon: <Icon.Users /> },
  { name: "Private Office 1", sub: "4-8 orang", icon: <Icon.Building /> },
];

const TIME_SLOTS = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];

// Pre-generated availability matrix (rooms x slots)
const AVAIL = [
  ["A","A","A","B","B","A","A","A","A","A"],
  ["A","B","B","A","A","A","B","B","A","A"],
  ["A","A","A","A","B","B","A","A","A","A"],
  ["B","B","A","A","A","A","A","B","B","A"],
  ["A","A","B","B","A","A","A","A","A","A"],
];

function CWSchedule() {
  const [view, setView] = useStateCW2("hari");
  const [selected, setSelected] = useStateCW2({});
  const [day, setDay] = useStateCW2(0);
  const dates = ["18 Mei 2026", "19 Mei 2026", "20 Mei 2026", "21 Mei 2026", "22 Mei 2026"];

  const toggleSlot = (r, s) => {
    if (AVAIL[r][s] === "B") return;
    const key = `${r}-${s}`;
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="schedule-section" id="schedule">
      <div className="container">
        <div className="schedule-head">
          <span className="eyebrow">Cek Ketersediaan</span>
          <h2 className="section-title">Jadwal Sewa <em>Ruangan</em></h2>
          <p className="section-sub" style={{ marginInline: "auto", textAlign: "center" }}>
            Pilih ruang & slot waktu yang tersedia, lalu lanjutkan ke booking. Realtime &
            tanpa konfirmasi manual.
          </p>
        </div>

        <div className="schedule-toolbar">
          <div className="schedule-tabs">
            {["hari", "minggu", "bulan"].map(v => (
              <button
                key={v}
                className={`schedule-tab ${view === v ? "active" : ""}`}
                onClick={() => setView(v)}
              >
                Per {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <div className="schedule-date-nav">
            <button onClick={() => setDay(Math.max(0, day - 1))} aria-label="Sebelumnya">
              <Icon.ChevLeft />
            </button>
            <div className="schedule-date-display">
              <em>{dates[day]}</em>
            </div>
            <button onClick={() => setDay(Math.min(dates.length - 1, day + 1))} aria-label="Berikutnya">
              <Icon.ChevRight />
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" style={{ padding: "10px 18px", fontSize: 13 }}>
              Lokasi: Manahan, Solo <Icon.Chevron />
            </button>
          </div>
        </div>

        <div className="schedule-table">
          <div className="schedule-grid">
            <div className="schedule-header">
              <div>Ruangan</div>
              {TIME_SLOTS.map(t => <div key={t}>{t}:00</div>)}
            </div>
            {SCHEDULE_ROOMS.map((room, r) => (
              <div key={r} className="schedule-row">
                <div className="schedule-room">
                  <span className="schedule-room-icon">{room.icon}</span>
                  <div>
                    <div>{room.name}</div>
                    <div className="schedule-room-sub">{room.sub}</div>
                  </div>
                </div>
                {TIME_SLOTS.map((t, s) => {
                  const status = AVAIL[r][s];
                  const isSelected = selected[`${r}-${s}`];
                  return (
                    <div key={s}>
                      <button
                        className={`slot ${isSelected ? "selected" : status === "A" ? "available" : "booked"}`}
                        onClick={() => toggleSlot(r, s)}
                        aria-label={`${room.name} ${t}:00`}
                      >
                        {isSelected ? <CWIcon.Check /> : status === "A" ? "Free" : "Full"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="schedule-legend">
          <span className="legend-dot avail">Tersedia</span>
          <span className="legend-dot book">Terisi</span>
          <span className="legend-dot sel">Dipilih</span>
        </div>

        {/* Procedure */}
        <div style={{ marginTop: 80, textAlign: "center" }}>
          <span className="eyebrow">Cara Booking</span>
          <h3 className="section-title" style={{ fontSize: "clamp(28px, 3vw, 40px)" }}>
            Hanya <em>4 Langkah</em>
          </h3>
        </div>
        <div className="procedure">
          {[
            { n: "01", t: "Pilih Ruangan", d: "Cek ketersediaan ruangan dari katalog atau jadwal real-time di atas." },
            { n: "02", t: "Pilih Tanggal & Slot", d: "Klik slot waktu yang berwarna hijau (tersedia) sesuai kebutuhan." },
            { n: "03", t: "Isi Form & Bayar", d: "Lengkapi data pemesan dan pilih metode pembayaran — QRIS, transfer, atau kartu." },
            { n: "04", t: "Datang & Check-in", d: "Tunjukkan e-tiket ke resepsionis. Tim kami siap menyambut Anda." },
          ].map(s => (
            <div key={s.n} className="procedure-step">
              <div className="procedure-num">{s.n}</div>
              <h4 className="procedure-title">{s.t}</h4>
              <p className="procedure-desc">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   COMPARISON
   ============================================ */
function CWCompare() {
  const cols = [
    { key: "private", name: "Private Office", tag: "Premium" },
    { key: "coworking", name: "Coworking Space", tag: "Fleksibel", featured: true },
    { key: "virtual", name: "Virtual Office", tag: "Ekonomis" },
  ];
  const Mark = ({ k }) => {
    const map = {
      good: <span className="compare-icon good"><CWIcon.Check /></span>,
      warn: <span className="compare-icon warn"><CWIcon.Tilde /></span>,
      bad: <span className="compare-icon bad"><CWIcon.X /></span>,
    };
    return map[k];
  };
  const rows = [
    { label: "Biaya Renovasi", v: ["Rp0", "Rp0", "Rp0"], m: ["good", "good", "good"] },
    { label: "Biaya Langganan", v: ["Rp2–4jt/bln", "Rp25rb–Rp1jt", "Rp200rb/bln"], m: ["warn", "good", "good"] },
    { label: "Waktu Setup", v: ["Siap pakai", "Siap pakai", "Siap pakai"], m: ["good", "good", "good"] },
    { label: "Fleksibilitas", v: ["Fleksibel", "Sangat fleksibel", "Sangat fleksibel"], m: ["warn", "good", "good"] },
    { label: "Kredibilitas", v: ["Sangat kredibel", "Sangat kredibel", "Sangat kredibel"], m: ["good", "good", "good"] },
    { label: "Privasi", v: ["Tinggi", "Sedang", "Tinggi"], m: ["good", "warn", "good"] },
    { label: "Gangguan Operasional", v: ["Rendah", "Rendah", "Sangat rendah"], m: ["good", "good", "good"] },
    { label: "Risiko Keuangan", v: ["Rendah", "Sangat rendah", "Sangat rendah"], m: ["warn", "good", "good"] },
    { label: "Produktivitas", v: ["Sangat tinggi", "Sangat tinggi", "Tergantung tim"], m: ["good", "good", "warn"] },
  ];

  return (
    <section className="compare-section">
      <div className="container">
        <div className="compare-head">
          <span className="eyebrow">Perbandingan</span>
          <h2 className="section-title">Kenapa <em>Coworking?</em></h2>
          <p className="section-sub" style={{ marginInline: "auto", textAlign: "center" }}>
            Bandingkan dengan opsi lain — kami transparan dengan angka & realita.
          </p>
        </div>

        <div className="compare-wrap">
          <div className="compare-table">
            {/* Header row */}
            <div className="compare-cell compare-head-cell">
              <span className="compare-head-tag">Kategori</span>
              <span className="compare-head-name">Aspek</span>
            </div>
            {cols.map(c => (
              <div key={c.key} className={`compare-cell compare-head-cell ${c.featured ? "featured" : ""}`}>
                <span className="compare-head-tag">{c.tag}</span>
                <span className="compare-head-name">{c.name}</span>
              </div>
            ))}

            {/* Rows */}
            {rows.map((row, i) => (
              <React.Fragment key={i}>
                <div className="compare-cell compare-label">{row.label}</div>
                {row.v.map((val, j) => (
                  <div key={j} className={`compare-cell compare-value ${cols[j].featured ? "featured" : ""}`}>
                    <Mark k={row.m[j]} />
                    {val}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a className="btn btn-primary" href="#rooms">Mulai dengan Coworking <Icon.Arrow /></a>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURED TESTIMONIAL
   ============================================ */
function CWFeatureTesti() {
  return (
    <section className="feature-testi">
      <div className="container">
        <div className="feature-testi-card">
          <div className="feature-testi-media">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80"
              alt="Member Kaspa Space"
            />
          </div>
          <div className="feature-testi-body">
            <div className="feature-testi-stars">
              {[0,1,2,3,4].map(s => <Icon.Star key={s} />)}
            </div>
            <p className="feature-testi-quote">
              "Coworking space-nya sangat strategis dan terjangkau di jantung Kota Solo.
              Akses jalan mudah, fasilitas juga lengkap. Tidak perlu pusing soal listrik
              karena sudah termasuk — bahkan akses meeting room ikut di-include."
            </p>
            <div className="feature-testi-author">
              <div className="feature-testi-avatar">K</div>
              <div>
                <div className="feature-testi-name">Kevin Virdianto</div>
                <div className="feature-testi-role">Notaris · Member sejak 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.CWSchedule = CWSchedule;
window.CWCompare = CWCompare;
window.CWFeatureTesti = CWFeatureTesti;
