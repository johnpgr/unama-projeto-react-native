CREATE TYPE "public"."user_type" AS ENUM('normal', 'cooperative', 'admin');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_account" (
	"user_id" varchar(21) NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	CONSTRAINT "oauth_account_provider_provider_user_id_pk" PRIMARY KEY("provider","provider_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" text,
	"email_verified" timestamp with time zone,
	"image_url" text,
	"user_type" "user_type" DEFAULT 'normal' NOT NULL,
	"total_points" integer DEFAULT 1000 NOT NULL,
	"can_redeem_rewards" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "p2p_transaction" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"from" varchar NOT NULL,
	"to" varchar NOT NULL,
	"points" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recycling_transaction" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"weight" integer NOT NULL,
	"points" integer NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rewards" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"reward" varchar,
	"points" integer NOT NULL,
	"description" text,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_rewards" (
	"id" varchar(21) NOT NULL,
	"reward_id" varchar(21) NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_account" ADD CONSTRAINT "oauth_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "p2p_transaction" ADD CONSTRAINT "p2p_transaction_from_user_id_fk" FOREIGN KEY ("from") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "p2p_transaction" ADD CONSTRAINT "p2p_transaction_to_user_id_fk" FOREIGN KEY ("to") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recycling_transaction" ADD CONSTRAINT "recycling_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_reward_id_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
