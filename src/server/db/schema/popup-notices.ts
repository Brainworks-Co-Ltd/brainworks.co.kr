import {
  integer,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { assets } from "@/server/db/schema/assets";
import { auditActors } from "@/server/db/schema/audit";
import { localeEnum, managedContentColumns } from "@/server/db/schema/common";
import { noticePublicationStatusEnum, notices } from "@/server/db/schema/notices";

export const popupNotices = pgTable(
  "popup_notices",
  {
    ...managedContentColumns(),
    noticeId: uuid("notice_id").references(() => notices.id, { onDelete: "set null" }),
    dismissalRevision: integer("dismissal_revision").notNull().default(1),
  },
);

export const popupNoticeLocales = pgTable(
  "popup_notice_locales",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    popupNoticeId: uuid("popup_notice_id").notNull().references(() => popupNotices.id, { onDelete: "cascade" }),
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
    displayOrder: integer("display_order").notNull().default(0),
    title: text("title").notNull(),
    bodyMarkdown: text("body_markdown"),
    imageAssetId: uuid("image_asset_id").references(() => assets.id, { onDelete: "restrict" }),
    imageAlt: text("image_alt"),
  },
  (table) => [
    uniqueIndex("popup_notice_locales_popup_locale_uk").on(table.popupNoticeId, table.locale),
    index("popup_notice_locales_publication_idx").on(table.locale, table.publicationStatus, table.displayOrder),
  ],
);
