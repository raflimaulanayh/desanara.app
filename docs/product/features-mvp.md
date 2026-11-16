# Fitur MVP (target 11 Desember 2026)

Status per 16 November 2026: **Selesai**, **Dikerjakan**, atau **Direncanakan**.
Feature freeze **28 November 2026**; setelah itu hanya perbaikan bug dan uji coba (UAT) dengan admin desa.

Cara setiap peran memakai fitur ini: [alur pengguna](user-flows.md).

## Fondasi

| Fitur                                                                                         | Status  |
| --------------------------------------------------------------------------------------------- | ------- |
| Monorepo, CI (format, lint, tipe, test unit + integrasi Postgres), cek CHANGELOG di setiap PR | Selesai |
| Skema database + migrasi Drizzle, seed data contoh (3 desa, 16 UMKM, 42 produk, ±1.400 event) | Selesai |
| Deploy production: 3 project Vercel (Singapura) + Supabase Postgres + Cloudflare R2           | Selesai |
| Dokumentasi API interaktif `/docs` (dikunci kata sandi di production)                         | Selesai |
| Hak akses `can()` + test, actor dibangun dari keanggotaan desa/UMKM                           | Selesai |

## Situs publik (ID/EN)

| Fitur                                                                                                                  | Status                                      |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Beranda, Jelajah (pencarian, filter wilayah dan kategori, urutan)                                                      | Selesai (pencarian ILIKE; pg_trgm menyusul) |
| Halaman desa bertema (warna, logo, huruf, gaya sudut per desa)                                                         | Selesai                                     |
| Halaman UMKM: cerita, status buka/tutup otomatis, toko online, produk; alamat tidak tampil                             | Selesai                                     |
| Halaman produk: slider foto, harga / Gratis / harga coret + badge diskon, panel pesan (jumlah dan catatan) ke WhatsApp | Selesai                                     |
| Halaman Tentang dan Kredit foto                                                                                        | Selesai                                     |
| Gambar pratinjau link (OG image) khusus per halaman                                                                    | Direncanakan                                |

## Dashboard

| Fitur                                                                                                                                   | Status                              |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Login, cek sesi, menu sesuai peran (HP: menu bawah, laptop: sidebar), beranda per peran                                                 | Selesai                             |
| UMKM: daftar + pencarian + tab status, form 4 langkah dengan draf otomatis di HP, persetujuan UU PDP                                    | Selesai                             |
| UMKM: verifikasi (setujui/tolak + alasan), tayang/sembunyikan dengan checklist syarat, turunkan/pulihkan                                | Selesai                             |
| Produk: daftar per UMKM, form (Rp, Gratis, harga coret, kategori, stok kosong, terjemahan EN), tayang; ukuran ditulis di nama           | Selesai                             |
| Foto: upload maks. 10 foto/produk (kompres + hapus GPS di HP), urutan + sampul, logo UMKM                                               | Selesai                             |
| Lokasi UMKM: RT/RW, jalan/patokan, titik peta (Leaflet + OpenStreetMap) dengan GPS; data wilayah Kemendagri lengkap + pencarian wilayah | Selesai                             |
| Pengaturan UMKM: jam buka, tutup sementara, ganti alamat link (slug) oleh admin desa                                                    | Direncanakan                        |
| Pengaturan desa: profil dan kontak kantor desa, titik desa di peta                                                                      | Selesai                             |
| Pengaturan desa: logo + banner, editor tema dengan pratinjau, anggota tim                                                               | Direncanakan (fondasi tema selesai) |
| Antrean verifikasi lintas UMKM untuk admin desa                                                                                         | Direncanakan                        |
| Statistik: kunjungan dan klik WhatsApp per UMKM dan per desa                                                                            | Direncanakan (pencatatan selesai)   |

## Akun dan pendaftaran

| Fitur                                                                                                                    | Status                                |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Undangan + serah-terima akun dari pendamping ke pemilik lewat link WhatsApp                                              | Direncanakan                          |
| Pendaftaran UMKM mandiri: link/QR per desa dan form terbuka (Turnstile + rate limit); akun dibuat setelah disetujui desa | Direncanakan                          |
| Menutup pendaftaran akun terbuka Better Auth                                                                             | Direncanakan (bersama modul undangan) |
| Ajukan desa baru: form + pemilih wilayah resmi, diverifikasi tim HIMA, diaktifkan super admin                            | Direncanakan                          |

## Legal

| Fitur                                             | Status       |
| ------------------------------------------------- | ------------ |
| Kebijakan privasi, syarat dan ketentuan           | Direncanakan |
| Alamat UMKM tidak pernah tampil di halaman publik | Selesai      |

## Setelah MVP inti

- **PWA**: dashboard bisa dipasang di layar utama HP + notifikasi (hasil verifikasi, undangan baru). Butuh rencana tersendiri.

## Di luar MVP

Template tampilan ke-2/ke-3 dan pilihan font di editor (fase 2), CSS/HTML bebas (tidak akan dibuat), keranjang,
pembayaran, chat, rating/ulasan, subdomain per desa, aplikasi mobile native, terjemahan otomatis.
Lihat [roadmap](roadmap.md).
