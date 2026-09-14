import { integer, pgEnum, timestamp, uuid } from "drizzle-orm/pg-core";
import { auditActors } from "@/server/db/schema/audit";

export const itemStatusEnum = pgEnum("item_status", ["ACTIVE", "ARCHIVED"]);
export const localeEnum = pgEnum("locale", ["ko", "en"]);
export const publicationStatusEnum = pgEnum("publication_status", [
  "DRAFT",
  "PUBLISHED",
  "HIDDEN",
]);

export function managedContentColumns() {
  return {
    id: uuid("id").defaultRandom().primaryKey(),
    schemaVersion: integer("schema_version").notNull().default(1),
    itemStatus: itemStatusEnum("item_status").notNull().default("ACTIVE"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdByActorId: uuid("created_by_actor_id")
      .notNull()
      .references(() => auditActors.id),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedByActorId: uuid("updated_by_actor_id")
      .notNull()
      .references(() => auditActors.id),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedByActorId: uuid("archived_by_actor_id").references(
      () => auditActors.id,
    ),
  };
}

export function localeContentColumns() {
  return {
    id: uuid("id").defaultRandom().primaryKey(),
    locale: localeEnum("locale").notNull(),
    publicationStatus: publicationStatusEnum("publication_status")
      .notNull()
      .default("DRAFT"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedByActorId: uuid("updated_by_actor_id")
      .notNull()
      .references(() => auditActors.id),
    firstPublishedAt: timestamp("first_published_at", { withTimezone: true }),
    lastPublishedAt: timestamp("last_published_at", { withTimezone: true }),
    lastPublishedByActorId: uuid("last_published_by_actor_id").references(
      () => auditActors.id,
    ),
    hiddenAt: timestamp("hidden_at", { withTimezone: true }),
    hiddenByActorId: uuid("hidden_by_actor_id").references(
      () => auditActors.id,
    ),
  };
}
