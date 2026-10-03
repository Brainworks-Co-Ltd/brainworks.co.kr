import { z } from "zod";
import { expectedVersionSchema } from "@/server/http/validate";

const aiSolutionLocaleSchema = z.object({
  name: z.string(),
  summary: z.string(),
  description: z.string(),
  imageAlt: z.string().nullable().optional(),
});

export const aiSolutionCommandSchema = z.object({
  businessAreaId: z.string(),
  /** 비우면 서버가 영역 안 맨 뒤 순서를 매긴다. */
  displayOrder: z.number().int().optional(),
  imageAssetId: z.string().nullable().optional(),
  locales: z.object({ ko: aiSolutionLocaleSchema, en: aiSolutionLocaleSchema }),
});

export type AiSolutionInput = z.infer<typeof aiSolutionCommandSchema>;

export const aiSolutionSaveSchema = aiSolutionCommandSchema.extend({
  expectedVersion: expectedVersionSchema,
});
