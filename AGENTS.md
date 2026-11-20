# AGENTS.md — Desanara

Entry point for every AI coding agent (Claude Code, Codex, Cursor, …) and for new developers.
Read this file first, then the docs it links. Keep it short; details live in `docs/`.

## What this is

A multi-village catalogue for village micro/small businesses (UMKM), built by HIMA Sistem Informasi,
SATU University. **A village (desa) is the tenant.** Buyers browse products and order through WhatsApp.
MVP deadline: seminar on **2026-12-11** (feature freeze 2026-11-28). Product context: `docs/product/`.

## Repository map

| Path                  | What                                                                               | Runs on |
| --------------------- | ---------------------------------------------------------------------------------- | ------- |
| `apps/web`            | Public site, bilingual `/id` `/en` (Next.js 16, next-intl, HeroUI v3, Tailwind v4) | Vercel  |
| `apps/dashboard`      | Logged-in app for every role (Next.js 16, TanStack Query)                          | Vercel  |
| `apps/api`            | REST API `/v1` + Better Auth `/api/auth/*` (Hono; Bun locally, Node on Vercel)     | Vercel  |
| `packages/db`         | Drizzle schema, migrations (`drizzle/`), seed                                      | —       |
| `packages/auth`       | `permissions.ts` (`can()`), `server.ts` (Better Auth, API only), `client.ts`       | —       |
| `packages/validators` | Zod schemas shared by API, dashboard, mobile                                       | —       |
| `packages/api-client` | Typed Hono RPC client + `unwrap()`                                                 | —       |
| `packages/ui`         | HeroUI theme tokens + neutral components                                           | —       |
| `packages/i18n`       | Locales, shared messages, `formatRupiah`, `buildWhatsAppLink`                      | —       |
| `packages/email`      | `createMailer()` (Resend over fetch, console locally) + email templates (API only) | —       |
| `packages/config`     | tsconfig + ESLint presets (import boundaries live here)                            | —       |

Architecture: `docs/architecture/overview.md`. Security and personal data: `docs/architecture/security-privacy.md`.
Decisions and their reasons: `docs/adr/`. Index of every document by reader: `docs/README.md`.
Product context: `PRODUCT.md`. Visual system for any new UI: `DESIGN.md` (read before building pages).

## Commands (run from the repo root)

```bash
bun install                 # install everything
bun run dev                 # web :3000, dashboard :3001, api :8787 (needs .env)
bun run db:migrate          # apply migrations
bun run db:seed             # reference data + demo data (idempotent)
bun run db:seed:reset       # remove demo data only
bun run db:generate         # create a migration after changing packages/db/src/schema
bun run check:all           # format check + lint + typecheck + tests (what CI runs)
bun run --cwd apps/api test # one workspace
```

Setup from zero: `docs/guides/local-setup.md`.

## Rules (non-negotiable)

1. **Authorization goes through `can()` / `assertCan()`** from `@repo/auth/permissions`. Every API mutation
   and every private read calls it in the service layer. Never write ad-hoc role checks. Add a test in
   `packages/auth/src/permissions.test.ts` for each new action.
2. **Tenant scoping.** Every query on tenant data filters by `villageId` (or a business inside it) and
   `deletedAt IS NULL`. See `docs/architecture/multi-tenancy.md`.
3. **Frontends never touch the database.** `apps/web` and `apps/dashboard` call the API through
   `@repo/api-client`. ESLint blocks `@repo/db` and `@repo/auth/server` imports in apps.
4. **Schema changes only through Drizzle migrations** (`bun run db:generate`, commit `packages/db/drizzle`).
   Never change tables in the Supabase dashboard or through an MCP server (ADR 0003).
5. **Supabase is plain Postgres.** Do not use Supabase Auth, Storage, Realtime, Edge Functions, or
   `auth.uid()`. The database must stay portable to the campus VPS.
6. **Every change gets a `docs/CHANGELOG.md` entry** in the same change set (format in that file).
   CI fails PRs that touch `apps/**` or `packages/**` without one (label `skip-changelog` for trivia).
