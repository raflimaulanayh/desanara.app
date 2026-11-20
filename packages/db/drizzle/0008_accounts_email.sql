CREATE TABLE "rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limits_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "invitee_name" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "invitee_email" text;--> statement-breakpoint
CREATE INDEX "invitations_created_by_created_at_index" ON "invitations" USING btree ("created_by","created_at");