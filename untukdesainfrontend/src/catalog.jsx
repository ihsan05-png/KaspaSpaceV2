/* global window */
/* ============================================
   CATALOG — sumber data terpusat untuk halaman
   Detail Produk (coworking, F&B, business service).
   buildProduct(descriptor) -> objek produk ternormalisasi
   yang dikonsumsi oleh product-detail.jsx.
   ============================================ */

/* ---- Syarat & Ketentuan per kategori ---- */
const TERMS_UMUM = [
  "Pemesanan dianggap sah setelah pembayaran (atau DP) berhasil diverifikasi sistem.",
  "Invoice resmi dikirim otomatis ke email yang Anda daftarkan saat checkout.",
  "Harga yang tertera sudah termasuk pajak kecuali dinyatakan lain.",
  "Kaspa Space berhak menolak pesanan yang melanggar hukum atau ketertiban umum.",
];

const TERMS_COWORKING = [
  "Booking berlaku sesuai tanggal & durasi yang dipilih; keterlambatan tidak menambah durasi.",
  "Pembatalan minimal H-1 mendapat refund 100%; pembatalan di hari-H tidak dapat di-refund.",
  "Reschedule gratis 1× selama kuota ruang masih tersedia.",
  "Member wajib menjaga kebersihan & ketertiban; kerusakan fasilitas menjadi tanggung jawab pemesan.",
  "Akses ruang mengikuti jam operasional 08.00–22.00 (kecuali paket Overtime / 24 jam).",
];

const TERMS_VO = [
  "Alamat virtual office hanya untuk keperluan administrasi & korespondensi yang sah.",
  "Penyewa wajib menyerahkan KTP penanggung jawab & menandatangani surat pernyataan penggunaan alamat.",
  "Masa sewa mengikuti paket (tahunan); perpanjangan dilakukan sebelum jatuh tempo.",
  "Surat/paket yang masuk diteruskan sesuai alamat penerusan yang Anda daftarkan.",
  "Kaspa Space tidak bertanggung jawab atas penyalahgunaan alamat di luar perjanjian.",
];

const TERMS_PO = [
  "Kontrak sewa minimum 6 bulan, dibayar per bulan di muka.",
  "Deposit keamanan dikembalikan di akhir kontrak setelah pemeriksaan kondisi ruang.",
  "Jumlah pengguna tidak boleh melebihi kapasitas ruang yang dipilih.",
  "Perubahan layout/instalasi tambahan harus atas persetujuan pengelola.",
  "Surat keterangan domisili gedung diterbitkan setelah dokumen penyewa lengkap.",
];

const TERMS_LEGAL = [
  "Proses dimulai setelah DP 50% dibayar dan dokumen persyaratan diterima lengkap.",
  "Estimasi waktu pengerjaan 14–21 hari kerja, tergantung antrean instansi terkait.",
  "Nama badan usaha tunduk pada persetujuan Kemenkumham; sediakan 3 alternatif nama.",
  "Pelunasan dilakukan saat dokumen selesai sebelum penyerahan akta & SK.",
  "Garansi refund 100% bila pesanan tidak dapat kami proses sama sekali.",
];

const TERMS_FNB = [
  "Pesanan diproses setelah pembayaran dikonfirmasi di kasir atau melalui aplikasi.",
  "Diskon 20% member berlaku dengan menunjukkan/scan QR member aktif.",
  "Estimasi waktu penyajian dapat berubah saat jam sibuk.",
  "Menu tergantung ketersediaan bahan harian; substitusi diinformasikan lebih dulu.",
  "Makanan/minuman yang sudah disajikan tidak dapat dikembalikan kecuali ada kesalahan dari dapur.",
];

