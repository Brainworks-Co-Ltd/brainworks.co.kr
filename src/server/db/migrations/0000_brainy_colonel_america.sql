CREATE TYPE "public"."asset_status" AS ENUM('QUARANTINED', 'SCANNING', 'READY', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('IMAGE', 'DOCUMENT', 'VIDEO');--> statement-breakpoint
CREATE TYPE "public"."actor_type" AS ENUM('ADMIN', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."item_status" AS ENUM('ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('ko', 'en');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('DRAFT', 'PUBLISHED', 'HIDDEN');--> statement-breakpoint
CREATE TYPE "public"."contact_receipt_status" AS ENUM('RECEIVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."honor_type" AS ENUM('AWARD', 'CERTIFICATION');--> statement-breakpoint
CREATE TYPE "public"."news_body_format" AS ENUM('MARKDOWN_V1');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"status" "asset_status" DEFAULT 'QUARANTINED' NOT NULL,
	"storage_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"declared_mime" text,
	"detected_mime" text,
	"bytes" bigint NOT NULL,
	"width" integer,
	"height" integer,
	"checksum" text NOT NULL,
	"inspection_result" jsonb,
	"retry_error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_actor_id" uuid NOT NULL,
	CONSTRAINT "assets_bytes_positive_ck" CHECK ("assets"."bytes" > 0)
);
--> statement-breakpoint
CREATE TABLE "audit_actors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_type" "actor_type" NOT NULL,
	"admin_account_id" text,
	"system_key" text,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_actors_owner_ck" CHECK (("audit_actors"."actor_type" = 'ADMIN' AND "audit_actors"."admin_account_id" IS NOT NULL AND "audit_actors"."system_key" IS NULL) OR ("audit_actors"."actor_type" = 'SYSTEM' AND "audit_actors"."admin_account_id" IS NULL AND "audit_actors"."system_key" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "admin_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'ADMIN' NOT NULL,
	"account_status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"last_request" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_solution_locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" "locale" NOT NULL,
	"publication_status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL,
	"first_published_at" timestamp with time zone,
	"last_published_at" timestamp with time zone,
	"last_published_by_actor_id" uuid,
	"hidden_at" timestamp with time zone,
	"hidden_by_actor_id" uuid,
	"ai_solution_id" uuid NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"image_alt" text
);
--> statement-breakpoint
CREATE TABLE "ai_solutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"item_status" "item_status" DEFAULT 'ACTIVE' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_actor_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL,
	"archived_at" timestamp with time zone,
	"archived_by_actor_id" uuid,
	"business_area_id" uuid NOT NULL,
	"display_order" integer NOT NULL,
	"image_asset_id" uuid
);
--> statement-breakpoint
CREATE TABLE "business_area_locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" "locale" NOT NULL,
	"publication_status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL,
	"first_published_at" timestamp with time zone,
	"last_published_at" timestamp with time zone,
	"last_published_by_actor_id" uuid,
	"hidden_at" timestamp with time zone,
	"hidden_by_actor_id" uuid,
	"business_area_id" uuid NOT NULL,
	"name" text NOT NULL,
	"subtitle" text NOT NULL,
	"description" text NOT NULL,
	"hero_alt" text
);
--> statement-breakpoint
CREATE TABLE "business_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"item_status" "item_status" DEFAULT 'ACTIVE' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_actor_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL,
	"archived_at" timestamp with time zone,
	"archived_by_actor_id" uuid,
	"public_key" text NOT NULL,
	"display_order" integer NOT NULL,
	"hero_asset_id" uuid
);
--> statement-breakpoint
CREATE TABLE "contact_submission_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id_hash" text NOT NULL,
	"processing_status" "contact_receipt_status" DEFAULT 'RECEIVED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "contact_submission_receipts_request_id_hash_unique" UNIQUE("request_id_hash")
);
--> statement-breakpoint
CREATE TABLE "honor_locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" "locale" NOT NULL,
	"publication_status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL,
	"first_published_at" timestamp with time zone,
	"last_published_at" timestamp with time zone,
	"last_published_by_actor_id" uuid,
	"hidden_at" timestamp with time zone,
	"hidden_by_actor_id" uuid,
	"honor_id" uuid NOT NULL,
	"title" text NOT NULL,
	"organization" text NOT NULL,
	"description" text NOT NULL,
	"image_alt" text
);
--> statement-breakpoint
CREATE TABLE "honors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"item_status" "item_status" DEFAULT 'ACTIVE' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_actor_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL,
	"archived_at" timestamp with time zone,
	"archived_by_actor_id" uuid,
	"honor_type" "honor_type" NOT NULL,
	"occurred_year" integer NOT NULL,
	"occurred_on" date,
	"display_order" integer NOT NULL,
	"image_asset_id" uuid,
	CONSTRAINT "honors_year_positive_ck" CHECK ("honors"."occurred_year" > 0)
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"item_status" "item_status" DEFAULT 'ACTIVE' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_actor_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL,
	"archived_at" timestamp with time zone,
	"archived_by_actor_id" uuid,
	"category" text NOT NULL,
	"display_date" date NOT NULL,
	"body_format" "news_body_format" DEFAULT 'MARKDOWN_V1' NOT NULL,
	"cover_asset_id" uuid
);
--> statement-breakpoint
CREATE TABLE "news_body_asset_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"news_locale_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"occurrence_count" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_external_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"news_locale_id" uuid NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"display_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" "locale" NOT NULL,
	"publication_status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL,
	"first_published_at" timestamp with time zone,
	"last_published_at" timestamp with time zone,
	"last_published_by_actor_id" uuid,
	"hidden_at" timestamp with time zone,
	"hidden_by_actor_id" uuid,
	"news_id" uuid NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"body_markdown" text NOT NULL,
	"cover_alt" text
);
--> statement-breakpoint
CREATE TABLE "news_slugs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"news_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_actor_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_created_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("created_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_actors" ADD CONSTRAINT "audit_actors_admin_account_id_admin_accounts_id_fk" FOREIGN KEY ("admin_account_id") REFERENCES "public"."admin_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_admin_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_solution_locales" ADD CONSTRAINT "ai_solution_locales_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_solution_locales" ADD CONSTRAINT "ai_solution_locales_last_published_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("last_published_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_solution_locales" ADD CONSTRAINT "ai_solution_locales_hidden_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("hidden_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_solution_locales" ADD CONSTRAINT "ai_solution_locales_ai_solution_id_ai_solutions_id_fk" FOREIGN KEY ("ai_solution_id") REFERENCES "public"."ai_solutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_solutions" ADD CONSTRAINT "ai_solutions_created_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("created_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_solutions" ADD CONSTRAINT "ai_solutions_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_solutions" ADD CONSTRAINT "ai_solutions_archived_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("archived_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_solutions" ADD CONSTRAINT "ai_solutions_business_area_id_business_areas_id_fk" FOREIGN KEY ("business_area_id") REFERENCES "public"."business_areas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_solutions" ADD CONSTRAINT "ai_solutions_image_asset_id_assets_id_fk" FOREIGN KEY ("image_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_area_locales" ADD CONSTRAINT "business_area_locales_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_area_locales" ADD CONSTRAINT "business_area_locales_last_published_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("last_published_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_area_locales" ADD CONSTRAINT "business_area_locales_hidden_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("hidden_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_area_locales" ADD CONSTRAINT "business_area_locales_business_area_id_business_areas_id_fk" FOREIGN KEY ("business_area_id") REFERENCES "public"."business_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_areas" ADD CONSTRAINT "business_areas_created_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("created_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_areas" ADD CONSTRAINT "business_areas_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_areas" ADD CONSTRAINT "business_areas_archived_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("archived_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_areas" ADD CONSTRAINT "business_areas_hero_asset_id_assets_id_fk" FOREIGN KEY ("hero_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honor_locales" ADD CONSTRAINT "honor_locales_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honor_locales" ADD CONSTRAINT "honor_locales_last_published_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("last_published_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honor_locales" ADD CONSTRAINT "honor_locales_hidden_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("hidden_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honor_locales" ADD CONSTRAINT "honor_locales_honor_id_honors_id_fk" FOREIGN KEY ("honor_id") REFERENCES "public"."honors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honors" ADD CONSTRAINT "honors_created_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("created_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honors" ADD CONSTRAINT "honors_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honors" ADD CONSTRAINT "honors_archived_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("archived_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honors" ADD CONSTRAINT "honors_image_asset_id_assets_id_fk" FOREIGN KEY ("image_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_created_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("created_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_archived_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("archived_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_cover_asset_id_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_body_asset_refs" ADD CONSTRAINT "news_body_asset_refs_news_locale_id_news_locales_id_fk" FOREIGN KEY ("news_locale_id") REFERENCES "public"."news_locales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_body_asset_refs" ADD CONSTRAINT "news_body_asset_refs_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_external_links" ADD CONSTRAINT "news_external_links_news_locale_id_news_locales_id_fk" FOREIGN KEY ("news_locale_id") REFERENCES "public"."news_locales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_locales" ADD CONSTRAINT "news_locales_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_locales" ADD CONSTRAINT "news_locales_last_published_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("last_published_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_locales" ADD CONSTRAINT "news_locales_hidden_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("hidden_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_locales" ADD CONSTRAINT "news_locales_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_slugs" ADD CONSTRAINT "news_slugs_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_slugs" ADD CONSTRAINT "news_slugs_created_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("created_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assets_storage_key_uk" ON "assets" USING btree ("storage_key");--> statement-breakpoint
CREATE UNIQUE INDEX "assets_checksum_uk" ON "assets" USING btree ("checksum");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_accounts_email_uk" ON "admin_accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "admin_accounts_status_idx" ON "admin_accounts" USING btree ("account_status");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_sessions_token_uk" ON "admin_sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "admin_sessions_user_idx" ON "admin_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_accounts_provider_account_uk" ON "auth_accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "auth_accounts_user_idx" ON "auth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_rate_limits_key_uk" ON "auth_rate_limits" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_verifications_identifier_value_uk" ON "auth_verifications" USING btree ("identifier","value");--> statement-breakpoint
CREATE INDEX "auth_verifications_expires_idx" ON "auth_verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_solution_locales_solution_locale_uk" ON "ai_solution_locales" USING btree ("ai_solution_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_solutions_area_order_uk" ON "ai_solutions" USING btree ("business_area_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "business_area_locales_area_locale_uk" ON "business_area_locales" USING btree ("business_area_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "business_areas_public_key_uk" ON "business_areas" USING btree ("public_key");--> statement-breakpoint
CREATE UNIQUE INDEX "business_areas_order_uk" ON "business_areas" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "honor_locales_honor_locale_uk" ON "honor_locales" USING btree ("honor_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "honors_type_order_uk" ON "honors" USING btree ("honor_type","display_order");--> statement-breakpoint
CREATE INDEX "news_publication_idx" ON "news" USING btree ("item_status","display_date");--> statement-breakpoint
CREATE UNIQUE INDEX "news_body_asset_refs_locale_asset_uk" ON "news_body_asset_refs" USING btree ("news_locale_id","asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "news_external_links_order_uk" ON "news_external_links" USING btree ("news_locale_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "news_locales_news_locale_uk" ON "news_locales" USING btree ("news_id","locale");--> statement-breakpoint
CREATE INDEX "news_locales_publication_idx" ON "news_locales" USING btree ("locale","publication_status","title");--> statement-breakpoint
CREATE UNIQUE INDEX "news_slugs_slug_uk" ON "news_slugs" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "news_slugs_current_news_uk" ON "news_slugs" USING btree ("news_id") WHERE "news_slugs"."is_current" = true;