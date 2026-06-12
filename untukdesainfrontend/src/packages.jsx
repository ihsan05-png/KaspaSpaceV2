/* global React, Icon, CWIcon */
const { useState: usePkgState } = React;

/* ============================================
   PACKAGE DATA (from Paket .docx)
   ============================================ */
const PACKAGES = {
  "Virtual Office": {
    intro: "Virtual office adalah sewa alamat kantor dengan fasilitas penunjang usaha. Anda dapat menggunakan alamat kantor Kaspa Space sebagai alamat usaha — termasuk layanan penerimaan surat, meeting room, layanan bisnis, dan jasa pengajuan PKP.",
    note: "Pilih tier paket VO atau bundling dengan jasa legalitas usaha.",
    tiers: [
      {
        id: "vo-bronze",
        name: "Bronze",
        price: 2400000, unit: "tahun",
        tagline: "Untuk individu / freelancer",
        features: [
          "Jasa penerimaan surat, paket, panggilan, & email",
          "Alamat kantor untuk non-badan usaha",
          "Gratis meeting room 2 jam/bulan",
          "Gratis pembuatan rekening bank BRI & Sinarmas",
        ],
      },
      {
        id: "vo-platinum",
        name: "Platinum",
        price: 4800000, unit: "tahun", popular: true,
        tagline: "Paling sering dipilih badan usaha",
        features: [
          "Jasa penerimaan surat, paket, panggilan, & email",
          "Surat keterangan domisili gedung",
          "Gratis meeting room 2 jam/bulan",
          "Gratis pembuatan rekening bank BRI & Sinarmas",
          "Gratis website & email bisnis 1 tahun",
          "Voucher diskon 10% layanan Dokter Finance",
        ],
      },
      {
        id: "vo-gold",
        name: "Gold",
        price: 6800000, unit: "tahun",
        tagline: "Termasuk akses coworking",
        features: [
          "Jasa penerimaan surat, paket, panggilan, & email",
          "Surat keterangan domisili gedung",
          "Gratis meeting room 2 jam/bulan & coworking 6 hari/bulan",
          "Gratis pembuatan rekening bank BRI & Sinarmas",
          "Gratis website & email bisnis 1 tahun",
          "Voucher diskon 10% layanan Dokter Finance",
          "Voucher diskon 20% meeting room & coworking",
        ],
      },
      {
        id: "vo-diamond",
        name: "Diamond",
        price: 9800000, unit: "tahun",
        tagline: "Paling lengkap + diskon PKP",
        features: [
          "Jasa penerimaan surat, paket, panggilan, & email",
          "Surat keterangan domisili gedung",
          "Gratis meeting room 4 jam/bulan & coworking 6 hari/bulan",
          "Gratis pembuatan rekening bank BRI & Sinarmas",
          "Gratis website & email bisnis 1 tahun",
          "Voucher diskon 10% layanan Dokter Finance",
          "Voucher diskon 20% meeting room & coworking",
          "Voucher diskon 50% jasa pengajuan PKP",
        ],
      },
    ],
    bundles: [
      {
        id: "vo-pt-perorangan",
        name: "VO Platinum + Pendirian PT Perorangan",
        price: 6800000, unit: "paket",
        features: [
          "Virtual Office Platinum 12 bulan",
          "Voucher diskon 20% meeting room & coworking",
          "SK Kemenkumham, surat pernyataan pendirian PT Perorangan",
          "NIB, NPWP, lampiran RBA (SPPL, K3L, izin komersial dll)",
          "Email baru & akun OSS",
        ],
      },
      {
        id: "vo-pt",
        name: "VO Platinum + Pendirian PT",
        price: 8900000, unit: "paket",
        features: [
          "Virtual Office Platinum 12 bulan",
          "Voucher diskon 20% meeting room & coworking",
          "Voucher diskon 50% jasa pengajuan PKP",
          "SK Kemenkumham & akta notaris",
          "NIB, NPWP, lampiran RBA (SPPL, K3L, izin komersial dll)",
          "Email baru & akun OSS",
        ],
      },
      {
        id: "vo-cv",
        name: "VO Platinum + Pendirian CV",
        price: 7900000, unit: "paket",
        features: [
          "Virtual Office Platinum 12 bulan",
          "Voucher diskon 20% meeting room & coworking",
          "Voucher diskon 50% jasa pengajuan PKP",
          "SK Kemenkumham & akta notaris",
          "NIB, NPWP, lampiran RBA (SPPL, K3L, izin komersial dll)",
          "Email baru & akun OSS",
        ],
      },
    ],
  },

  "Private Office": {
    intro: "Kantor pribadi siap pakai untuk tim Anda — alamat domisili, resepsionis, dan fasilitas kantor lengkap. Pilih ukuran sesuai kebutuhan tim.",
    note: "Harga per bulan, kontrak minimum 6 bulan.",
    tiers: [
      {
        id: "po-4-small",
        name: "Private Office 4 pax (Small)",
        price: 4500000, unit: "bulan",
        tagline: "Luas 8 m² · 2 meja, 4 kursi",
        features: [
          "Jasa front desk resepsionis & office boy",
          "Surat keterangan domisili gedung",
          "Luas 8 m² dengan 2 meja, 4 kursi, & laci",
          "AC 1/2 PK, Wi-Fi 100 Mbps, & stop kontak",
          "Lobi, mushola, pantry (dispenser panas/dingin & teh)",
          "Gratis meeting room 5 jam/bulan",
          "Gratis 1 pack tisu/bulan",
          "Gratis website & email bisnis 1 tahun",
          "Voucher diskon 10% layanan Dokter Finance",
          "Voucher diskon 20% meeting room & coworking",
        ],
      },
      {
        id: "po-4",
        name: "Private Office 4 pax",
        price: 5500000, unit: "bulan", popular: true,
        tagline: "Luas 9 m² · Plus akses eLibrary",
        features: [
          "Jasa front desk resepsionis & office boy",
          "Surat keterangan domisili gedung",
          "Luas 9 m² dengan 2 meja, 4 kursi, & laci",
          "AC 1/2 PK, Wi-Fi 100 Mbps, & stop kontak",
          "Lobi, mushola, pantry (dispenser panas/dingin & teh)",
          "Gratis meeting room 5 jam/bulan",
          "Gratis akses eBook di eLibrary",
          "Gratis 1 pack tisu/bulan",
          "Gratis website & email bisnis 1 tahun",
          "Voucher diskon 10% layanan Dokter Finance",
          "Voucher diskon 20% meeting room & coworking",
        ],
      },
      {
        id: "po-6",
        name: "Private Office 6 pax",
        price: 7500000, unit: "bulan",
        tagline: "Luas 12 m² · Whiteboard",
        features: [
          "Jasa front desk resepsionis & office boy",
          "Surat keterangan domisili gedung",
          "Luas 12 m² dengan 3 meja, 6 kursi, & laci",
          "AC 3/4 PK, Wi-Fi 100 Mbps, stop kontak, & whiteboard",
          "Lobi, mushola, pantry (dispenser panas/dingin & teh)",
          "Gratis meeting room 5 jam/bulan",
          "Gratis akses eBook di eLibrary",
          "Gratis 1 pack tisu/bulan",
          "Gratis website & email bisnis 1 tahun",
          "Voucher diskon 10% layanan Dokter Finance",
          "Voucher diskon 20% meeting room & coworking",
        ],
      },
    ],
  },

  "Share Desk": {
    intro: "Meja terbuka di area komunal — tempat ideal untuk fokus kerja atau bertemu komunitas profesional.",
    note: "Tarif harian, akses jam operasional 08.00–22.00.",
    tiers: [
      {
        id: "sd-daily",
        name: "Shared Desk — Daily",
        price: 25000, unit: "hari", popular: true,
        tagline: "Bayar per hari, fleksibel",
        features: [
          "Jasa menerima, informator, dan komunikator tamu",
          "Ruang kerja bersama dengan kursi dan meja",
          "AC, Wi-Fi 100 Mbps, & stop kontak",
          "Lobi, mushola, pantry (dispenser panas/dingin & teh)",
          "Gratis air minum kemasan & tisu",
        ],
      },
      {
        id: "sd-weekly",
        name: "Shared Desk — Weekly",
        price: 125000, unit: "minggu",
        tagline: "Hemat 30% vs harian",
        features: [
          "Semua fasilitas paket harian",
          "Akses 7 hari berturut-turut",
          "Loker harian (opsional)",
          "Cetak 20 lembar/minggu gratis",
        ],
      },
      {
        id: "sd-monthly",
        name: "Shared Desk — Monthly",
        price: 450000, unit: "bulan",
        tagline: "Paling hemat untuk regular",
        features: [
          "Semua fasilitas paket harian",
          "Akses tidak terbatas dalam jam operasional",
          "Loker pribadi",
          "Cetak 100 lembar/bulan gratis",
          "Voucher diskon 20% meeting room",
        ],
      },
    ],
  },

  "Private Room": {
    intro: "Ruang tertutup untuk fokus mendalam atau diskusi kecil 2–4 orang. Tidak terganggu suasana coworking terbuka.",
    note: "Tarif per jam, minimum booking 2 jam.",
    tiers: [
      {
        id: "pr-hourly",
        name: "Private Room — Hourly",
        price: 60000, unit: "jam", popular: true,
        tagline: "Fleksibel, bayar per jam",
        features: [
          "Jasa menerima, informator, dan komunikator tamu",
          "Ruang kerja privat dengan 4 kursi dan 2 meja",
          "AC, Wi-Fi 100 Mbps, & stop kontak",
          "Lobi, mushola, pantry (dispenser panas/dingin & teh)",
          "Gratis air minum kemasan & tisu",
        ],
      },
      {
        id: "pr-half-day",
        name: "Private Room — Half Day (4 jam)",
        price: 200000, unit: "sesi",
        tagline: "Hemat untuk meeting / workshop pendek",
        features: [
          "Semua fasilitas paket per jam",
          "Akses ruangan 4 jam berturut-turut",
          "Air minum & snack ringan",
        ],
      },
      {
        id: "pr-full-day",
        name: "Private Room — Full Day (8 jam)",
        price: 360000, unit: "sesi",
        tagline: "Untuk workshop atau training",
        features: [
          "Semua fasilitas paket per jam",
          "Akses ruangan 8 jam berturut-turut",
          "Air minum, kopi, dan snack",
          "Bantuan setup ruangan",
        ],
      },
    ],
  },

  "Meeting Room": {
    intro: "Ruang meeting dengan projector / TV besar dan whiteboard untuk presentasi tim atau pertemuan klien.",
    note: "Tarif per jam, minimum 1 jam.",
    tiers: [
      {
        id: "mr-small",
        name: "Meeting Room — 6 orang",
        price: 80000, unit: "jam", popular: true,
        tagline: "Cocok untuk tim kecil",
        features: [
          "Kapasitas hingga 6 orang",
          "TV 43\" + HDMI + whiteboard",
          "AC, Wi-Fi 1 Gbps, stop kontak",
          "Air mineral & set kopi-teh",
          "Resepsionis menyambut tamu Anda",
        ],
      },
      {
        id: "mr-medium",
        name: "Meeting Room — 12 orang",
        price: 150000, unit: "jam",
        tagline: "Untuk meeting tim atau klien",
        features: [
          "Kapasitas hingga 12 orang",
          "Projector / TV 55\" + sound system",
          "Whiteboard besar + flipchart",
          "AC, Wi-Fi 1 Gbps, stop kontak",
          "Air mineral, kopi-teh, snack ringan",
          "Resepsionis menyambut tamu Anda",
        ],
      },
      {
        id: "mr-large",
        name: "Meeting Room — 16 orang",
        price: 200000, unit: "jam",
        tagline: "Ruang konferensi besar",
        features: [
          "Kapasitas hingga 16 orang",
          "Conference camera + mic array",
          "Projector + 2 layar TV",
          "Whiteboard besar + flipchart",
          "AC, Wi-Fi 1 Gbps, stop kontak",
          "Snack box & lunch box (opsional)",
        ],
      },
    ],
  },
};

