import {
  check,
  integer,
  pgEnum,
  pgTable,
  date,
  uniqueIndex,
  uuid,
  text,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { assets } from "@/server/db/schema/assets";
import {
  localeContentColumns,
  managedContentColumns,
} from "@/server/db/schema/common";

export const honorTypeEnum = pgEnum("honor_type", ["AWARD", "CERTIFICATION"]);

export const honors = pgTable(
  "honors",
  {
    ...managedContentColumns(),
    honorType: honorTypeEnum("honor_type").notNull(),
    occurredYear: integer("occurred_year").notNull(),
    occurredOn: date("occurred_on"),
    displayOrder: integer("display_order").notNull(),
    imageAssetId: uuid("image_asset_id").references(() => assets.id),
  },
  (table) => [
    uniqueIndex("honors_type_order_uk").on(table.honorType, table.displayOrder),
    check("honors_year_positive_ck", sql`${table.occurredYear} > 0`),
  ],
);

export const honorLocales = pgTable(
  "honor_locales",
  {
    ...localeContentColumns(),
    honorId: uuid("honor_id")
      .notNull()
      .references(() => honors.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    organization: text("organization").notNull(),
    description: text("description").notNull(),
    imageAlt: text("image_alt"),
  },
  (table) => [
    uniqueIndex("honor_locales_honor_locale_uk").on(
      table.honorId,
      table.locale,
    ),
  ],
);
