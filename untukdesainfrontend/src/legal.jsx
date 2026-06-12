/* global window, document */
/* ============================================
   LEGAL — modal Syarat & Ketentuan / Privasi /
   Keamanan / Cookies. Dipakai global lewat
   window.openLegal('terms' | 'privacy' | 'security' | 'cookies').
   ============================================ */

const LEGAL_DOCS = {
  terms: {
    title: "Syarat & Ketentuan",
    updated: "Diperbarui 1 Mei 2026",
    intro: "Dengan membuat akun, memesan, atau menggunakan layanan Kaspa Space, Anda dianggap telah membaca dan menyetujui ketentuan berikut.",
    sections: [
      { h: "1. Penerimaan Ketentuan", items: [
        "Ketentuan ini berlaku untuk seluruh layanan Kaspa Space: coworking, virtual office, private office, business service, serta food & beverage.",
        "Jika Anda tidak menyetujui sebagian atau seluruh ketentuan, mohon untuk tidak menggunakan layanan kami.",
      ] },
      { h: "2. Pemesanan & Pembayaran", items: [
        "Pemesanan dianggap sah setelah pembayaran (atau DP) berhasil diverifikasi sistem.",
        "Untuk layanan tertentu kami menerapkan uang muka 50%; pelunasan dilakukan saat layanan/dokumen selesai.",
        "Invoice resmi dikirim otomatis ke email yang Anda daftarkan saat checkout.",
        "Pembayaran diproses melalui penyedia pembayaran tepercaya (mis. Midtrans) dengan kanal VA, QRIS, e-wallet, dan gerai retail.",
      ] },
      { h: "3. Pembatalan & Refund", items: [
        "Booking ruang: pembatalan minimal H-1 mendapat refund 100%; pembatalan di hari-H tidak dapat di-refund.",
        "Reschedule gratis 1× selama kuota masih tersedia.",
        "Layanan legalitas: refund 100% hanya jika pesanan sama sekali tidak dapat kami proses.",
      ] },
      { h: "4. Penggunaan Layanan", items: [
        "Pengguna wajib menjaga kebersihan, ketertiban, dan fasilitas; kerusakan menjadi tanggung jawab pemesan.",
        "Alamat virtual/private office hanya untuk keperluan administrasi & korespondensi yang sah.",
        "Dilarang menggunakan layanan untuk aktivitas yang melanggar hukum yang berlaku di Indonesia.",
      ] },
      { h: "5. Layanan Legalitas (PT/CV)", items: [
        "Proses dimulai setelah DP dibayar dan dokumen persyaratan diterima lengkap.",
        "Nama badan usaha tunduk pada persetujuan Kemenkumham; sediakan 3 alternatif nama.",
        "Estimasi 14–21 hari kerja, tergantung antrean instansi terkait.",
      ] },
      { h: "6. Batasan Tanggung Jawab", items: [
        "Kaspa Space tidak bertanggung jawab atas penyalahgunaan layanan di luar perjanjian.",
        "Kami berhak menolak atau membatalkan pesanan yang melanggar hukum atau ketertiban umum.",
      ] },
      { h: "7. Perubahan Ketentuan", items: [
        "Kaspa Space dapat memperbarui ketentuan sewaktu-waktu. Perubahan berlaku sejak dipublikasikan di situs ini.",
      ] },
    ],
  },
  privacy: {
    title: "Kebijakan Privasi",
    updated: "Diperbarui 1 Mei 2026",
    intro: "Privasi Anda penting bagi kami. Kebijakan ini menjelaskan data apa yang kami kumpulkan dan bagaimana kami menggunakannya.",
    sections: [
      { h: "1. Data yang Kami Kumpulkan", items: [
        "Data identitas: nama, NIK, email, nomor WhatsApp.",
        "Data usaha: nama perusahaan, bidang usaha (KBLI), alamat, susunan pengurus (untuk layanan terkait).",
        "Dokumen yang Anda unggah: KTP, NPWP, foto, akta/legalitas.",
        "Data transaksi: pesanan, metode pembayaran, dan riwayat.",
      ] },
      { h: "2. Cara Kami Menggunakan Data", items: [
        "Memproses pesanan, pembayaran, dan penerbitan dokumen/surat resmi.",
        "Mengirim invoice serta update progres melalui email/WhatsApp.",
        "Meningkatkan kualitas layanan dan dukungan pelanggan.",
      ] },
      { h: "3. Berbagi Data dengan Pihak Ketiga", items: [
        "Notaris/instansi terkait — hanya untuk keperluan pengurusan legalitas Anda.",
        "Penyedia pembayaran — untuk memproses transaksi dengan aman.",
        "Kami tidak menjual data pribadi Anda kepada pihak mana pun.",
      ] },
      { h: "4. Penyimpanan & Keamanan", items: [
        "Data disimpan dengan pengamanan teknis & organisasi yang wajar.",
        "Akses dibatasi hanya untuk staf yang berkepentingan.",
        "Dokumen sensitif dienkripsi saat transit (SSL/TLS).",
      ] },
      { h: "5. Hak Anda", items: [
        "Anda dapat meminta akses, koreksi, atau penghapusan data pribadi Anda.",
        "Permintaan dapat diajukan melalui kontak resmi Kaspa Space.",
      ] },
      { h: "6. Kontak", items: [
        "Pertanyaan seputar privasi? Hubungi kami di privacy@kaspaspace.id atau via WhatsApp.",
      ] },
    ],
  },
  security: {
    title: "Keamanan Kami",
    updated: "Diperbarui 1 Mei 2026",
    intro: "Kami menerapkan praktik keamanan berlapis untuk melindungi data dan transaksi Anda.",
    sections: [
      { h: "Enkripsi", items: [
        "Seluruh koneksi diamankan dengan SSL/TLS 256-bit.",
        "Data sensitif dienkripsi saat transit antara perangkat Anda dan server kami.",
      ] },
      { h: "Pembayaran", items: [
        "Transaksi diproses melalui payment gateway tersertifikasi (mis. Midtrans).",
        "Kami tidak menyimpan detail kartu/PIN pembayaran Anda.",
      ] },
      { h: "Dokumen & Akses", items: [
        "Dokumen yang diunggah disimpan terbatas dan hanya diakses staf berkepentingan.",
        "Aktivitas akun dapat dipantau untuk mendeteksi aktivitas mencurigakan.",
      ] },
    ],
  },
  cookies: {
    title: "Kebijakan Cookies",
    updated: "Diperbarui 1 Mei 2026",
    intro: "Kami menggunakan cookies untuk menjaga sesi dan meningkatkan pengalaman Anda.",
    sections: [
      { h: "Jenis Cookies", items: [
        "Esensial — menjaga sesi login dan keranjang pesanan Anda.",
        "Preferensi — mengingat pilihan tampilan & lokasi favorit.",
        "Analitik — membantu kami memahami penggunaan situs secara agregat.",
      ] },
      { h: "Pengaturan", items: [
        "Anda dapat mengatur atau menghapus cookies melalui pengaturan browser Anda.",
        "Menonaktifkan cookies esensial dapat memengaruhi fungsi situs.",
      ] },
    ],
  },
};

