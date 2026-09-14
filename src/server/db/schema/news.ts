import {
  date,
  integer,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { assets } from "@/server/db/schema/assets";
import {
  localeContentColumns,
  managedContentColumns,
} from "@/server/db/schema/common";
import { auditActors } from "@/server/db/schema/audit";

export const newsBodyFormatEnum = pgEnum("news_body_format", ["MARKDOWN_V1"]);

export const news = pgTable(
  "news",
  {
    ...managedContentColumns(),
    category: text("category").notNull(),
    displayDate: date("display_date").notNull(),
    bodyFormat: newsBodyFormatEnum("body_format")
      .notNull()
      .default("MARKDOWN_V1"),
    coverAssetId: uuid("cover_asset_id").references(() => assets.id),
  },
  (table) => [
    index("news_publication_idx").on(table.itemStatus, table.displayDate),
  ],
);

export const newsLocales = pgTable(
  "news_locales",
  {
    ...localeContentColumns(),
    newsId: uuid("news_id")
      .notNull()
      .references(() => news.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    bodyMarkdown: text("body_markdown").notNull(),
    coverAlt: text("cover_alt"),
  },
  (table) => [
    uniqueIndex("news_locales_news_locale_uk").on(table.newsId, table.locale),
    index("news_locales_publication_idx").on(
      table.locale,
      table.publicationStatus,
      table.title,
    ),
  ],
);

export const newsSlugs = pgTable(
  "news_slugs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    newsId: uuid("news_id")
      .notNull()
      .references(() => news.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    isCurrent: boolean("is_current").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdByActorId: uuid("created_by_actor_id")
      .notNull()
      .references(() => auditActors.id),
  },
  (table) => [
    uniqueIndex("news_slugs_slug_uk").on(table.slug),
    uniqueIndex("news_slugs_current_news_uk")
      .on(table.newsId)
      .where(sql`${table.isCurrent} = true`),
  ],
);

export const newsExternalLinks = pgTable(
  "news_external_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    newsLocaleId: uuid("news_locale_id")
      .notNull()
      .references(() => newsLocales.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    displayOrder: integer("display_order").notNull(),
  },
  (table) => [
    uniqueIndex("news_external_links_order_uk").on(
      table.newsLocaleId,
      table.displayOrder,
    ),
  ],
);

export const newsBodyAssetRefs = pgTable(
  "news_body_asset_refs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    newsLocaleId: uuid("news_locale_id")
      .notNull()
      .references(() => newsLocales.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "restrict" }),
    occurrenceCount: integer("occurrence_count").notNull().default(1),
  },
  (table) => [
    uniqueIndex("news_body_asset_refs_locale_asset_uk").on(
      table.newsLocaleId,
      table.assetId,
    ),
  ],
);
