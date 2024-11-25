CREATE TABLE IF NOT EXISTS "trade_offer" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"user_id" varchar(21),
	"quantity" integer NOT NULL,
	"item_type" text NOT NULL,
	"latitude" text,
	"longitude" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"accepted_by" varchar(21)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trade_offer" ADD CONSTRAINT "trade_offer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trade_offer" ADD CONSTRAINT "trade_offer_accepted_by_user_id_fk" FOREIGN KEY ("accepted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
