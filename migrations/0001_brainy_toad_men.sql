CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" integer,
	"message" text NOT NULL,
	"user_id" integer NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "country" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "zip_code" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "city" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "state" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "longitude" numeric(10, 7);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
