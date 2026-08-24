import { getDb } from "@/server/db/client";
import { aiSolutionLocales, aiSolutions } from "@/server/db/schema/catalog";
import { assertCompleteLocales } from "@/server/db/integrity";
import { HttpError } from "@/server/http/errors";

type LocalizedSolution = { name: string; summary: string; description: string; imageAlt?: string };
type LocalizedFields = Record<string, string | undefined>;

function validateLocales<T extends LocalizedFields>(locales: Record<"ko" | "en", T>, fields: string[]) { assertCompleteLocales(Object.keys(locales)); for (const locale of ["ko", "en"] as const) for (const field of fields) if (!String(locales[locale][field] || "").trim()) throw new HttpError("PUBLICATION_INVALID"); }

export async function createAiSolution(input: { businessAreaId: string; displayOrder: number; locales: Record<"ko" | "en", LocalizedSolution> }, actorId: string) {
  validateLocales(input.locales, ["name", "summary", "description"]);
  return getDb().transaction(async (tx) => { const [created] = await tx.insert(aiSolutions).values({ businessAreaId: input.businessAreaId, displayOrder: input.displayOrder, createdByActorId: actorId, updatedByActorId: actorId }).returning({ id: aiSolutions.id, version: aiSolutions.version }); await tx.insert(aiSolutionLocales).values((Object.keys(input.locales) as ("ko" | "en")[]).map((locale) => ({ aiSolutionId: created.id, locale, name: input.locales[locale].name, summary: input.locales[locale].summary, description: input.locales[locale].description, imageAlt: input.locales[locale].imageAlt, updatedByActorId: actorId }))); return created; });
}
