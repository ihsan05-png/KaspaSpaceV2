/* Centralized product catalog â€” mirrors catalog.jsx from design reference */

const TERMS_UMUM = [
  "Pemesanan dianggap sah setelah pembayaran (atau DP) berhasil diverifikasi sistem.",
  "Invoice resmi dikirim otomatis ke email yang Anda daftarkan saat checkout.",
  "Harga yang tertera sudah termasuk pajak kecuali dinyatakan lain.",
  "Kaspa Space berhak menolak pesanan yang melanggar hukum atau ketertiban umum.",
];

const TERMS_COWORKING = [
  "Booking berlaku sesuai tanggal & durasi yang dipilih; keterlambatan tidak menambah durasi.",
  "Pembatalan minimal H-1 mendapat refund 100%; pembatalan di hari-H tidak dapat di-refund.",
  "Reschedule gratis 1Ã— selama kuota ruang masih tersedia.",
  "Member wajib menjaga kebersihan & ketertiban; kerusakan fasilitas menjadi tanggung jawab pemesan.",
  "Akses ruang mengikuti jam operasional 08.00â€“22.00 (kecuali paket Overtime / 24 jam).",
];

const TERMS_VO = [
  "Alamat virtual office hanya untuk keperluan administrasi & korespondensi yang sah.",
  "Penyewa wajib menyerahkan KTP penanggung jawab & menandatangani surat pernyataan penggunaan alamat.",
  "Masa sewa mengikuti paket (tahunan); perpanjangan dilakukan sebelum jatuh tempo.",
  "Surat/paket yang masuk diteruskan sesuai alamat penerusan yang Anda daftarkan.",
  "Kaspa Space tidak bertanggung jawab atas penyalahgunaan alamat di luar perjanjian.",
];

