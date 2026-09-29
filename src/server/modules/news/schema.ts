import { z } from "zod";
import {
  dateOnlySchema,
  expectedVersionSchema,
  versionCommandSchema,
} from "@/server/http/validate";

/** 초안 저장은 빈 제목을 허용하므로 형태만 본다. 필수값 검사는 integrity 정책이 맡는다. */
const newsLocaleSchema = z.object({
  title: z.string(),
  summary: z.string(),
  bodyMarkdown: z.string(),
  coverAlt: z.string().nullable().optional(),
});

export const newsCommandSchema = z.object({
  slug: z.string(),
  category: z.string().min(1),
  displayDate: dateOnlySchema,
  locales: z.object({ ko: newsLocaleSchema, en: newsLocaleSchema }),
});

export type NewsCommandInput = z.infer<typeof newsCommandSchema>;

export const newsSaveSchema = versionCommandSchema.extend({
  input: newsCommandSchema,
});

export const newsSlugCommandSchema = z.object({
  expectedVersion: expectedVersionSchema,
  slug: z.string(),
});
