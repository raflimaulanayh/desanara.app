# Fitur MVP (target 11 Desember 2026)

Status: ✅ selesai · 🚧 dikerjakan · ⏳ belum

| Area    | Fitur                                                                                                  | Status                                         |
| ------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Fondasi | Monorepo, CI, dokumentasi, skema DB, seed demo                                                         | ✅                                             |
| Auth    | Login email + kata sandi (Better Auth), sesi lintas subdomain                                          | ✅ (login), ⏳ (undangan)                      |
| RBAC    | `can()` + test; actor dari membership                                                                  | ✅                                             |
| Desa    | Daftar & detail desa publik                                                                            | ✅ API + halaman desa bertema                  |
| Desa    | Kelola desa (super admin), kelola anggota (admin desa)                                                 | ⏳                                             |
| Desa    | Tampilan custom: brand kit (logo, banner, warna + cek kontras), 1 template `classic`, editor + preview | ✅ fondasi, ⏳ UI                              |
| UMKM    | Buat/ubah UMKM (admin desa, pendamping), verifikasi sekali oleh admin desa, consent UU PDP             | ✅ API + halaman dashboard                     |
| UMKM    | Undangan & serah-terima akun ke pemilik lewat link WA                                                  | ⏳                                             |
| Produk  | CRUD produk, harga Rp (gratis & harga coret/diskon), satuan, kategori wajib, terjemahan EN opsional    | ✅ API + tampilan publik, ⏳ halaman dashboard |
| Produk  | Upload foto ke R2 (presigned, kompres di HP), maks. 10 foto + slider; logo UMKM, logo & banner desa    | ✅ API + slider publik, ⏳ halaman dashboard   |
| Publik  | Landing bilingual, jelajah + filter wilayah/kategori + pencarian                                       | ✅ (pencarian ILIKE; pg_trgm menyusul)         |
| Publik  | Halaman UMKM & produk, pesan via WhatsApp, status buka/tutup                                           | ✅ (OG image khusus menyusul)                  |
| Dampak  | Pencatatan view & klik WA, halaman statistik                                                           | ✅ pencatatan, ⏳ halaman statistik            |
| Legal   | Kebijakan privasi, syarat & ketentuan                                                                  | ⏳                                             |

## Di luar MVP

Template tampilan ke-2/ke-3 dan pilihan font di editor (fase 2), CSS/HTML bebas (tidak akan dibuat), keranjang, pembayaran, chat, rating/ulasan, notifikasi, subdomain per desa, app mobile, terjemahan otomatis.
