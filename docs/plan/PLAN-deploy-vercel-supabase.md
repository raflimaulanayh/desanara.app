# PLAN-deploy-vercel-supabase — Web, dashboard, dan API di Vercel, database di Supabase

|         |                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------- |
| Status  | Done (2026-11-15) — live di Vercel + Supabase Singapura                                                        |
| Owner   | HIMA Sistem Informasi                                                                                          |
| Tanggal | 2026-11-14                                                                                                     |
| Terkait | [ADR 0009](../adr/0009-api-on-vercel.md), [ADR 0003](../adr/0003-supabase-as-plain-postgres.md), deployment.md |

## 1. Tujuan & kondisi saat ini

Situs bisa dibuka online (untuk tim, desa, dan seminar) tanpa menunggu VPS kampus.
Saat ini: repo belum punya remote GitHub, belum ada project Vercel, Vercel CLI belum terpasang, Supabase CLI sudah
login tapi hanya ada satu project lama yang sedang dijeda. API masih diasumsikan jalan di VPS (Docker + Caddy).

## 2. Scope & non-goals

**Scope**

- 3 project Vercel: `desanara-web` (`apps/web`), `desanara-dashboard` (`apps/dashboard`), `desanara-api` (`apps/api`).
- **1 project Supabase** (region Singapura) untuk semua deployment Vercel (production + preview). Project dev terpisah menyusul.
- Migrasi + seed ke database itu; env di Vercel.
- Login dashboard tetap jalan di domain `*.vercel.app` (tanpa domain sendiri).
- Docs: ADR 0009, `deployment.md`, `deploy.md`, `local-setup.md`, `.env.example`, CHANGELOG.

**Non-goals**

- Domain sendiri (menyusul saat dibeli; tinggal tambah domain di Vercel + `COOKIE_DOMAIN`).
- Upload foto ke R2 (ikut plan CRUD dashboard; kredensial R2 belum ada).
- Backup otomatis (dicatat sebagai tugas lanjutan).

## 3. Keputusan

- **API di Vercel** sebagai satu Vercel Function (preset Hono), runtime Node.js. Lokal tetap Bun.
  `src/index.ts` diubah jadi `export default app` (yang dibaca Vercel); server lokal Bun dipindah ke `src/dev.ts`.
- **Database**: API memakai _transaction pooler_ Supabase (port 6543) dengan pool kecil (`DB_POOL_MAX`, default 10 lokal,
  3 di Vercel). Migrasi memakai _session pooler_ (port 5432) lewat `DATABASE_URL` sementara saat menjalankan `db:migrate`.
- **Region**: semua function Vercel di `sin1`, Supabase di `ap-southeast-1`.
- **Login dashboard**: dashboard meneruskan `/api/auth/*` dan `/v1/*` ke API lewat rewrites Next.js, jadi cookie
  sesi milik domain dashboard sendiri (tidak terblokir sebagai cookie pihak ketiga). Better Auth `baseURL` = URL dashboard.
- **Web publik** memanggil API langsung (`API_URL` di server, `NEXT_PUBLIC_API_URL` untuk event klik WA), tanpa cookie.
- **Supabase Free dijeda setelah 7 hari sepi** → Vercel Cron harian ke `/health` yang ikut ping database.
- **Deploy**: Git integration Vercel (otomatis tiap push ke `main`, preview tiap branch). Butuh repo GitHub.
- **Secret** (`DATABASE_URL`, `BETTER_AUTH_SECRET`) tidak pernah lewat chat: dibuat/diisi di mesin lokal dan dikirim
  langsung ke Vercel lewat CLI, atau diisi pemilik di dashboard Vercel.

## 4. Yang terdampak

- `apps/api`: entry `src/index.ts` + `src/dev.ts`, `vercel.json`, env `DB_POOL_MAX`, `/health` cek DB.
- `apps/dashboard`: rewrites di `next.config.ts`, `NEXT_PUBLIC_API_URL` jadi origin dashboard sendiri.
- `apps/web`: `vercel.json` (region). Tidak ada perubahan halaman.
- `packages/db`: `createDb` membaca ukuran pool. Seed membaca `SEED_DEMO_PASSWORD`.
- Docs + `.env.example`. Skema DB, permission, dan API contract: tidak berubah.

