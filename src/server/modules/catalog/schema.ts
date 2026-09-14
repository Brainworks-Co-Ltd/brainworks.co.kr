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
  displayOrder: z.number().int(),
  imageAssetId: z.string().nullable().optional(),
  locales: z.object({ ko: aiSolutionLocaleSchema, en: aiSolutionLocaleSchema }),
});

export type AiSolutionInput = z.infer<typeof aiSolutionCommandSchema>;

export const aiSolutionSaveSchema = aiSolutionCommandSchema.extend({
  expectedVersion: expectedVersionSchema,
});
