# PLAN-rebranding — Sudut Desa menjadi Desanara

|         |                                                                                       |
| ------- | ------------------------------------------------------------------------------------- |
| Status  | Approved (2026-11-15) — fase 1 selesai, fase 2 perlu diskusi                          |
| Owner   | HIMA Sistem Informasi                                                                 |
| Tanggal | 2026-11-15                                                                            |
| Terkait | `docs/brand/README.md`, `DESIGN.md`, PLAN-familiar-interface.md, ADR 0007 (tema desa) |

## 1. Tujuan & kondisi saat ini

Tim memilih nama dan identitas baru: **Desanara**, tagline **"Ragam Karya, Cerita Nusantara."** (desa + nusantara).
Brand guideline berisi logo horizontal dan vertikal, ikon aplikasi "d", dan palet warna. Saat ini nama Sudut Desa,
warna ungu `#5b21b6`, dan tanda siku masih ada di kode, aset, dan dokumen.

Tujuan fase 1: semua jejak Sudut Desa yang terlihat diganti Desanara, dengan logo vektor dan palet baru, tanpa mengubah
tata letak, URL, API, atau skema database.

## 2. Scope & non-goals

**Fase 1 (dikerjakan sekarang)**

- Nama, tagline, logo, favicon, ikon aplikasi, gambar share (OG), dan warna platform.
- Logo **SVG vektor murni** (tanpa gambar tertempel), dipecah per huruf dan per elemen agar bisa dianimasikan.
- Teks UI, seed demo, dan dokumen yang menyebut nama brand.

**Fase 2 (perlu diskusi dulu, belum dikerjakan)**

- Tata letak dan UI/UX dari mockup brand guideline (hero banner, ikon kategori, detail produk, profil desa, onboarding),
  digabung dengan PLAN-familiar-interface.md.
- Yang perlu dibahas: rating, "terjual", dan ikon keranjang di mockup bertentangan dengan MVP (pesan via WhatsApp,
  tanpa ulasan); layar onboarding/login hanya relevan untuk aplikasi HP.

**Non-goals**: URL, API, skema DB, tema per desa (ADR 0007), dokumen sejarah (plan lama, entri CHANGELOG lama).

## 3. Keputusan

### 3.1 Palet

| Token     | Hex       | Pemakaian di UI                                                   |
| --------- | --------- | ----------------------------------------------------------------- |
| Primer    | `#0F5A37` | `--accent`: tombol, tautan, logo. Kontras teks putih ±8:1         |
| Sekunder  | `#5E8F3E` | Dekoratif (ilustrasi, chip); bukan untuk teks kecil di atas putih |
| Aksen     | `#E3A84F` | Sorotan/badge, hanya dengan teks gelap                            |
| Pelengkap | `#C2612C` | Penekanan hemat (mis. label "baru"); cek kontras tiap pemakaian   |
| Netral    | `#F9F4E7` | `--wash`: latar bagian halaman dan ubin; kartu tetap putih        |

Tombol **Pesan via WhatsApp** tetap hijau WhatsApp (`--wa`) agar pembeli langsung mengenalinya. Halaman desa tetap
memakai warna desanya sendiri.

### 3.2 Logo vektor untuk web dan motion

- Sumber: gambar brand guideline dan wordmark (1448×1086). Tidak ada file asli.
- Huruf: cari font rounded geometris berlisensi OFL yang paling mirip (dicek dengan overlay), ubah jadi outline path.
  Jika tidak ada yang cocok, huruf di-trace lalu dirapikan.
- Elemen khusus digambar sebagai path bersih: garis sawah + bukit di dalam "d", tunas di "a", dan jalur oranye.
- Struktur: satu `<path>` per huruf/elemen dengan id (`#letter-d`, `#mark-fields`, `#sprout`, `#swoosh`, …), tanpa
  transform, `viewBox` rapat, warna lewat kelas di `<style>` agar mudah diganti dan dianimasikan.
- File master di `docs/brand/desanara/`; salinan yang dioptimasi di `apps/web/public/brand/`.

## 4. Yang terdampak

- `packages/i18n` (`BRAND_NAME`, `appName`), `packages/ui/src/theme.css` (token), `packages/db` (seed demo).
- `apps/web` (logo, favicon, OG, pesan ID/EN), `apps/dashboard` (favicon, judul), `apps/api` (judul dokumentasi).
- Dokumen: `docs/brand/README.md`, `DESIGN.md`, `PRODUCT.md`, `README.md`, `docs/README.md`, `AGENTS.md`,
  `docs/guides/seed-data.md`, PLAN-deploy-vercel-supabase.md, `.env.example`, `docker/Caddyfile`, CHANGELOG.

## 5. Langkah implementasi

- [x] 1. Plan ini
- [x] 2. Logo master SVG (horizontal, vertikal, ikon "d", varian putih dan hijau satu warna) — `docs/brand/desanara/`
- [x] 3. **Review logo oleh pemilik proyek** sebelum dipasang
- [x] 4. Komponen logo, favicon, ikon, OG, token warna
- [x] 5. Teks UI, seed demo (`demo.desanara.test`)
- [x] 6. Dokumen + CHANGELOG + memori agent
- [x] 7. Verifikasi (lihat §8)
- [ ] 8. Diskusi fase 2 (tata letak)

## 6. Acceptance criteria

- Tidak ada lagi "Sudut Desa" di UI, kode, dan dokumen aktif.
- Logo tajam di semua ukuran; SVG tanpa `<image>` atau base64, setiap elemen yang dianimasikan punya id.
- Favicon terbaca di 16/32 px; preview link WhatsApp memakai gambar OG baru.
- Kontras teks memenuhi WCAG AA; tombol WA tetap hijau WhatsApp; halaman desa tetap memakai warna desa.
- `bun run check:all` hijau.

## 7. Risiko & mitigasi

- **Logo hasil vektorisasi beda dari desain** → overlay dengan gambar asli, review pemilik sebelum dipasang.
- **Huruf "a" bertunas terbaca "g"** ("desangra") di ukuran kecil → cek keterbacaan di 96 px; di ukuran kecil boleh
  memakai versi tanpa tunas.
- **Domain belum dibeli** → DNS `desanara.id/.com/.co.id` belum terdaftar (2026-11-15); beli secepatnya.
- **Merek** → cek PDKI kelas 35 sebelum publikasi seminar.

## 8. Validasi & skenario test

- Grep "Sudut Desa" di apps/packages/docs aktif = kosong.
- `bun run check:all`; `bun run db:seed` lokal.
- Screenshot 390 px + desktop: beranda, `/desa/baros`, produk, `/tentang`, 404, login dashboard.
- Cek kontras warna dan tampilan favicon di tab browser.

## 9. Rollback

Revert commit branch ini. Tidak ada migrasi database; seed demo dibuat ulang dengan `bun run db:seed`.

## 10. Pertanyaan terbuka & catatan persetujuan

- Disetujui 2026-11-15: identitas dikerjakan sekarang; tata letak dan UI/UX didiskusikan dulu.
- Logo harus SVG vektor murni karena akan dipakai untuk aset motion/animasi.

## 11. Revision notes

| Tanggal    | Perubahan  |
| ---------- | ---------- |
| 2026-11-15 | Draft awal |