/* ============================================
   ROOM DETAIL + PACKAGE PICKER MODAL
   ============================================ */
function RoomDetailModal({ room, onClose }) {
  const pkg = PACKAGES[room.type];
  const allTiers = pkg ? [...(pkg.tiers || []), ...(pkg.bundles || [])] : [];
  const defaultTier = allTiers.find(t => t.popular) || allTiers[0];

  const [selectedId, setSelectedId] = usePkgState(defaultTier?.id || null);
  const [qty, setQty] = usePkgState(1);
  const [section, setSection] = usePkgState("tiers"); // tiers | bundles

  const selected = allTiers.find(t => t.id === selectedId) || defaultTier;

  const proceed = () => {
    if (!selected) return;
    const order = {
      product: {
        cat: room.type,
        title: room.title,
        loc: room.loc,
        img: room.img,
      },
      variant: { id: selected.id, name: selected.name, price: selected.price, unit: selected.unit },
      qty,
      subtotal: selected.price * qty,
      adminFee: 15000,
    };
    try { localStorage.setItem("ks_order", JSON.stringify(order)); } catch (e) {}
    window.location.href = "#/checkout";
  };

  return (
    <div className="rd-backdrop" onClick={onClose}>
      <div className="rd-modal" onClick={e => e.stopPropagation()}>
        <button className="rd-close" onClick={onClose} aria-label="Tutup">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* HEADER */}
        <div className="rd-hero">
          <img src={room.img} alt={room.title} />
          <div className="rd-hero-overlay">
            <span className="rd-eyebrow">{room.type}</span>
            <h2 className="rd-title">{room.title}</h2>
            <div className="rd-meta">
              <span><Icon.Pin /> {room.loc}</span>
              <span><Icon.Users /> {room.capacity}</span>
              <span><Icon.Wifi /> {room.amenity}</span>
              <span><Icon.Star /> {room.rating?.toFixed(1)} <small>({room.reviews || 0})</small></span>
            </div>
          </div>
        </div>

        <div className="rd-body">
          {/* INTRO */}
          {pkg?.intro && (
            <div className="rd-intro">
              <h4>Tentang {room.type}</h4>
              <p>{pkg.intro}</p>
            </div>
          )}

          {/* SECTION TABS for VO */}
          {pkg?.bundles && (
            <div className="rd-tabs">
              <button className={section === "tiers" ? "active" : ""} onClick={() => setSection("tiers")}>Paket VO</button>
              <button className={section === "bundles" ? "active" : ""} onClick={() => setSection("bundles")}>Bundling + Legalitas</button>
            </div>
          )}

          {/* PACKAGE PICKER */}
          {pkg ? (
            <div>
              <div className="rd-section-head">
                <h3>Pilih <em>Paket</em></h3>
                {pkg.note && <p>{pkg.note}</p>}
              </div>
              <div className="rd-pkg-grid">
                {(section === "bundles" ? pkg.bundles : pkg.tiers).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`rd-pkg ${selectedId === t.id ? "selected" : ""} ${t.popular ? "popular" : ""}`}
                    onClick={() => setSelectedId(t.id)}
                  >
                    {t.popular && <span className="rd-pkg-flag">Paling Dipilih</span>}
                    <div className="rd-pkg-head">
                      <h4>{t.name}</h4>
                      {t.tagline && <p className="rd-pkg-tagline">{t.tagline}</p>}
                    </div>
                    <div className="rd-pkg-price">
                      Rp{t.price.toLocaleString("id-ID")}
                      <small>/ {t.unit}</small>
                    </div>
                    <ul className="rd-pkg-features">
                      {t.features.map((f, i) => (
                        <li key={i}>
                          <span className="rd-check">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="rd-pkg-select-mark">
                      {selectedId === t.id ? "✓ Dipilih" : "Pilih paket ini"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rd-section-head">
              <h3>Pesan <em>Langsung</em></h3>
              <p>Ruangan ini bisa langsung dipesan tanpa pemilihan paket.</p>
            </div>
          )}
        </div>

        {/* FOOTER — selection summary + CTA */}
        <div className="rd-foot">
          <div className="rd-foot-info">
            <span className="rd-foot-label">Total</span>
            <div className="rd-foot-price">
              Rp{((selected?.price || room.price) * qty).toLocaleString("id-ID")}
              <small>{qty > 1 ? ` (${qty} × Rp${(selected?.price || room.price).toLocaleString("id-ID")})` : ""}</small>
            </div>
            <div className="rd-foot-sub">
              {selected ? selected.name : room.title} · {selected?.unit || room.unit}
            </div>
          </div>

          <div className="rd-qty">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Kurangi">−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} aria-label="Tambah">+</button>
          </div>

          <button className="btn btn-primary rd-cta" onClick={proceed}>
            Lanjut ke Pembayaran <Icon.Arrow />
          </button>
        </div>
      </div>
    </div>
  );
}

window.PACKAGES = PACKAGES;
window.RoomDetailModal = RoomDetailModal;
