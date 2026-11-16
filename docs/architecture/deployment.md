# Deployment

Decision and reasons: [ADR 0009](../adr/0009-api-on-vercel.md). Step-by-step setup: [docs/guides/deploy.md](../guides/deploy.md).

| Component        | Where                                                      | How                                                                         |
| ---------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/web`       | Vercel project `desanara-web` → `<domain>`                 | Git integration, root `apps/web`, Next.js preset, region `sin1`             |
| `apps/dashboard` | Vercel project `desanara-dashboard` → `dashboard.<domain>` | same; proxies `/api/auth/*` and `/v1/*` to the API (`API_PROXY_TARGET`)     |
| `apps/api`       | Vercel project `desanara-api` → `api.<domain>`             | root `apps/api`, `bun run build:vercel` → Build Output API, Node 22, `sin1` |
| Postgres         | Supabase (plain Postgres, ADR 0003), `ap-southeast-1`      | Drizzle migrations from a laptop or CI through the session pooler           |
| Files            | Cloudflare R2                                              | presigned uploads                                                           |
| Fallback API     | VPS with Docker + Caddy (`docker/`)                        | same code, `bun src/index.ts`                                               |

## API on Vercel

`apps/api/vercel.json` sets `framework: null`, `buildCommand: bun run build:vercel`, `outputDirectory: .vercel/output`,
`regions: ["sin1"]`. `scripts/build-vercel.ts` bundles `src/vercel.ts` (Hono app behind `@hono/node-server`'s
request listener) with every workspace package into `functions/index.func/index.mjs`, routes every path to it, and
registers a daily cron on `/health/ready` (DB ping; keeps Supabase Free from pausing).

Check a build locally before pushing:

```bash
bun run --cwd apps/api build:vercel
# run the bundle under Node against any database:
node -e "import('node:http').then(async h=>h.createServer((await import('./apps/api/.vercel/output/functions/index.func/index.mjs')).default).listen(8799))"
```

## API reference

`/docs` (Scalar) and `/openapi.json` are open locally. In production they sit behind a branded login page
(`/docs/login`, `DOCS_USERNAME` + `DOCS_PASSWORD`) that sets a signed, HttpOnly, SameSite=Strict cookie for 8 hours;
changing `DOCS_PASSWORD` signs everyone out, `/docs/logout` signs out. Without `DOCS_PASSWORD` they are not served
at all. The page embeds the OpenAPI document, so it renders from one request. This hides the reference only:
the API itself is still protected per endpoint by sessions and `can()`.

## Database connections

| Who                      | Supabase string                    | Why                                                      |
| ------------------------ | ---------------------------------- | -------------------------------------------------------- |
| API on Vercel            | Transaction pooler, port 6543      | many short-lived instances; `prepare: false` already set |
| Laptop, migrations, seed | Session pooler, port 5432          | IPv4, supports everything Drizzle and the seed need      |
| Never                    | Direct `db.<ref>.supabase.co:5432` | IPv6 only on the Free plan                               |

`DB_POOL_MAX` limits connections per API instance (1–3 on Vercel, 10 locally).

## Domains

Decision (2026-11-15): no custom domain during development. The apps run on free hosts and the domain is
bought later; nothing in the code depends on it.

| Today                           | Later                |
| ------------------------------- | -------------------- |
| `desanara-web.vercel.app`       | `<domain>`           |
| `desanara-dashboard.vercel.app` | `dashboard.<domain>` |
| `desanara-api.vercel.app`       | `api.<domain>`       |
| `<id>.r2.dev` (`R2_PUBLIC_URL`) | `cdn.<domain>`       |

Switching checklist: add the domains in Vercel and keep the `*.vercel.app` hosts redirecting to them (shared links keep
working); update `TRUSTED_ORIGINS`, `AUTH_BASE_URL`, `API_PROXY_TARGET`, `NEXT_PUBLIC_*` URLs; connect `cdn.<domain>`
to `desanara-media` and set `R2_PUBLIC_URL` + `NEXT_PUBLIC_MEDIA_URL`; add the dashboard origin to the bucket CORS
(`docs/architecture/storage.md`). Buy it before anything is printed for the seminar (QR codes, flyers), so printed
links use the final address.

## Login across hosts

Without a shared domain the apps live on separate `*.vercel.app` hosts, where a cookie set by the API host would be a
third-party cookie for the dashboard (blocked by Safari). The dashboard therefore rewrites `/api/auth/*` and `/v1/*` to
the API, and the browser only ever talks to the dashboard origin. API env: `AUTH_BASE_URL` = dashboard origin,
`TRUSTED_ORIGINS` = web + dashboard origins. Dashboard env: `NEXT_PUBLIC_API_URL` = its own origin,
`API_PROXY_TARGET` = API origin. With a custom domain later, `COOKIE_DOMAIN=<domain>` also works.

## Environments

- `local`: Postgres on the laptop (or the Supabase session pooler), seed data.
- `production` (+ Vercel previews for now): one Supabase project. A separate dev project once the team works in
  parallel or real UMKM data arrives (previews currently write to the same database).

## Backups

Supabase Free keeps daily backups for 7 days (not downloadable). Before real data arrives, add a scheduled GitHub
Action running `pg_dump --format=custom` through the session pooler to R2; keep 14 days.

## Moving Postgres to a VPS

```bash
pg_dump --format=custom --no-owner --no-acl "$SUPABASE_SESSION_URL" > desanara.dump
pg_restore --no-owner --dbname "$VPS_URL" desanara.dump
# switch DATABASE_URL in Vercel (or on the VPS), redeploy the API
```

Same Postgres major version on both sides. Only standard extensions (`pg_trgm`, `unaccent`).

## Vercel Hobby limits

Hobby is for non-commercial use, one cron per day per project. Move to Pro before enabling payments or any commercial traffic.