function ensureLegalStyles() {
  if (document.getElementById("legal-style")) return;
  const s = document.createElement("style");
  s.id = "legal-style";
  s.textContent = `
.legal-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;
  padding:24px;background:rgba(3,7,18,.72);backdrop-filter:blur(8px);opacity:0;transition:opacity .25s ease;}
.legal-overlay.show{opacity:1;}
.legal-modal{width:min(720px,100%);max-height:86vh;display:flex;flex-direction:column;
  background:var(--bg-elevated,#0c1424);border:1px solid var(--border,rgba(255,255,255,.08));
  border-radius:20px;box-shadow:0 40px 90px -30px rgba(0,0,0,.8);overflow:hidden;
  transform:translateY(14px) scale(.98);transition:transform .25s ease;}
.legal-overlay.show .legal-modal{transform:none;}
.legal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;
  padding:26px 28px 18px;border-bottom:1px solid var(--border,rgba(255,255,255,.08));}
.legal-head h2{margin:0;font-size:23px;font-weight:700;color:var(--text-primary,#f1f5f9);letter-spacing:-.01em;}
.legal-head .upd{margin-top:6px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--text-muted,#64748b);}
.legal-close{flex:none;width:38px;height:38px;border-radius:11px;border:1px solid var(--border,rgba(255,255,255,.1));
  background:transparent;color:var(--text-tertiary,#94a3b8);cursor:pointer;font-size:18px;display:grid;place-items:center;
  transition:background .15s,color .15s;}
.legal-close:hover{background:rgba(255,255,255,.06);color:var(--text-primary,#f1f5f9);}
.legal-body{padding:22px 28px 30px;overflow-y:auto;}
.legal-intro{margin:0 0 22px;color:var(--text-secondary,#cbd5e1);font-size:14.5px;line-height:1.65;}
.legal-sec{margin-bottom:22px;}
.legal-sec h3{margin:0 0 10px;font-size:14px;font-weight:700;color:var(--brand-glow,#60a5fa);letter-spacing:.01em;}
.legal-sec ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;}
.legal-sec li{position:relative;padding-left:20px;color:var(--text-secondary,#cbd5e1);font-size:14px;line-height:1.6;}
.legal-sec li::before{content:"";position:absolute;left:2px;top:9px;width:6px;height:6px;border-radius:50%;
  background:var(--brand-glow,#60a5fa);opacity:.7;}
.legal-foot{padding:16px 28px;border-top:1px solid var(--border,rgba(255,255,255,.08));
  display:flex;justify-content:flex-end;gap:10px;background:rgba(255,255,255,.02);}
.legal-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-right:auto;}
.legal-tab{font-size:12px;padding:7px 12px;border-radius:8px;border:1px solid var(--border,rgba(255,255,255,.1));
  background:transparent;color:var(--text-tertiary,#94a3b8);cursor:pointer;}
.legal-tab.active{background:var(--brand,#3b82f6);border-color:var(--brand,#3b82f6);color:#fff;}
`;
  document.head.appendChild(s);
}

