ALTER TABLE "notifications" ALTER COLUMN "class_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "business_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
