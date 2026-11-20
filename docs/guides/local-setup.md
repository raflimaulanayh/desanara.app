# Setup lokal dari nol

## Prasyarat

- [Bun](https://bun.sh) ≥ 1.4.2 (`bun --version`)
- PostgreSQL 16/17 lokal: Docker (`docker compose -f docker/docker-compose.dev.yml up -d`),
  Postgres.app, ServBay, atau Supabase (pakai string **Session pooler**, bukan Direct connection)
- Git

## Langkah

```bash
git clone <repo> umkm-app && cd umkm-app
bun install
cp .env.example .env            # isi DATABASE_URL dan BETTER_AUTH_SECRET (openssl rand -base64 32)
bun run db:migrate              # buat tabel
bun run db:seed                 # data wilayah, kategori, dan data demo
bun run dev                     # web :3000, dashboard :3001, api :8787
```

Buka:

- http://localhost:3000 — situs publik (bahasa Inggris di `/en`)
- http://localhost:3001/login — dashboard (akun demo di [seed-data.md](seed-data.md))
- http://localhost:8787/docs — dokumentasi API

## Email (opsional)

Tanpa `RESEND_API_KEY`, email (kode verifikasi, kode lupa kata sandi, undangan) tidak dikirim, tetapi dicetak di
terminal API. Salin kode 6 angka atau tautan undangan dari situ. Dengan key, email terkirim sungguhan dari
`noreply@desanara.app`; pakai key lokal sendiri (bukan key production) dan minta ke pengurus.

## Upload foto (opsional)

Upload foto butuh Cloudflare R2. Isi `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
`R2_PUBLIC_URL`, dan `NEXT_PUBLIC_MEDIA_URL` (nilainya sama dengan `R2_PUBLIC_URL`) di `.env`. Minta kuncinya ke pengurus;
jangan membuat token baru di akun HIMASIF tanpa koordinasi. Tanpa variabel itu, aplikasi tetap jalan dan endpoint upload
menjawab `503 SERVICE_UNAVAILABLE`. Detail: [storage](../architecture/storage.md).

## Test integrasi API

Test di `apps/api` yang butuh database (mis. `/v1/manage/businesses`) hanya jalan bila `TEST_DATABASE_URL`
diisi dengan database **lokal** yang sudah dimigrasi. Tanpa itu test tersebut dilewati. Test menolak host
selain localhost, jadi tidak mungkin menyentuh Supabase.

```bash
createdb umkm_test   # atau pakai database dari docker-compose
(cd packages/db && DATABASE_URL=postgres://postgres:postgres@localhost:5432/umkm_test bunx drizzle-kit migrate)
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/umkm_test bun run --cwd apps/api test
```

Test membuat desa/akun sendiri dengan penanda unik dan menghapusnya lagi di akhir. CI menjalankannya otomatis.
`bun run check:all` juga butuh `TEST_DATABASE_URL`. Variabel ini tidak dibaca dari `.env` di root; ekspor di shell
(misalnya `export TEST_DATABASE_URL=…` di `~/.zshrc`) agar tidak perlu diketik setiap kali.

## Sebelum commit

```bash
bun run check:all
```

## Masalah umum

| Gejala                                          | Solusi                                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `Invalid environment variables` saat API start  | Lengkapi `.env` sesuai `.env.example`                                                   |
| Halaman desa kosong                             | API belum jalan atau seed belum dijalankan                                              |
| Login berhasil tapi dashboard kembali ke /login | `TRUSTED_ORIGINS` belum berisi `http://localhost:3001`                                  |
| `No route to host` ke `db.<ref>.supabase.co`    | Itu Direct connection (IPv6). Pakai string Session pooler dari tombol Connect           |
| Style HeroUI tidak muncul                       | Urutan import di `globals.css`: `tailwindcss` → `@heroui/styles` → `@repo/ui/theme.css` |
