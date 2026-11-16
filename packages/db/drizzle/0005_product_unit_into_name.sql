-- Products no longer have a unit field: size and packaging belong in the name, like marketplace titles
-- ("Keripik Singkong Balado 250 gr"). Step 1 of 2: keep what was typed by appending it to the name,
-- then empty the column. The column itself is dropped in a later release, after no deployed code reads it.
UPDATE "products"
SET "name" = "name" || ' (' || btrim("unit") || ')'
WHERE "unit" IS NOT NULL
  AND btrim("unit") <> ''
  AND position(lower(btrim("unit")) in lower("name")) = 0;--> statement-breakpoint
UPDATE "products" SET "unit" = NULL WHERE "unit" IS NOT NULL;
