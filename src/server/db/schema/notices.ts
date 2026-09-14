import {
  boolean,
  check,
  date,
  integer,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { assets } from "@/server/db/schema/assets";
import { auditActors } from "@/server/db/schema/audit";
import { localeEnum, managedContentColumns } from "@/server/db/schema/common";

export const noticePublicationStatusEnum = pgEnum("notice_publication_status", [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "UNPUBLISHED",
]);

export const noticeCategories = pgTable(
  "notice_categories",
  {
    ...managedContentColumns(),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: integer("display_order").notNull().default(0),
  },
  (table) => [index("notice_categories_order_idx").on(table.isActive, table.displayOrder)],
);

export const noticeCategoryLocales = pgTable(
  "notice_category_locales",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => noticeCategories.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedByActorId: uuid("updated_by_actor_id").notNull().references(() => auditActors.id),
  },
  (table) => [uniqueIndex("notice_category_locales_category_locale_uk").on(table.categoryId, table.locale)],
);

export const notices = pgTable(
  "notices",
  {
    ...managedContentColumns(),
    publicNumber: integer("public_number")
      .notNull()
      .generatedAlwaysAsIdentity(),
    categoryId: uuid("category_id").references(() => noticeCategories.id, { onDelete: "restrict" }),
    displayDate: date("display_date").notNull(),
    isPinned: boolean("is_pinned").notNull().default(false),
    pinOrder: integer("pin_order"),
  },
  (table) => [
    uniqueIndex("notices_public_number_uk").on(table.publicNumber),
    index("notices_publication_idx").on(table.itemStatus, table.isPinned, table.displayDate),
    index("notices_category_idx").on(table.categoryId),
    check(
      "notices_pin_order_ck",
      sql`(${table.isPinned} = false AND ${table.pinOrder} IS NULL) OR (${table.isPinned} = true AND ${table.pinOrder} IS NOT NULL)`,
    ),
  ],
);

export const noticeLocales = pgTable(
  "notice_locales",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    noticeId: uuid("notice_id").notNull().references(() => notices.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    publicationStatus: noticePublicationStatusEnum("publication_status").notNull().default("DRAFT"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedByActorId: uuid("updated_by_actor_id").notNull().references(() => auditActors.id),
    publishStartsAt: timestamp("publish_starts_at", { withTimezone: true }),
    publishEndsAt: timestamp("publish_ends_at", { withTimezone: true }),
    firstPublishedAt: timestamp("first_published_at", { withTimezone: true }),
    lastPublishedAt: timestamp("last_published_at", { withTimezone: true }),
    lastPublishedByActorId: uuid("last_published_by_actor_id").references(() => auditActors.id),
    unpublishedAt: timestamp("unpublished_at", { withTimezone: true }),
    unpublishedByActorId: uuid("unpublished_by_actor_id").references(() => auditActors.id),
    title: text("title").notNull(),
    bodyMarkdown: text("body_markdown").notNull(),
  },
  (table) => [
    uniqueIndex("notice_locales_notice_locale_uk").on(table.noticeId, table.locale),
    index("notice_locales_publication_idx").on(table.locale, table.publicationStatus, table.title),
  ],
);

export const noticeSlugs = pgTable(
  "notice_slugs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    noticeId: uuid("notice_id").notNull().references(() => notices.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    isCurrent: boolean("is_current").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdByActorId: uuid("created_by_actor_id").notNull().references(() => auditActors.id),
  },
  (table) => [
    uniqueIndex("notice_slugs_slug_uk").on(table.slug),
    uniqueIndex("notice_slugs_current_notice_uk").on(table.noticeId).where(sql`${table.isCurrent} = true`),
  ],
);

export const noticeAttachments = pgTable(
  "notice_attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    noticeLocaleId: uuid("notice_locale_id").notNull().references(() => noticeLocales.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id").notNull().references(() => assets.id, { onDelete: "restrict" }),
    displayName: text("display_name").notNull(),
    displayOrder: integer("display_order").notNull(),
  },
  (table) => [uniqueIndex("notice_attachments_locale_order_uk").on(table.noticeLocaleId, table.displayOrder)],
);