/* ---- Konten coworking per tipe ---- */
const CW_INFO = {
  "Share Desk": {
    desc: "Meja kerja di area komunal yang nyaman, lengkap dengan internet cepat, kopi gratis, dan komunitas profesional. Cocok untuk freelancer, remote worker, atau siapa pun yang butuh ruang fokus tanpa komitmen jangka panjang.",
    steps: [
      { t: "Pilih Paket & Tanggal", d: "Tentukan paket harian / mingguan / bulanan dan tanggal mulai." },
      { t: "Isi Data & Bayar", d: "Lengkapi data pemesan, pilih metode bayar, lalu konfirmasi." },
      { t: "Datang & Check-in", d: "Tunjukkan bukti booking di resepsionis untuk akses ruang." },
      { t: "Mulai Bekerja", d: "Nikmati ruang kerja, Wi-Fi 100 Mbps, dan kopi tanpa batas." },
    ],
    terms: TERMS_COWORKING,
    reviews: [
      { n: "Galih P.", role: "Remote Developer", date: "10 Mei 2026", star: 5, t: "Internetnya kencang dan suasananya tenang. Kopinya juga enak, betah berjam-jam." },
      { n: "Siska M.", role: "Freelance Designer", date: "28 April 2026", star: 5, t: "Fleksibel banget bisa bayar harian. Komunitasnya ramah, sering dapat kenalan baru." },
    ],
  },
  "Private Room": {
    desc: "Ruang tertutup untuk fokus mendalam atau diskusi kecil 2–4 orang, bebas dari keramaian area terbuka. Ideal untuk call penting, sesi kerja intens, atau meeting tim kecil.",
    steps: [
      { t: "Pilih Durasi", d: "Per jam, half day, atau full day sesuai kebutuhan." },
      { t: "Isi Data & Bayar", d: "Lengkapi data pemesan dan selesaikan pembayaran." },
      { t: "Check-in", d: "Resepsionis akan mengarahkan Anda ke ruang yang dipesan." },
      { t: "Gunakan Ruang", d: "Privasi penuh dengan AC, Wi-Fi, dan stop kontak." },
    ],
    terms: TERMS_COWORKING,
    reviews: [
      { n: "Bayu A.", role: "Konsultan", date: "5 Mei 2026", star: 5, t: "Pas untuk meeting online tanpa gangguan suara. Kedap dan nyaman." },
    ],
  },
  "Meeting Room": {
    desc: "Ruang rapat profesional dengan layar besar, whiteboard, dan resepsionis yang menyambut tamu Anda. Tersedia beberapa kapasitas untuk presentasi tim maupun pertemuan klien.",
    steps: [
      { t: "Pilih Kapasitas & Jam", d: "Tentukan ukuran ruang dan slot waktu meeting." },
      { t: "Isi Data & Bayar", d: "Lengkapi data dan konfirmasi pembayaran." },
      { t: "Persiapan Ruang", d: "Tim kami siapkan ruang, air mineral, dan set kopi-teh." },
      { t: "Meeting Dimulai", d: "Tamu Anda disambut resepsionis, ruang siap pakai." },
    ],
    terms: TERMS_COWORKING,
    reviews: [
      { n: "Dimas R.", role: "Sales Manager", date: "2 Mei 2026", star: 5, t: "Klien terkesan dengan ruang dan sambutannya. Projector & sound jernih." },
      { n: "Putri N.", role: "Project Lead", date: "20 April 2026", star: 4, t: "Ruang nyaman, snack-nya bonus. Booking cepat dan mudah." },
    ],
  },
  "Private Office": {
    desc: "Kantor pribadi siap pakai untuk tim Anda — furnitur lengkap, alamat domisili gedung, resepsionis, dan fasilitas kantor profesional. Pilih ukuran sesuai jumlah anggota tim.",
    docsTitle: "Dokumen yang Anda Siapkan",
    docsIntro: "Untuk penerbitan surat domisili & kontrak sewa, siapkan dokumen berikut.",
    docs: [
      { t: "KTP Penyewa / PIC", d: "Identitas penanggung jawab tim" },
      { t: "NPWP Pribadi / Badan", d: "Untuk keperluan administrasi & domisili" },
      { t: "Akta / Legalitas Perusahaan", d: "Opsional, jika sudah berbadan usaha" },
    ],
    steps: [
      { t: "Pilih Ukuran Kantor", d: "Tentukan kapasitas tim & paket bulanan." },
      { t: "Isi Data & Bayar DP", d: "Lengkapi data penyewa dan bayar untuk mengunci ruang." },
      { t: "Verifikasi & Kontrak", d: "Tim kami siapkan kontrak sewa & surat domisili." },
      { t: "Tim Pindah Masuk", d: "Ruang siap pakai dengan furnitur & fasilitas lengkap." },
    ],
    terms: TERMS_PO,
    reviews: [
      { n: "Kevin V.", role: "Founder Startup", date: "8 Mei 2026", star: 5, t: "Pindah tim jadi gampang, tinggal masuk. Resepsionis & domisili sangat membantu legalitas." },
      { n: "Ratna D.", role: "Operations", date: "15 April 2026", star: 5, t: "Biaya jelas, fasilitas lengkap. Tidak perlu pusing urus perabot." },
    ],
  },
  "Virtual Office": {
    desc: "Sewa alamat kantor prestige dengan layanan penunjang usaha — penerimaan surat, surat domisili gedung, akses meeting room, sampai jasa pengajuan PKP. Solusi legal-administratif tanpa perlu sewa kantor fisik.",
    docsTitle: "Dokumen yang Anda Siapkan",
    docsIntro: "Untuk pencatatan alamat & surat domisili, siapkan dokumen berikut.",
    docs: [
      { t: "KTP Penanggung Jawab", d: "Identitas yang bertanggung jawab atas penggunaan alamat" },
      { t: "NPWP Pribadi / Badan", d: "Untuk keperluan administrasi" },
      { t: "Surat Pernyataan Penggunaan Alamat", d: "Template kami sediakan setelah pemesanan" },
      { t: "Akta / Legalitas (jika ada)", d: "Untuk badan usaha yang sudah berdiri" },
    ],
    steps: [
      { t: "Pilih Paket / Bundling", d: "Pilih tier VO atau bundling dengan pendirian PT/CV." },
      { t: "Isi Data Usaha & Bayar", d: "Lengkapi data usaha dan selesaikan pembayaran." },
      { t: "Verifikasi Dokumen", d: "Tim kami proses surat domisili & pencatatan alamat." },
      { t: "Alamat Aktif", d: "Alamat usaha & layanan penerimaan surat siap digunakan." },
    ],
    terms: TERMS_VO,
    reviews: [
      { n: "Hana S.", role: "Owner Online Shop", date: "11 Mei 2026", star: 5, t: "Alamat prestige dengan harga masuk akal. Pengurusan PKP-nya juga dibantu." },
      { n: "Arif B.", role: "Konsultan IT", date: "30 April 2026", star: 5, t: "Surat masuk diteruskan rapi. Bundling sama pendirian PT bikin hemat waktu." },
    ],
  },
};

