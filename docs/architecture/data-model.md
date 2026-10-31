# Data model

Source of truth: `packages/db/src/schema/*`. Migrations: `packages/db/drizzle/`. This page explains intent.

```mermaid
erDiagram
  regions ||--o{ regions : parent
  regions ||--o{ villages : located_in
  villages ||--o{ village_members : has
  villages ||--o{ businesses : has
  businesses ||--o{ business_members : has
  businesses ||--o{ products : sells
  categories ||--o{ products : groups
  products ||--o{ product_images : has
  products ||--o{ product_translations : has
  users ||--o{ village_members : is
  users ||--o{ business_members : is
```

## Conventions

- Ids: `uuid` (random) for domain tables; Better Auth tables use text ids.
- `createdAt` / `updatedAt` everywhere; `deletedAt` (soft delete) on villages, businesses, products.
- `isSeed` on rows created by the demo seed; `db:seed:reset` deletes only those.
- Money: `products.price` is an integer in rupiah.
- Status: `record_status` = draft | published | archived. Businesses also have
  `verification_status` = pending | verified | rejected (verified once by the village admin).
- `businesses.consentAt` records UU PDP consent; required before publishing.
- `villages.theme` / `theme_draft` (JSONB) hold per-village branding; shape and rules in
  [village-theming.md](village-theming.md). Always read with `parseVillageTheme()`.
- Translations: Indonesian is the base column; optional rows in `*_translations` (`locale = 'en'`) override it.
  Read with a fallback to the base column.

## Regions

`regions.code` uses Kemendagri codes: `32` → `32.04` → `32.04.10` → `32.04.10.2001`.
The seed includes Jawa Barat and its 27 regencies/cities. District and village levels must be imported from the
official dataset (never invented); villages can reference any level until then.

## Planned (not in the schema yet)

- Search: `pg_trgm` + `unaccent` indexes on product/business names (migration with the search feature).
- Payments (phase 3): `orders`, `order_items`, `payments` with idempotency keys and webhook log.
