# PLAN-cerita-umkm — Cerita singkat yang terhubung ke katalog

|         |                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------- |
| Status  | Draft. Mockup pembeli disetujui 2026-11-22; lingkup implementasi menunggu persetujuan.                                    |
| Owner   | HIMA Sistem Informasi                                                                                                     |
| Tanggal | 2026-11-22                                                                                                                |
| Terkait | [Struktur publik](PLAN-public-structure.md), [rebranding](PLAN-rebranding-v2.md), [mockup](assets/cerita-umkm-mockup.png) |

## 1. Tujuan & kondisi saat ini

Pembeli bisa mengikuti kabar terbaru dari UMKM dan langsung membuka produk terkait. Contohnya, foto proses
menganyam membuka detail besek yang sedang dibuat. Katalog sudah punya profil UMKM, produk, dan pemesanan
via WhatsApp. Cerita menambahkan jalan masuk ke fitur tersebut dari pembaruan singkat pemilik usaha.

## 2. Scope & non-goals

- Tahap UI memakai data mock untuk Beranda, Jelajah, Cerita UMKM, dan Detail Produk agar bisa ditinjau sebelum
  integrasi API. Jalankan `DESANARA_UI_PREVIEW=1 bun run --cwd apps/web dev` dan buka `/` atau `/en`.
  Data katalog contoh ada di `apps/web/src/lib/catalogue-preview.ts`. Tombol WhatsApp menampilkan contoh pesan.
- Beranda produksi menampilkan prototipe deret cerita selama alur penerbitan disiapkan.
  Penampil memuat foto dan keterangan. Harga dan tautan produk contoh tersedia di pratinjau katalog.
- Versi awal mencakup satu foto, keterangan singkat, dan pilihan menautkan satu produk dari UMKM yang sama.
- Pembeli membuka cerita dari beranda dan profil UMKM. Pemilik dan pendamping mengunggah serta menarik cerita
  dari dashboard.
- Video vertikal, reaksi, komentar, pengikut, dan daftar cerita personal masuk pembahasan fase lanjutan.

## 3. Keputusan yang diusulkan

### Pengalaman pembeli dan penjual

- Beranda menampilkan satu deret **Cerita UMKM** di bawah pencarian, sebelum produk terbaru. Kartu foto portrait
  dapat digeser mendatar. Nama UMKM tampil di atas gradasi gelap di bagian bawah foto. Titik hijau muncul
  saat masih ada cerita yang belum dilihat. Tanda centang muncul saat semua cerita akun sudah dibuka.
  Tiap UMKM tampil satu kali dalam deret, diurutkan menurut cerita terbarunya. Profil UMKM
  menampilkan cerita aktif dari usaha tersebut.
- Penampil foto menampilkan nama UMKM, desa, waktu unggah, dan keterangan. Foto diberi waktu enam detik
  setelah dimuat. Setelah status terakhir, penampil lanjut ke UMKM berikutnya lalu kembali ke Beranda saat
  deret habis. Pembeli bisa menjeda lewat tombol atau dengan menahan foto. Gestur geser dan tombol panah
  juga bisa berpindah ke status di akun berikutnya. Saat dibuka lagi, cerita dimulai dari status yang belum dilihat. Tautan
  **Lihat produk** muncul ketika produk terkait masih tayang.
- Usulan masa tampil adalah 24 jam sejak terbit. Dashboard memberi pratinjau dan menunjukkan kapan cerita
  berakhir. Pemilik bisa menarik cerita lebih awal.
- Label antarmuka tersedia dalam ID dan EN. Keterangan mengikuti bahasa yang ditulis penjual.

### Izin, data, dan media

- Tambahkan tabel `business_stories` melalui migrasi Drizzle. Simpan relasi desa dan UMKM, produk opsional,
  keterangan, kunci foto, waktu terbit dan kedaluwarsa, pembuat, serta penanda penghapusan. Data demo memakai
  `is_seed`.
- Aksi dashboard melalui `assertCan()`. Pemilik dan pendamping yang ditugaskan mengelola cerita dalam cakupannya.
  Admin desa dapat menurunkan cerita di desanya. Identitas desa dan UMKM diambil dari DB, dengan audit perubahan.
- Cerita publik harus berasal dari desa dan UMKM yang masih tayang, terverifikasi, dan punya persetujuan aktif.
  Kueri hanya mengembalikan cerita terbit, aktif, dan belum dihapus. Relasi produk diverifikasi di server.
