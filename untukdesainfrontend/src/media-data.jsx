/* global window */
/* ============================================
   KASPA SPACE — Shared article data + helpers
   Consumed by media.jsx (list) and article.jsx (reader)
   ============================================ */

/* Avatar palette — deterministic per author name */
window.KaspaAvatarColors = [
  "linear-gradient(135deg,#2563eb,#60a5fa)",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#0e9f6e,#34d399)",
  "linear-gradient(135deg,#d97706,#fbbf24)",
  "linear-gradient(135deg,#db2777,#f472b6)",
  "linear-gradient(135deg,#0891b2,#22d3ee)",
];
window.ksInitials = (name) => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
window.ksAvatar = (name) => window.KaspaAvatarColors[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % window.KaspaAvatarColors.length];

const AUTHORS = {
  "Rara Anjani": "Editor in Chief yang meliput budaya kerja, produktivitas, dan kisah komunitas Kaspa Space.",
  "Dimas Putra": "Product Lead Kaspa Space. Menulis tentang fitur baru, teknologi, dan masa depan ruang kerja.",
  "Sinta Maharani": "Partnership Manager yang membangun kolaborasi Kaspa Space dengan mitra dan institusi.",
  "Bagas Wibowo": "Community Builder. Menemani member dari hari pertama hingga bisnis mereka tumbuh.",
};

