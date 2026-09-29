import {
  bigint,
  check,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { auditActors } from "@/server/db/schema/audit";

export const assetTypeEnum = pgEnum("asset_type", [
  "IMAGE",
  "DOCUMENT",
  "VIDEO",
]);
export const assetStatusEnum = pgEnum("asset_status", [
  "QUARANTINED",
  "SCANNING",
  "READY",
  "REJECTED",
]);

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetType: assetTypeEnum("asset_type").notNull(),
    status: assetStatusEnum("status").notNull().default("QUARANTINED"),
    storageKey: text("storage_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    declaredMime: text("declared_mime"),
    detectedMime: text("detected_mime"),
    bytes: bigint("bytes", { mode: "number" }).notNull(),
    width: integer("width"),
    height: integer("height"),
    checksum: text("checksum").notNull(),
    inspectionResult: jsonb("inspection_result"),
    retryErrorCode: text("retry_error_code"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdByActorId: uuid("created_by_actor_id")
      .notNull()
      .references(() => auditActors.id),
  },
  (table) => [
    uniqueIndex("assets_storage_key_uk").on(table.storageKey),
    uniqueIndex("assets_checksum_uk").on(table.checksum),
    check("assets_bytes_positive_ck", sql`${table.bytes} > 0`),
  ],
);
