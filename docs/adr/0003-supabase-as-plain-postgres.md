# 0003 — Supabase only as plain Postgres

- Status: Accepted (2026-11-01)

## Context

The database should be managed (students rotate yearly, data loss is unrecoverable) but may later move to the
campus VPS. Supabase is convenient, yet its extra features create lock-in.

## Decision

Use Supabase purely as a Postgres host. Authentication = Better Auth, storage = Cloudflare R2.
Drizzle migrations in `packages/db/drizzle` are the only way to change the schema.

## Rules

- Do not use Supabase Auth, Storage, Realtime, Edge Functions, pg_graphql, or policies using `auth.uid()`.
- Do not edit tables in the Supabase dashboard or through the Supabase MCP server (it is configured read-only).
- Only standard extensions (`pg_trgm`, `unaccent`, `pgcrypto`).
- Connect with `prepare: false` (works with Supabase's transaction pooler and plain Postgres).

## Consequences

- Moving to the VPS is `pg_dump` → `pg_restore` → change `DATABASE_URL` (see `docs/architecture/deployment.md`).
- Free tier: projects pause after inactivity and have no automatic backups → nightly `pg_dump` to R2;
  consider Supabase Pro after the seminar.

## Alternatives

- Neon — equally valid plain Postgres host; switching costs only a connection string.
- Postgres on the campus VPS from day one — cheapest, but backups/security become our job before we are ready.
