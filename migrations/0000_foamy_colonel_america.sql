CREATE TABLE IF NOT EXISTS "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"phone_number" text NOT NULL,
	"description" text,
	"hours" text,
	"email" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"duration" integer NOT NULL,
	"price" integer NOT NULL,
	"instructor" text NOT NULL,
	"location" text NOT NULL,
	"start_date" text NOT NULL,
	"time" text NOT NULL,
	"capacity" integer NOT NULL,
	"slots_left" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "classes" ADD CONSTRAINT "classes_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_email_idx" ON "businesses" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_idx" ON "users" USING btree ("email");