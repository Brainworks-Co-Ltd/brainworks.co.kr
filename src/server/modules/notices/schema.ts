import { z } from "zod";
import {
  dateOnlySchema,
  expectedVersionSchema,
  versionCommandSchema,
} from "@/server/http/validate";

const noticeLocaleSchema = z.object({
  title: z.string(),
  bodyMarkdown: z.string(),
});

export const noticeCommandSchema = z.object({
  categoryId: z.string().nullable().optional(),
  displayDate: dateOnlySchema,
  isPinned: z.boolean().optional(),
  pinOrder: z.number().int().nullable().optional(),
  locales: z.object({ ko: noticeLocaleSchema, en: noticeLocaleSchema }),
});

export const noticeSaveSchema = noticeCommandSchema.extend({
  expectedVersion: expectedVersionSchema,
});

const noticeCategoryNameSchema = z
  .string()
  .trim()
  .min(1, "카테고리 이름을 입력해 주세요.");

export const noticeCategoryCommandSchema = z.object({
  displayOrder: z.number().int().optional(),
  locales: z.object({
    ko: z.object({ name: noticeCategoryNameSchema }),
    en: z.object({ name: noticeCategoryNameSchema }),
  }),
});

export const noticeCategorySaveSchema = noticeCategoryCommandSchema.extend({
  expectedVersion: expectedVersionSchema,
});

export const noticeCategoryActiveSchema = versionCommandSchema.extend({
  isActive: z.boolean(),
});