window.KaspaArticles = [
  {
    slug: "coworking-terbaik-2026",
    cat: "Penghargaan", date: "12 Mei 2026", read: "4 min", featured: true,
    title: "Kaspa Space Raih Penghargaan Coworking Terbaik 2026",
    excerpt: "Dewan juri Indonesia Workspace Awards menobatkan Kaspa Space sebagai ruang kerja kolaboratif terbaik berkat ekosistem layanan terintegrasi dan tingkat okupansi member yang konsisten di atas 90%.",
    author: "Rara Anjani", role: "Editor",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    lede: "Malam itu, panggung Indonesia Workspace Awards 2026 berakhir dengan satu nama yang disebut paling lantang — Kaspa Space. Penghargaan Coworking Terbaik tahun ini menjadi penanda perjalanan tiga tahun yang dimulai dari sebuah garasi di Solo.",
    body: [
      { p: "Kategori \"Best Collaborative Workspace\" dinilai dari empat aspek: pengalaman member, kelengkapan layanan, keberlanjutan komunitas, dan inovasi produk. Kaspa Space unggul karena tidak berhenti sebagai penyedia meja, melainkan tumbuh menjadi ekosistem yang menemani perjalanan bisnis member dari nol." },
      { h: "Bukan soal gedung, tapi ekosistem" },
      { p: "Dewan juri menyoroti bagaimana Kaspa Space menggabungkan coworking, layanan legalitas, kafe internal, dan komunitas dalam satu atap. Member bisa mendirikan PT, memesan ruang meeting, dan bertemu calon investor tanpa berpindah platform." },
      { quote: "Yang membedakan Kaspa bukan fasilitasnya, tapi bagaimana semuanya saling terhubung untuk membuat bisnis kecil terasa punya kantor besar.", by: "Dewan Juri IWA 2026" },
      { h: "Angka yang berbicara" },
      { list: [
        "Tingkat okupansi member konsisten di atas 90% sepanjang 2025–2026.",
        "Lebih dari 500 badan usaha didirikan lewat layanan legalitas Kaspa.",
        "Net Promoter Score member mencapai 72 — tertinggi di kategorinya.",
      ] },
      { p: "Penghargaan ini kami persembahkan untuk setiap member yang memilih bertumbuh bersama kami. Tahun depan, kami menargetkan kehadiran di empat kota baru dengan standar pengalaman yang sama." },
    ],
  },
  {
    slug: "legalitas-6-kota",
    cat: "Produk", date: "5 Mei 2026", read: "6 min",
    title: "Layanan Legalitas Bisnis Kini Hadir di 6 Kota",
    excerpt: "Pendirian PT, CV, hingga pengurusan izin usaha kini bisa diurus langsung dari dashboard Kaspa Space — tanpa antre, dengan pendampingan notaris mitra.",
    author: "Dimas Putra", role: "Product",
    img: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
    lede: "Mengurus legalitas usaha sering jadi tembok pertama yang menghentikan langkah calon pengusaha. Mulai bulan ini, tembok itu kami robohkan di enam kota sekaligus.",
    body: [
      { p: "Lewat dashboard Kaspa Space, kamu kini bisa memilih jenis badan usaha, mengunggah dokumen, dan memantau progres pengurusan secara real-time. Semua tahap dikerjakan bersama notaris mitra yang sudah terverifikasi." },
      { h: "Apa saja yang bisa diurus?" },
      { list: [
        "Pendirian PT Perorangan, PT, dan CV.",
        "Pengurusan NIB, NPWP badan, dan izin usaha.",
        "Perubahan akta, domisili, dan tambah bidang usaha.",
      ] },
      { p: "Setiap paket sudah termasuk konsultasi awal gratis. Tim kami membantu menentukan struktur badan usaha yang paling sesuai dengan rencana bisnis dan kewajiban pajakmu." },
      { quote: "Tujuan kami sederhana: dari ide ke badan usaha resmi dalam hitungan hari, bukan minggu.", by: "Dimas Putra, Product Lead" },
      { h: "Kota mana saja?" },
      { p: "Layanan kini tersedia di Solo, Yogyakarta, Semarang, Bandung, Surabaya, dan Jakarta. Karena prosesnya berbasis dashboard, member dari kota lain tetap bisa mengurus secara daring dengan dokumen dikirim ke alamat masing-masing." },
    ],
  },
  {
    slug: "bri-keuangan-terintegrasi",
    cat: "Kolaborasi", date: "28 April 2026", read: "5 min",
    title: "Kaspa Space & BRI Buka Layanan Keuangan Terintegrasi",
    excerpt: "Member kini dapat membuka rekening bisnis, mengajukan modal kerja, dan mengelola arus kas langsung dari satu tempat lewat kemitraan strategis dengan BRI.",
    author: "Sinta Maharani", role: "Partnership",
    img: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=80",
    lede: "Setelah legalitas beres, tantangan berikutnya bagi bisnis baru adalah keuangan. Kemitraan kami dengan BRI hadir untuk menjawab tepat di titik itu.",
    body: [
      { p: "Mulai kuartal ini, member Kaspa Space bisa membuka rekening giro bisnis BRI tanpa perlu ke kantor cabang. Verifikasi dilakukan di lokasi Kaspa, dan rekening aktif di hari yang sama." },
      { h: "Lebih dari sekadar rekening" },
      { p: "Integrasi ini juga membuka akses ke fasilitas modal kerja dengan proses pengajuan yang disederhanakan. Riwayat transaksi member yang tercatat rapi membantu mempercepat penilaian kelayakan kredit." },
      { list: [
        "Buka rekening bisnis langsung di lokasi Kaspa.",
        "Pengajuan modal kerja dengan dokumen minimal.",
        "Dashboard arus kas yang terhubung otomatis.",
      ] },
      { quote: "Kami ingin member berfokus membangun produk, bukan tersangkut urusan administrasi bank.", by: "Sinta Maharani, Partnership" },
      { p: "Kolaborasi ini adalah bagian dari visi kami menjadikan Kaspa Space sebagai satu tempat di mana sebuah bisnis bisa lahir, diurus legalitasnya, dan dibiayai untuk tumbuh." },
    ],
  },
  {
    slug: "5-startup-share-desk",
    cat: "Komunitas", date: "20 April 2026", read: "3 min",
    title: "Cerita 5 Startup yang Lahir dari Meja Share Desk",
    excerpt: "Dari ide di tisu kafe hingga pendanaan seri A — lima founder berbagi bagaimana komunitas Kaspa Space ikut membentuk perjalanan bisnis mereka.",
    author: "Bagas Wibowo", role: "Community",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    lede: "Share desk sering dianggap sekadar meja murah untuk numpang kerja. Tapi bagi lima tim ini, meja itu adalah tempat kelahiran perusahaan yang kini mempekerjakan puluhan orang.",
    body: [
      { p: "Yang menyatukan kelima cerita ini bukan modal besar, melainkan pertemuan tak terduga — perkenalan di antrean kopi, obrolan di sela meeting, kolaborasi yang bermula dari basa-basi." },
      { h: "Dari tetangga meja jadi co-founder" },
      { p: "Tiga dari lima startup ini menemukan co-founder mereka di Kaspa Space. Kedekatan fisik di ruang bersama mempercepat hal yang sulit dibangun lewat layar: kepercayaan." },
      { quote: "Aku pindah ke private office sekarang, tapi semua bermula dari satu meja share desk dan satu obrolan random.", by: "Founder, alumni Kaspa" },
      { h: "Komunitas sebagai akselerator" },
      { p: "Selain ruang, member mendapat akses ke sesi mentoring, demo day, dan jaringan investor yang rutin berkunjung. Bagi banyak founder, inilah nilai yang tak terlihat di brosur namun paling terasa di perjalanan." },
    ],
  },
  {
    slug: "7-kebiasaan-produktif",
    cat: "Tips", date: "14 April 2026", read: "7 min",
    title: "7 Kebiasaan Kerja Produktif ala Member Kaspa",
    excerpt: "Rutinitas pagi, deep work block, sampai etika ruang bersama — panduan praktis agar hari kerjamu di coworking jauh lebih fokus dan efektif.",
    author: "Rara Anjani", role: "Editor",
    img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    lede: "Kami bertanya ke puluhan member paling produktif di Kaspa Space: apa kebiasaan kecil yang paling berpengaruh? Tujuh hal ini paling sering disebut.",
    body: [
      { h: "1. Mulai dengan satu tugas penting" },
      { p: "Sebelum membuka email atau chat, kerjakan satu tugas paling berdampak selama 60 menit pertama. Otak masih segar dan ruang masih tenang — manfaatkan." },
      { h: "2. Pakai deep work block" },
      { p: "Blok waktu 90 menit tanpa notifikasi terbukti jauh lebih produktif daripada delapan jam yang terus terinterupsi. Pesan ruang fokus jika perlu sinyal \"jangan ganggu\"." },
      { h: "3. Hormati ruang bersama" },
      { list: [
        "Telepon dan meeting daring di phone booth, bukan di meja.",
        "Mode senyap untuk laptop dan ponsel.",
        "Rapikan meja saat selesai — meja bersih, pikiran ringan.",
      ] },
      { quote: "Produktivitas di coworking 50% soal disiplin pribadi, 50% soal menghargai orang di sebelahmu.", by: "Rara Anjani" },
      { h: "4–7. Ritme, jeda, dan koneksi" },
      { p: "Sisanya: jadwalkan jeda pendek tiap jam, makan siang jauh dari layar, manfaatkan kafe untuk obrolan ringan yang menyegarkan, dan tutup hari dengan menulis tiga prioritas esok. Sederhana, tapi konsisten mengubah hasil." },
    ],
  },
  {
    slug: "kaspa-connect-recap",
    cat: "Event", date: "8 April 2026", read: "4 min",
    title: "Recap Kaspa Connect: Malam Networking Terbesar Tahun Ini",
    excerpt: "Lebih dari 200 founder, freelancer, dan investor berkumpul dalam satu malam penuh kolaborasi. Simak momen dan insight terbaik dari panggung Kaspa Connect.",
    author: "Sinta Maharani", role: "Partnership",
    img: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
    lede: "Aula utama Kaspa Space Solo dipenuhi lebih dari 200 orang malam itu. Kaspa Connect kembali membuktikan bahwa hal terbaik sering terjadi saat orang yang tepat dipertemukan.",
    body: [
      { p: "Acara dibuka dengan sesi lightning talk dari tiga founder alumni yang membagikan perjalanan dari ide hingga ekspansi. Tema besarnya tahun ini: bertumbuh tanpa kehilangan arah." },
      { h: "Panggung yang menginspirasi" },
      { p: "Sesi panel mempertemukan investor dan operator bisnis membahas realitas pendanaan di 2026. Pesannya jelas — fundamental yang sehat kembali jadi raja, bukan sekadar pertumbuhan cepat." },
      { quote: "Networking terbaik bukan menukar kartu nama, tapi menemukan orang yang mau bertumbuh bersamamu.", by: "Pembicara Kaspa Connect" },
      { h: "Yang terjadi setelah panggung" },
      { p: "Bagian favorit malam itu justru sesi mingle. Beberapa kolaborasi langsung lahir di meja kafe, dari kesepakatan desain hingga rencana co-founding. Sampai jumpa di Kaspa Connect berikutnya." },
    ],
  },
  {
    slug: "meeting-room-pintar",
    cat: "Produk", date: "1 April 2026", read: "5 min",
    title: "Meeting Room Pintar: Booking, Bayar, Masuk dalam 30 Detik",
    excerpt: "Fitur smart booking baru memungkinkan member memesan ruang meeting, membayar otomatis dari saldo, dan membuka pintu lewat QR — semua tanpa resepsionis.",
    author: "Dimas Putra", role: "Product",
    img: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
    lede: "Memesan ruang meeting seharusnya secepat memesan ojek online. Itulah prinsip di balik fitur Meeting Room Pintar yang kami rilis bulan ini.",
    body: [
      { p: "Cukup buka dashboard, pilih ruang dan slot waktu, lalu konfirmasi. Pembayaran ditarik otomatis dari saldo member, dan kamu langsung menerima QR untuk membuka pintu ruangan." },
      { h: "Tiga langkah, tanpa antre" },
      { list: [
        "Booking: pilih ruang, durasi, dan slot dari ponsel.",
        "Bayar: otomatis dari saldo, struk langsung tersimpan.",
        "Masuk: scan QR di pintu, ruangan terbuka.",
      ] },
      { quote: "Kami menghapus setiap gesekan kecil antara member dan ruang yang mereka butuhkan.", by: "Dimas Putra, Product Lead" },
      { h: "Pintar di balik layar" },
      { p: "Sistem juga otomatis menyalakan AC dan layar saat sesi dimulai, lalu mematikannya setelah selesai — hemat energi tanpa perlu dipikirkan. Pemberitahuan pengingat dikirim 10 menit sebelum waktu habis." },
    ],
  },
  {
    slug: "virtual-office-vs-fisik",
    cat: "Tips", date: "25 Maret 2026", read: "6 min",
    title: "Virtual Office vs Kantor Fisik: Mana yang Tepat untukmu?",
    excerpt: "Bingung memilih antara alamat bisnis bergengsi atau ruang kerja nyata? Kami bedah biaya, legalitas, dan skenario terbaik untuk tiap tahap bisnis.",
    author: "Bagas Wibowo", role: "Community",
    img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
    lede: "Salah satu pertanyaan paling sering kami terima dari calon member: cukup virtual office, atau perlu kantor fisik? Jawabannya bergantung pada tahap bisnismu.",
    body: [
      { h: "Kapan virtual office cukup" },
      { p: "Untuk freelancer, bisnis daring, atau startup tahap awal yang timnya bekerja remote, virtual office memberi alamat bisnis bergengsi dan kelengkapan legalitas tanpa biaya sewa ruang." },
      { h: "Kapan kantor fisik jadi penting" },
      { p: "Begitu tim mulai bertumbuh dan kolaborasi tatap muka jadi rutin, ruang fisik membayar dirinya sendiri lewat produktivitas dan budaya yang lebih kuat." },
      { list: [
        "Virtual office: hemat biaya, ideal untuk tahap validasi.",
        "Hybrid: alamat virtual + akses share desk sesuai kebutuhan.",
        "Private office: untuk tim yang butuh ruang tetap dan privasi.",
      ] },
      { quote: "Tidak ada jawaban benar — yang ada adalah pilihan yang tepat untuk tahapmu sekarang.", by: "Bagas Wibowo" },
      { p: "Kabar baiknya, di Kaspa Space kamu bisa mulai dari virtual office dan naik kelas ke ruang fisik kapan pun siap, tanpa mengganti alamat atau dokumen bisnis." },
    ],
  },
  {
    slug: "kafe-internal-kaspa",
    cat: "Komunitas", date: "18 Maret 2026", read: "3 min",
    title: "Mengenal Kafe Internal Kaspa: Kopi yang Menemani Lembur",
    excerpt: "Di balik setiap deadline ada secangkir kopi. Kami berkunjung ke dapur kafe Kaspa Space dan ngobrol dengan barista soal menu favorit member.",
    author: "Rara Anjani", role: "Editor",
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    lede: "Aroma kopi adalah hal pertama yang menyambutmu di lobi Kaspa Space. Di balik bar mungil itu, ada tim kecil yang diam-diam menjadi bagian penting dari ritme kerja member.",
    body: [
      { p: "Kafe internal Kaspa bukan sekadar fasilitas pelengkap. Bagi banyak member, antrean kopi pagi adalah ruang sosial paling jujur — tempat ide dan obrolan ringan mengalir tanpa agenda." },
      { h: "Menu yang lahir dari member" },
      { p: "Beberapa menu favorit justru usulan member sendiri. Es Kopi Susu Aren, misalnya, kini jadi pesanan nomor satu dan mendapat diskon khusus untuk member Gold." },
      { quote: "Pelanggan kami orang yang sama tiap hari. Lama-lama kami hafal pesanan dan kabar mereka.", by: "Barista Kaspa Space" },
      { p: "Lain kali kamu mampir, sapa tim kafe dan minta rekomendasi. Siapa tahu cangkir berikutnya menemani ide terbaikmu hari itu." },
    ],
  },
];

window.KaspaAuthorBio = (name) => AUTHORS[name] || "Kontributor Kaspa Space.";
window.KaspaArticleBySlug = (slug) => window.KaspaArticles.find(a => a.slug === slug) || null;
