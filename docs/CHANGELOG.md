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
