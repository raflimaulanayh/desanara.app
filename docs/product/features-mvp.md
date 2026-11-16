# Fitur MVP (target 11 Desember 2026)

Status: ✅ selesai · 🚧 dikerjakan · ⏳ belum. Diperbarui 16 November 2026.
Feature freeze **28 November 2026**; setelah itu hanya perbaikan bug dan uji coba (UAT) dengan admin desa.

Cara setiap peran memakai fitur ini: [alur pengguna](user-flows.md).

## Fondasi

| Fitur                                                                                         | Status |
| --------------------------------------------------------------------------------------------- | ------ |
| Monorepo, CI (format, lint, tipe, test unit + integrasi Postgres), cek CHANGELOG di setiap PR | ✅     |
| Skema database + migrasi Drizzle, seed data contoh (3 desa, 16 UMKM, 42 produk, ±1.400 event) | ✅     |
| Deploy production: 3 project Vercel (Singapura) + Supabase Postgres + Cloudflare R2           | ✅     |
| Dokumentasi API interaktif `/docs` (dikunci kata sandi di production)                         | ✅     |
| Hak akses `can()` + test, actor dibangun dari keanggotaan desa/UMKM                           | ✅     |

## Situs publik (ID/EN)

| Fitur                                                                                                               | Status                                 |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Beranda, Jelajah (pencarian, filter wilayah dan kategori, urutan)                                                   | ✅ (pencarian ILIKE; pg_trgm menyusul) |
| Halaman desa bertema (warna, logo, huruf, gaya sudut per desa)                                                      | ✅                                     |
| Halaman UMKM: cerita, status buka/tutup otomatis, toko online, produk; alamat tidak tampil                          | ✅                                     |
| Halaman produk: slider foto, harga / Gratis / harga coret + badge diskon, panel pesan (jumlah + catatan) → WhatsApp | ✅                                     |
| Halaman Tentang dan Kredit foto                                                                                     | ✅                                     |
| Gambar pratinjau link (OG image) khusus per halaman                                                                 | ⏳                                     |

## Dashboard

| Fitur                                                                                                                        | Status                        |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Login, cek sesi, menu sesuai peran (HP: menu bawah, laptop: sidebar), beranda per peran                                      | ✅                            |
| UMKM: daftar + pencarian + tab status, form 3 langkah dengan draf otomatis di HP, persetujuan UU PDP                         | ✅                            |
| UMKM: verifikasi (setujui/tolak + alasan), tayang/sembunyikan dengan checklist syarat, turunkan/pulihkan                     | ✅                            |
| Produk: daftar per UMKM, form (Rp, Gratis, harga coret, satuan, kategori, terjemahan EN), tayang                             | 🚧 API ✅, halaman dikerjakan |
| Foto: upload maks. 10 foto/produk (kompres + hapus GPS di HP), urutan + sampul, logo UMKM                                    | 🚧 API ✅, halaman dikerjakan |
| Lokasi UMKM: RT/RW, jalan/patokan, titik peta (Leaflet + OpenStreetMap); data wilayah Kemendagri lengkap + pencarian wilayah | ⏳                            |
| Pengaturan UMKM: jam buka, tutup sementara, ganti alamat link (slug) oleh admin desa                                         | ⏳                            |
| Pengaturan desa: profil, titik tengah desa, logo + banner, editor tema dengan pratinjau, anggota tim                         | ⏳ (fondasi tema ✅)          |
| Antrean verifikasi lintas UMKM untuk admin desa                                                                              | ⏳                            |
| Statistik: kunjungan dan klik WhatsApp per UMKM dan per desa                                                                 | ⏳ (pencatatan ✅)            |

## Akun dan pendaftaran

| Fitur                                                                                                                    | Status                      |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| Undangan + serah-terima akun dari pendamping ke pemilik lewat link WhatsApp                                              | ⏳                          |
| Pendaftaran UMKM mandiri: link/QR per desa dan form terbuka (Turnstile + rate limit); akun dibuat setelah disetujui desa | ⏳                          |
| Menutup pendaftaran akun terbuka Better Auth                                                                             | ⏳ (bersama modul undangan) |
| Ajukan desa baru: form + pemilih wilayah resmi, diverifikasi tim HIMA, diaktifkan super admin                            | ⏳                          |

## Legal

| Fitur                                             | Status |
| ------------------------------------------------- | ------ |
| Kebijakan privasi, syarat dan ketentuan           | ⏳     |
| Alamat UMKM tidak pernah tampil di halaman publik | ✅     |

## Setelah MVP inti

- **PWA**: dashboard bisa dipasang di layar utama HP + notifikasi (hasil verifikasi, undangan baru). Butuh rencana tersendiri.

## Di luar MVP

Template tampilan ke-2/ke-3 dan pilihan font di editor (fase 2), CSS/HTML bebas (tidak akan dibuat), keranjang,
pembayaran, chat, rating/ulasan, subdomain per desa, aplikasi mobile native, terjemahan otomatis.
Lihat [roadmap](roadmap.md).
