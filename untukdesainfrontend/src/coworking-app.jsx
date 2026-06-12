/* global React, Icon, Nav, Footer, CWSubHero, CWFilterAndGrid, CWSchedule, CWCompare, CWFeatureTesti */
const { useState: useStateCWApp } = React;

/* FAQ specific to coworking */
function CWFAQ() {
  const [open, setOpen] = useStateCWApp(0);
  const faqs = [
    { q: "Bagaimana cara mengetahui ketersediaan ruangan?", a: "Lihat tabel jadwal & ketersediaan di atas — slot hijau berarti tersedia, slot merah sudah terisi. Jika ruangan yang Anda butuhkan penuh, tim kami bisa membantu mencarikan alternatif." },
    { q: "Bagaimana prosedur booking?", a: "Pilih produk atau layanan yang Anda butuhkan → masuk ke keranjang → isi formulir data pemesan → pilih metode pembayaran → setujui Syarat & Ketentuan → bayar. E-tiket otomatis dikirim ke email Anda." },
    { q: "Bagaimana konfirmasi setelah pembayaran?", a: "Setelah pembayaran berhasil, Anda akan menerima email invoice & e-tiket dalam 5 menit. Tunjukkan e-tiket ke resepsionis saat datang — tidak perlu konfirmasi manual." },
    { q: "Apakah ada surat perjanjian sewa?", a: "Ya. Untuk paket bulanan & tahunan, kami sediakan surat perjanjian resmi yang dapat diunduh dari dashboard member setelah pembayaran." },
    { q: "Apakah kantor dapat diakses 24 jam?", a: "Coworking standar buka jam 08:00–22:00. Untuk akses 24 jam, ambil paket Overtime atau Private Office yang sudah include akses 24/7." },
    { q: "Bisa upgrade paket di tengah jalan?", a: "Tentu. Anda bisa upgrade dari paket harian ke bulanan, atau dari coworking ke private office kapan saja. Selisih biaya akan dihitung pro-rata." },
  ];

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="faq-section">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="section-title">Pertanyaan <em>Umum</em></h2>
            <p className="section-sub">
              Belum menemukan jawaban? Tim kami siap bantu lewat WhatsApp 8 menit response time
              di jam kerja.
            </p>
            <a className="btn btn-primary" href="#" style={{ marginTop: 24 }}>
              <Icon.Whatsapp /> Chat WhatsApp
            </a>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
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

function CWApp() {
  return (
    <>
      <Nav />
      <CWSubHero />
      <CWFilterAndGrid />
      <CWSchedule />
      <CWCompare />
      <CWFeatureTesti />
      <CWFAQ />
      <Footer />
      <a className="wa-float" href="#" aria-label="Chat WhatsApp"><Icon.Whatsapp /></a>
    </>
  );
}

(window.KaspaPages = window.KaspaPages || {})["coworking"] = CWApp;
