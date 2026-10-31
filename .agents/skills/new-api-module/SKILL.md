---
name: new-api-module
description: Add a new API module (resource) to apps/api following the routes → service → repository pattern, with OpenAPI, permissions, tests, and docs.
---

# New API module

Reference implementation: `apps/api/src/modules/villages/`.

1. Scaffold: `bun run generate` → "api-module" (or copy the villages folder). Files:
   `<name>.schema.ts` (zod-openapi response schemas), `<name>.repository.ts` (Drizzle only),
   `<name>.service.ts` (rules + `assertCan`), `<name>.routes.ts` (`createRoute` + handlers), `<name>.test.ts`.
2. Input validation: reuse or add schemas in `packages/validators` (shared with the dashboard and mobile).
3. Authorization: every mutation and private read calls `assertCan(c.get('actor'), '<action>', resource)` in the
   **service**, with `villageId`/`businessId` taken from the database row. New action? Add it to
   `packages/auth/src/permissions.ts` + tests first.
4. Tenant scoping + soft delete in every repository query (`docs/architecture/multi-tenancy.md`).
5. Mutations write `audit_logs` in the same transaction.
6. Mount in `apps/api/src/app.ts` by **extending the chain** (`.route('/v1/<name>', <name>Routes)`) so RPC types work.
7. Tests with `app.request()`: 401 without session, 403 for another village, 422 for bad input, 200 happy path.
8. Update `docs/architecture/*` if the contract is new, `docs/product/features-mvp.md`, and `docs/CHANGELOG.md`.
9. `bun run check:all`.

Use Context7 for Hono / zod-openapi / Drizzle APIs instead of memory.