const CW_FALLBACK = {
  desc: "Layanan ruang & fasilitas kerja dari Kaspa Space. Hubungi tim kami untuk detail ketersediaan dan penyesuaian kebutuhan Anda.",
  steps: CW_INFO["Share Desk"].steps,
  terms: TERMS_COWORKING,
  reviews: [],
};

/* ---- Produk Business Service ---- */
const BIZ = {
  legalitas: {
    id: "legalitas-usaha-solo",
    cat: "Legalitas Usaha",
    catForCheckout: "Legalitas Usaha",
    title: "Legalitas Usaha",
    titleEm: "Kaspa Space Solo",
    rating: 5.0, reviewCount: 5,
    badge: "Resmi · Notaris Pilihan",
    desc: "Layanan pengurusan badan usaha & izin operasional yang ditangani notaris pilihan kami. Proses transparan, online, dan terjadwal — dari konsultasi sampai dokumen jadi di tangan Anda.",
    galleryPlaceholders: [
      { big: "Akta", sub: "Pendirian Resmi", thumb: "Akta" },
      { big: "NIB", sub: "Nomor Induk Berusaha", thumb: "NIB" },
      { big: "SK", sub: "Kemenkumham", thumb: "SK" },
      { big: "NPWP", sub: "Pajak Badan Usaha", thumb: "NPWP" },
    ],
    priceNote: "Sudah termasuk jasa notaris, biaya pengurusan & SK Kemenkumham.",
    adminFee: 2500,
    variants: [
      { id: "cv", name: "CV", desc: "Persekutuan Komanditer", price: 225000 },
      { id: "pt-perorangan", name: "PT Perorangan", desc: "Usaha skala mikro & kecil", price: 525000 },
      { id: "pt", name: "PT Lengkap", desc: "PT untuk skala bisnis penuh", price: 1850000, popular: true },
      { id: "yayasan", name: "Yayasan / Firma", desc: "Non-profit & profesional", price: 2500000 },
    ],
    included: [
      { t: "Konsultasi awal dengan notaris", d: "Diskusi 1-on-1 untuk memilih bentuk badan usaha yang tepat" },
      { t: "Akta pendirian resmi", d: "Disahkan notaris pilihan kami yang berpengalaman" },
      { t: "SK Kemenkumham", d: "Pengesahan dari Kementerian Hukum & HAM RI" },
      { t: "NPWP badan usaha", d: "Nomor Pokok Wajib Pajak resmi atas nama perusahaan" },
      { t: "NIB OSS", d: "Nomor Induk Berusaha lewat sistem OSS RBA" },
      { t: "Domisili usaha", d: "Surat keterangan domisili dari kantor Kaspa Space" },
    ],
    docsTitle: "Dokumen yang Anda Siapkan",
    docsIntro: "Semua dikirim secara digital via dashboard atau WhatsApp. Tim kami bantu jika ada yang kurang.",
    docs: [
      { t: "KTP semua pendiri", d: "Scan jelas, masih berlaku" },
      { t: "NPWP pribadi pendiri", d: "Setiap pendiri & direktur" },
      { t: "Foto pendiri", d: "Latar belakang polos, format JPG/PNG" },
      { t: "Nama PT (3 pilihan)", d: "Min. 3 kata, sebagai alternatif jika ditolak" },
      { t: "Bidang usaha (KBLI)", d: "Tim kami bantu pilih kode yang sesuai" },
      { t: "Susunan pengurus", d: "Direktur, komisaris, dan pemegang saham" },
    ],
    steps: [
      { t: "Pesan & Bayar DP", d: "Pilih paket, isi formulir, bayar DP 50%" },
      { t: "Konsultasi & Submit", d: "Tim notaris hubungi Anda max 1×24 jam kerja" },
      { t: "Proses Notaris", d: "Pembuatan akta & pengurusan SK Kemenkumham" },
      { t: "Dokumen Jadi", d: "Pelunasan, lalu dokumen dikirim digital & fisik" },
    ],
    terms: TERMS_LEGAL,
    reviews: [
      { n: "Pratyaksa F.", role: "Owner CV Sentra Niaga", date: "12 Mei 2026", star: 5, t: "Pelayanan legal pembuatan CV yang cepat dan amanah. Sangat profesional dari awal sampai dokumen jadi." },
      { n: "Rina K.", role: "Co-founder Startup F&B", date: "3 Mei 2026", star: 5, t: "Konsultannya bantu pilihkan yang paling cocok. Akta jadi 9 hari kerja, lebih cepat dari estimasi." },
      { n: "Hendra W.", role: "Direktur PT Mitra Jaya", date: "21 April 2026", star: 5, t: "Update progres rutin via WhatsApp, jadi tenang. Harga lebih masuk akal." },
    ],
    related: [
      { kind: "business", id: "print" },
      { kind: "business", id: "backoffice" },
      { kind: "coworking", type: "Virtual Office" },
    ],
  },
  print: {
    id: "print-materai",
    cat: "Print & Materai",
    catForCheckout: "Print & Materai",
    title: "Print & Materai",
    titleEm: "Manahan Solo",
    rating: 4.8, reviewCount: 12,
    galleryPlaceholders: [
      { big: "Print", sub: "Cetak Dokumen", thumb: "Print" },
      { big: "Materai", sub: "e-Materai / Tempel", thumb: "Materai" },
      { big: "Scan", sub: "Digitalisasi", thumb: "Scan" },
    ],
    priceNote: "Harga per lembar/layanan, bisa dipesan satuan maupun borongan.",
    adminFee: 2000,
    variants: [
      { id: "print-bw", name: "Print Hitam Putih", desc: "Per lembar A4", price: 500, unit: "lembar", popular: true },
      { id: "print-color", name: "Print Warna", desc: "Per lembar A4", price: 1500, unit: "lembar" },
      { id: "materai", name: "Materai 10.000", desc: "Tempel / e-Materai", price: 12000, unit: "pcs" },
      { id: "scan", name: "Scan Dokumen", desc: "Per lembar, hasil PDF", price: 1000, unit: "lembar" },
    ],
    included: [
      { t: "Hasil cetak berkualitas", d: "Printer laser, hasil tajam & cepat kering" },
      { t: "Materai resmi", d: "Materai tempel asli atau e-Materai sah" },
      { t: "Bisa kirim file online", d: "Kirim dokumen via email/WhatsApp, ambil jadi" },
    ],
    steps: [
      { t: "Kirim File / Datang", d: "Kirim dokumen online atau langsung ke lokasi" },
      { t: "Konfirmasi Jumlah", d: "Tentukan jumlah lembar & jenis layanan" },
      { t: "Bayar", d: "Pembayaran tunai atau cashless" },
      { t: "Ambil / Dikirim", d: "Hasil siap diambil atau dikirim digital" },
    ],
    terms: TERMS_UMUM,
    reviews: [
      { n: "Toni H.", role: "Mahasiswa", date: "9 Mei 2026", star: 5, t: "Cepat dan murah. Bisa kirim file dulu, tinggal ambil." },
    ],
    related: [
      { kind: "business", id: "legalitas" },
      { kind: "business", id: "backoffice" },
    ],
  },
  backoffice: {
    id: "back-office",
    cat: "Back Office",
    catForCheckout: "Back Office",
    title: "Back Office",
    titleEm: "Kaspa Space",
    rating: 5.0, reviewCount: 8,
    isNew: true,
    galleryPlaceholders: [
      { big: "Akuntansi", sub: "Pembukuan Bulanan", thumb: "Akun" },
      { big: "Pajak", sub: "PPh & PPN", thumb: "Pajak" },
      { big: "Payroll", sub: "Gaji Karyawan", thumb: "Payroll" },
    ],
    priceNote: "Biaya menyesuaikan skala & kebutuhan — konsultasi dulu, gratis.",
    adminFee: 0,
    variants: [
      { id: "konsultasi", name: "Konsultasi Awal", desc: "Pemetaan kebutuhan back office", price: 0, unit: "sesi", popular: true },
      { id: "pembukuan", name: "Paket Pembukuan", desc: "Akuntansi & laporan bulanan", price: 1500000, unit: "bulan" },
      { id: "pajak", name: "Paket Pajak", desc: "Hitung, lapor & bayar pajak rutin", price: 2000000, unit: "bulan" },
    ],
    included: [
      { t: "Pencatatan & pembukuan", d: "Jurnal, buku besar, dan laporan keuangan rutin" },
      { t: "Perpajakan", d: "Perhitungan, pelaporan, dan kepatuhan pajak" },
      { t: "Tim berpengalaman", d: "Hemat 20%–70% dibanding rekrut staf tetap" },
      { t: "Data terlindungi", d: "Dijaga dengan kebijakan privasi yang ketat" },
    ],
    steps: [
      { t: "Konsultasi Gratis", d: "Diskusi kebutuhan & skala bisnis Anda" },
      { t: "Penawaran", d: "Kami susun paket & biaya yang sesuai" },
      { t: "Onboarding", d: "Serah terima data & akses yang diperlukan" },
      { t: "Jalan Rutin", d: "Laporan berkala dikirim setiap periode" },
    ],
    terms: TERMS_UMUM,
    reviews: [
      { n: "Maya L.", role: "Owner UMKM", date: "6 Mei 2026", star: 5, t: "Pembukuan jadi rapi, laporan tepat waktu. Jauh lebih hemat daripada bikin tim sendiri." },
    ],
    related: [
      { kind: "business", id: "legalitas" },
      { kind: "coworking", type: "Virtual Office" },
    ],
  },
};

