ALTER TABLE "classes" DROP CONSTRAINT "classes_booked_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN IF EXISTS "is_booked";--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN IF EXISTS "booked_by";