# PLAN-ui-states — Kondisi data di UI Desanara

|         |                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------- |
| Status  | Implementasi dan validasi lokal selesai untuk situs publik dan dashboard.                             |
| Owner   | HIMA Sistem Informasi                                                                                 |
| Tanggal | 2026-11-26                                                                                            |
| Terkait | [Pola visual](../../DESIGN.md), [redesain publik](PLAN-public-redesign.md), [PWA](PLAN-public-pwa.md) |

## 1. Tujuan & kondisi saat ini

Pembeli dan pengelola perlu tahu saat layar sedang memuat, daftar memang kosong, atau layanan sedang bermasalah.

- Beranda, profil desa, dan profil UMKM mengambil sebagian daftar publik lewat fallback yang bisa menyamarkan
  kegagalan API sebagai daftar kosong. Jelajah memakai pembacaan yang membedakan keduanya.
- Detail publik sudah punya halaman untuk data yang tidak ditemukan. Saran pencarian punya pesan loading dan
  kosong, tetapi kegagalan permintaan saran masih ditampilkan sebagai hasil kosong.
- Dashboard sudah menangani loading dan error pada beberapa daftar serta detail. Daftar UMKM memakai komponen
  bersama untuk kondisi kosong, sedangkan daftar desa dan panel produk memakai pesan tersendiri.

## 2. Scope & non-goals

- Situs publik: Beranda, daftar dan peta Jelajah, profil desa dan UMKM, detail produk, serta saran pencarian.
- Dashboard: beranda, daftar dan detail desa, UMKM dan produk, serta form atau panel yang memuat data.
- Cakupan meliputi loading awal, hasil kosong, hasil filter kosong, gagal muat, data yang tidak ditemukan, akses
  terbatas, dan status koneksi pada alur yang menyediakan pemulihan. Form mempertahankan isian saat simpan gagal.
- Rilis ini berfokus pada UI dan pembacaan data. PWA menampilkan pesan offline saat navigasi gagal setelah
  service worker aktif. Kontrak API, skema, aturan izin, dan penyimpanan katalog offline mengikuti rencana masing-masing.

## 3. Keputusan (produk, arsitektur, API)

| Kondisi                              | Tampilan                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Memuat pertama kali                  | Skeleton mengikuti bentuk konten dan menyertakan label status untuk pembaca layar.           |
| Memuat ulang atau halaman berikutnya | Data yang sudah tampil tetap terlihat, dengan indikator pada bagian yang berubah.            |
| Daftar kosong                        | Tampilkan alasan dan aksi sesuai konteks, seperti Tambah produk jika pengguna punya izin.    |
| Pencarian kosong                     | Pertahankan input dan filter. Beri aksi untuk menghapus filter atau kembali ke daftar.       |
| Gagal memuat                         | Pesan singkat dan Coba lagi. Aktifkan pemulihan pada bagian terkecil yang bisa dicoba ulang. |
| Tidak ditemukan atau akses ditolak   | Jelaskan keadaan dan berikan jalan kembali yang sesuai dengan izin pengguna.                 |
| Gangguan sebagian                    | Pertahankan bagian yang berhasil dimuat dan beri status pada bagian yang bermasalah.         |

Gunakan HeroUI v3 untuk tombol dan skeleton, serta token Desanara untuk jarak, sudut, dan warna. Situs publik
dan dashboard memakai komponen status yang sama dan aset maskot yang berasal dari `packages/ui`.
Salinan publik tersedia dalam bahasa Indonesia dan Inggris. Dashboard memakai bahasa aplikasinya.
Pakai `EmptyState` yang sudah tersedia sebagai dasar komponen bersama jika pola Jelajah cocok untuk kedua aplikasi.

## 4. Yang terdampak

`apps/web`, `apps/dashboard`, `packages/ui`, dan dokumentasi desain. Perubahan pemetaan status berada di sisi UI.

## 5. Langkah implementasi / milestone

1. Jadikan daftar dan peta Jelajah sebagai contoh. Uji respons kosong, tertunda, dan gagal.
2. Terapkan pola yang disetujui ke halaman publik lain dan saran pencarian.
3. Terapkan pola pada dashboard. Periksa data cache, muat ulang, izin, kegagalan paginasi, dan pemulihan form.
4. Audit rute terdampak pada layar HP dan desktop, dalam bahasa yang tersedia di tiap aplikasi.

## 6. Acceptance criteria

- Respons kosong yang sukses punya tampilan berbeda dari kegagalan jaringan atau server.
- Pencarian dan filter tetap bisa ditinjau dan dipakai ulang. Aksi pemulihan bekerja tanpa mengubah bahasa.
- Daftar yang kosong memberi langkah berikutnya sesuai konteks. Peta tetap punya jalan ke daftar.
- Skeleton hanya tampil saat memuat, menghormati preferensi pengurangan gerak, dan tidak menyerupai data aktif.
- Skeleton memakai susunan, rasio foto, ukuran baris, dan breakpoint yang sama dengan konten asli. Bagian yang
  sudah siap tetap berada di tempatnya saat bagian yang tertunda dimuat.
- Pemulihan error mempertahankan data dan isian yang masih bisa digunakan.

## 7. Risiko & mitigasi

- Hasil gagal yang tersimpan sebagai hasil kosong menyesatkan pengguna. Pertahankan perbedaan status di lapisan data.
- State umum bisa kehilangan konteks. Gunakan komponen yang menerima judul, penjelasan, dan aksi sesuai modul.
- Rute dinamis dan cache dapat menyembunyikan kondisi lambat. Uji dengan respons API terkontrol.

## 8. Validasi & skenario test

- Uji API dengan respons sukses berisi data, sukses kosong, respons lambat, dan kegagalan. Uji pemulihan setelah error.
- Cek Jelajah daftar dan peta pada 320 px serta desktop dalam kedua bahasa. Uji keyboard dan status pembaca layar.
- Jalankan `bun run check:all`. Uji alur refresh, paginasi, akses, dan simpan dashboard saat modul tersebut dikerjakan.
- Validasi lokal mencakup pemulihan setelah 503, data publik yang hanya berhasil dimuat sebagian, daftar dashboard
  yang tetap terlihat saat halaman berikutnya gagal, fallback runtime, 404, akses ditolak, dan navigasi PWA saat
  origin benar-benar tidak merespons. Periksa ukuran ilustrasi, judul, dan tombol antaraplikasi di layar 360 px.

## 9. Rollback

Kembalikan perubahan route dan komponen per tahap melalui Git. Tidak ada migrasi data.

## 10. Pertanyaan terbuka & catatan persetujuan

Pengguna menyetujui perluasan kondisi UI lintas aplikasi setelah meninjau Jelajah dan tiga pose Nara.

## 11. Revision notes

| Tanggal    | Perubahan                                                                     |
| ---------- | ----------------------------------------------------------------------------- |
| 2026-11-26 | Audit awal dan rencana penerapan lintas modul.                                |
| 2026-11-26 | Penerapan dan validasi di situs publik dan dashboard dengan komponen bersama. |