/* ---- F&B "yang termasuk" template per kategori ---- */
function fnbIncluded(item) {
  const base = [
    { t: "Dibuat fresh saat dipesan", d: "Tanpa bahan pengawet, kualitas terjaga" },
    { t: "Bahan pilihan lokal", d: "Disuplai dari rekanan lokal terpercaya" },
    { t: "Diskon 20% untuk member", d: "Scan QR member aktif di kasir" },
  ];
  if (item.cat === "Kopi") base.push({ t: "Biji single origin", d: "Dipanggang fresh tiap minggu di roastery rekanan" });
  if (item.cat === "Makanan") base.push({ t: "Porsi mengenyangkan", d: "Disajikan hangat siap santap" });
  return base;
}

/* ---- Builder utama ---- */
function buildProduct(desc) {
  if (!desc) return null;

  /* ===== Business Service ===== */
  if (desc.kind === "business") {
    const p = BIZ[desc.id] || BIZ.legalitas;
    return { kind: "business", depositPct: 0.5, ...p };
  }

  /* ===== Coworking ===== */
  if (desc.kind === "coworking") {
    const type = desc.type;
    const room = desc.room || {};
    const info = CW_INFO[type] || CW_FALLBACK;
    const pkg = (window.PACKAGES || {})[type];

    let variants = [];
    if (pkg) {
      const tiers = (pkg.tiers || []).map(t => ({
        id: t.id, name: t.name, desc: t.tagline, price: t.price, unit: t.unit,
        popular: t.popular, features: t.features,
      }));
      const bundles = (pkg.bundles || []).map(b => ({
        id: b.id, name: b.name, desc: "Bundling + legalitas", price: b.price, unit: b.unit,
        features: b.features, bundle: true,
      }));
      variants = [...tiers, ...bundles];
    } else {
      variants = [{
        id: (type || "room").toLowerCase().replace(/\s+/g, "-"),
        name: type || room.title, desc: room.amenity || "", price: room.price || 0,
        unit: room.unit || "hari", popular: true,
      }];
    }

    return {
      kind: "coworking",
      id: "cw-" + (type || "").toLowerCase().replace(/\s+/g, "-"),
      cat: type,
      catForCheckout: type,
      title: room.title || type,
      titleEm: null,
      rating: room.rating || 4.8,
      reviewCount: room.reviews || (info.reviews ? info.reviews.length : 0),
      badge: room.badge || null,
      heroImg: room.img || null,
      loc: room.loc || null,
      capacity: room.capacity,
      amenity: room.amenity,
      desc: info.desc,
      priceNote: pkg && pkg.note ? pkg.note : "Harga dapat berubah sesuai paket & lokasi yang dipilih.",
      adminFee: 15000,
      depositPct: 0.5,
      variants,
      included: null, // diambil dari fitur tiap paket
      docs: info.docs || null,
      docsTitle: info.docsTitle || null,
      docsIntro: info.docsIntro || null,
      steps: info.steps,
      terms: [...(info.terms || TERMS_COWORKING), ...TERMS_UMUM.slice(0, 2)],
      reviews: info.reviews || [],
      related: [
        { kind: "coworking", type: type === "Share Desk" ? "Private Room" : "Share Desk" },
        { kind: "coworking", type: "Meeting Room" },
        { kind: "business", id: "legalitas" },
      ].filter(r => !(r.kind === "coworking" && r.type === type)),
    };
  }

  /* ===== Food & Beverage ===== */
  if (desc.kind === "fnb") {
    const menu = window.FNB_MENU || [];
    const item = menu.find(m => m.name === desc.name) || menu[0];
    if (!item) return null;
    const unit = item.cat === "Kopi" || item.cat === "Non-Kopi" ? "cup" : "porsi";
    return {
      kind: "fnb",
      id: "fnb-" + item.name.toLowerCase().replace(/\s+/g, "-"),
      cat: "Food & Beverage",
      catForCheckout: "Food & Beverage",
      title: item.name,
      titleEm: item.cat,
      rating: item.rating || 4.7,
      reviewCount: 24,
      badge: item.tag || null,
      heroImg: item.img,
      desc: item.desc + " Disajikan oleh kafe internal Kaspa Space dengan bahan pilihan dan diskon 20% untuk member.",
      priceNote: "Harga normal — member otomatis hemat 20% di kasir.",
      meta: item.time,
      adminFee: 2000,
      depositPct: 1,
      variants: [
        { id: "reg", name: "Reguler", desc: "1 " + unit, price: item.price, unit, popular: true },
      ],
      included: fnbIncluded(item),
      docs: null,
      steps: [
        { t: "Pilih Menu", d: "Pesan via halaman ini atau langsung ke counter." },
        { t: "Tunjukkan Member", d: "Scan QR member untuk diskon 20% otomatis." },
        { t: "Bayar", d: "QRIS, e-wallet, transfer, atau tunai." },
        { t: "Diantar / Pickup", d: "Diantar ke desk Anda atau ambil di counter." },
      ],
      terms: [...TERMS_FNB, ...TERMS_UMUM.slice(0, 2)],
      reviews: [
        { n: "Lina W.", role: "Member", date: "12 Mei 2026", star: 5, t: "Rasanya konsisten enak, apalagi diskon member. Jadi langganan tiap pagi." },
        { n: "Rio S.", role: "Member", date: "1 Mei 2026", star: 4, t: "Penyajian cepat walau lagi ramai. Recommended!" },
      ],
      related: menu.filter(m => m.cat === item.cat && m.name !== item.name).slice(0, 3)
        .map(m => ({ kind: "fnb", name: m.name })),
    };
  }

  return null;
}

window.buildProduct = buildProduct;
window.CATALOG_BIZ = BIZ;
