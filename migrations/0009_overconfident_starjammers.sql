ALTER TABLE "classes" ADD COLUMN "is_booked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "booked_by" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "classes" ADD CONSTRAINT "classes_booked_by_users_id_fk" FOREIGN KEY ("booked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
