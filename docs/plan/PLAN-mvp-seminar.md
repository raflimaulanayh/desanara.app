# PLAN-mvp-seminar — Platform Katalog Sudut Desa

|         |                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------- |
| Status  | Approved (2026-11-01) — fondasi selesai, fitur MVP berjalan                                        |
| Owner   | HIMA Sistem Informasi SATU University                                                              |
| Terkait | [ADR](../adr/README.md), [Fitur MVP](../product/features-mvp.md), [Roadmap](../product/roadmap.md) |

## Context

UMKM desa sulit memasarkan produk, dan masyarakat sulit menemukan produk khas suatu desa. HIMA Sistem Informasi SATU University membangun platform multi-desa (desa = tenant) plus program edukasi UMKM. **Target: MVP live dan didemokan di seminar 11 Desember 2026** di desa pilot (sudah fix, kontak sudah ada). Project jangka panjang: skala nasional, app mobile ≤ 1 tahun, payment gateway nanti. Karena development banyak dibantu AI dan pengurus berganti tiap periode, repo harus **self-documenting** (pola diadopsi dari `PROJECTS/SAWALA/aftech-bfn-monorepo`: `AGENTS.md`, `docs/` + indeks, `docs/plan/` README/TEMPLATE, CHANGELOG, `.agents/skills` + pointer `.claude/skills`, plop, husky, CI).

Folder project `umkm-app` saat ini kosong (greenfield).

## Keputusan yang disepakati

| Area                | Keputusan                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model produk        | Katalog + direktori, desa = tenant, pencarian lintas desa, checkout **via WhatsApp / link marketplace**                                               |
| Repo                | Monorepo **Turborepo + Bun**                                                                                                                          |
| Frontend            | `apps/web` (publik, **bilingual ID/EN**) + `apps/dashboard` (semua role login), **Next.js App Router + HeroUI v3 + Tailwind CSS v4**                  |
| Backend             | `apps/api` **Hono** (runtime Bun), modular monolith, REST `/v1` + RPC types                                                                           |
| DB                  | **PostgreSQL + Drizzle**. Host awal **Supabase sebagai Postgres biasa saja**, bisa pindah ke VPS kampus                                               |
| Auth                | **Better Auth** di API (authN saja); otorisasi via tabel membership sendiri                                                                           |
| Storage             | **Cloudflare R2** (presigned upload langsung dari browser, custom domain)                                                                             |
| Hosting             | Web & dashboard → Vercel (Hobby dulu); API → VPS kampus (Docker); fallback API → VPS sewaan murah                                                     |
| Domain              | Beli domain sendiri: `<domain>`, `dashboard.<domain>`, `api.<domain>` (satu induk untuk cookie)                                                       |
| Moderasi            | UMKM **diverifikasi admin desa sekali**; setelah itu produk langsung tayang, admin bisa takedown                                                      |
| Bahasa              | Kode, `AGENTS.md`, dan docs teknis dalam Inggris; docs produk/panduan/handover dalam Indonesia; UI bilingual                                          |
| URL                 | Segmen statis **Inggris** (`/about`, `/explore`), slug konten dalam bahasa konten (Indonesia); localized pathnames = opsional nanti (dengan redirect) |
| Backend di monorepo | Ya. Deploy per app berdasarkan path berubah, `turbo prune api --docker`, aturan batas import ESLint (web/dashboard dilarang import `packages/db`)     |
| Pilot               | Arsitektur siap nasional (kode wilayah Kemendagri), fokus Jawa Barat, pilot = desa seminar                                                            |

## Arsitektur Sistem

```
Pembeli ──► apps/web (Vercel, SSR/ISR, /id /en) ─┐
Admin/UMKM ► apps/dashboard (Vercel) ────────────┼─► api.<domain> (VPS: Hono + Better Auth, Docker + Caddy HTTPS)
(nanti) apps/mobile (Expo) ──────────────────────┘          │                    │
        upload foto ── presigned URL ──► Cloudflare R2 ◄────┘ (backup pg_dump)   ▼
                                                                  Supabase Postgres (plain)
```

