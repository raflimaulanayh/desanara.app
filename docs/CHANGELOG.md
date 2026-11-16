# CHANGELOG

Setiap perubahan dicatat di sini, **entri terbaru di atas**, dalam Bahasa Indonesia.
Wajib ada di commit/PR yang sama dengan perubahannya (dicek CI `changelog-check`).

Format:

```
## YYYY-MM-DD — Judul singkat perubahan
- **Area**: apps/api, packages/db
- **Jenis**: Added | Changed | Fixed | Removed | Security
- Apa yang berubah dan kenapa (1–3 kalimat). Catatan migrasi/env baru bila ada.
- Terkait: PLAN-xxx.md / PR #
```

---

## 2026-11-16 — Alamat UMKM tidak lagi tampil di halaman publik

- **Area**: apps/api, apps/web, docs
- **Jenis**: Security
- Halaman UMKM publik dan `GET /v1/businesses/{slug}` tidak lagi menampilkan alamat UMKM. Lokasi publik berhenti di level desa (nama desa dan wilayahnya), seperti marketplace yang hanya menampilkan kota penjual. Alamat jalan dan RT/RW sering kali alamat rumah pemilik (UU PDP), jadi hanya dipakai di dashboard.

## 2026-11-15 — Keputusan: domain gratis selama development

- **Area**: docs
- **Jenis**: Changed
- Selama development aplikasi tetap di `*.vercel.app` dan foto di URL `r2.dev`; domain sendiri dibeli nanti. Langkah pindah domain dicatat di `docs/architecture/deployment.md`. Domain sebaiknya dibeli sebelum materi seminar (QR, brosur) dicetak.

## 2026-11-15 — Penyimpanan Cloudflare R2 disiapkan

- **Area**: docs, .env.example
- **Jenis**: Added | Security
- R2 diaktifkan di akun Cloudflare **HIMASIF** (bukan akun pribadi) dengan dua bucket di APAC: `desanara-media` (publik lewat URL `r2.dev` untuk sementara, CORS hanya untuk dashboard) dan `desanara-backups` (privat). Backup dipisah bucket karena akses publik R2 berlaku untuk seluruh bucket; dokumen lama yang menyebut "bucket/prefix" diperbaiki.
- Env: `R2_BUCKET=desanara-media`, `R2_ACCOUNT_ID`, `R2_PUBLIC_URL` (URL `r2.dev`). Kunci S3 dibuat lewat R2 API token yang dibatasi ke satu bucket. Pindah ke domain sendiri nanti tanpa migrasi data.
- Terkait: PLAN-mvp-seminar.md, docs/architecture/storage.md

## 2026-11-15 — API kelola UMKM untuk dashboard

- **Area**: apps/api, packages/db, packages/auth, packages/validators, .github, docs
- **Jenis**: Added | Fixed
- Endpoint baru `/v1/manage/businesses` (login wajib, tidak di-cache): daftar sesuai hak akses, buat UMKM (slug dibuat otomatis dari nama), ubah, verifikasi/tolak oleh admin desa (penolakan wajib beralasan, setelah diedit otomatis kembali menunggu), publish/unpublish, takedown/pulihkan, dan hapus (soft delete, khusus admin desa). Publish ditolak bila belum diverifikasi, belum ada persetujuan, tanpa nomor WA, atau sedang ditakedown. Setiap perubahan tercatat di `audit_logs`, termasuk penggantian nomor WA.
- **Migrasi `0003_business_management`** (hanya menambah kolom): bukti persetujuan UU PDP (`consent_method`, `consent_recorded_by`), alasan verifikasi (`verification_note`), dan takedown (`taken_down_at`, `taken_down_by`, `takedown_reason`). UMKM yang ditakedown otomatis hilang dari halaman publik. Jalankan `bun run db:migrate`.
- Action izin baru: `business.list_all`, `business.list`, `business.view`, `business.change_slug`, `business.delete`.
- Perbaikan: skema ubah UMKM lama mencabut persetujuan pemilik di setiap edit (nilai bawaan `consentGiven: false`). Skema baru tidak punya nilai bawaan; field kosong berarti dihapus, field tidak dikirim berarti tidak berubah.
- Test integrasi API memakai Postgres lokal lewat `TEST_DATABASE_URL` (ditolak bila bukan localhost); CI kini memigrasi database sebelum test.
- Terkait: PLAN-mvp-seminar.md

## 2026-11-15 — Halaman login bermerek untuk dokumentasi API

