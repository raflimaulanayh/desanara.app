# Panduan deploy

Detail teknis: `docs/architecture/deployment.md`.

## Sekali di awal

1. Beli domain (dana HIMA), arahkan DNS: `@` dan `dashboard` → Vercel, `api` → IP VPS.
2. Vercel: buat 2 project dari repo GitHub organisasi HIMA (root `apps/web` dan `apps/dashboard`), isi env dari `.env.example`.
3. Supabase: buat project **dev** dan **production**; salin connection string ke `DATABASE_URL`.
4. Cloudflare R2: buat bucket + custom domain `cdn.<domain>`, buat API token, isi env `R2_*`.
5. VPS: pasang Docker, clone repo, isi `.env`, jalankan `docker compose -f docker/docker-compose.prod.yml up -d --build`.
6. Production env API: `COOKIE_DOMAIN=<domain>`, `TRUSTED_ORIGINS=https://<domain>,https://dashboard.<domain>`,
   `API_URL=https://api.<domain>`.

## Setiap rilis

1. CI hijau di `main`.
2. Web/dashboard ter-deploy otomatis oleh Vercel.
3. API: workflow "Deploy API" (manual) atau di VPS: `git pull && docker compose -f docker/docker-compose.prod.yml up -d --build`.
4. Migrasi: `docker compose -f docker/docker-compose.prod.yml run --rm api bun run --cwd packages/db migrate`.
5. Tambah tag rilis (`v0.1.0`) dan catat di CHANGELOG.

## Batas waktu VPS kampus

Jika VPS kampus belum siap atau tidak layak sampai **14 November 2026**, sewa VPS (±1–2 GB RAM). Langkahnya sama persis.
