# Panduan deploy

Detail teknis: `docs/architecture/deployment.md`. Keputusan: ADR 0009 (semua di Vercel, database di Supabase).

## Sekali di awal

### 1. Supabase

1. Buat project di region **Southeast Asia (Singapore)**. Data API dan "expose new tables" dimatikan, automatic RLS
   dinyalakan, GitHub integration dikosongkan.
2. Tombol **Connect** → salin dua string, ganti `[YOUR-PASSWORD]` dengan password database (tanpa kurung siku):
   - **Session pooler** (port 5432) → `DATABASE_URL` di `.env` laptop (untuk migrasi dan seed).
   - **Transaction pooler** (port 6543) → `DATABASE_URL` di Vercel project API.
   - Jangan pakai "Direct connection" (`db.<ref>.supabase.co`): di paket gratis hanya IPv6.
3. Dari laptop: `bun run db:migrate`, lalu (untuk demo) `bun run db:seed` dengan `SEED_DEMO_PASSWORD` terisi di `.env`.

### 2. Vercel (tiga project dari repo GitHub yang sama)

| Project              | Root directory   | Env (Production + Preview)                                                                                                                                                                                                                     |
| -------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `desanara-api`       | `apps/api`       | `DATABASE_URL` (transaction pooler), `DB_POOL_MAX=2`, `BETTER_AUTH_SECRET`, `API_URL`, `AUTH_BASE_URL` (= URL dashboard), `TRUSTED_ORIGINS` (= URL web,URL dashboard), `NODE_ENV=production`, `DOCS_USERNAME`, `DOCS_PASSWORD` (login `/docs`) |
| `desanara-web`       | `apps/web`       | `API_URL`, `NEXT_PUBLIC_API_URL` (= URL API), `NEXT_PUBLIC_WEB_URL`, `NEXT_PUBLIC_DASHBOARD_URL`                                                                                                                                               |
| `desanara-dashboard` | `apps/dashboard` | `NEXT_PUBLIC_API_URL` (= URL dashboard sendiri), `API_PROXY_TARGET` (= URL API), `NEXT_PUBLIC_WEB_URL`                                                                                                                                         |

Pengaturan build sudah ada di `apps/*/vercel.json` (region Singapura `sin1`; API memakai `bun run build:vercel`).
Saat import di Vercel, biarkan "Include files outside the root directory" menyala (monorepo).

### 3. Domain (setelah dibeli)

Tambahkan `desanara.id` ke web, `dashboard.desanara.id` ke dashboard, `api.desanara.id` ke API. Lalu ganti semua URL
di env di atas dan isi `COOKIE_DOMAIN=desanara.id` di API.

## Setiap rilis

1. CI hijau, merge ke `main` → ketiga project ter-deploy otomatis. Branch lain mendapat preview (memakai database yang sama).
2. Ada migrasi baru? Jalankan `bun run db:migrate` dari laptop (session pooler) **sebelum** merge.
3. Cek `https://<api>/health/ready` → `{"status":"ok","database":true}`. Dokumentasi API (`/docs`) di production dikunci dengan `DOCS_USERNAME`/`DOCS_PASSWORD`; tanpa `DOCS_PASSWORD` halaman itu mati (404).
4. Tambah tag rilis (`v0.1.0`) dan catat di CHANGELOG.

## Sebelum situs dibuka untuk umum

Tampilan publik **tidak** melabeli data contoh sebagai demo, jadi sebelum link disebar:

1. Jalankan `bun run db:seed:reset` di database production (hapus semua baris `is_seed = true`).
2. Pastikan UMKM dan produk asli sudah masuk dan terverifikasi oleh admin Desa Baros.
3. Cek tidak ada nomor WhatsApp tim (`SEED_WHATSAPP_NUMBER`) yang tersisa di UMKM.
4. Cek halaman `/desa/baros`, `/jelajah`, dan satu halaman produk di HP.

## Cadangan: API di VPS

Jika Vercel tidak lagi cocok, API bisa jalan di VPS (±1–2 GB RAM) dengan `docker compose -f docker/docker-compose.prod.yml up -d --build`.
Kodenya sama; cukup ganti URL API di env web dan dashboard.