## 5. Langkah implementasi

- [x] 1. Persiapan (pemilik): ~~repo GitHub~~ (selesai, `raflimaulanayh/desanara.id`, public), ~~project Supabase Singapura~~ (selesai), `vercel login`, buat/izinkan project Supabase (lihat §10)
- [x] 2. Kode: entry API untuk Vercel, pool DB, rewrites dashboard, `/health` + cron, `vercel.json` region
- [x] 3. Uji lokal: `check:all`, `vercel build` untuk API, login dashboard lewat rewrites
- [x] 4. Supabase (1 project): migrasi + seed demo (dihapus dengan `db:seed:reset` sebelum situs dibuka umum)
- [x] 5. Vercel: 3 project, env Production dan Preview menunjuk ke database yang sama
- [x] 6. Deploy + smoke test: beranda, `/desa/baros`, produk, klik WA, login dashboard, `/docs` API
- [x] 7. Docs + CHANGELOG, ADR 0009 → Accepted

## 6. Acceptance criteria

- `https://desanara-web.vercel.app` menampilkan data dari Supabase production, foto dan logo tampil.
- Login akun demo di `https://desanara-dashboard.vercel.app` berhasil dan tetap login setelah refresh (Chrome + Safari iOS).
- `https://desanara-api.vercel.app/health` → 200 dan `/docs` terbuka.
- Push ke `main` men-deploy ulang ketiganya; branch lain mendapat preview.
- Tidak ada secret di repo atau di chat. `bun run check:all` hijau.

## 7. Risiko & mitigasi

- **Kata sandi bawaan akun demo tertulis di repo publik** → siapa pun bisa login sebagai super admin di situs online.
  Seed membaca `SEED_DEMO_PASSWORD` dari env (wajib saat menyeed database online); nilai acak disimpan di password manager tim.
- **Cold start** pada request pertama → region `sin1` dekat DB, bundle API kecil; terima untuk MVP.
- **Koneksi DB habis** (banyak instance serverless) → transaction pooler + pool kecil per instance.
- **Supabase dijeda** → cron harian; cek status sebelum seminar.
- **Satu database untuk production dan preview** → preview bisa mengubah data asli (login, event klik). Diterima sementara; buat project dev begitu tim mulai kerja paralel atau data UMKM asli masuk.
- **Vercel Hobby non-komersial** → cukup untuk proyek HIMA; pindah Pro sebelum ada pembayaran.
- **Deteksi entry Hono salah file** → verifikasi dengan `vercel build` lokal sebelum deploy.

## 8. Validasi & skenario test

- Unit test tetap jalan (`createApp` tidak berubah). Tambah test `/health` dengan DB palsu.
- Manual setelah deploy: semua halaman publik di HP, klik WA tercatat di `events`, login/logout dashboard.

## 9. Rollback

Vercel: "Promote" deployment sebelumnya. Kode: revert commit. Database: migrasi tidak berubah di plan ini.
Fallback hosting API: Docker di VPS (`docker/docker-compose.prod.yml`) tetap ada.

## 10. Pertanyaan terbuka & catatan persetujuan

- Repo GitHub: di organisasi HIMA atau akun pribadi dulu?
- Supabase: diputuskan **satu project dulu** (2026-11-14); pemilik membuat project dan menyerahkan connection string lewat file lokal `.env.supabase` (gitignored), bukan chat.
- Akun Vercel: akun pribadi atau team HIMA?

## 11. Revision notes

| Tanggal    | Perubahan                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------- |
| 2026-11-14 | Draft awal                                                                                  |
| 2026-11-14 | Satu project Supabase dulu (bukan dev + prod)                                               |
| 2026-11-15 | Live: desanara-web/-dashboard/-api.vercel.app; API via Build Output API (bukan preset Hono) |
