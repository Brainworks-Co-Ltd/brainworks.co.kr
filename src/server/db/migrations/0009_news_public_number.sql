ALTER TABLE "news" ADD COLUMN "public_number" integer;--> statement-breakpoint
WITH "numbered_news" AS (
	SELECT
		"id",
		row_number() OVER (ORDER BY "display_date", "created_at", "id")::integer AS "public_number"
	FROM "news"
)
UPDATE "news"
SET "public_number" = "numbered_news"."public_number"
FROM "numbered_news"
WHERE "news"."id" = "numbered_news"."id";--> statement-breakpoint
ALTER TABLE "news" ALTER COLUMN "public_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "news" ALTER COLUMN "public_number" ADD GENERATED ALWAYS AS IDENTITY (sequence name "news_public_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
SELECT setval(
	pg_get_serial_sequence('news', 'public_number'),
	COALESCE((SELECT MAX("public_number") FROM "news"), 0) + 1,
	false
);--> statement-breakpoint
CREATE UNIQUE INDEX "news_public_number_uk" ON "news" USING btree ("public_number");