- Frontend **tidak pernah** akses DB langsung; semua lewat API.
- Server Components di `web` memanggil API (via typed client) agar SEO bagus; `dashboard` client-heavy dengan TanStack Query.

## Struktur Monorepo

```
umkm-app/
├── AGENTS.md  CLAUDE.md(@AGENTS.md)  README.md
├── apps/
│   ├── web/          # publik: landing, jelajah, desa, umkm, produk; next-intl /id /en
│   ├── dashboard/    # super_admin, village_admin, assistant, owner (menu sesuai role)
│   └── api/          # Hono: src/modules/<module>/{routes,service,repository,schema}.ts
├── packages/
│   ├── db/           # skema Drizzle, migrasi, seed wilayah + kategori
│   ├── validators/   # skema Zod bersama (form + API + mobile)
│   ├── api-client/   # typed client (hono/client) + error envelope
│   ├── ui/           # komponen netral di atas HeroUI v3 + tema/tokens Tailwind v4
│   ├── i18n/         # konfigurasi locale, formatter (Rp, tanggal), pesan generik
│   ├── auth/         # konfigurasi Better Auth bersama + helper permission `can()`
│   └── config/       # tsconfig, eslint, prettier
├── docs/  (lihat bagian Dokumentasi)
├── .agents/skills/  .claude/skills/  .plop/  .github/workflows/  .husky/
├── docker/           # docker-compose dev (postgres) & prod (api + caddy)
└── turbo.json  package.json  bun.lock  .env.example
```

## Backend (apps/api)

- Modul: `auth`, `regions`, `villages`, `businesses`, `products`, `categories`, `uploads`, `memberships/invitations`, `analytics-events`, `audit`.
- Middleware: request-id, error envelope standar, session (Better Auth), **tenant/permission guard**, rate limit, CORS (origin `<domain>` + `dashboard.<domain>`, credentials).
- Konvensi: `/v1`, pagination terbatas, `snake_case` di HTTP atau `camelCase` (tetapkan sekali di `docs/architecture/api-conventions.md`), dokumentasi OpenAPI via `@hono/zod-openapi` + Scalar di `/docs`.
- Better Auth: dipasang di `/api/auth/*`, `crossSubDomainCookies` untuk `.<domain>`, `trustedOrigins` web+dashboard. Mobile nanti pakai plugin Expo/bearer.
- Disiapkan untuk payment: route webhook idempotent + tabel transaksi di fase 3 (bukan MVP).

## Data Model (packages/db)

- `regions(code PK, name, level, parent_code)`: seed dari dataset kode wilayah Kemendagri.
- `villages`: slug unik, region_code, profil, banner, kontak, status.
- Better Auth: `users`, `sessions`, `accounts`, `verifications`; `users.global_role` (`super_admin` | null).
- `village_members(user_id, village_id, role='village_admin')`.
- `businesses`: village_id, slug, nama, deskripsi, no. WA, alamat, link marketplace/IG, NIB (opsional), `verification_status` (pending/verified/rejected), `consent_at`, status, soft delete.
- `business_members(user_id, business_id, role: owner | assistant)`.
- `invitations`: token, target (village/business), role, expires_at; dipakai untuk **serah-terima akun UMKM** via link WA.
- `categories`, `products` (harga integer rupiah, satuan, status draft/published/archived, soft delete), `product_images` (R2 key, urutan).
- Konten bilingual: field utama Indonesia + tabel `*_translations(locale)` opsional, fallback ke `id`. Auto-translate EN = fase 2.
- `analytics_events` (view, klik WA), `audit_logs` (siapa ubah apa).
- Semua tabel tenant punya `village_id`; semua query di-scope; RLS opsional versi sendiri (session var, bukan `auth.uid()`).

## Otorisasi

Satu helper `can(actor, action, resource)` di `packages/auth`, dipakai API (security boundary) dan dashboard (UX saja). Matriks role ada di `docs/architecture/auth-rbac.md`. **Test permission wajib** untuk tiap endpoint mutasi.