const TERMS_LEGAL = [
  "Proses dimulai setelah DP 50% dibayar dan dokumen persyaratan diterima lengkap.",
  "Estimasi waktu pengerjaan 14â€“21 hari kerja, tergantung antrean instansi terkait.",
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

export interface ProductVariant {
  id: string;
  name: string;
  desc?: string;
  price: number;
  unit?: string;
  popular?: boolean;
  bundle?: boolean;
  features?: string[];
  bookingType?: string;
  durationMonths?: number;
}

export interface ProductIncluded { t: string; d?: string; }
export interface ProductDoc { t: string; d?: string; }
export interface ProductStep { t: string; d: string; }
export interface ProductReview { n: string; role: string; date: string; star: number; t: string; }
export type ProductDescriptor =
  | { kind: 'business'; id: string }
  | { kind: 'coworking'; type: string; roomId?: number; requires_documents?: boolean; prices?: Array<{ label: string; price: number; unit: string; booking_type?: string; is_share_desk?: boolean }> | null; room?: Record<string, unknown> }
  | { kind: 'fnb'; name: string };

export interface Product {
  kind: string;
  id: string;
  cat: string;
  catForCheckout: string;
  title: string;
  titleEm?: string | null;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  isNew?: boolean;
  heroImg?: string | null;
  loc?: string | null;
  meta?: string;
  desc: string;
  priceNote?: string;
  adminFee: number;
  depositPct: number;
  variants: ProductVariant[];
  included?: ProductIncluded[] | null;
  docs?: ProductDoc[] | null;
  docsTitle?: string | null;
  docsIntro?: string | null;
  steps?: ProductStep[];
  terms: string[];
  reviews: ProductReview[];
  galleryPlaceholders?: { big: string; sub: string; thumb: string }[];
  heroImages?: string[];
  related?: ProductDescriptor[];
  requiresDocs?: boolean;
}

const CW_INFO: Record<string, {
  desc: string;
  docs?: ProductDoc[];
  docsTitle?: string;
  docsIntro?: string;
  steps: ProductStep[];
  terms: string[];
  reviews: ProductReview[];
  included?: ProductIncluded[];
}> = {
  "Share Desk": {
    desc: "Ruang kerja bersama yang nyaman dengan fasilitas lengkap. Bisa booking per jam, pilih tanggal, jam, dan ruangan sesuai ketersediaan.",
    included: [
      { t: "Jasa menerima, informator, dan komunikator tamu" },
      { t: "Ruang kerja bersama dengan kursi dan meja" },
      { t: "AC, Wi-Fi 100 Mbps, & stop kontak" },
      { t: "Lobi, mushola, pantry dengan dispenser air panas dingin & teh" },
      { t: "Gratis air minum kemasan & tisu" },
    ],
    steps: [
      { t: "Pilih Tanggal, Jam & Ruangan", d: "Tentukan tanggal, slot jam, dan ruangan yang tersedia." },
      { t: "Isi Data & Bayar", d: "Lengkapi data pemesan, pilih metode bayar, lalu konfirmasi." },
      { t: "Datang & Check-in", d: "Tunjukkan bukti booking di resepsionis untuk akses ruang." },
      { t: "Mulai Bekerja", d: "Nikmati ruang kerja dan Wi-Fi 100 Mbps." },
    ],
    terms: TERMS_COWORKING,
    reviews: [
      { n: "Galih P.", role: "Remote Developer", date: "10 Mei 2026", star: 5, t: "Internetnya kencang dan suasananya tenang. Betah berjam-jam." },
      { n: "Siska M.", role: "Freelance Designer", date: "28 April 2026", star: 5, t: "Fleksibel banget bisa bayar harian. Komunitasnya ramah." },
    ],
  },
  "Private Room": {
    desc: "Ruang kerja privat untuk 1 sesi penuh (4 kursi, 2 meja). Pilih tanggal, jam, dan ruangan. Cocok untuk kerja fokus atau diskusi tim kecil.",
    included: [
      { t: "Jasa menerima, informator, dan komunikator tamu" },
      { t: "Ruang kerja privat dengan 4 kursi dan 2 meja" },
      { t: "AC, Wi-Fi 100 Mbps, & stop kontak" },
      { t: "Lobi, mushola, pantry dengan dispenser air panas dingin & teh" },
      { t: "Gratis air minum kemasan & tisu" },
    ],
    steps: [
      { t: "Pilih Tanggal, Jam & Ruangan", d: "Cek ketersediaan ruangan dan tentukan slot waktu." },
      { t: "Isi Data & Bayar", d: "Lengkapi data pemesan dan selesaikan pembayaran." },
      { t: "Check-in", d: "Resepsionis akan mengarahkan Anda ke ruang yang dipesan." },
      { t: "Gunakan Ruang", d: "Privasi penuh â€” 4 kursi & 2 meja siap pakai." },
    ],
    terms: TERMS_COWORKING,
    reviews: [
      { n: "Bayu A.", role: "Konsultan", date: "5 Mei 2026", star: 5, t: "Pas untuk meeting online tanpa gangguan suara. Kedap dan nyaman." },
    ],
  },
  "Meeting Room": {
    desc: "Ruang rapat profesional dengan layar besar, whiteboard, dan resepsionis yang menyambut tamu Anda.",
    included: [
      { t: "Jasa menerima tamu & resepsionis profesional" },
      { t: "Layar / proyektor & whiteboard" },
      { t: "AC, Wi-Fi 100 Mbps, & stop kontak" },
      { t: "Air minum & teh tersedia" },
    ],
    steps: [
      { t: "Pilih Kapasitas & Jam", d: "Tentukan ukuran ruang dan slot waktu meeting." },
      { t: "Isi Data & Bayar", d: "Lengkapi data dan konfirmasi pembayaran." },
      { t: "Persiapan Ruang", d: "Tim kami siapkan ruang dan perlengkapan." },
      { t: "Meeting Dimulai", d: "Tamu Anda disambut resepsionis, ruang siap pakai." },
    ],
    terms: TERMS_COWORKING,
    reviews: [
      { n: "Dimas R.", role: "Sales Manager", date: "2 Mei 2026", star: 5, t: "Klien terkesan dengan ruang dan sambutannya. Projector & sound jernih." },
    ],
  },
  "Private Office": {
    desc: "Kantor pribadi siap pakai untuk tim Anda â€” pilih ukuran sesuai kapasitas tim. Termasuk domisili gedung, resepsionis, dan fasilitas kantor lengkap. Pilih tanggal dan ruangan saat booking.",
    docsTitle: "Dokumen yang Anda Siapkan",
    docsIntro: "Untuk penerbitan surat domisili & kontrak sewa, siapkan dokumen berikut.",
    docs: [
      { t: "KTP Penyewa / PIC", d: "Identitas penanggung jawab tim" },
      { t: "NPWP Pribadi / Badan", d: "Untuk keperluan administrasi & domisili" },
      { t: "Akta / Legalitas Perusahaan", d: "Opsional, jika sudah berbadan usaha" },
    ],
    steps: [
      { t: "Pilih Ukuran & Tanggal", d: "Pilih paket 4 pax atau 6 pax dan tentukan tanggal mulai." },
      { t: "Isi Data & Bayar DP", d: "Lengkapi data penyewa dan bayar DP untuk mengunci ruang." },
      { t: "Verifikasi & Kontrak", d: "Tim kami siapkan kontrak sewa & surat domisili gedung." },
      { t: "Tim Pindah Masuk", d: "Ruang siap pakai dengan furnitur & fasilitas lengkap." },
    ],
    terms: [...TERMS_COWORKING, ...TERMS_VO.slice(0, 2)],
    reviews: [
      { n: "Kevin V.", role: "Founder Startup", date: "8 Mei 2026", star: 5, t: "Pindah tim jadi gampang, tinggal masuk. Resepsionis & domisili sangat membantu legalitas." },
    ],
  },
  "Virtual Office": {
    desc: "Sewa alamat kantor Kaspa Space sebagai alamat usaha Anda. Termasuk layanan penerimaan surat, domisili gedung, akses meeting room, dan jasa PKP. Pilih tanggal mulai â€” tidak perlu pilih ruangan.",
    docsTitle: "Dokumen yang Anda Siapkan",
    docsIntro: "Untuk pencatatan alamat & surat domisili, siapkan dokumen berikut.",
    docs: [
      { t: "KTP Penanggung Jawab", d: "Identitas yang bertanggung jawab atas penggunaan alamat" },
      { t: "NPWP Pribadi / Badan", d: "Untuk keperluan administrasi" },
      { t: "Surat Pernyataan Penggunaan Alamat", d: "Template kami sediakan setelah pemesanan" },
      { t: "Akta / Legalitas (jika ada)", d: "Untuk badan usaha yang sudah berdiri" },
    ],
    steps: [
      { t: "Pilih Paket / Bundling", d: "Pilih tier VO (Bronzeâ€“Diamond) atau bundling dengan pendirian PT/CV." },
      { t: "Isi Data Usaha & Bayar", d: "Lengkapi data usaha, pilih tanggal mulai, lalu bayar." },
      { t: "Verifikasi Dokumen", d: "Tim kami proses surat domisili & pencatatan alamat." },
      { t: "Alamat Aktif", d: "Alamat usaha & layanan penerimaan surat siap digunakan." },
    ],
    terms: TERMS_VO,
    reviews: [
      { n: "Hana S.", role: "Owner Online Shop", date: "11 Mei 2026", star: 5, t: "Alamat prestige dengan harga masuk akal. Pengurusan PKP-nya juga dibantu." },
      { n: "Arif B.", role: "Konsultan IT", date: "30 April 2026", star: 5, t: "Bundling sama pendirian PT bikin hemat waktu dan biaya." },
    ],
  },
  "Overtime": {
    desc: "Akses ruang kerja di luar jam operasional normal. Seninâ€“Sabtu pukul 17:00â€“23:00, Minggu pukul 08:00â€“23:00. Pesan minimal 1 jam, fleksibel sesuai kebutuhan.",
    included: [
      { t: "Akses ruang sesuai jam overtime", d: "Seninâ€“Sabtu 17:00â€“23:00 Â· Minggu 08:00â€“23:00" },
      { t: "Wi-Fi 100 Mbps & stop kontak" },
      { t: "AC dan pencahayaan penuh" },
      { t: "Pemesanan minimum 1 jam, fleksibel" },
    ],
    steps: [
      { t: "Pilih Tanggal & Jam", d: "Pilih hari dan slot jam sesuai jadwal overtime yang tersedia." },
      { t: "Pilih Ruangan", d: "Pilih ruangan yang disetting admin untuk sesi overtime." },
      { t: "Bayar & Konfirmasi", d: "Pembayaran selesai â†’ e-tiket otomatis terkirim ke email." },
      { t: "Datang & Akses", d: "Tunjukkan e-tiket, langsung gunakan ruang." },
    ],
    terms: TERMS_COWORKING,
    reviews: [
      { n: "Reza M.", role: "Software Engineer", date: "5 Mei 2026", star: 5, t: "Sangat membantu buat lembur. Jam-nya fleksibel, bisa pesan per jam." },
    ],
  },
};

const CW_FALLBACK = {
  desc: "Layanan ruang & fasilitas kerja dari Kaspa Space. Hubungi tim kami untuk detail ketersediaan.",
  steps: CW_INFO["Share Desk"].steps,
  terms: TERMS_COWORKING,
  reviews: [] as ProductReview[],
};


const BIZ_PRODUCTS: Record<string, Omit<Product, 'kind' | 'depositPct'>> = {
  legalitas: {
    id: "legalitas-usaha-solo",
    cat: "Legalitas Usaha",
    catForCheckout: "Legalitas Usaha",
    title: "Legalitas Usaha",
    titleEm: "Kaspa Space Solo",
    rating: 5.0, reviewCount: 5,
    badge: "Resmi Â· Notaris Pilihan",
    desc: "Layanan pengurusan badan usaha & izin operasional yang ditangani notaris pilihan kami. Proses transparan, online, dan terjadwal â€” dari konsultasi sampai dokumen jadi di tangan Anda.",
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
    docsIntro: "Semua dikirim secara digital. Tim kami bantu jika ada yang kurang.",
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
      { t: "Konsultasi & Submit", d: "Tim notaris hubungi Anda max 1Ã—24 jam kerja" },
      { t: "Proses Notaris", d: "Pembuatan akta & pengurusan SK Kemenkumham" },
      { t: "Dokumen Jadi", d: "Pelunasan, lalu dokumen dikirim digital & fisik" },
    ],
    terms: TERMS_LEGAL,
    reviews: [
      { n: "Pratyaksa F.", role: "Owner CV Sentra Niaga", date: "12 Mei 2026", star: 5, t: "Pelayanan legal pembuatan CV yang cepat dan amanah. Sangat profesional." },
      { n: "Rina K.", role: "Co-founder Startup F&B", date: "3 Mei 2026", star: 5, t: "Konsultannya bantu pilihkan yang paling cocok. Akta jadi 9 hari kerja." },
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
    desc: "Layanan cetak dokumen, materai, dan scan di lokasi Kaspa Space. Kirim file online atau datang langsung â€” hasil cepat dan harga terjangkau.",
    galleryPlaceholders: [
      { big: "Print", sub: "Cetak Dokumen", thumb: "Print" },
      { big: "Materai", sub: "e-Materai / Tempel", thumb: "Materai" },
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
    ],
    steps: [
      { t: "Kirim File / Datang", d: "Kirim dokumen online atau langsung ke lokasi" },
      { t: "Konfirmasi Jumlah", d: "Tentukan jumlah lembar & jenis layanan" },
      { t: "Bayar", d: "Pembayaran tunai atau cashless" },
      { t: "Ambil / Dikirim", d: "Hasil siap diambil atau dikirim digital" },
    ],
    terms: TERMS_UMUM,
    reviews: [{ n: "Toni H.", role: "Mahasiswa", date: "9 Mei 2026", star: 5, t: "Cepat dan murah. Bisa kirim file dulu, tinggal ambil." }],
    related: [{ kind: "business", id: "legalitas" }, { kind: "business", id: "backoffice" }],
  },
  backoffice: {
    id: "back-office",
    cat: "Back Office",
    catForCheckout: "Back Office",
    title: "Back Office",
    titleEm: "Kaspa Space",
    desc: "Outsourcing pembukuan, perpajakan, dan administrasi bisnis ke tim profesional kami. Hemat 20%â€“70% dibanding rekrut staf tetap, dengan kualitas yang terstandar.",
    rating: 5.0, reviewCount: 8,
    isNew: true,
    galleryPlaceholders: [
      { big: "Akuntansi", sub: "Pembukuan Bulanan", thumb: "Akun" },
      { big: "Pajak", sub: "PPh & PPN", thumb: "Pajak" },
    ],
    priceNote: "Biaya menyesuaikan skala & kebutuhan â€” konsultasi dulu, gratis.",
    adminFee: 0,
    variants: [
      { id: "konsultasi", name: "Konsultasi Awal", desc: "Pemetaan kebutuhan back office", price: 0, unit: "sesi", popular: true },
      { id: "pembukuan", name: "Paket Pembukuan", desc: "Akuntansi & laporan bulanan", price: 1500000, unit: "bulan" },
      { id: "pajak", name: "Paket Pajak", desc: "Hitung, lapor & bayar pajak rutin", price: 2000000, unit: "bulan" },
    ],
    included: [
      { t: "Pencatatan & pembukuan", d: "Jurnal, buku besar, dan laporan keuangan rutin" },
      { t: "Perpajakan", d: "Perhitungan, pelaporan, dan kepatuhan pajak" },
      { t: "Tim berpengalaman", d: "Hemat 20%â€“70% dibanding rekrut staf tetap" },
    ],
    steps: [
      { t: "Konsultasi Gratis", d: "Diskusi kebutuhan & skala bisnis Anda" },
      { t: "Penawaran", d: "Kami susun paket & biaya yang sesuai" },
      { t: "Onboarding", d: "Serah terima data & akses yang diperlukan" },
      { t: "Jalan Rutin", d: "Laporan berkala dikirim setiap periode" },
    ],
    terms: TERMS_UMUM,
    reviews: [{ n: "Maya L.", role: "Owner UMKM", date: "6 Mei 2026", star: 5, t: "Pembukuan jadi rapi, laporan tepat waktu. Jauh lebih hemat." }],
    related: [{ kind: "business", id: "legalitas" }, { kind: "coworking", type: "Virtual Office" }],
  },
};

const FNB_MENU_DATA = [
  { cat: "Kopi", name: "Manahan Latte", desc: "Single origin Aceh Gayo dengan oat milk dan caramel house syrup.", price: 38000, oldPrice: 48000, time: "5 min", rating: 4.9, img: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?auto=format&fit=crop&w=900&q=80" },
  { cat: "Kopi", name: "Es Kopi Susu Aren", desc: "Espresso double shot dengan susu segar dan gula aren asli.", price: 28000, time: "4 min", rating: 4.8, img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80" },
  { cat: "Kopi", name: "V60 Single Origin", desc: "Manual brew dengan biji pilihan minggu ini, disajikan hitam.", price: 42000, time: "8 min", rating: 4.7, img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80" },
  { cat: "Kopi", name: "Cappuccino Klasik", desc: "Espresso, milk foam tebal, taburan cocoa premium.", price: 32000, time: "5 min", rating: 4.7, img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80" },
  { cat: "Non-Kopi", name: "Matcha Latte", desc: "Bubuk matcha ceremonial grade dengan susu fresh.", price: 36000, time: "5 min", rating: 4.8, img: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=80" },
  { cat: "Non-Kopi", name: "Cokelat Hangat", desc: "Cokelat dark Belgian dengan marshmallow.", price: 32000, time: "5 min", rating: 4.6, img: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=900&q=80" },
  { cat: "Makanan", name: "Nasi Goreng Kaspa", desc: "Nasi goreng spesial dengan ayam suwir, telur mata sapi, dan acar.", price: 45000, time: "12 min", rating: 4.9, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80" },
  { cat: "Makanan", name: "Beef Burger", desc: "Beef patty grilled, keju cheddar, salad, dan saus rumahan.", price: 58000, time: "15 min", rating: 4.8, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80" },
  { cat: "Snack", name: "French Fries", desc: "Kentang goreng renyah dengan saus pilihan.", price: 22000, time: "8 min", rating: 4.5, img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80" },
  { cat: "Snack", name: "Tiramisu Cup", desc: "Tiramisu rumahan dengan kopi espresso dan mascarpone.", price: 35000, time: "Siap saji", rating: 4.8, img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80" },
];

export function buildProduct(desc: ProductDescriptor | null): Product | null {
  if (!desc) return null;

  if (desc.kind === 'business') {
    const p = BIZ_PRODUCTS[desc.id] ?? BIZ_PRODUCTS.legalitas;
    return { kind: 'business', depositPct: 0.5, ...p } as Product;
  }

  if (desc.kind === 'coworking') {
    const type = desc.type;
    const room = (desc.room ?? {}) as Record<string, unknown>;
    const info = CW_INFO[type] ?? CW_FALLBACK;
    const isVO = type === 'Virtual Office';
    const isPO = type === 'Private Office';

    let variants: ProductVariant[];
    if (desc.prices && desc.prices.length > 0) {
      variants = desc.prices.map((tier, i) => ({
        id:             `tier-${i}`,
        name:           tier.label,
        desc:           (room.amenity as string) ?? '',
        price:          tier.price,
        unit:           tier.unit,
        popular:        i === 0,
        bookingType:    tier.booking_type ?? type,
        durationMonths: (tier as { duration_months?: number }).duration_months ?? undefined,
      }));
    } else {
      variants = [{
        id:      type.toLowerCase().replace(/\s+/g, '-'),
        name:    type,
        desc:    (room.amenity as string) ?? '',
        price:   (room.suggested_price as number) ?? (room.price as number) ?? 0,
        unit:    (room.unit as string) ?? 'hari',
        popular: true,
        bookingType: type,
      }];
    }

    const priceNote = isVO
      ? 'Pilih tier sesuai kebutuhan usaha Anda. Bundling tersedia untuk efisiensi lebih.'
      : isPO
        ? 'Harga tergantung ukuran ruang & durasi sewa. Hubungi tim kami untuk penawaran.'
        : 'Harga dapat berubah sesuai paket & lokasi.';

    return {
      kind: 'coworking',
      id: 'cw-' + type.toLowerCase().replace(/\s+/g, '-'),
      cat: type,
      catForCheckout: type,
      title: type,
      titleEm: (room.loc as string) || (room.location as string) || null,
      rating: (room.rating as number) ?? 0,
      reviewCount: (room.reviews as number) ?? 0,
      badge: (room.badge as string) || null,
      heroImg: (room.images as string[] | undefined)?.[0] || (room.img as string) || null,
      heroImages: (room.images as string[] | undefined) || [],
      loc: (room.loc as string) || (room.location as string) || null,
      desc: info.desc,
      priceNote,
      adminFee: 15000,
      depositPct: isPO ? 0.5 : isVO ? 1 : 1,
      variants,
      included: info.included ?? null,
      docs: info.docs ?? null,
      docsTitle: info.docsTitle ?? null,
      docsIntro: info.docsIntro ?? null,
      steps: info.steps,
      terms: [...info.terms, ...TERMS_UMUM.slice(0, 2)],
      reviews: info.reviews,
      related: [
        type !== 'Share Desk' ? { kind: 'coworking' as const, type: 'Share Desk' } : { kind: 'coworking' as const, type: 'Meeting Room' },
        { kind: 'coworking' as const, type: 'Virtual Office' },
        { kind: 'business' as const, id: 'legalitas' },
      ].filter(r => !(r.kind === 'coworking' && (r as { type: string }).type === type)),
    };
  }

  if (desc.kind === 'fnb') {
    const item = FNB_MENU_DATA.find(m => m.name === desc.name) ?? FNB_MENU_DATA[0];
    const unit = (item.cat === 'Kopi' || item.cat === 'Non-Kopi') ? 'cup' : 'porsi';
    return {
      kind: 'fnb',
      id: 'fnb-' + item.name.toLowerCase().replace(/\s+/g, '-'),
      cat: 'Food & Beverage',
      catForCheckout: 'Food & Beverage',
      title: item.name,
      titleEm: item.cat,
      rating: item.rating,
      reviewCount: 24,
      heroImg: item.img,
      meta: item.time,
      desc: item.desc + ' Disajikan oleh kafe internal Kaspa Space dengan bahan pilihan.',
      priceNote: 'Harga normal â€” member otomatis hemat 20% di kasir.',
      adminFee: 2000,
      depositPct: 1,
      variants: [{ id: 'reg', name: 'Reguler', desc: '1 ' + unit, price: item.price, unit, popular: true }],
      included: [
        { t: "Dibuat fresh saat dipesan", d: "Tanpa bahan pengawet, kualitas terjaga" },
        { t: "Bahan pilihan lokal", d: "Disuplai dari rekanan lokal terpercaya" },
        { t: "Diskon 20% untuk member", d: "Scan QR member aktif di kasir" },
      ],
      steps: [
        { t: "Pilih Menu", d: "Pesan via halaman ini atau langsung ke counter." },
        { t: "Tunjukkan Member", d: "Scan QR member untuk diskon 20% otomatis." },
        { t: "Bayar", d: "QRIS, e-wallet, transfer, atau tunai." },
        { t: "Diantar / Pickup", d: "Diantar ke desk Anda atau ambil di counter." },
      ],
      terms: [...TERMS_FNB, ...TERMS_UMUM.slice(0, 2)],
      reviews: [
        { n: "Lina W.", role: "Member", date: "12 Mei 2026", star: 5, t: "Rasanya konsisten enak, apalagi diskon member." },
      ],
      related: FNB_MENU_DATA.filter(m => m.cat === item.cat && m.name !== item.name).slice(0, 3)
        .map(m => ({ kind: 'fnb' as const, name: m.name })),
    };
  }

  return null;
}

export const PAYMENT_METHODS = [
  {
    group: "Transfer Virtual Account",
    methods: [
      { id: "va-bca",     name: "BCA Virtual Account",     desc: "Verifikasi otomatis Â· max 24 jam", logo: "BCA" },
      { id: "va-mandiri", name: "Mandiri Virtual Account",  desc: "Verifikasi otomatis Â· max 24 jam", logo: "MDR" },
      { id: "va-bni",     name: "BNI Virtual Account",      desc: "Verifikasi otomatis Â· max 24 jam", logo: "BNI" },
      { id: "va-bri",     name: "BRI Virtual Account",      desc: "Verifikasi otomatis Â· max 24 jam", logo: "BRI" },
    ],
  },
  {
    group: "QRIS & E-Wallet",
    methods: [
      { id: "qris",      name: "QRIS",      desc: "Scan dari semua aplikasi pembayaran", logo: "QRIS" },
      { id: "gopay",     name: "GoPay",     desc: "Bayar dari aplikasi Gojek",           logo: "GO"   },
      { id: "ovo",       name: "OVO",       desc: "Bayar dari aplikasi OVO",             logo: "OVO"  },
      { id: "shopeepay", name: "ShopeePay", desc: "Bayar dari aplikasi Shopee",          logo: "SPY"  },
    ],
  },
  {
    group: "Gerai Retail",
    methods: [
      { id: "indomaret", name: "Indomaret", desc: "Bayar di kasir Indomaret terdekat", logo: "IDM" },
      { id: "alfamart",  name: "Alfamart",  desc: "Bayar di kasir Alfamart terdekat",  logo: "ALF" },
    ],
  },
];

export const LEGAL_DOCS = {
  terms: {
    title: "Syarat & Ketentuan",
    titleEm: null,
    updated: "Diperbarui 1 Mei 2026",
    intro: "Dengan membuat akun, memesan, atau menggunakan layanan Kaspa Space, Anda dianggap telah membaca dan menyetujui ketentuan berikut.",
    sections: [
      { h: "1. Penerimaan Ketentuan", items: ["Ketentuan ini berlaku untuk seluruh layanan Kaspa Space: coworking, virtual office, private office, business service, serta food & beverage.", "Jika Anda tidak menyetujui sebagian atau seluruh ketentuan, mohon untuk tidak menggunakan layanan kami."] },
      { h: "2. Pemesanan & Pembayaran", items: ["Pemesanan dianggap sah setelah pembayaran (atau DP) berhasil diverifikasi sistem.", "Untuk layanan tertentu kami menerapkan uang muka 50%; pelunasan dilakukan saat layanan/dokumen selesai.", "Invoice resmi dikirim otomatis ke email yang Anda daftarkan saat checkout."] },
      { h: "3. Pembatalan & Refund", items: ["Booking ruang: pembatalan minimal H-1 mendapat refund 100%; pembatalan di hari-H tidak dapat di-refund.", "Reschedule gratis 1Ã— selama kuota masih tersedia.", "Layanan legalitas: refund 100% hanya jika pesanan sama sekali tidak dapat kami proses."] },
      { h: "4. Penggunaan Layanan", items: ["Pengguna wajib menjaga kebersihan, ketertiban, dan fasilitas; kerusakan menjadi tanggung jawab pemesan.", "Alamat virtual/private office hanya untuk keperluan administrasi & korespondensi yang sah."] },
    ],
  },
  privacy: {
    title: "Kebijakan",
    titleEm: "Privasi",
    updated: "Diperbarui 1 Mei 2026",
    intro: "Privasi Anda penting bagi kami. Kebijakan ini menjelaskan data apa yang kami kumpulkan dan bagaimana kami menggunakannya.",
    sections: [
      { h: "1. Data yang Kami Kumpulkan", items: ["Data identitas: nama, NIK, email, nomor WhatsApp.", "Data usaha: nama perusahaan, bidang usaha, alamat.", "Dokumen yang Anda unggah: KTP, NPWP, foto, akta/legalitas.", "Data transaksi: pesanan, metode pembayaran, dan riwayat."] },
      { h: "2. Cara Kami Menggunakan Data", items: ["Memproses pesanan, pembayaran, dan penerbitan dokumen.", "Mengirim invoice serta update progres melalui email/WhatsApp.", "Meningkatkan kualitas layanan dan dukungan pelanggan."] },
      { h: "3. Berbagi Data dengan Pihak Ketiga", items: ["Notaris/instansi terkait â€” hanya untuk keperluan pengurusan legalitas Anda.", "Penyedia pembayaran â€” untuk memproses transaksi dengan aman.", "Kami tidak menjual data pribadi Anda kepada pihak mana pun."] },
    ],
  },
  security: {
    title: "Keamanan",
    titleEm: "Kami",
    updated: "Diperbarui 1 Mei 2026",
    intro: "Kami menerapkan praktik keamanan berlapis untuk melindungi data dan transaksi Anda.",
    sections: [
      { h: "Enkripsi", items: ["Seluruh koneksi diamankan dengan SSL/TLS 256-bit.", "Data sensitif dienkripsi saat transit antara perangkat Anda dan server kami."] },
      { h: "Pembayaran", items: ["Transaksi diproses melalui payment gateway tersertifikasi.", "Kami tidak menyimpan detail kartu/PIN pembayaran Anda."] },
    ],
  },
  cookies: {
    title: "Kebijakan",
    titleEm: "Cookies",
    updated: "Diperbarui 1 Mei 2026",
    intro: "Kami menggunakan cookies untuk meningkatkan pengalaman pengguna dan keamanan platform.",
    sections: [
      { h: "Jenis Cookies", items: ["Cookies sesi: untuk menjaga status login selama Anda menggunakan platform.", "Cookies preferensi: untuk menyimpan pengaturan bahasa dan tampilan.", "Cookies analitik: untuk memahami cara penggunaan dan meningkatkan layanan."] },
      { h: "Mengelola Cookies", items: ["Anda dapat menonaktifkan cookies di pengaturan browser, namun beberapa fitur mungkin tidak berfungsi.", "Cookies pihak ketiga (analytics) dapat dinonaktifkan tanpa mempengaruhi fungsionalitas utama."] },
    ],
  },
};