- **Area**: apps/api, docs
- **Jenis**: Changed | Security
- Dialog login bawaan browser (Basic Auth) diganti halaman `/docs/login` bergaya Desanara: logo, warna hijau/krem, tombol lihat kata sandi, pesan salah yang jelas. Setelah masuk, browser menyimpan cookie bertanda tangan (HttpOnly, Secure, SameSite=Strict) selama 8 jam; `/docs/logout` untuk keluar; mengganti `DOCS_PASSWORD` mengeluarkan semua sesi. Percobaan salah diberi jeda singkat.
- Catatan "lupa kata sandi" dihapus agar tidak menyebut tempat hosting, dan seluruh teks halaman login memakai bahasa Inggris.
- Terkait: ADR 0009

## 2026-11-15 — Dokumentasi API dikunci di production

- **Area**: apps/api, docs
- **Jenis**: Security
- `/docs` dan `/openapi.json` sekarang memakai HTTP Basic Auth bila `DOCS_PASSWORD` diisi, dan tidak tersedia sama sekali di production tanpa `DOCS_PASSWORD`. Lokal tetap terbuka. Env baru: `DOCS_USERNAME` (bawaan `desanara`), `DOCS_PASSWORD` (min. 12 karakter).
- Perbaikan: penangan error API sempat membuang header `WWW-Authenticate`, sehingga browser menampilkan JSON `BAD_REQUEST` alih-alih kotak login. Header dari middleware kini dipertahankan dan 401 berkode `UNAUTHENTICATED`.
- Perbaikan kedua: halaman `/docs` menanam dokumen OpenAPI langsung di halaman, karena Scalar mengambil `/openapi.json` tanpa membawa login sehingga browser terus meminta login ulang.
- Terkait: ADR 0009

## 2026-11-15 — API siap di-deploy ke Vercel, database Supabase

- **Area**: apps/api, apps/dashboard, apps/web, packages/db (seed), packages/config, docs
- **Jenis**: Added | Changed
- API dibundel Bun menjadi satu Vercel Function (Node 22, Build Output API, region Singapura) lewat `bun run build:vercel`; entry lokal (Bun) dan Vercel memakai `src/bootstrap.ts` yang sama. Endpoint baru `/health/ready` (ping database) dipanggil cron harian agar Supabase gratis tidak dijeda.
- Dashboard meneruskan `/api/auth/*` dan `/v1/*` ke API bila `API_PROXY_TARGET` diisi, sehingga cookie login tetap milik domain dashboard di `*.vercel.app`. Env baru: `DB_POOL_MAX`, `AUTH_BASE_URL`, `API_PROXY_TARGET`, `SEED_DEMO_PASSWORD` (lihat `.env.example`).
- Seed menolak database non-lokal tanpa `SEED_DEMO_PASSWORD`, karena kata sandi demo bawaan tertulis di repo publik. ADR 0009 diterima; panduan deploy dan setup lokal diperbarui.
- Live 2026-11-15: https://desanara-web.vercel.app, https://desanara-dashboard.vercel.app, https://desanara-api.vercel.app (Supabase `ap-southeast-1`, sudah dimigrasi dan di-seed).
- Terkait: PLAN-deploy-vercel-supabase.md, ADR 0009

## 2026-11-15 — Rebranding: Sudut Desa menjadi Desanara

- **Area**: apps/web, apps/dashboard, apps/api, packages/ui, packages/i18n, packages/db (seed), docs
- **Jenis**: Changed
- Nama platform menjadi **Desanara** ("Ragam Karya, Cerita Nusantara."). Logo baru berupa SVG vektor murni (satu path per huruf/elemen dengan id, siap animasi) di `docs/brand/desanara/`, dipasang sebagai logo header/footer, favicon, ikon aplikasi, dan gambar share. Aset Sudut Desa dihapus.
- Warna utama platform berubah dari ungu `#5b21b6` ke hijau `#0f5a37`, latar krem `#f9f4e7`, plus token sekunder `leaf`, `sun`, `clay`. Tombol WhatsApp tetap hijau WhatsApp; halaman desa tetap memakai warna desanya.
- Akun demo pindah ke `@demo.desanara.test`: jalankan `bun run db:seed` agar akun lama diganti. Tata letak dari mockup brand guideline belum dikerjakan (fase 2, perlu diskusi).
- Terkait: PLAN-rebranding.md

## 2026-11-14 — Rencana deploy ke Vercel dan Supabase

