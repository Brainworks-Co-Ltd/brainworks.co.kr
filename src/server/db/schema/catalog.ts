import { integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { assets } from "@/server/db/schema/assets";
import {
  localeContentColumns,
  managedContentColumns,
} from "@/server/db/schema/common";

export const businessAreas = pgTable(
  "business_areas",
  {
    ...managedContentColumns(),
    publicKey: text("public_key").notNull(),
    displayOrder: integer("display_order").notNull(),
    heroAssetId: uuid("hero_asset_id").references(() => assets.id),
  },
  (table) => [
    uniqueIndex("business_areas_public_key_uk").on(table.publicKey),
    uniqueIndex("business_areas_order_uk").on(table.displayOrder),
  ],
);

export const businessAreaLocales = pgTable(
  "business_area_locales",
  {
    ...localeContentColumns(),
    businessAreaId: uuid("business_area_id")
      .notNull()
      .references(() => businessAreas.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    subtitle: text("subtitle").notNull(),
    description: text("description").notNull(),
    heroAlt: text("hero_alt"),
  },
  (table) => [
    uniqueIndex("business_area_locales_area_locale_uk").on(
      table.businessAreaId,
      table.locale,
    ),
  ],
);

export const aiSolutions = pgTable(
  "ai_solutions",
  {
    ...managedContentColumns(),
    businessAreaId: uuid("business_area_id")
      .notNull()
      .references(() => businessAreas.id, { onDelete: "restrict" }),
    displayOrder: integer("display_order").notNull(),
    imageAssetId: uuid("image_asset_id").references(() => assets.id),
  },
  (table) => [
    uniqueIndex("ai_solutions_area_order_uk").on(
      table.businessAreaId,
      table.displayOrder,
    ),
  ],
);

export const aiSolutionLocales = pgTable(
  "ai_solution_locales",
  {
    ...localeContentColumns(),
    aiSolutionId: uuid("ai_solution_id")
      .notNull()
      .references(() => aiSolutions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    imageAlt: text("image_alt"),
  },
  (table) => [
    uniqueIndex("ai_solution_locales_solution_locale_uk").on(
      table.aiSolutionId,
      table.locale,
    ),
  ],
);