## Frontend

- **web**: `/[locale]` → landing, `/explore` (filter wilayah + kategori + search `pg_trgm`), `/villages/[village]`, `/villages/[village]/[business]`, `/products/[product]`, `/about`, `/privacy-policy`, `/terms`. Tombol **Pesan via WhatsApp** (`wa.me` + pesan otomatis), OG image per produk, sitemap, metadata per locale.
- **dashboard** (`/login`, `/invite/[token]`, `/villages`, `/businesses`, `/businesses/[id]/products`, `/verifications`, `/members`, `/analytics`, `/settings`): login, onboarding undangan, kelola desa (super admin), verifikasi UMKM (admin desa), CRUD UMKM & produk (form bertahap, foto dari kamera, kompres di client, draft otomatis, input Rp), undang pendamping/pemilik, statistik view & klik WA. Bahasa ID dulu, siap i18n.
- HeroUI v3 adalah komponen client: halaman tetap Server Component, bagian interaktif dibungkus client component. Pakai docs **v3** (bukan v2/NextUI) sebagai acuan AI.

## Dokumentasi & Sistem AI

```
AGENTS.md            # peta repo, aturan kerja AI, perintah, larangan (mis. fitur khas Supabase)
docs/README.md       # indeks
docs/product/        # (ID) vision, personas, features-mvp, roadmap, glossary (desa=village, UMKM=business, pendamping=assistant)
docs/architecture/   # (EN) overview, structure, multi-tenancy, auth-rbac, data-model, api-conventions, i18n, storage, deployment
docs/adr/            # 0001-turborepo-bun (termasuk alasan BE satu repo), 0002-hono-backend, 0003-supabase-as-plain-postgres, 0004-heroui-v3, 0005-whatsapp-checkout-mvp, 0006-english-url-segments
docs/guides/         # (ID) onboarding-dev, local-setup, feature-end-to-end, deploy, HANDOVER-checklist per periode
docs/plan/           # README (aturan plan), TEMPLATE.md, PLAN-*.md per fitur
docs/CHANGELOG.md
.agents/skills/      # new-api-module, new-db-migration, new-page, pre-pr-review (kanonik)
.claude/skills/      # pointer ke .agents/skills
.github/             # PR template + checklist, workflows: lint, typecheck, test, build, migration check
```

Aturan inti: ubah kontrak/skema berarti update docs di PR yang sama; fitur besar wajib `PLAN-*.md` dulu; AI dilarang melewati helper `can()`.

### Changelog: setiap perubahan tercatat

- File: `docs/CHANGELOG.md`, entri terbaru di atas, dikelompokkan per tanggal (format terinspirasi Keep a Changelog), ditulis dalam Bahasa Indonesia agar bisa dibaca anggota non-dev.
- Format entri:
  ```
  ## 2026-11-03 — Judul singkat perubahan
  - **Area**: apps/api, packages/db
  - **Jenis**: Added | Changed | Fixed | Removed | Security
  - Apa yang berubah dan kenapa (1–3 kalimat). Catatan migrasi/env baru bila ada.
  - Terkait: PLAN-xxx.md / PR #
  ```
- Penegakan:
  - `AGENTS.md`: agent **wajib** menambah entri CHANGELOG untuk setiap perubahan yang dibuatnya, di commit yang sama.
  - Template PR punya checkbox "CHANGELOG diperbarui".
  - CI `changelog-check`: PR yang mengubah `apps/**` atau `packages/**` gagal bila `docs/CHANGELOG.md` tidak ikut berubah (bisa dilewati dengan label `skip-changelog` untuk perubahan trivial, misal typo).
  - Skill `pre-pr-review` mengecek entri CHANGELOG sesuai format.
- Tag rilis (`v0.1.0` = MVP seminar) menandai titik di CHANGELOG.

## Tooling AI: MCP & Skills

Dipakai langsung oleh agent selama implementasi, dan dicatat di `AGENTS.md` (bagian "AI tooling") agar generasi berikutnya punya setup yang sama.

