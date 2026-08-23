CREATE TYPE "public"."notice_publication_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'UNPUBLISHED');--> statement-breakpoint
CREATE TABLE "notice_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notice_locale_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"display_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notice_categories" (
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
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notice_category_locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notice_locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notice_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"publication_status" "notice_publication_status" DEFAULT 'DRAFT' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL,
	"publish_starts_at" timestamp with time zone,
	"publish_ends_at" timestamp with time zone,
	"first_published_at" timestamp with time zone,
	"last_published_at" timestamp with time zone,
	"last_published_by_actor_id" uuid,
	"unpublished_at" timestamp with time zone,
	"unpublished_by_actor_id" uuid,
	"title" text NOT NULL,
	"body_markdown" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notice_slugs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notice_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_actor_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notices" (
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
	"category_id" uuid,
	"display_date" date NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"pin_order" integer,
	CONSTRAINT "notices_pin_order_ck" CHECK (("notices"."is_pinned" = false AND "notices"."pin_order" IS NULL) OR ("notices"."is_pinned" = true AND "notices"."pin_order" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "popup_notice_locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"popup_notice_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"publication_status" "notice_publication_status" DEFAULT 'DRAFT' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by_actor_id" uuid NOT NULL,
	"publish_starts_at" timestamp with time zone,
	"publish_ends_at" timestamp with time zone,
	"first_published_at" timestamp with time zone,
	"last_published_at" timestamp with time zone,
	"last_published_by_actor_id" uuid,
	"unpublished_at" timestamp with time zone,
	"unpublished_by_actor_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"body_markdown" text,
	"image_asset_id" uuid,
	"image_alt" text
);
--> statement-breakpoint
CREATE TABLE "popup_notices" (
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
	"notice_id" uuid,
	"dismissal_revision" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notice_attachments" ADD CONSTRAINT "notice_attachments_notice_locale_id_notice_locales_id_fk" FOREIGN KEY ("notice_locale_id") REFERENCES "public"."notice_locales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_attachments" ADD CONSTRAINT "notice_attachments_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_categories" ADD CONSTRAINT "notice_categories_created_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("created_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_categories" ADD CONSTRAINT "notice_categories_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_categories" ADD CONSTRAINT "notice_categories_archived_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("archived_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_category_locales" ADD CONSTRAINT "notice_category_locales_category_id_notice_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."notice_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_category_locales" ADD CONSTRAINT "notice_category_locales_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_locales" ADD CONSTRAINT "notice_locales_notice_id_notices_id_fk" FOREIGN KEY ("notice_id") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_locales" ADD CONSTRAINT "notice_locales_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_locales" ADD CONSTRAINT "notice_locales_last_published_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("last_published_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_locales" ADD CONSTRAINT "notice_locales_unpublished_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("unpublished_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_slugs" ADD CONSTRAINT "notice_slugs_notice_id_notices_id_fk" FOREIGN KEY ("notice_id") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notice_slugs" ADD CONSTRAINT "notice_slugs_created_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("created_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_created_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("created_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_archived_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("archived_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_category_id_notice_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."notice_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_notice_locales" ADD CONSTRAINT "popup_notice_locales_popup_notice_id_popup_notices_id_fk" FOREIGN KEY ("popup_notice_id") REFERENCES "public"."popup_notices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_notice_locales" ADD CONSTRAINT "popup_notice_locales_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_notice_locales" ADD CONSTRAINT "popup_notice_locales_last_published_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("last_published_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_notice_locales" ADD CONSTRAINT "popup_notice_locales_unpublished_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("unpublished_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_notice_locales" ADD CONSTRAINT "popup_notice_locales_image_asset_id_assets_id_fk" FOREIGN KEY ("image_asset_id") REFERENCES "public"."assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_notices" ADD CONSTRAINT "popup_notices_created_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("created_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_notices" ADD CONSTRAINT "popup_notices_updated_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("updated_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_notices" ADD CONSTRAINT "popup_notices_archived_by_actor_id_audit_actors_id_fk" FOREIGN KEY ("archived_by_actor_id") REFERENCES "public"."audit_actors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popup_notices" ADD CONSTRAINT "popup_notices_notice_id_notices_id_fk" FOREIGN KEY ("notice_id") REFERENCES "public"."notices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "notice_attachments_locale_order_uk" ON "notice_attachments" USING btree ("notice_locale_id","display_order");--> statement-breakpoint
CREATE INDEX "notice_categories_order_idx" ON "notice_categories" USING btree ("is_active","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "notice_category_locales_category_locale_uk" ON "notice_category_locales" USING btree ("category_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "notice_locales_notice_locale_uk" ON "notice_locales" USING btree ("notice_id","locale");--> statement-breakpoint
CREATE INDEX "notice_locales_publication_idx" ON "notice_locales" USING btree ("locale","publication_status","title");--> statement-breakpoint
CREATE UNIQUE INDEX "notice_slugs_slug_uk" ON "notice_slugs" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "notice_slugs_current_notice_uk" ON "notice_slugs" USING btree ("notice_id") WHERE "notice_slugs"."is_current" = true;--> statement-breakpoint
CREATE INDEX "notices_publication_idx" ON "notices" USING btree ("item_status","is_pinned","display_date");--> statement-breakpoint
CREATE INDEX "notices_category_idx" ON "notices" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "popup_notice_locales_popup_locale_uk" ON "popup_notice_locales" USING btree ("popup_notice_id","locale");--> statement-breakpoint
CREATE INDEX "popup_notice_locales_publication_idx" ON "popup_notice_locales" USING btree ("locale","publication_status","display_order");