# KaspaSpace — Sistem Manajemen Coworking Space

Platform pemesanan dan manajemen coworking space berbasis web untuk **KaspaSpace**, berlokasi di Manahan, Solo. Sistem ini memungkinkan tamu dan anggota terdaftar untuk memesan ruang kerja, layanan F&B, dan layanan bisnis secara online, serta menyediakan panel admin lengkap untuk mengelola operasional sehari-hari.

---

## Fitur Utama

### Pelanggan (Public)
- **Booking Coworking** — Share Desk (per jam, pilih jumlah meja), Private Room (per jam), Meeting Room (per jam), Private Office (per bulan), Overtime Access (jadwal dari admin), Virtual Office (paket bulanan)
- **Cek Ketersediaan Real-time** — Matriks ruangan dengan status Tersedia / Terisi berdasarkan data booking aktif
- **Pemesanan F&B** — Menu makanan & minuman dengan pilihan varian dan diskon
- **Layanan Bisnis** — Jasa legalitas, desain, dan layanan profesional lainnya
- **Pembayaran** — QRIS, Transfer Bank, Tunai, dan Midtrans (kartu kredit/debit online)
- **Kode Diskon** — Sistem voucher dengan batas penggunaan dan periode aktif
- **PPN Otomatis** — Kalkulasi dan tampilan PPN sesuai pengaturan admin
- **Invoice & Tracking** — Halaman invoice dan pelacakan status booking
- **Ulasan** — Rating dan komentar untuk layanan yang telah diterima
- **Pemesanan Tamu** — Booking tanpa registrasi (cukup isi nama, email, nomor HP)

### Admin
- **Dashboard** — Ringkasan pendapatan, booking aktif, pesanan F&B & bisnis hari ini
- **Manajemen Ruangan & Meja** — CRUD ruang, konfigurasi tipe produk per ruangan, jadwal overtime
- **Manajemen Booking** — Ubah status (paid, checked-in, checked-out, cancelled), cetak invoice
- **Manajemen Produk** — F&B items, layanan bisnis, paket Virtual Office
- **Diskon** — Buat dan kelola kode voucher
- **Laporan** — Rekapitulasi pendapatan per periode
- **Pengaturan Situs** — PPN, informasi kontak, integrasi Midtrans, Google Reviews API
- **Konten** — Kelola artikel media dan ulasan pelanggan

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | PHP 8.3 + Laravel 13 |
| Frontend | React 19 + TypeScript + Vite 8 |
| Routing SPA | React Router DOM v7 |
| Styling | Tailwind CSS v4 (custom design system) |
| Database | SQLite (development) / MySQL (production) |
| Payment Gateway | Midtrans PHP SDK v2.6 |
| Auth | Laravel Session + cookie-based auth |
| Build Tool | Vite 8 dengan laravel-vite-plugin |

---

## Prasyarat