let _legalEl = null;
function closeLegal() {
  if (!_legalEl) return;
  _legalEl.classList.remove("show");
  const el = _legalEl; _legalEl = null;
  setTimeout(() => el.remove(), 240);
  document.removeEventListener("keydown", _legalEsc);
}
function _legalEsc(e) { if (e.key === "Escape") closeLegal(); }

function renderLegalBody(doc) {
  return `
    <div class="legal-intro">${doc.intro}</div>
    ${doc.sections.map(sec => `
      <div class="legal-sec">
        <h3>${sec.h}</h3>
        <ul>${sec.items.map(i => `<li>${i}</li>`).join("")}</ul>
      </div>`).join("")}
  `;
}

function openLegal(kind) {
  ensureLegalStyles();
  const order = ["terms", "privacy", "security", "cookies"];
  let active = LEGAL_DOCS[kind] ? kind : "terms";

  if (_legalEl) closeLegal();
  const overlay = document.createElement("div");
  overlay.className = "legal-overlay";
  overlay.innerHTML = `
    <div class="legal-modal" role="dialog" aria-modal="true">
      <div class="legal-head">
        <div>
          <h2 data-legal-title></h2>
          <div class="upd" data-legal-upd></div>
        </div>
        <button class="legal-close" aria-label="Tutup">✕</button>
      </div>
      <div class="legal-body" data-legal-body></div>
      <div class="legal-foot">
        <div class="legal-tabs">
          ${order.map(k => `<button class="legal-tab" data-k="${k}">${LEGAL_DOCS[k].title}</button>`).join("")}
        </div>
        <button class="btn btn-primary legal-ok" style="padding:9px 18px;font-size:13px;">Mengerti</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  _legalEl = overlay;

  const titleEl = overlay.querySelector("[data-legal-title]");
  const updEl = overlay.querySelector("[data-legal-upd]");
  const bodyEl = overlay.querySelector("[data-legal-body]");
  const paint = (k) => {
    active = k;
    const doc = LEGAL_DOCS[k];
    titleEl.textContent = doc.title;
    updEl.textContent = doc.updated;
    bodyEl.innerHTML = renderLegalBody(doc);
    bodyEl.scrollTop = 0;
    overlay.querySelectorAll(".legal-tab").forEach(b => b.classList.toggle("active", b.dataset.k === k));
  };
  paint(active);

  overlay.querySelectorAll(".legal-tab").forEach(b => b.addEventListener("click", () => paint(b.dataset.k)));
  overlay.querySelector(".legal-close").addEventListener("click", closeLegal);
  overlay.querySelector(".legal-ok").addEventListener("click", closeLegal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeLegal(); });
  document.addEventListener("keydown", _legalEsc);

  requestAnimationFrame(() => overlay.classList.add("show"));
}

window.LEGAL_DOCS = LEGAL_DOCS;
window.openLegal = openLegal;
