import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const contactReceiptStatusEnum = pgEnum("contact_receipt_status", [
  "RECEIVED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "EXPIRED",
]);

export const contactSubmissionReceipts = pgTable(
  "contact_submission_receipts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestIdHash: text("request_id_hash").notNull().unique(),
    processingStatus: contactReceiptStatusEnum("processing_status")
      .notNull()
      .default("RECEIVED"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
);
