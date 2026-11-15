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
