ALTER TABLE "products" ADD COLUMN "compare_at_price" integer;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_price_non_negative" CHECK ("products"."price" >= 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_compare_at_price_above_price" CHECK ("products"."compare_at_price" is null or "products"."compare_at_price" > "products"."price");