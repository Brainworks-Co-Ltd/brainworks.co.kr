import { z } from "zod";
import { dateOnlySchema, expectedVersionSchema } from "@/server/http/validate";

const honorLocaleSchema = z.object({
  title: z.string(),
  organization: z.string(),
  description: z.string(),
  imageAlt: z.string().nullable().optional(),
});

export const honorCommandSchema = z.object({
  honorType: z.enum(["AWARD", "CERTIFICATION"]),
  occurredYear: z.number().int(),
  occurredOn: dateOnlySchema.nullable().optional(),
  displayOrder: z.number().int(),
  imageAssetId: z.string().nullable().optional(),
  locales: z.object({ ko: honorLocaleSchema, en: honorLocaleSchema }),
});

export type HonorInput = z.infer<typeof honorCommandSchema>;

export const honorSaveSchema = honorCommandSchema.extend({
  expectedVersion: expectedVersionSchema,
});
