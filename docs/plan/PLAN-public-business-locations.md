# PLAN-public-business-locations — Titik toko di peta publik

|         |                                                                                          |
| ------- | ---------------------------------------------------------------------------------------- |
| Status  | Draft untuk sumber koordinat publik                                                      |
| Owner   | HIMA Sistem Informasi                                                                    |
| Tanggal | 2026-11-26                                                                               |
| Terkait | [Peta Jelajah](PLAN-public-structure.md), [Privasi](../architecture/security-privacy.md) |

## 1. Tujuan & kondisi saat ini

Setelah pembeli membuka satu desa, peta dapat menampilkan lokasi toko yang benar-benar boleh dibagikan.
Koordinat yang sudah tersimpan saat ini adalah data dashboard dan bisa menunjuk ke rumah pemilik usaha.
Persetujuan penerbitan profil saat ini tidak mencakup koordinat itu.

## 2. Scope & non-goals

Peta menggunakan koordinat toko yang secara khusus disediakan untuk publik. Daftar tetap memuat semua toko
yang cocok dengan filter. Alamat rinci, RT/RW, dan titik internal tetap hanya tersedia di dashboard.

## 3. Keputusan (produk, arsitektur, API)

- Usulan utama adalah medan koordinat publik yang terpisah. Pemilik memilih dan menyimpan titik toko yang
  ingin dibagikan, dengan keterangan bahwa siapa pun bisa melihatnya. Titik awal kosong untuk seluruh UMKM,
  termasuk UMKM yang sudah memiliki titik internal.
- Validasi pasangan lat/lng dilakukan di server. Menyimpan, mengubah, atau menarik titik mengikuti pemeriksaan
  izin layanan dan cakupan UMKM. Pemilik dapat menghapus titik publik tanpa menghapus titik internal.
- Pembacaan untuk peta hanya mengembalikan titik publik milik usaha yang masih tayang dan cocok dengan
  katalog. Gunakan slug UMKM sebagai kunci. Status tayang, penarikan persetujuan, dan pembatasan tenant
  mengikuti aturan visibilitas yang sudah berlaku.
- Jika sumber awalnya berupa daftar koordinat yang sudah disetujui untuk umum, catat sumber dan persetujuan
  tiap titik sebelum menghubungkannya ke katalog. Jangan menebak titik dari nama usaha atau pusat desa.

## 4. Yang terdampak

Peta `apps/web`. Alur pemilik membutuhkan dashboard, layanan API, validator, dan migrasi penyimpanan
koordinat publik yang terpisah. Akses Dashboard ke titik internal mengikuti kebijakan yang sudah berlaku.

## 5. Langkah implementasi / milestone

1. Uji tampilan pemilihan desa dan penanda dengan titik fiktif yang diberi label data contoh.
2. Konfirmasi sumber titik publik dan pihak yang boleh mempublikasikannya.
3. Sambungkan sumber yang disetujui ke peta dan validasi penarikan titik.

## 6. Acceptance criteria

- Klik kelompok UMKM menghilangkan bulatan angka. Toko yang punya koordinat publik tampil pada titik
  koordinatnya dan bisa dibuka. Tidak ada titik toko hasil penggeseran dari pusat desa.
- Bila titik publik kosong atau baru tersedia sebagian, semua toko masih dapat dibuka dari panel daftar.
- Titik internal tidak masuk ke respons publik untuk usaha lama maupun baru.

## 7. Risiko & mitigasi

Alamat toko dapat sekaligus menjadi tempat tinggal. Pakai pilihan publik yang eksplisit dan koordinat yang
terpisah. Jangan memindahkan titik internal secara otomatis.

## 8. Validasi & skenario test

Uji toko dengan titik publik, tanpa titik, titik yang ditarik, serta usaha yang tidak tayang. Verifikasi
respons publik bebas koordinat internal dan titik cocok dengan posisi pada peta.

## 9. Rollback

Putuskan sumber titik publik dari peta jika perlu. Pengunjung tetap dapat membuka daftar toko per desa.

## 10. Pertanyaan terbuka & catatan persetujuan

Pilih alur publikasi lewat dashboard oleh pemilik atau daftar titik yang sudah disetujui untuk dibagikan.

## 11. Revision notes

| Tanggal    | Perubahan                                                    |
| ---------- | ------------------------------------------------------------ |
| 2026-11-26 | Pisahkan titik toko publik dari pin internal dan pusat desa. |
