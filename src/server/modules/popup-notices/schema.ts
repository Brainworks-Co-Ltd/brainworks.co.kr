import { z } from "zod";
import {
  expectedVersionSchema,
  localeCommandSchema,
} from "@/server/http/validate";

const popupLocaleSchema = z.object({
  title: z.string(),
  bodyMarkdown: z.string().nullable().optional(),
  imageAssetId: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),
  displayOrder: z.number().int().optional(),
});

export const popupCommandSchema = z.object({
  noticeId: z.string().nullable().optional(),
  locales: z.object({ ko: popupLocaleSchema, en: popupLocaleSchema }),
});

export const popupSaveSchema = popupCommandSchema.extend({
  expectedVersion: expectedVersionSchema,
});

export const popupReorderCommandSchema = localeCommandSchema.extend({
  displayOrder: z.number().int(),
});
