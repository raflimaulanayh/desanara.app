-- pg_trgm powers the region search ("baros arjasari"); standard Postgres contrib, portable to any server.
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
ALTER TABLE "regions" ADD COLUMN "full_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "regions" ADD COLUMN "lat" double precision;--> statement-breakpoint
ALTER TABLE "regions" ADD COLUMN "lng" double precision;--> statement-breakpoint
ALTER TABLE "regions" ADD COLUMN "source_version" text;--> statement-breakpoint
ALTER TABLE "regions" ADD COLUMN "retired_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "center_lat" double precision;--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "center_lng" double precision;--> statement-breakpoint
CREATE INDEX "regions_code_prefix_idx" ON "regions" USING btree ("code" text_pattern_ops);--> statement-breakpoint
CREATE INDEX "regions_full_name_trgm_idx" ON "regions" USING gin (lower("full_name") gin_trgm_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "villages_region_code_live_idx" ON "villages" USING btree ("region_code") WHERE "villages"."deleted_at" is null;