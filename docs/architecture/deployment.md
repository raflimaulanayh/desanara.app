# Deployment

Decision and reasons: [ADR 0009](../adr/0009-api-on-vercel.md). Step-by-step setup: [docs/guides/deploy.md](../guides/deploy.md).

| Component        | Where                                                          | How                                                                         |
| ---------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/web`       | Vercel project `desanara-web` → `desanara.app`                 | Git integration, root `apps/web`, Next.js preset, region `sin1`             |
| `apps/dashboard` | Vercel project `desanara-dashboard` → `dashboard.desanara.app` | same; proxies `/api/auth/*` and `/v1/*` to the API (`API_PROXY_TARGET`)     |
| `apps/api`       | Vercel project `desanara-api` → `api.desanara.app`             | root `apps/api`, `bun run build:vercel` → Build Output API, Node 22, `sin1` |
| Postgres         | Supabase (plain Postgres, ADR 0003), `ap-southeast-1`          | Drizzle migrations from a laptop or CI through the session pooler           |
| Files            | Cloudflare R2                                                  | presigned uploads                                                           |
| Fallback API     | VPS with Docker + Caddy (`docker/`)                            | same code, `bun src/index.ts`                                               |

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

Domain: `desanara.app` (bought 2026-11-16 through the GitHub Student Developer Pack offer at Name.com; renewal is
paid yearly, so someone at HIMASIF must own it). The registrar stays Name.com for now; DNS is served by Cloudflare in
the HIMASIF account. Moving the registration itself to Cloudflare is possible 60 days after registration.

| Host                                           | Serves                                          | DNS (Cloudflare, all "DNS only") |
| ---------------------------------------------- | ----------------------------------------------- | -------------------------------- |
| `desanara.app`                                 | Vercel project `desanara-web`                   | CNAME to Vercel (flattened)      |
| `www.desanara.app`                             | 308 redirect to `desanara.app`                  | CNAME to Vercel                  |
| `dashboard.desanara.app`                       | `desanara-dashboard`                            | CNAME to Vercel                  |
| `api.desanara.app`                             | `desanara-api`                                  | CNAME to Vercel                  |
| `cdn.desanara.app`                             | R2 bucket `desanara-media`                      | managed by R2 (custom domain)    |
| `send`, `rsend`, `resend._domainkey`, `_dmarc` | email sending through Resend (SPF, DKIM, DMARC) | Resend records; DMARC `p=none`   |

The old `*.vercel.app` production hosts redirect (308) to the matching custom host, so links shared earlier keep
working. The `r2.dev` URL of the media bucket is switched off; media is only served from `cdn.desanara.app`.
Vercel records must stay "DNS only": proxying them through Cloudflare breaks Vercel's certificates.

Changing hosts again: update `TRUSTED_ORIGINS`, `AUTH_BASE_URL`, `API_URL`, `API_PROXY_TARGET`, `R2_PUBLIC_URL` and
the `NEXT_PUBLIC_*` URLs in the three Vercel projects, the bucket CORS (`docs/architecture/storage.md`), then redeploy.
Changing the dashboard host signs everyone out once (the session cookie belongs to that host).

## Login across hosts

The dashboard rewrites `/api/auth/*` and `/v1/*` to the API, so the browser only ever talks to the dashboard origin and
the session cookie is first-party on `dashboard.desanara.app` (no cross-site cookie, works in Safari). API env:
`AUTH_BASE_URL` = dashboard origin, `TRUSTED_ORIGINS` = web + dashboard origins. Dashboard env: `NEXT_PUBLIC_API_URL`
= its own origin, `API_PROXY_TARGET` = API origin. `COOKIE_DOMAIN` stays empty: nothing outside the dashboard needs
the session today. Set `COOKIE_DOMAIN=desanara.app` only when another subdomain must read the session.

## Environments

- `local`: Postgres on the laptop (or the Supabase session pooler), seed data.
- `production` (+ Vercel previews for now): one Supabase project. A separate dev project once the team works in
  parallel or real UMKM data arrives (previews currently write to the same database).

## Public PWA

The public web project serves the app manifest and service worker over HTTPS. For device test
notifications, set `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, and `WEB_PUSH_SUBJECT` in
the web project. Generate one VAPID keypair per environment with `bun run --cwd apps/web push:keys`
and keep the same keypair across deploys. Use an externally valid contact URI such as
`mailto:webpush@desanara.app` for the subject. A key rotation requires users to subscribe again.
Installation also works on deployments without these variables.

`GET /api/pwa/push` returns the public key or `null`. Same-origin `POST /api/pwa/push` accepts
`{ locale, subscription: { endpoint, keys: { p256dh, auth } } }` and queues a fixed test notification
for that browser subscription. The endpoint allows supported HTTPS push-provider destinations and
limits requests per subscription and per server instance. It stores no subscriptions and exposes no
provider response bodies.

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
