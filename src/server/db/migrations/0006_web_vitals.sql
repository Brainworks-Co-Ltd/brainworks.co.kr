CREATE TABLE "web_vitals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"value" double precision NOT NULL,
	"rating" text,
	"navigation_type" text,
	"route" text NOT NULL,
	"locale" text NOT NULL,
	"build_id" text NOT NULL,
	"device" text NOT NULL,
	"connection" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "web_vitals_created_at_idx" ON "web_vitals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "web_vitals_name_created_at_idx" ON "web_vitals" USING btree ("name","created_at");