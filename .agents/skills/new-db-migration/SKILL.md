---
name: new-db-migration
description: Change the database schema safely with Drizzle (packages/db) and keep the database portable from Supabase to plain Postgres.
---

# New database migration

1. Edit `packages/db/src/schema/*.ts` (+ `relations.ts`, + export in `schema/index.ts` for new files).
   Conventions: `timestamps`, `softDelete`, `seedFlag` helpers from `_shared.ts`; tenant tables get `villageId`;
   money is integer rupiah; enums in `enums.ts`.
2. `bun run db:generate` and read the generated SQL in `packages/db/drizzle/`. Never edit an applied migration;
   create a new one instead.
3. Destructive change (drop/rename column)? Do it in two releases (add new → backfill → remove old) and describe the
   rollback in the plan.
4. `bun run db:migrate` locally, then `bun run db:seed` to confirm the seed still works; update seed data if needed.
5. Forbidden (ADR 0003): Supabase-only features, `auth.uid()`, editing tables in the Supabase dashboard or via MCP.
   Allowed extensions: `pg_trgm`, `unaccent`, `pgcrypto` (create them in a migration).
6. Update `docs/architecture/data-model.md` and `docs/CHANGELOG.md` (mention that a migration is required).
