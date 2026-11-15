# 0009 — Host the API on Vercel; the VPS becomes the fallback

- Status: Accepted (2026-11-15)

## Context

`docs/architecture/deployment.md` puts `apps/api` on the campus VPS (Docker + Caddy). The deadline for the campus VPS
decision is 2026-11-14 and the VPS is not ready. The seminar is on 2026-12-11 (freeze 2026-11-28). Web and dashboard
already target Vercel, and Vercel runs Hono as a function with zero configuration. Traffic for the MVP is small
(one pilot village). No domain has been bought yet, so the apps live on separate `*.vercel.app` hosts for now.

## Decision

- `apps/api` is a third Vercel project (root `apps/api`), deployed as one Vercel Function on the Node.js runtime (GA).
  Bun stays the package manager, test runner and local runtime.
- Build: `bun run build:vercel` bundles `src/vercel.ts` with every workspace package into one ESM file and writes the
  Build Output API v3 layout (`.vercel/output`). No framework detection and no TypeScript compilation of monorepo
  packages on Vercel. `src/bootstrap.ts` wires env → db → auth → app for both entries (Bun `src/index.ts`, Vercel
  `src/vercel.ts` via `@hono/node-server`), so local and production run the same app.
- Database: Supabase (plain Postgres, ADR 0003), region `ap-southeast-1`; one project for now, a separate dev
  project once the team works in parallel. The API connects through the Supabase
  **transaction pooler** (port 6543, `prepare: false`, `DB_POOL_MAX` 1–3 per instance); laptops, migrations and seed
  use the **session pooler** (port 5432). The direct `db.<ref>.supabase.co` host is IPv6-only on Free and unusable from
  Vercel.
- All three Vercel projects run functions in `sin1` (Singapore), next to the database.
- The dashboard reaches the API through Next.js rewrites on its own origin (`/api/auth/*`, `/v1/*`, enabled by
  `API_PROXY_TARGET`), so the Better Auth session cookie is first-party on any host, with or without a custom domain.
  The API's `AUTH_BASE_URL` is the dashboard origin.
- The Docker/Caddy setup stays in the repo as the documented fallback (VPS or campus server later).

## Consequences

- No server to maintain before the seminar; preview deployments for every branch.
- Cold starts on the first request after idle (hundreds of ms); acceptable for a catalogue.
- Vercel Hobby is for non-commercial use (already noted in `deployment.md`). Move to Pro before payments.
- Supabase Free pauses a project after 7 days without activity: a daily Vercel Cron hits `/health/ready` (DB ping).
- Demo accounts on any non-local database need `SEED_DEMO_PASSWORD` (the repo is public; the seed refuses otherwise).
- Long-running work (image processing, nightly backups) cannot live in the API function; backups move to a scheduled
  GitHub Action or the fallback VPS.
- Moving to the VPS later is a redeploy of the same code with the existing Dockerfile and a `DATABASE_URL` change.

## Alternatives

- **Campus VPS (current plan):** full control and no cold starts, but not ready and needs maintenance by students.
- **Rented VPS:** works, costs money monthly, and someone must patch it and manage HTTPS.
- **Bun runtime on Vercel:** matches local dev, but is still Beta on Vercel; revisit after the seminar.
- **Vercel Hono zero-config preset:** less code, but entry detection by file name (`src/app.ts` would match first) and
  compiling TypeScript workspace packages on Vercel were not verifiable locally; the bundle is tested under Node before deploy.
- **Cloudflare Workers:** Hono runs there natively, but postgres.js needs Hyperdrive and the team already uses Vercel.
