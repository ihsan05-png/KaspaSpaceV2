/**
 * Konfigurasi kontak — ubah nomor WA di sini, berlaku di seluruh website.
 * Format: kode negara + nomor tanpa tanda '+' dan tanpa spasi/tanda hubung.
 * Contoh Indonesia: '6281234567890'
 */
export const WA_NUMBER = '6281234567890';

export const waLink = (msg = '') =>
  `https://wa.me/${WA_NUMBER}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
