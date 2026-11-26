# PLAN-public-pwa

|         |                                                   |
| ------- | ------------------------------------------------- |
| Status  | Approved                                          |
| Owner   | Desanara                                          |
| Tanggal | 2026-11-24                                        |
| Terkait | [PLAN-public-structure](PLAN-public-structure.md) |

## 1. Tujuan & kondisi saat ini

Katalog publik bisa dipasang dan dibuka dari layar utama. Pengunjung dapat mencoba notifikasi sistem
dari perangkat tersebut meski halaman sedang di latar belakang.

## 2. Scope & non-goals

- Instalasi, tampilan standalone, gestur sentuh, dan kontrol Web Push di Pengaturan web publik.
- Pengguna dapat mengaktifkan, mematikan, dan mengirim notifikasi uji ke perangkat sendiri.
- Pengiriman kampanye, pemicu notifikasi produk, penyimpanan langganan di server, dan katalog offline
  berada di luar tahap ini. Alur notifikasi peristiwa produk dibahas saat sumber peristiwanya ditentukan.

## 3. Keputusan

- Manifest Indonesia dan Inggris memakai satu identitas aplikasi. URL awal mengikuti bahasa manifest.
- Gestur cubit halaman dibatasi di mode terpasang. Peta tetap menerima gestur cubit. Pengaturan
  pembesaran sistem dan zoom di tab peramban tetap tersedia.
- Service worker menerima Web Push dan membuka tautan dalam bahasa pesan. Izin diminta melalui
  tombol di Pengaturan ketika pengguna membuka aplikasi terpasang.
- Server web menandatangani notifikasi uji standar dengan VAPID. Langganan hanya berada di perangkat
  dan diteruskan ke server saat tes. Tujuan pengiriman dibatasi ke layanan push browser yang didukung.
  Fitur ini tidak memakai data tenant, skema baru, atau layanan notifikasi berbayar.

## 4. Yang terdampak

`apps/web`, validasi input perangkat di `packages/validators`, konfigurasi VAPID untuk web, dan panduan deploy.

## 5. Langkah implementasi

1. Tambahkan manifest dan ikon, pendaftaran service worker, dan pengaturan gestur.
2. Tambahkan instalasi dan kontrol notifikasi dalam dua bahasa.
3. Verifikasi pengiriman terenkripsi, penanganan izin, dan tautan notifikasi.

## 6. Acceptance criteria

- Aplikasi bisa dipasang dan dibuka dalam mode standalone dengan logo Desanara.
- Scroll vertikal katalog dan horizontal cerita tetap berfungsi. Gestur cubit di peta hanya mengubah skala peta.
- Perangkat terpasang dapat menerima notifikasi uji pada izin aktif dan membuka Pengaturan saat diketuk.

## 7. Risiko & mitigasi

- Browser yang tidak menyediakan dialog instalasi diberi petunjuk dari menu browser.
- Permintaan tes dibatasi untuk provider resmi dan satu pesan tetap, dengan jeda antarpermintaan.
- Lingkungan tanpa VAPID tetap dapat memasang aplikasi dan menjelaskan status notifikasi di Pengaturan.

## 8. Validasi & skenario test

Uji validasi payload dan kegagalan layanan push secara otomatis. Uji instalasi dari Chrome Android dan
Safari iOS 16.4+, izin ditolak/diizinkan, tes dengan aplikasi di latar belakang, dan tautan Indonesia/Inggris.

## 9. Rollback

Kosongkan konfigurasi VAPID untuk menghentikan pengiriman tes. Untuk menghapus PWA setelah rilis, kirim
service worker pengganti yang membatalkan pendaftaran sebelum menghapus URL worker.

## 10. Catatan persetujuan

Implementasi dimajukan atas permintaan pemilik proyek pada 2026-11-24.

## 11. Revision notes

| Tanggal    | Perubahan                                       |
| ---------- | ----------------------------------------------- |
| 2026-11-24 | Rencana instalasi dan notifikasi uji disetujui. |
