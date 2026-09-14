import { z } from "zod";
import { HttpError } from "@/server/http/errors";

const databaseEnvironmentSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (value) =>
        value.startsWith("postgres://") || value.startsWith("postgresql://"),
      "PostgreSQL URL이어야 합니다.",
    ),
});

export function getDatabaseUrl(environment: NodeJS.ProcessEnv = process.env) {
  const result = databaseEnvironmentSchema.safeParse(environment);
  if (!result.success) {
    throw new HttpError("DEPENDENCY_UNAVAILABLE");
  }
  return result.data.DATABASE_URL;
}
