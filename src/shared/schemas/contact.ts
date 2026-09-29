import { z } from "zod";

export const contactTopicSchema = z.enum(["solution", "consulting", "education", "global", "other"]);
export const contactInputSchema = z.object({
  requestId: z.string().uuid(),
  locale: z.enum(["ko", "en"]),
  topic: contactTopicSchema,
  area: z.string().trim().max(80).nullable(),
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(120),
  message: z.string().trim().min(10).max(5000),
  privacyAccepted: z.literal(true),
  website: z.string().max(0),
});

export type ContactInput = z.infer<typeof contactInputSchema>;
