# Data seed & demo

```bash
bun run db:seed        # upsert data referensi, lalu buat ulang semua data demo (aman diulang)
bun run db:seed:reset  # hapus data demo saja (is_seed = true); data referensi, data asli & Desa Baros tetap
```

## Isi

- **Referensi (asli, tidak dihapus):** seluruh 91.599 wilayah Kepmendagri 2025 (provinsi sampai desa, dengan titik tengahnya) dan 6 kategori + terjemahan EN.
- **Demo (fiktif, `is_seed = true`):** 3 desa: **Desa Baros** (desa pilot asli, Kec. Arjasari, Kab. Bandung — memakai lambang resmi Pemerintah Desa Baros dan foto wisatanya; hanya UMKM/produknya yang demo) serta Mekarwangi (Kab. Garut) dan Sindangjaya (Kab. Cianjur) yang fiktif,
  16 UMKM (3 menunggu verifikasi), 42 produk (38 tayang), ±1.400 event view/klik WA 30 hari terakhir.
  Setiap produk punya deskripsi 2 sampai 4 paragraf (ID dan EN, `demo-content.ts`), minimal 2 foto, dan 3 sampai 7
  ulasan pembeli (185 ulasan; 4 masih menunggu moderasi di Desa Baros untuk demo dashboard Ulasan).
  Tiap desa punya tema berbeda: Baros teal + Barlow Condensed + sharp, Mekarwangi merah bata + Bitter + sharp,
  Sindangjaya hijau + Nunito + rounded. Sebagian besar UMKM punya jam buka; Dodol Ibu Euis sedang "tutup sementara" 3 hari.

Nama UMKM dan orang adalah fiktif (termasuk UMKM di Desa Baros). Desa Baros memakai kode desa resminya (`32.04.16.2005`). Dua desa fiktif memakai kode desa yang namanya sama (Mekarwangi, Kec. Tarogong Kaler, Garut dan Sindangjaya, Kec. Cipanas, Cianjur) agar muncul di peta; deskripsinya tetap ditandai data demo.

## Nomor WhatsApp demo

Semua UMKM demo memakai satu nomor dari `SEED_WHATSAPP_NUMBER` (format `628…`), agar klik saat demo tidak
mengirim pesan ke orang asing. **Isi dengan nomor tim HIMA sebelum seminar.** Jika kosong, dipakai `6281200000000`.

## Akun demo

Seed membuat satu akun untuk setiap peran agar dashboard bisa dicoba:

| Peran        | Cakupan                                                  |
| ------------ | -------------------------------------------------------- |
| Super admin  | Seluruh platform                                         |
| Admin desa   | Satu akun per desa demo (Baros, Mekarwangi, Sindangjaya) |
| Pendamping   | Pendamping Desa Baros dan pendamping 4 UMKM              |
| Pemilik UMKM | Pemilik satu UMKM demo                                   |

Alamat email akun-akun ini dibuat di `packages/db/src/seed/index.ts`. Kata sandinya diambil dari `SEED_DEMO_PASSWORD`
di `.env`. Bila kosong, seed memakai kata sandi bawaan yang hanya diizinkan untuk database lokal; untuk database lain
(Supabase/production) seed menolak berjalan tanpa `SEED_DEMO_PASSWORD`. Kata sandi akun demo di production tidak
pernah ditulis di repositori dan dipegang pengurus tim.

## Production

Akun demo yang sudah dipakai untuk pekerjaan nyata (misalnya mengirim undangan atau memverifikasi UMKM) tidak
dihapus saat seed ulang: seed memakainya kembali dan hanya memperbarui nama, peran, dan kata sandinya, sehingga
undangan dan log audit asli tetap utuh.

Script menolak berjalan saat `NODE_ENV=production` kecuali diberi `--allow-production`. Seed produksi hanya untuk
keperluan demo seminar, lalu dibersihkan dengan `db:seed:reset` setelah data UMKM asli masuk.

## Data wilayah resmi

```bash
bun run db:regions:import          # impor/perbarui wilayah (dilewati bila versinya sudah sama)
bun run db:regions:import --force  # tulis ulang semua baris
```

`db:seed` menjalankan impor ini otomatis, jadi biasanya tidak perlu dipanggil sendiri. Datanya berasal dari dataset
terbuka Kepmendagri 2025 (lisensi MIT, Cahya DSN) yang disimpan di `packages/db/data/regions`; sumber, versi, dan cara
memperbarui ada di `packages/db/data/regions/SOURCE.md`. Impor pertama butuh beberapa detik; data yang sudah ada tidak
pernah dihapus, wilayah yang tidak berlaku lagi hanya ditandai.