- PHP >= 8.3
- Composer
- Node.js >= 18 + npm
- SQLite (sudah bawaan PHP) **atau** MySQL/MariaDB untuk production
- Akun [Midtrans](https://midtrans.com) — daftar gratis, tersedia mode Sandbox untuk testing

---

## Instalasi

### 1. Clone repository

```bash
git clone https://github.com/<username>/kaspa-spacev2.git
cd kaspa-spacev2
```

### 2. Install dependensi PHP

```bash
composer install
```

> Perintah ini otomatis menginstall **Midtrans PHP SDK** karena sudah terdaftar di `composer.json` (`midtrans/midtrans-php`). Tidak perlu install terpisah.

### 3. Install dependensi Node

```bash
npm install
```

### 4. Konfigurasi environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` sesuai kebutuhan:

```env
APP_NAME="KaspaSpace"
APP_URL=http://localhost:8000

# Database — pilih salah satu:
DB_CONNECTION=sqlite
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=kaspaspace
# DB_USERNAME=root
# DB_PASSWORD=
```

> **Catatan Midtrans:** Kunci Midtrans (Server Key & Client Key) **tidak** disimpan di `.env`. Keduanya diatur lewat panel admin setelah aplikasi berjalan agar bisa diubah tanpa akses ke server (lihat Langkah 2 di bawah).

### 5. Jalankan migrasi database

```bash
php artisan migrate
```

> **Perhatian:** Jangan jalankan `migrate:fresh` di environment yang sudah ada data — perintah ini menghapus semua data secara permanen.

### 6. Build frontend

```bash
# Mode development dengan hot reload
npm run dev

# Mode production
npm run build
```

### 7. Jalankan server

```bash
php artisan serve
```

Akses aplikasi di: `http://localhost:8000`

---

## Pengaturan Awal Setelah Instalasi

### Langkah 1 — Buat akun admin

Daftar akun biasa lewat `/daftar`, lalu ubah role menjadi admin via tinker:

```bash
php artisan tinker
>>> \App\Models\User::where('email', 'admin@email.com')->update(['role' => 'admin']);
```

### Langkah 2 — Konfigurasi Midtrans

1. Daftar atau login di [dashboard.midtrans.com](https://dashboard.midtrans.com)
2. Pilih environment **Sandbox** (testing) atau **Production** (live)
3. Buka menu **Settings → Access Keys**, salin **Server Key** dan **Client Key**
4. Login ke `/admin` → **Pengaturan Situs**, isi:
   - *Midtrans Server Key* → tempel Server Key
   - *Midtrans Client Key* → tempel Client Key
   - *Mode Production* → aktifkan hanya saat sudah live
5. Daftarkan URL webhook di Midtrans Dashboard → **Settings → Configuration → Payment Notification URL**:
   ```
   https://domain-anda.com/api/midtrans/notification
   ```
   Webhook ini diperlukan agar status pembayaran terupdate otomatis setelah pelanggan membayar.

### Langkah 3 — Pengaturan situs lainnya

Di `/admin/settings`:
- Aktifkan **PPN** dan isi tarifnya jika diperlukan (misal 11%)
- Isi informasi kontak, alamat, dan nomor WhatsApp

### Langkah 4 — Tambah ruangan dan produk

- `/admin/rooms` → buat ruangan, atur tipe produk per ruangan (Share Desk, Private Room, dll), tambah meja untuk Share Desk
- `/admin/products` → tambah menu F&B, layanan bisnis, paket Virtual Office

---

## Struktur Folder Penting

```
app/
  Http/Controllers/Api/     # REST API controllers (booking, payment, availability, dll)
  Models/                   # Eloquent models
database/
  migrations/               # Skema database
resources/js/
  pages/                    # Halaman publik (React SPA)
  admin/pages/              # Halaman admin panel (React SPA)
  components/               # Komponen UI reusable
  lib/publicApi.ts          # Semua fungsi fetch ke backend API
  contexts/                 # React context (auth)
routes/
  api.php                   # Semua route REST API
  web.php                   # Entry point SPA (catch-all ke index)
```

---

## Tugas Pengembang Selanjutnya

### Pembayaran
- [ ] **Transfer / Debit Bank (Virtual Account)** — Aktifkan channel `bca_va`, `bni_va`, `bri_va`, `permata_va` di Midtrans. Di `CheckoutPage.tsx` tambahkan pilihan bank, kirim `enabled_payments` ke endpoint `/api/midtrans/snap`
- [ ] **Kartu Kredit/Debit Online** — Aktifkan `credit_card` di Midtrans, tambahkan form kartu di halaman pembayaran

### Langganan & Otomasi
- [ ] **Subscription / Recurring Billing** — Tagihan otomatis bulanan untuk Virtual Office dan Private Office. Butuh: tabel `subscriptions`, Laravel Scheduler untuk cron, dan integrasi Midtrans Recurring atau pengiriman link tagihan via email/WhatsApp
- [ ] **Notifikasi Perpanjangan** — Kirim pengingat H-7 dan H-1 sebelum masa sewa Private Office / Virtual Office habis

### Notifikasi
- [ ] **Notifikasi WhatsApp** — Integrasi Fonnte atau Wablas untuk notifikasi booking, pengingat check-in, dan konfirmasi pesanan F&B

### Fitur Produk
- [ ] **Tampilan Slot Meeting Room** — Visualisasi timeline slot jam yang tersedia (calendar view) saat user memilih jam booking Meeting Room
- [ ] **Paket Bundling** — Combo booking coworking + F&B dengan harga paket khusus
- [ ] **Loyalty Points / Member Benefit** — Sistem poin dari setiap transaksi yang bisa ditukar diskon atau akses gratis

### Admin & Operasional
- [ ] **Notifikasi Admin Real-time** — Pusher atau Server-Sent Events untuk notifikasi booking masuk tanpa perlu refresh halaman
- [ ] **Check-in via QR Code** — Generate QR code unik di invoice, scan saat tiba di lokasi untuk otomasi proses check-in
- [ ] **Multi-lokasi** — Dukungan lebih dari satu cabang coworking space dengan ruangan dan admin terpisah per lokasi

### Teknis & Kualitas
- [ ] **Unit & Feature Tests** — Belum ada test suite; prioritaskan: conflict check di `BookingController`, kalkulasi harga, dan validasi diskon
- [ ] **API Rate Limiting** — Tambahkan throttle pada endpoint booking dan availability check untuk mencegah abuse
- [ ] **Code Splitting** — Bundle JS saat ini > 500 KB; pisahkan chunk admin dari halaman publik menggunakan dynamic import
- [ ] **Optimasi Gambar** — Tambahkan lazy loading dan konversi gambar ke format WebP

---

## Catatan Penting untuk Developer

- **Migrasi** — Selalu gunakan `php artisan migrate` (bukan `migrate:fresh`) di environment yang sudah ada data
- **Timezone** — Semua kalkulasi tanggal di frontend menggunakan local date parts (bukan `toISOString()`) untuk menghindari offset UTC vs WIB (UTC+7)
- **PPN** — Dikonfigurasi di `site_settings` (`ppn_enabled`, `ppn_rate`). Jumlah PPN disimpan di localStorage saat checkout agar bisa ditampilkan di halaman sukses dan invoice
- **Metode Pembayaran** — Disimpan sebagai tag `[Pembayaran: Tunai]` di kolom `notes` booking di database
- **Conflict Check Booking** — Ada di dua tempat: `RoomController::availability` (preview real-time saat user memilih) dan `BookingController::store` (validasi final saat create). Jika salah satu diubah, pastikan keduanya tetap konsisten

---

## Lisensi

Proyek ini dikembangkan untuk keperluan internal KaspaSpace. Hak cipta © 2026 KaspaSpace.