| Tool                                                  | Fungsi                                                                                                         | Setup                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **HeroUI React MCP** (`@heroui/react-mcp`, khusus v3) | Docs komponen HeroUI v3 yang akurat                                                                            | `.mcp.json` project: `npx -y @heroui/react-mcp@latest`          |
| **HeroUI agent skills**                               | Pola penggunaan HeroUI React (dan Native untuk mobile nanti)                                                   | `curl -fsSL https://heroui.com/install \| bash -s heroui-react` |
| **Context7** (sudah aktif)                            | Docs terbaru Next.js, Hono, Drizzle, Better Auth, next-intl, Turborepo, Tailwind v4                            | sudah terpasang                                                 |
| **Supabase MCP**                                      | Cek skema/data, logs, advisors di project **dev**                                                              | remote MCP (OAuth), URL diverifikasi saat setup                 |
| **Vercel MCP**                                        | Status deploy, logs, env project web/dashboard                                                                 | remote MCP (OAuth), URL diverifikasi saat setup                 |
| Skill bawaan                                          | `impeccable` (UI/UX & polish), `code-review`, `security-review`, `simplify`, `run` (jalankan & screenshot app) | tersedia                                                        |
| Skill project                                         | `.agents/skills/{new-api-module,new-db-migration,new-page,pre-pr-review}`                                      | dibuat di fondasi                                               |

Aturan:

- `.mcp.json` di-commit (tanpa secret). MCP OAuth butuh login tiap anggota via `/mcp`, dan Claude Code perlu di-restart setelah `.mcp.json` ditambah.
- Supabase MCP **hanya ke project dev** dan read-only bila memungkinkan; perubahan skema **tetap lewat migrasi Drizzle** (ADR 0003), bukan lewat MCP/dashboard.
- Agent tidak menulis secret ke repo; env lewat `.env` lokal dan dashboard Vercel/VPS.

## Data Seed / Dummy (untuk demo)

- `packages/db/seed/`: script idempotent `bun run db:seed` dan `bun run db:seed:reset`.
- Isi: data wilayah Jawa Barat (asli, dari kode Kemendagri), kategori, 1 desa pilot + 2 desa contoh, ±20 UMKM, ±60 produk dengan harga wajar, akun demo per role (super_admin, village_admin, assistant, owner), event view/klik WA dummy agar halaman statistik terisi.
- Nama dan nomor WA **fiktif** (nomor format valid tapi bukan milik orang nyata), foto produk dari placeholder berlisensi bebas yang diunggah ke R2 lewat script seed.
- Semua baris dummy diberi penanda (`is_seed = true`) agar bisa dihapus bersih saat data UMKM asli masuk tanpa menyentuh data asli.
- Seed dijalankan di lokal dan di DB dev/demo; production hanya diseed bila memang dipakai untuk demo, lalu dibersihkan setelah data asli siap.

## Lingkup MVP (11 Des) & Non-goals

**Masuk**: auth + undangan, RBAC, desa, UMKM + verifikasi, produk + foto, halaman publik bilingual, search/filter, tombol WA, statistik sederhana, kebijakan privasi + consent.
**Tidak masuk**: keranjang, payment, chat, rating, notifikasi, subdomain per desa, mobile app, auto-translate.

## Timeline (1 Nov – 11 Des)

| Minggu           | Developer (A = api/db, B = dashboard, C = web/ui)                                                                     | Tim lapangan                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1 (1–7 Nov)      | **Fondasi**: monorepo, docs + AGENTS.md + ADR, CI, skema DB + seed, deploy "hello world" ke Vercel + VPS, beli domain | Form data UMKM + consent, mulai survei; cek spek VPS ke IT kampus |
| 2 (8–14)         | Auth + undangan + RBAC, CRUD desa/UMKM. **14 Nov: putuskan VPS kampus vs fallback**                                   | Foto produk, 15–30 UMKM                                           |
| 3 (15–21)        | Produk + upload R2, halaman publik, i18n                                                                              | Materi edukasi                                                    |
| 4 (22–28)        | Search, tombol WA, SEO/OG, statistik. **Feature freeze 28 Nov**                                                       | Finalisasi data                                                   |
| 5 (29 Nov–5 Des) | Input data asli, UAT dengan admin desa, test di Android low-end, bugfix                                               | Gladi materi                                                      |
| 6 (6–11 Des)     | Production, backup, gladi demo end-to-end                                                                             | **Seminar**                                                       |

