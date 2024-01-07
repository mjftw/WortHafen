CREATE TABLE IF NOT EXISTS "auth_client_credentials" (
	"client_id" text PRIMARY KEY NOT NULL,
	"client_secret" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_words" (
	"user_id" text NOT NULL,
	"word_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT "users_words_user_id_word_id_pk" PRIMARY KEY("user_id","word_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "words" (
	"id" text PRIMARY KEY NOT NULL,
	"in_german" text NOT NULL,
	"in_english" text NOT NULL,
	"example_usage" text,
	"added_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP(3)
);
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "created_by_user_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_client_credentials" ADD CONSTRAINT "auth_client_credentials_client_id_auth_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."auth_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_words" ADD CONSTRAINT "users_words_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_words" ADD CONSTRAINT "users_words_word_id_words_id_fk" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "words" ADD CONSTRAINT "words_added_by_user_id_auth_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."auth_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
