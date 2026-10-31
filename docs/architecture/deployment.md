# Deployment

| Component        | Where                                                  | How                                                                       |
| ---------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `apps/web`       | Vercel project `umkm-web` → `<domain>`                 | Git integration, root `apps/web`, ignored build step on unrelated changes |
| `apps/dashboard` | Vercel project `umkm-dashboard` → `dashboard.<domain>` | same                                                                      |
| `apps/api`       | Campus VPS (fallback: rented VPS) → `api.<domain>`     | Docker image from `docker/api.Dockerfile`, Caddy for HTTPS                |
| Postgres         | Supabase (plain Postgres) → later campus VPS           | `bun run db:migrate` from CI or the VPS                                   |
| Files            | Cloudflare R2                                          | presigned uploads                                                         |

## Environments

- `local`: Postgres from `docker/docker-compose.dev.yml` (or any local Postgres), seed data.
- `demo/dev`: Supabase dev project, seeded; Vercel preview deployments.
- `production`: separate Supabase project; seed only for the seminar demo, then cleaned (`db:seed:reset`).

## API on the VPS

```bash
# on the VPS (Docker + Compose installed), repo checked out
cp .env.example .env    # fill production values
docker compose -f docker/docker-compose.prod.yml up -d --build
docker compose -f docker/docker-compose.prod.yml run --rm api bun run --cwd packages/db migrate
```

Minimum VPS for API + Caddy: 1 vCPU, 1 GB RAM. If Postgres also moves to the VPS: 2 vCPU, 4 GB RAM.

## Backups

Nightly `pg_dump --format=custom` to R2 (cron on the VPS); keep 14 days. Test a restore once a month.

## Moving Postgres from Supabase to the VPS

```bash
pg_dump --format=custom --no-owner --no-acl "$SUPABASE_URL" > umkm.dump
pg_restore --no-owner --dbname "$VPS_URL" umkm.dump
# switch DATABASE_URL, restart the API
```

Same Postgres major version on both sides. Only standard extensions (`pg_trgm`, `unaccent`).

## Vercel Hobby limits

Hobby is for non-commercial use. Move to Pro before enabling payments or any commercial traffic.