7. **Contract or schema change ⇒ update the docs** that describe it in the same change
   (`docs/architecture/*`, OpenAPI descriptions, validators).
8. **Large or cross-cutting work needs a plan first**: `docs/plan/PLAN-<name>.md` from
   `docs/plan/TEMPLATE.md`, approved before implementation.
9. **No secrets in the repo.** Env vars are documented in `.env.example`; real values live in `.env`,
   Vercel, and the VPS.
10. **Demo data is flagged** `is_seed = true`. Never mix it with real UMKM data or remove that flag.
11. **Village branding is tokens + code templates only** (ADR 0007). Never render user-supplied CSS/HTML.
    Read themes with `parseVillageTheme()`, apply them with `villageThemeAttributes()` on village-scoped pages only.

## Conventions

- Code, identifiers, `AGENTS.md`, and `docs/architecture` + `docs/adr`: **English**.
  `docs/product`, `docs/guides`, `docs/CHANGELOG.md`: **Bahasa Indonesia**. UI copy: ID + EN via next-intl.
- Glossary of domain terms ↔ code names: `docs/product/glossary.md` (desa = village, UMKM = business,
  pendamping = assistant).
- Public URL segments are Indonesian, no `/id` prefix (`/jelajah`, `/desa/[village]`, `/produk/[product]`; English under `/en`); slugs follow the content language (ADR 0008). API paths stay English.
- API JSON is camelCase; success `{ data, meta? }`; errors `{ error: { code, message, details?, requestId } }`
  (`docs/architecture/api-conventions.md`).
- API module layout: `apps/api/src/modules/<name>/<name>.{routes,service,repository,schema}.ts`.
  `villages` is the reference module. Scaffold with `bun run generate`.
- Money: whole rupiah integers. Phones: `628…` (normalised by `whatsappNumberSchema`).
- HeroUI is **v3** (compound components: `Card.Header`, `TextField` + `Label` + `Input`, `onPress`).
  Do not copy v2/NextUI examples. Interactive HeroUI parts live in `'use client'` components.

## Git

- Branches: `<type>/<short-kebab-description>` from `main`, e.g. `feat/public-village-page`, `fix/login-redirect`.
- Commits: [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint (husky `commit-msg`):
  `<type>(<scope>): <subject>` — types `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `build`,
  `ci`, `revert`; scopes listed in `commitlint.config.mjs` (`web`, `dashboard`, `api`, `db`, `auth`, `ui`, `theme`, …).
- One logical change per commit; the CHANGELOG entry goes in the same commit/PR. Never commit `.env`.
- Agents commit or push only when the user asks.

## AI tooling

Use these instead of guessing library APIs from memory:

| Tool                                  | Use for                                                                  | Setup                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| HeroUI React MCP (`.mcp.json`)        | HeroUI v3 component APIs                                                 | automatic after restart; check with `/mcp`                                      |
| HeroUI agent skills                   | HeroUI usage patterns                                                    | `curl -fsSL https://heroui.com/install \| bash -s heroui-react` (per developer) |
| Context7 MCP                          | Next.js, Hono, Drizzle, Better Auth, next-intl, Turborepo, Tailwind docs | user-level MCP                                                                  |
| Supabase MCP (`.mcp.json`, read-only) | Inspect the **dev** database, logs, advisors                             | `/mcp` → login; add `&project_ref=<dev-ref>` to the URL                         |
| Vercel MCP (`.mcp.json`)              | Deployments, logs, env of web/dashboard                                  | `/mcp` → login                                                                  |
| Project skills `.agents/skills/`      | `new-api-module`, `new-db-migration`, `new-page`, `pre-pr-review`        | read the SKILL.md                                                               |

Never point an MCP server with write access at production data.

## Before you finish a task

- `bun run check:all` passes.
- New behaviour has tests (permissions, services, validators).
- `docs/CHANGELOG.md` has an entry; affected docs are updated.
- Run the `pre-pr-review` skill checklist.
