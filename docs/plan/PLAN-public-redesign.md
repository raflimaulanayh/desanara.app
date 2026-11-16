# PLAN-public-redesign — Redesign halaman publik + URL berbahasa Indonesia

|         |                                                                                                                                                                 |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status  | Approved (2026-11-03) — dalam pengerjaan                                                                                                                        |
| Owner   | HIMA Sistem Informasi                                                                                                                                           |
| Tanggal | 2026-11-03                                                                                                                                                      |
| Terkait | [ADR 0008](../adr/0008-indonesian-url-segments.md) (menggantikan ADR 0006), [ADR 0007](../adr/0007-village-theming.md), [PLAN-mvp-seminar](PLAN-mvp-seminar.md) |

## 1. Tujuan & kondisi saat ini

Halaman publik sekarang memakai konsep visual "Buku Nota & Stempel" (kertas nota, stempel, kop, huruf condensed).
Hasilnya terasa seperti formulir/kuitansi, bukan toko, dan tidak familiar bagi pembeli oleh-oleh.
Tujuan: tampilan **ramah seperti e-commerce pada umumnya**, dengan **desa sebagai pembeda** yang selalu terlihat.

Arah yang dipilih: **campuran marketplace bersih (A) + desa sebagai destinasi (B)**.

## 2. Scope & non-goals

**Scope**

- Visual baru untuk seluruh `apps/web`: beranda, jelajah, desa, UMKM, produk, tentang, 404, header, footer.
- URL publik berbahasa Indonesia tanpa awalan `/id` (lihat §3.2).
- Label/banner "data demo" dihapus dari tampilan publik.
- Foto contoh untuk produk, UMKM, dan desa di data seed agar katalog tidak kosong.
- `DESIGN.md`, `.impeccable/design.json`, `PRODUCT.md`, docs arsitektur, dan skill `new-page` diperbarui.

**Non-goals**

- Dashboard (tetap seperti sekarang, dikerjakan di plan CRUD).
- Keranjang, payment, rating, chat (tetap di luar MVP).
- Perubahan path API (`/v1/villages`, `/v1/products` tetap Inggris; itu kontrak kode, bukan URL publik).
- Deploy API ke Vercel (dibahas terpisah).

## 3. Keputusan

### 3.1 Arah visual

| Halaman      | Pola                                                                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Beranda      | Pencarian besar di atas, chip kategori, kartu "Desa unggulan" (foto sampul + logo), grid produk terbaru                                                                    |
| Jelajah      | Pola marketplace: pencarian + filter (kategori, kabupaten, desa) + urutkan, grid 2 kolom di HP / 4–5 di desktop                                                            |
| Kartu produk | Foto 1:1, nama (2 baris), harga tebal, baris kecil dengan ikon pin lokasi "Desa Baros, Arjasari", status buka/tutup bila ada                                               |
| Desa         | Gaya destinasi: foto sampul lebar, logo desa, nama + wilayah, cerita singkat, angka (jumlah UMKM, produk), badge "UMKM diverifikasi desa", lalu tab/daftar UMKM dan produk |
| UMKM         | Header toko: foto/logo, nama, desa, status buka, jam buka, tombol WhatsApp, lalu grid produk                                                                               |
| Produk       | Galeri foto, harga, satuan, deskripsi, tombol **Pesan via WhatsApp** menempel di bawah layar HP, kartu "Dari Desa …" dan "Dijual oleh …"                                   |

- Brand platform: logo Sudut Desa tetap; palet diganti menjadi lebih hangat dan netral (putih, abu hangat, satu warna brand),
  huruf sans yang ramah dan mudah dibaca di HP murah. Detail token ditulis ulang di `DESIGN.md`.
- Komponen nota/stempel (`nota/`, `stamp`, `kop`, `order-slip`, `seal`, `product-plate`, `product-rows`, `demo-notice`) dihapus
  atau diganti komponen baru (`product-card`, `product-grid`, `village-card`, `village-hero`, `business-header`, `wa-button`, `filter-bar`).
- Tema per desa (ADR 0007) tetap: accent, font, dan radius desa berlaku di halaman desa, UMKM, dan produk desa itu.
- Kredit HIMASIF + SATU University tetap di footer dan halaman tentang (logo resmi, tidak digambar ulang).

### 3.2 URL publik berbahasa Indonesia (ADR 0008)

| Halaman | Lama                        | Baru (ID)            | Baru (EN)               |
| ------- | --------------------------- | -------------------- | ----------------------- |
| Beranda | `/id`                       | `/`                  | `/en`                   |
| Jelajah | `/id/explore`               | `/jelajah`           | `/en/jelajah`           |
| Desa    | `/id/villages/baros`        | `/desa/baros`        | `/en/desa/baros`        |
| UMKM    | `/id/villages/baros/<umkm>` | `/desa/baros/<umkm>` | `/en/desa/baros/<umkm>` |
| Produk  | `/id/products/<produk>`     | `/produk/<produk>`   | `/en/produk/<produk>`   |
| Tentang | `/id/about`                 | `/tentang`           | `/en/tentang`           |

- next-intl `localePrefix: 'as-needed'`, default `id`. Folder route: `app/[locale]/{jelajah,desa/[village]/[business],produk/[product],tentang}` (nama param tetap Inggris).
- Redirect permanen (308) dari URL lama (`/id/...`, `/villages/...`, `/products/...`, `/explore`, `/about`) ke URL baru di `proxy.ts`,
  agar link yang sudah dibagikan tidak mati.
- `hreflang` + canonical diperbarui; sitemap memakai URL baru.

### 3.3 Data contoh tampil seperti data asli