- Foto diproses ulang di browser untuk membuang EXIF dan disimpan di bucket privat khusus cerita yang kompatibel
  dengan S3. Utamakan penyimpanan open source yang bisa di-host sendiri. Pilot menargetkan Rp0 biaya layanan
  tambahan dan dapat memakai sisa kuota gratis R2 Standard di akun HIMASIF jika mencukupi.
- API menerbitkan tautan foto berumur pendek setelah mengecek ulang visibilitas dan masa aktif cerita.
  Tetapkan batas ukuran foto, jadwal pembersihan berkas kedaluwarsa, dan pemantauan kuota sebelum rilis.

### Kontrak API yang diusulkan

- `GET /v1/stories` untuk cerita aktif, dengan filter UMKM opsional dan batas paginasi.
- `GET /v1/stories/{storySlug}/photo` untuk akses foto setelah cek visibilitas.
- Dashboard memakai `GET` dan `POST /v1/manage/businesses/{id}/stories`, `POST /v1/manage/stories/{id}/publish`,
  dan `DELETE /v1/manage/stories/{id}`. Unggahan memakai target `story_image` pada modul media.
- Validasi memakai Zod bersama, deskripsi OpenAPI, dan envelope API standar. Situs dan dashboard memakai
  `@repo/api-client`.

## 4. Yang terdampak

`apps/web` untuk deret dan penampil cerita. `apps/dashboard` untuk unggah, pratinjau, dan kelola cerita.
`apps/api` untuk publikasi, daftar aktif, media, dan audit. `packages/db`, `packages/auth`, serta
`packages/validators` untuk skema, izin, dan kontrak.

## 5. Langkah implementasi

1. Tinjau UI memakai pratinjau lokal. Setelah UI disepakati, sepakati masa tampil, alur penarikan, peran penerbit,
   serta kebijakan penyimpanan foto.
2. Tambahkan skema, aturan izin, pengelolaan foto, dan API. Uji akses lintas desa dan kedaluwarsa.
3. Bangun alur terbit di dashboard, lalu deret cerita dan penampil di situs publik.
4. Uji alur penjual dan pembeli di HP sebelum aktivasi.

## 6. Acceptance criteria

- Penjual berwenang bisa menerbitkan foto, keterangan, dan produk opsional, lalu menarik ceritanya.
- Pembeli bisa membuka dan menutup cerita, berpindah foto, serta menuju produk yang masih tayang.
- Cerita berjalan otomatis, bisa dijeda, dan lanjut ke UMKM berikutnya dalam deret yang sama.
- Cerita kedaluwarsa, ditarik, atau milik UMKM yang kehilangan status publik hilang dari pembacaan publik berikutnya.
- Jika daftar kosong, deret cerita tidak mengambil ruang di beranda atau profil UMKM.

## 7. Risiko & mitigasi

- Foto memperlambat beranda. Gunakan thumbnail terkompresi dan muat foto utama saat penampil dibuka.
- Foto berisi alamat atau data pribadi. Pratinjau memberi kesempatan mengecek gambar sebelum terbit. Tim desa
  bisa menarik cerita, dan tautan foto publik dibatasi masa berlakunya.
- Produk berhenti tayang setelah cerita terbit. Periksa status produk saat cerita dibaca dan tampilkan tautan hanya
  selama produknya publik.

## 8. Validasi & skenario test

- Uji izin pemilik, pendamping, dan admin desa, termasuk akses ditolak lintas desa dan produk milik UMKM lain.
- Uji masa aktif, cerita ditarik, pencabutan persetujuan UMKM, akses foto yang berakhir, dan pembersihan berkas yatim.
- Uji manual ID dan EN di HP kecil, keyboard, koneksi lambat, urutan fokus saat menutup penampil, dan tautan produk.
- Jalankan `bun run check:all` serta tes integrasi API di Postgres lokal.

## 9. Rollback

Hentikan aktivasi tampilan dan penerbitan cerita, lalu pastikan akses media mengikuti masa berlaku yang sudah
diberikan. Pertahankan data seperlunya untuk pemulihan dan selesaikan pembersihan sesuai kebijakan yang disetujui.

## 10. Pertanyaan terbuka & catatan persetujuan

- Persetujuan berikutnya mencakup masa tampil 24 jam, batas dan retensi foto, peran penerbit, serta jadwal rilis.
- Mockup pembeli diterima sebagai arah visual pada 2026-11-22.

## 11. Revision notes

| Tanggal    | Perubahan                                                   |
| ---------- | ----------------------------------------------------------- |
| 2026-11-22 | Draft alur, data, izin, dan API.                            |
| 2026-11-23 | Pratinjau Cerita UMKM di atas produk dengan status dilihat. |
