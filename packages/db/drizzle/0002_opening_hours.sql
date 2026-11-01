ALTER TABLE "villages" ADD COLUMN "timezone" text DEFAULT 'Asia/Jakarta' NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "opening_hours" jsonb;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "closed_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "closed_note" text;