- **Area**: docs (plan, ADR)
- **Jenis**: Added
- Draft rencana menaruh web, dashboard, dan API di Vercel dengan database Supabase (dev + production, Singapura), karena VPS kampus belum siap sampai batas 14 November. ADR 0009 (Proposed) menjadikan VPS sebagai cadangan. Belum ada perubahan kode atau deploy.
- Terkait: PLAN-deploy-vercel-supabase.md, ADR 0009

## 2026-11-03 — Foto contoh produk dan perbaikan logo desa yang rusak

- **Area**: apps/web, packages/db (seed), docs
- **Jenis**: Added | Fixed
- Fix: `NEXT_PUBLIC_MEDIA_URL` yang dikosongkan di `.env` membuat URL media menjadi `/seed/...` (404), sehingga logo Desa Baros rusak. `mediaUrl()` sekarang memakai `||` agar string kosong jatuh ke `/media`.
- Seed: 32 produk contoh kini punya foto asli (stok Wikimedia Commons, 800 px WebP) di `apps/web/public/media/seed/products/`, dengan sumber + lisensi di file `.json` dan `CREDITS.md`. Produk tanpa foto tetap memakai ubin kategori. Jalankan `bun run db:seed` untuk mengisi `product_images`. Sebelum rilis publik, foto ini ikut hilang lewat `db:seed:reset` atau perlu halaman kredit bila dipertahankan.
- Terkait: PLAN-public-redesign.md

## 2026-11-03 — Perbaikan: pesan kosong beranda hilang setelah redesign

- **Area**: apps/web (messages)
- **Jenis**: Fixed
- Kunci `home.villagesEmpty` dan `home.latestEmpty` ikut terhapus saat pesan beranda ditulis ulang, sehingga muncul `MISSING_MESSAGE` ketika daftar desa/produk kosong. Dikembalikan di ID dan EN.
- Terkait: PLAN-public-redesign.md

## 2026-11-03 — Redesign halaman publik: gaya e-commerce ramah dengan desa sebagai pembeda

- **Area**: apps/web, packages/ui, docs (DESIGN.md, PRODUCT.md, guides)
- **Jenis**: Changed | Removed
- Konsep "Buku Nota & Stempel" diganti tampilan marketplace yang ramah: header dengan pencarian, grid kartu produk (foto atau ubin kategori berwarna desa), halaman desa bergaya destinasi (sampul, lambang, lencana "Diverifikasi desa"), halaman produk dengan tombol **Pesan via WhatsApp** yang menempel di bawah layar HP, dan kartu "Dari desa …". Font platform Plus Jakarta Sans; token warna baru di `theme.css`; tema per desa (ADR 0007) tetap berlaku.
- Komponen nota/stempel/kop/seal dihapus; komponen baru: `product-card`, `village-card`, `village-logo`, `order-panel`, `open-status` (badge), `verified-badge`. Label "data demo" dihapus dari UI (`is_seed` tetap di database); langkah `db:seed:reset` sebelum rilis publik ditambahkan di `docs/guides/deploy.md`. Foto contoh produk tidak dibuat: produk tanpa foto memakai ubin kategori.
- Terkait: PLAN-public-redesign.md

## 2026-11-03 — URL publik berbahasa Indonesia tanpa awalan `/id`

- **Area**: apps/web, docs/adr
- **Jenis**: Changed
- Rute publik dipindah sesuai ADR 0008: `/jelajah`, `/desa/[desa]`, `/desa/[desa]/[umkm]`, `/produk/[produk]`, `/tentang`. Bahasa Indonesia tanpa awalan, Inggris di bawah `/en`. URL lama (`/id/...`, `/explore`, `/villages/...`, dst.) di-redirect permanen. ADR 0006 menjadi Superseded, plan redesign berstatus Approved.
- Terkait: PLAN-public-redesign.md, ADR 0008

## 2026-11-03 — Plan redesign halaman publik + URL berbahasa Indonesia

- **Area**: docs/plan, docs/adr
- **Jenis**: Added
- Plan `PLAN-public-redesign.md` (draft): tampilan publik diganti dari konsep nota/stempel menjadi gaya e-commerce yang ramah dengan desa sebagai pembeda, label demo dihapus dari UI (`is_seed` tetap), dan foto contoh ditambahkan. ADR 0008 (proposed) mengganti URL publik menjadi bahasa Indonesia tanpa awalan `/id` (`/desa/baros`, `/produk/...`, `/jelajah`) dengan redirect dari URL lama.
- Terkait: PLAN-public-redesign.md, ADR 0008