- Tidak ada lagi label/banner "demo" di halaman publik.
- Kolom `is_seed` **tetap** di database (aturan 10 AGENTS.md tidak berubah) agar data contoh bisa dihapus bersih.
- Nomor WhatsApp data contoh tetap memakai `SEED_WHATSAPP_NUMBER` (nomor tim), jadi chat tidak nyasar ke orang lain.
- **Wajib sebelum situs dibuka untuk umum:** `bun run db:seed:reset` lalu isi data UMKM asli. Dimasukkan ke checklist rilis.
- `PRODUCT.md` prinsip "Honest by default" diubah: data contoh tidak dilabeli di UI, tapi tidak boleh ada di production publik.

### 3.4 Foto contoh

- Foto produk/UMKM/desa diambil dari sumber berlisensi bebas (Unsplash/Pexels license), disimpan di
  `apps/web/public/media/seed/...` dalam WebP terkompresi (≤ 80 KB per foto), dengan file `.json` sumber + lisensi di sebelahnya.
- Seed mengisi `product_images` / `logoKey` / `bannerKey` dengan key tersebut. Tidak ada perubahan skema.
- Produk tanpa foto tetap tampil rapi (placeholder berwarna aksen + ikon kategori), karena data asli nanti sering belum punya foto.

## 4. Yang terdampak

- `apps/web`: semua route publik dipindah, komponen visual diganti, `i18n/routing.ts`, `proxy.ts`, pesan ID/EN.
- `packages/ui`: token `theme.css` platform diganti; atribut tema desa tetap.
- `packages/db`: seed (foto, tanpa perubahan skema).
- Docs: `DESIGN.md`, `.impeccable/design.json`, `PRODUCT.md`, `AGENTS.md` (contoh URL), `docs/architecture/{i18n,structure,village-theming,multi-tenancy,storage}.md`,
  `.agents/skills/new-page/SKILL.md`, ADR 0006 → Superseded, ADR 0008 baru, `docs/CHANGELOG.md`.
- API, auth, skema DB, dashboard: tidak terdampak.

## 5. Langkah implementasi

- [x] 1. ADR 0008 + update docs URL (dikerjakan bersama plan ini)
- [x] 2. Routing: pindah folder route, `localePrefix: 'as-needed'`, redirect URL lama, sitemap/hreflang
- [x] 3. Token & komponen dasar baru (`DESIGN.md` baru), hapus komponen nota/stempel
- [x] 4. Halaman: beranda → jelajah → produk → UMKM → desa → tentang/404
- [x] 5. ~~Foto contoh + seed~~ diganti: produk tanpa foto memakai ubin kategori berwarna desa (tanpa aset foto; foto asli menyusul saat data UMKM masuk)
- [x] 6. Hapus label demo, update `PRODUCT.md`, tambah langkah `db:seed:reset` di checklist rilis
- [~] 7. Uji visual 360 px / 390 px / desktop, Lighthouse mobile, `check:all`
- [ ] 8. Commit per langkah (conventional commits), CHANGELOG di tiap commit

## 6. Acceptance criteria

- Pembeli baru langsung paham ini toko: dari beranda bisa cari produk, buka produk, dan menekan "Pesan via WhatsApp" dalam ≤ 3 ketukan.
- Setiap kartu produk dan halaman produk menunjukkan asal desa; halaman desa terasa seperti profil tempat, bukan sekadar daftar.
- `/desa/baros`, `/produk/<slug>`, `/jelajah`, `/tentang`, `/en/...` berfungsi; URL lama redirect 308 ke URL baru.
- Tidak ada teks "demo" di halaman publik; `is_seed` tetap ada di database.
- Tema desa (accent/font/radius) tetap berlaku di halaman desa, UMKM, dan produk.
- Rapi di lebar 360 px, Lighthouse mobile ≥ 80, `bun run check:all` hijau, detector impeccable bersih.

## 7. Risiko & mitigasi

- **Data contoh di desa asli dikira UMKM asli** → nomor WA tim, `db:seed:reset` wajib sebelum publik (checklist rilis).
- **Foto contoh tidak cocok dengan produk desa** → pilih foto generik per kategori (keripik, kopi, anyaman, …), ganti foto asli saat data masuk.
- **Link lama mati** → redirect 308 + test.
- **Halaman berat di HP murah** → foto WebP kecil, `next/image` dengan `sizes`, tanpa animasi berat.
- **Waktu** (freeze 28 Nov) → selesaikan sebelum ±10 Nov agar CRUD dashboard tetap sempat.

## 8. Validasi & skenario test

- Unit test: helper URL (`hrefs`) dan redirect URL lama.
- `bun run check:all`.
- Manual: screenshot HP (390 px) + desktop untuk semua halaman, cek tema 3 desa, cek klik WA, cek `/en`, cek redirect URL lama.
- Uji di Android murah lewat jaringan lambat sebelum UAT.

## 9. Rollback

Semua perubahan ada di `apps/web`, docs, dan seed. Rollback = revert commit branch ini. Tidak ada migrasi database.

## 10. Pertanyaan terbuka & catatan persetujuan

- Disetujui arah A + B, hapus label demo, URL Indonesia tanpa `/id` (diskusi 2026-11-03).
- Terbuka: deploy API ke Vercel vs VPS kampus (plan/ADR terpisah).

## 11. Revision notes

| Tanggal    | Perubahan                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-03 | Draft awal                                                                                                                                                        |
| 2026-11-03 | Disetujui. Foto contoh dibatalkan (diganti ubin kategori). Langkah 1–6 selesai, uji visual HP/desktop dilakukan sekali; Lighthouse dan uji Android murah menyusul |
