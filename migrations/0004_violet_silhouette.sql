ALTER TABLE "notifications" DROP CONSTRAINT "notifications_business_id_businesses_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "business_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "photo" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
