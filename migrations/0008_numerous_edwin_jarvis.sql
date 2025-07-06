ALTER TABLE "notifications" ADD COLUMN "class_type_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_class_type_id_classes_id_fk" FOREIGN KEY ("class_type_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
