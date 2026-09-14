ALTER TABLE "notices" ADD COLUMN "public_number" integer;--> statement-breakpoint
WITH "numbered_notices" AS (
	SELECT
		"id",
		row_number() OVER (ORDER BY "created_at", "id")::integer AS "public_number"
	FROM "notices"
)
UPDATE "notices"
SET "public_number" = "numbered_notices"."public_number"
FROM "numbered_notices"
WHERE "notices"."id" = "numbered_notices"."id";--> statement-breakpoint
ALTER TABLE "notices" ALTER COLUMN "public_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notices" ALTER COLUMN "public_number" ADD GENERATED ALWAYS AS IDENTITY (sequence name "notices_public_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
SELECT setval(
	pg_get_serial_sequence('notices', 'public_number'),
	COALESCE((SELECT MAX("public_number") FROM "notices"), 0) + 1,
	false
);--> statement-breakpoint
CREATE UNIQUE INDEX "notices_public_number_uk" ON "notices" USING btree ("public_number");
