# Data seed & demo

```bash
bun run db:seed        # upsert data referensi, lalu buat ulang semua data demo (aman diulang)
bun run db:seed:reset  # hapus data demo saja (is_seed = true); data referensi, data asli & Desa Baros tetap
```

## Isi

- **Referensi (asli, tidak dihapus):** Provinsi Jawa Barat + 27 kabupaten/kota (kode Kemendagri), 6 kategori + terjemahan EN.
- **Demo (fiktif, `is_seed = true`):** 3 desa: **Desa Baros** (desa pilot asli, Kec. Arjasari, Kab. Bandung — memakai lambang resmi Pemerintah Desa Baros dan foto wisatanya; hanya UMKM/produknya yang demo) serta Mekarwangi (Kab. Garut) dan Sindangjaya (Kab. Sumedang) yang fiktif,
  16 UMKM (3 menunggu verifikasi), 42 produk (38 tayang), ±1.400 event view/klik WA 30 hari terakhir.
  Tiap desa punya tema berbeda: Baros teal + Barlow Condensed + sharp, Mekarwangi merah bata + Bitter + sharp,
  Sindangjaya hijau + Nunito + rounded. Sebagian besar UMKM punya jam buka; Dodol Ibu Euis sedang "tutup sementara" 3 hari.

Nama UMKM dan orang adalah fiktif (termasuk UMKM di Desa Baros). Kecamatan/desa belum diisi kode resmi, jadi desa demo menunjuk kode kabupaten.

## Nomor WhatsApp demo

Semua UMKM demo memakai satu nomor dari `SEED_WHATSAPP_NUMBER` (format `628…`), agar klik saat demo tidak
mengirim pesan ke orang asing. **Isi dengan nomor tim HIMA sebelum seminar.** Jika kosong, dipakai `6281200000000`.

## Akun demo

Kata sandi semua akun di database **lokal**: `demo12345`. Database lain (Supabase/production) wajib memakai
`SEED_DEMO_PASSWORD` dari `.env`; seed menolak berjalan tanpa itu, supaya tidak ada yang bisa masuk sebagai super admin
dengan kata sandi yang tertulis di repo. Kata sandi production dipegang pengurus tim.

| Email                                       | Peran                                     |
| ------------------------------------------- | ----------------------------------------- |
| `superadmin@demo.desanara.test`             | Super admin                               |
| `admin.baros@demo.desanara.test`            | Admin Desa Baros                          |
| `admin.mekarwangi@demo.desanara.test`       | Admin Desa Mekarwangi                     |
| `admin.sindangjaya@demo.desanara.test`      | Admin Desa Sindangjaya                    |
| `pendamping.baros@demo.desanara.test`       | Pendamping desa Baros + pendamping 4 UMKM |
| `pemilik.keripik-bu-ani@demo.desanara.test` | Pemilik UMKM Keripik Bu Ani               |

## Production

Script menolak berjalan saat `NODE_ENV=production` kecuali diberi `--allow-production`. Seed produksi hanya untuk
keperluan demo seminar, lalu dibersihkan dengan `db:seed:reset` setelah data UMKM asli masuk.

## Impor data wilayah resmi (belum)

Kecamatan dan desa harus diimpor dari dataset resmi Kepmendagri, bukan diketik manual. Tambahkan script impor CSV
di `packages/db/src/seed/` ketika dataset sudah dipilih, dan catat sumber serta tanggalnya di sini.
