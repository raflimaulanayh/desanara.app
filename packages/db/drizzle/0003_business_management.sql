CREATE TYPE "public"."consent_method" AS ENUM('paper_form', 'in_app');--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "verification_note" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "consent_recorded_by" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "consent_method" "consent_method";--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "taken_down_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "taken_down_by" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "takedown_reason" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_consent_recorded_by_users_id_fk" FOREIGN KEY ("consent_recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_taken_down_by_users_id_fk" FOREIGN KEY ("taken_down_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;