## 2026-11-01 — Brand baru: Sudut Desa

- **Area**: seluruh repo (`@repo/i18n` `BRAND_NAME`, pesan ID/EN, apps/web, apps/dashboard, apps/api, docs, PRODUCT.md, DESIGN.md)
- **Jenis**: Changed / Added
- Nama platform diganti dari placeholder "UMKM Desa" menjadi **Sudut Desa** (domain rencana `sudutdesa.id`). Email akun demo
  kini `*@demo.sudutdesa.test` — **jalankan `bun run db:seed`** untuk membuat ulang akun demo.
- Identitas visual pertama: tanda "sudut" (siku bingkai cap + titik desa), wordmark Barlow Condensed, logo stempel,
  favicon & ikon aplikasi (web + dashboard), gambar OG default 1200×630, dan aset PNG/SVG di `apps/web/public/brand/`.
- Panduan brand: `docs/brand/README.md`.

## 2026-11-01 — Logo resmi HIMASIF, SATU University, dan Desa Baros

- **Area**: apps/web (public/brand, public/media, komponen `BrandMark`, `VillageSeal`), docs, PRODUCT.md, DESIGN.md
- **Jenis**: Changed
- Slot "logo menyusul" diganti logo resmi HIMASIF dan SATU University (versi putih/mono dari folder `copyright` repo Desa
  Baros), dicetak dalam tinta navy nota lewat CSS mask di footer dan halaman Tentang.
- Cap Desa Baros kini memakai lambang resmi Pemerintah Desa Baros (perisai + pita motto) menggantikan logo KIM.
- Tinta logo di dalam cap desa kini mengikuti kecerahan (bagian gelap tebal, putih tidak tercetak), sehingga detail
  lambang tetap terbaca dalam satu warna tinta desa.

## 2026-11-01 — Halaman publik "Buku Nota & Stempel" + jam buka UMKM

- **Area**: apps/web, apps/api, packages/validators, packages/ui, packages/db, packages/i18n, docs, PRODUCT.md
- **Jenis**: Added / Changed
- Situs publik dibangun dengan arah desain **Buku Nota & Stempel** (dipilih lewat skill impeccable): cap desa bundar,
  stempel karet untuk status, daftar produk sebagai baris nota, tinta platform ungu dan tinta tiap desa sesuai temanya.
  Halaman: beranda, jelajah (cari + filter kabupaten/kategori + urutan + paginasi, tetap jalan tanpa JavaScript),
  desa (bertema), UMKM (kop, jam buka, chat WA, marketplace), produk (nota pesanan → WhatsApp dengan animasi cap
  "TERKIRIM"), tentang, 404. Semua teks ID/EN.
- API publik baru: `GET /v1/products` (cari), `GET /v1/products/:slug`, `GET /v1/categories`, `GET /v1/businesses/:slug`,
  `GET /v1/villages/:slug/businesses`, `GET /v1/regions/regencies`, `POST /v1/events` (view & klik WA). Aturan visibilitas
  publik terpusat di `apps/api/src/lib/visibility.ts`.
- Status buka/tutup: jadwal mingguan + "tutup sementara", dihitung otomatis di browser (`computeOpenStatus`, + test).
  Migrasi `0002_opening_hours` (kolom `opening_hours`, `closed_until`, `closed_note`, `villages.timezone`).
  **Jalankan `bun run db:migrate` lalu `bun run db:seed`.**
- Desa demo pertama kini **Desa Baros** (desa pilot asli) dengan logo KIM dan foto wisatanya; UMKM/produknya tetap demo.
  Akun demo berganti ke `admin.baros@…` dan `pendamping.baros@…`.
- Daftar font tema desa diganti: barlow-condensed (default), bitter, nunito, poppins. Konstanta `BRAND_NAME` di
  `@repo/i18n` (nama brand masih placeholder). Env baru: `NEXT_PUBLIC_MEDIA_URL`.
- `PRODUCT.md` ditambahkan (konteks produk untuk skill desain).
- Perbaikan hasil review desain: label DATA DEMO di beranda dan halaman desa demo; slot logo HIMA SI & SATU University
  (kosong, menunggu aset resmi); status buka/tutup dirender dari server (terlihat sebelum JavaScript termuat); label kecil
  di atas judul dihapus; bagian "Kenapa pesan di sini" dipindah menjadi cap di kaki "Nota hari ini"; nota pesanan naik ke
  atas di HP (foto kosong jadi strip label); tombol pesan untuk barang kosong benar-benar nonaktif; logo desa dicetak
  satu warna tinta di dalam cap; tinta Desa Baros diganti teal `#0e7490`.