## Langkah pertama setelah plan disetujui (sesi ini)

1. Scaffold monorepo Turborepo + Bun dengan `apps/{web,dashboard,api}` dan `packages/*` (cek docs terbaru via Context7: Turborepo, Next.js, HeroUI v3, Tailwind v4, Hono, Drizzle, Better Auth, next-intl).
2. Tulis `AGENTS.md`, `CLAUDE.md`, `docs/` (indeks, architecture, ADR 0001–0005, plan README + TEMPLATE, glossary, guides inti, CHANGELOG).
3. Skema Drizzle awal + migrasi + seed (wilayah Jawa Barat, kategori, desa/UMKM/produk/akun dummy); docker-compose dev Postgres.
   3a. Tambah `.mcp.json` (HeroUI React MCP; Supabase & Vercel MCP setelah project cloud dibuat) dan pasang HeroUI agent skills.
4. Hono skeleton: health check, error envelope, Better Auth mount, OpenAPI `/docs`.
5. Tooling: ESLint + Prettier, husky + lint-staged, GitHub Actions (termasuk `changelog-check`), PR template, skill `.agents/skills/*`, generator plop.
6. Entri pertama `docs/CHANGELOG.md`: "Fondasi monorepo & dokumentasi".

## Roadmap

- **Fase 2**: subdomain per desa, import Excel, keranjang lalu pesan sekaligus ke WA, modul edukasi di platform, auto-translate EN, app mobile Expo (pakai `packages/validators` + `api-client`).
- **Fase 3**: payment Midtrans/Xendit. Prasyarat: badan hukum (yayasan/koperasi/PT/BUMDes), KYC merchant, split payment, ongkir, kebijakan refund; Vercel naik ke Pro.

## Risiko & Mitigasi

- VPS kampus lemah/tidak siap → API ringan (Hono), DB di managed; deadline keputusan 14 Nov, fallback VPS sewaan.
- Data UMKM kurang saat demo → pengumpulan data mulai minggu 1, paralel dengan dev.
- Kode AI tidak konsisten → AGENTS.md, skills, CI gates, test permission, review PR.
- Regenerasi pengurus → aset atas nama HIMA (GitHub org, domain, akun cloud), `HANDOVER-checklist.md`.
- Supabase free di-pause/tanpa backup → backup `pg_dump` ke R2 terjadwal; pertimbangkan Pro setelah seminar.

## Verifikasi

- `bun run check:all` (format, lint, typecheck) dan `bun test`/Vitest hijau di CI.
- Unit test `can()`: tiap role tidak bisa mengakses desa/UMKM lain; integration test CRUD utama di API.
- Migrasi Drizzle berjalan bersih di Postgres lokal dan di Supabase; uji `pg_dump`/`pg_restore` ke Postgres biasa (bukti portabilitas).
- Login lintas `dashboard.<domain>` ↔ `api.<domain>` berhasil (cookie subdomain).
- UAT checklist per role bersama perangkat desa; Lighthouse mobile ≥ 80; uji di Android low-end + 3G; cek preview OG & link WA di HP.
- Gladi end-to-end: pendamping daftarkan UMKM → admin desa verifikasi → publish produk → cari di `/id` dan `/en` → klik pesan WA → serah-terima akun ke pemilik.

## Revision notes

| Tanggal    | Perubahan                                                                                                                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-01 | Plan disetujui setelah diskusi stack/arsitektur. Fondasi (langkah 1–6) dikerjakan; lihat CHANGELOG. Catatan: demo seed berisi 16 UMKM / 42 produk (plan: ±20 / ±60). HeroUI agent skills dipasang per developer (lihat onboarding). |
