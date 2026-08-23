import { asc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { aiSolutionLocales, aiSolutions, businessAreaLocales, businessAreas } from "@/server/db/schema/catalog";
import { assertCompleteLocales } from "@/server/db/integrity";
import { HttpError } from "@/server/http/errors";

type LocalizedArea = { name: string; subtitle: string; description: string; heroAlt?: string };
type LocalizedSolution = { name: string; summary: string; description: string; imageAlt?: string };

function validateLocales(locales: Record<string, LocalizedArea | LocalizedSolution>, fields: string[]) { assertCompleteLocales(Object.keys(locales)); for (const locale of ["ko", "en"] as const) for (const field of fields) if (!String(locales[locale][field as keyof (LocalizedArea | LocalizedSolution)] || "").trim()) throw new HttpError("PUBLICATION_INVALID"); }

export async function listAdminBusinessAreas() {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select({ id: businessAreas.id, publicKey: businessAreas.publicKey, displayOrder: businessAreas.displayOrder, itemStatus: businessAreas.itemStatus }).from(businessAreas).where(eq(businessAreas.itemStatus, "ACTIVE")).orderBy(asc(businessAreas.displayOrder));
}

export async function createBusinessArea(input: { publicKey: string; displayOrder: number; locales: Record<"ko" | "en", LocalizedArea> }, actorId: string) {
  if (!/^[a-z0-9-]+$/.test(input.publicKey)) throw new HttpError("PUBLICATION_INVALID"); validateLocales(input.locales, ["name", "subtitle", "description"]);
  return getDb().transaction(async (tx) => { const [created] = await tx.insert(businessAreas).values({ publicKey: input.publicKey, displayOrder: input.displayOrder, createdByActorId: actorId, updatedByActorId: actorId }).returning({ id: businessAreas.id, version: businessAreas.version }); await tx.insert(businessAreaLocales).values((Object.keys(input.locales) as ("ko" | "en")[]).map((locale) => ({ businessAreaId: created.id, locale, name: input.locales[locale].name, subtitle: input.locales[locale].subtitle, description: input.locales[locale].description, heroAlt: input.locales[locale].heroAlt, updatedByActorId: actorId }))); return created; });
}

export async function createAiSolution(input: { businessAreaId: string; displayOrder: number; locales: Record<"ko" | "en", LocalizedSolution> }, actorId: string) {
  validateLocales(input.locales, ["name", "summary", "description"]);
  return getDb().transaction(async (tx) => { const [created] = await tx.insert(aiSolutions).values({ businessAreaId: input.businessAreaId, displayOrder: input.displayOrder, createdByActorId: actorId, updatedByActorId: actorId }).returning({ id: aiSolutions.id, version: aiSolutions.version }); await tx.insert(aiSolutionLocales).values((Object.keys(input.locales) as ("ko" | "en")[]).map((locale) => ({ aiSolutionId: created.id, locale, name: input.locales[locale].name, summary: input.locales[locale].summary, description: input.locales[locale].description, imageAlt: input.locales[locale].imageAlt, updatedByActorId: actorId }))); return created; });
}