- `DESIGN.md` + `.impeccable/design.json`: sistem desain "Buku Nota & Stempel" (token warna, tipografi, aturan, komponen)
  dicatat dari hasil build; jadi acuan untuk halaman baru (dashboard, editor tema, dll).
- **Desa Baros kini disimpan sebagai desa asli** (`is_seed = false`), tidak terhapus oleh `db:seed:reset`; hanya UMKM
  dan produknya yang demo.
- Terkait: [PLAN-mvp-seminar.md](plan/PLAN-mvp-seminar.md), [ADR 0007](adr/0007-village-theming.md)

## 2026-11-01 — Aturan commit (Conventional Commits)

- **Area**: root (`commitlint.config.mjs`, `.husky/commit-msg`), AGENTS.md
- **Jenis**: Added
- Pesan commit wajib format `<type>(<scope>): <subject>` (feat, fix, chore, docs, refactor, test, …) dan dicek otomatis oleh
  commitlint saat commit. Nama branch mengikuti `<type>/<deskripsi>`. Aturan lengkap di bagian "Git" `AGENTS.md`.

## 2026-11-01 — Fondasi tampilan custom per desa (tema)

- **Area**: packages/validators, packages/ui, packages/db, packages/auth, apps/api, docs
- **Jenis**: Added
- Desa bisa punya branding sendiri: warna utama (wajib kontras ≥ 3:1 di latar putih), font dan gaya sudut dari daftar
  pilihan, serta template tampilan (sekarang `classic`). Tanpa CSS/HTML bebas demi keamanan dan konsistensi (ADR 0007).
- `villageThemeSchema`, 6 preset palet, `parseVillageTheme()` (tema rusak otomatis kembali ke default per field),
  `villageThemeAttributes()` + override variabel turunan HeroUI di `theme.css` agar hover/soft/focus ikut warna desa.
- Migrasi `0001_village_theme`: kolom `villages.theme`, `theme_draft`, `theme_published_at` (nullable, aman untuk data lama).
  **Jalankan `bun run db:migrate`.** Seed demo memberi tema berbeda untuk tiap desa.
- Izin baru `village.customize_theme` (admin desa, super admin) + test. `GET /v1/villages/:slug` kini mengirim `theme`.
- Editor tema di dashboard dan template di halaman desa menyusul.
- Terkait: [PLAN-village-theming.md](plan/PLAN-village-theming.md), [ADR 0007](adr/0007-village-theming.md)

## 2026-11-01 — Fondasi monorepo & dokumentasi

- **Area**: seluruh repo (`apps/*`, `packages/*`, `docs/`, `.github/`, `.agents/`, `docker/`)
- **Jenis**: Added
- Monorepo Turborepo + Bun berisi `apps/web` (Next.js 16, next-intl `/id` `/en`, HeroUI v3, Tailwind v4),
  `apps/dashboard` (login Better Auth, beranda sesuai role), dan `apps/api` (Hono: `/health`, `/v1/villages`,
  `/v1/me`, Better Auth `/api/auth/*`, OpenAPI `/openapi.json` + `/docs`).
- `packages/db`: skema Drizzle 17 tabel + migrasi `0000_init`, seed referensi (Jawa Barat + 27 kab/kota, 6 kategori)
  dan data demo (3 desa, 16 UMKM, 42 produk, akun per role, statistik dummy) yang bisa dihapus dengan `db:seed:reset`.
- `packages/auth`: `can()`/`assertCan()` dengan matriks role + 8 test; Better Auth server/client.
- Aturan lint batas import (frontend dilarang mengimpor `@repo/db` / `@repo/auth/server`).
- Dokumentasi: `AGENTS.md`, arsitektur, ADR 0001–0006, panduan, template plan, checklist serah-terima;
  `.mcp.json` (HeroUI React, Supabase read-only, Vercel), skill agent, CI + `changelog-check`, PR template.
- Env baru: lihat `.env.example` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `TRUSTED_ORIGINS`, `COOKIE_DOMAIN`, `R2_*`,
  `SEED_WHATSAPP_NUMBER`).
- Terkait: [PLAN-mvp-seminar.md](plan/PLAN-mvp-seminar.md)
