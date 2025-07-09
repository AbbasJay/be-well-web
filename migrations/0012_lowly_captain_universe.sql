CREATE TABLE IF NOT EXISTS "class_review_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "photo" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "class_review_likes" ADD CONSTRAINT "class_review_likes_review_id_class_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."class_reviews"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "class_review_likes" ADD CONSTRAINT "class_review_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
