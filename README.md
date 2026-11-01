# Sudut Desa

Platform katalog produk UMKM multi-desa + program edukasi UMKM, oleh **HIMA Sistem Informasi SATU University**.
Desa = tenant; pembeli menemukan produk khas desa lalu memesan langsung lewat WhatsApp.

> Target MVP: seminar desa pilot **11 Desember 2026**.

## Stack

Turborepo + Bun · Next.js 16 + HeroUI v3 + Tailwind v4 + next-intl (ID/EN) · Hono + Better Auth · PostgreSQL + Drizzle · Cloudflare R2

## Mulai cepat

```bash
bun install
cp .env.example .env      # isi DATABASE_URL dan BETTER_AUTH_SECRET
bun run db:migrate && bun run db:seed
bun run dev               # web :3000 · dashboard :3001 · api :8787 (/docs)
```

Detail: [docs/guides/local-setup.md](docs/guides/local-setup.md) · Akun demo: [docs/guides/seed-data.md](docs/guides/seed-data.md)

## Dokumentasi

- [AGENTS.md](AGENTS.md) — aturan kerja untuk developer & AI agent (baca pertama)
- [docs/](docs/README.md) — produk, arsitektur, ADR, panduan, plan, [CHANGELOG](docs/CHANGELOG.md)
