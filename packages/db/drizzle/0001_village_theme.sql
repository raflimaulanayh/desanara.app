ALTER TABLE "villages" ADD COLUMN "theme" jsonb;--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "theme_draft" jsonb;--> statement-breakpoint
ALTER TABLE "villages" ADD COLUMN "theme_published_at" timestamp with time zone;