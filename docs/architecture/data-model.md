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
- Money: `products.price` is an integer in rupiah. `0` means free ("Gratis"); otherwise at least Rp100
  (validator, catches typos). `products.compareAtPrice` (nullable) is the normal price shown struck through
  for a discount or a free promo; a check constraint keeps it above `price`, and a non-negative check guards
  `price`. There is no separate `is_free` column (one source of truth); the API derives `isFree`.
- Product slugs are generated from the name by the API, unique platform-wide; a taken name gets the business
  name appended, then `-2`, `-3` … (`keripik-singkong` → `keripik-singkong-keripik-bu-ani`). The village of a
  product is always its business's village. Variants (size, flavour) are separate products in the MVP.
- Status: `record_status` = draft | published | archived. Businesses also have
  `verification_status` = pending | verified | rejected (verified once by the village admin).
- `businesses.consentAt` records UU PDP consent; required before publishing. `consentMethod`
  (`paper_form` | `in_app`) and `consentRecordedBy` say how it was obtained and by whom, so consent can be
  proven later. Staff record `paper_form` from the signed form; the owner confirms `in_app` at hand-over.
- `businesses.verificationNote` holds the reason of the last review decision.
- `businesses.takenDownAt` / `takenDownBy` / `takedownReason`: a village admin's takedown. Public queries
  exclude taken-down businesses (`publicBusiness` in `apps/api/src/lib/visibility.ts`).
- Business slugs are generated from the name by the API (`toSlug()` in `@repo/validators`, `-2`, `-3` … on
  duplicates) and only village admins may change them (it breaks shared links).
- `villages.theme` / `theme_draft` (JSONB) hold per-village branding; shape and rules in
- `businesses.openingHours` (JSONB, `OpeningHours` in `@repo/validators`), `closedUntil`, `closedNote` drive the
  open/closed status, computed with `computeOpenStatus()` in the village time zone (`villages.timezone`,
  default `Asia/Jakarta`). No schedule = no status shown.
  [village-theming.md](village-theming.md). Always read with `parseVillageTheme()`.
- Translations: Indonesian is the base column; optional rows in `*_translations` (`locale = 'en'`) override it.
  Read with a fallback to the base column.

## Regions

`regions.code` uses Kemendagri codes: `32` → `32.04` → `32.04.10` → `32.04.10.2001`.
The seed includes Jawa Barat and its 27 regencies/cities. District and village levels must be imported from the
official dataset (never invented); villages can reference any level until then.

## Personal data on public pages

`businesses.address` (and the RT/RW and map pin planned next) is often the owner's home. Public API responses and
pages never include it: a business's public location stops at its village and the village's region, the way
marketplaces show only the seller's city. These fields exist for the village team in the dashboard.

## Planned (not in the schema yet)

- Search: `pg_trgm` + `unaccent` indexes on product/business names (migration with the search feature).
- Payments (phase 3): `orders`, `order_items`, `payments` with idempotency keys and webhook log.
