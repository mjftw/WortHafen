CREATE TABLE IF NOT EXISTS "auth_authorization_tokens" (
	"code" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
DROP TABLE "auth_client_credentials";--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD COLUMN "authorization_token" text;--> statement-breakpoint
ALTER TABLE "auth_accounts" DROP COLUMN IF EXISTS "access_token";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_authorization_tokens" ADD CONSTRAINT "auth_authorization_tokens_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
