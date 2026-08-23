import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { honorLocales, honors } from "@/server/db/schema/honors";
import { assertCompleteLocales, assertExpectedVersion } from "@/server/db/integrity";
import { HttpError } from "@/server/http/errors";
import type { HonorType } from "@/server/modules/honors/types";

export type HonorInput = { honorType: HonorType; occurredYear: number; occurredOn?: string | null; displayOrder: number; imageAssetId?: string | null; locales: { ko: { title: string; organization: string; description: string; imageAlt?: string }; en: { title: string; organization: string; description: string; imageAlt?: string } } };

async function bump(tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0], id: string, expectedVersion: number, actorId: string) {
  const [updated] = await tx.update(honors).set({ version: sql`${honors.version} + 1`, updatedAt: new Date(), updatedByActorId: actorId }).where(and(eq(honors.id, id), eq(honors.version, expectedVersion))).returning({ id: honors.id, version: honors.version });
  if (!updated) throw new HttpError("VERSION_CONFLICT");
  return updated;
}

function validate(input: HonorInput) { assertCompleteLocales(Object.keys(input.locales)); if (!Number.isInteger(input.occurredYear) || input.occurredYear < 1) throw new HttpError("PUBLICATION_INVALID"); for (const locale of ["ko", "en"] as const) { const value = input.locales[locale]; if (!value.title.trim() || !value.organization.trim() || !value.description.trim()) throw new HttpError("PUBLICATION_INVALID"); } }

export async function listAdminHonors() {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select().from(honors).where(eq(honors.itemStatus, "ACTIVE")).orderBy(honors.honorType, honors.displayOrder);
}

export async function createHonor(input: HonorInput, actorId: string) {
  validate(input);
  return getDb().transaction(async (tx) => { const [created] = await tx.insert(honors).values({ honorType: input.honorType, occurredYear: input.occurredYear, occurredOn: input.occurredOn ?? null, displayOrder: input.displayOrder, imageAssetId: input.imageAssetId ?? null, createdByActorId: actorId, updatedByActorId: actorId }).returning({ id: honors.id, version: honors.version }); await tx.insert(honorLocales).values((Object.keys(input.locales) as ("ko" | "en")[]).map((locale) => ({ honorId: created.id, locale, title: input.locales[locale].title, organization: input.locales[locale].organization, description: input.locales[locale].description, imageAlt: input.locales[locale].imageAlt, updatedByActorId: actorId }))); return created; });
}

export async function publishHonor(id: string, locale: "ko" | "en", expectedVersion: number, actorId: string) {
  return getDb().transaction(async (tx) => { const current = await tx.query.honorLocales.findFirst({ where: and(eq(honorLocales.honorId, id), eq(honorLocales.locale, locale)) }); if (!current || !current.title.trim() || !current.organization.trim() || !current.description.trim()) throw new HttpError("PUBLICATION_INVALID"); await bump(tx, id, expectedVersion, actorId); const now = new Date(); await tx.update(honorLocales).set({ publicationStatus: "PUBLISHED", firstPublishedAt: current.firstPublishedAt ?? now, lastPublishedAt: now, lastPublishedByActorId: actorId, updatedAt: now, updatedByActorId: actorId }).where(and(eq(honorLocales.honorId, id), eq(honorLocales.locale, locale))); return { id, locale, version: expectedVersion + 1 }; });
}
