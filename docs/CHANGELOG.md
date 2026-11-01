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
