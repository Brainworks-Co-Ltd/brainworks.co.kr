ALTER TABLE "web_vitals" ADD COLUMN "metric_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "web_vitals_metric_id_idx" ON "web_vitals" USING btree ("metric_id");