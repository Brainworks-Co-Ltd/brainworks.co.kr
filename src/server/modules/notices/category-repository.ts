import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { noticeCategories, noticeCategoryLocales } from "@/server/db/schema/notices";
import { assertCompleteLocales, assertExpectedVersion } from "@/server/db/integrity";
import { HttpError } from "@/server/http/errors";
import type { NoticeLocale } from "@/server/modules/notices/contracts";

type CategoryInput = { displayOrder?: number; locales: Record<NoticeLocale, { name: string }> };

async function bump(tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0], id: string, expectedVersion: number, actorId: string) {
  const [updated] = await tx.update(noticeCategories).set({ version: sql`${noticeCategories.version} + 1`, updatedAt: new Date(), updatedByActorId: actorId }).where(and(eq(noticeCategories.id, id), eq(noticeCategories.version, expectedVersion))).returning({ id: noticeCategories.id, version: noticeCategories.version });
  if (!updated) throw new HttpError("VERSION_CONFLICT");
  return updated;
}

function validate(input: CategoryInput) { assertCompleteLocales(Object.keys(input.locales)); for (const locale of ["ko", "en"] as const) if (!input.locales[locale].name.trim()) throw new HttpError("PUBLICATION_INVALID"); }

export async function listAdminNoticeCategories() {
  if (!process.env.DATABASE_URL) return [];
  const rows = await getDb().select({ id: noticeCategories.id, version: noticeCategories.version, isActive: noticeCategories.isActive, displayOrder: noticeCategories.displayOrder, locale: noticeCategoryLocales.locale, name: noticeCategoryLocales.name }).from(noticeCategories).innerJoin(noticeCategoryLocales, eq(noticeCategoryLocales.categoryId, noticeCategories.id)).where(eq(noticeCategories.itemStatus, "ACTIVE")).orderBy(asc(noticeCategories.displayOrder));
  return rows;
}

export async function createNoticeCategory(input: CategoryInput, actorId: string) {
  validate(input);
  return getDb().transaction(async (tx) => {
    const [created] = await tx.insert(noticeCategories).values({ displayOrder: input.displayOrder ?? 0, createdByActorId: actorId, updatedByActorId: actorId }).returning({ id: noticeCategories.id, version: noticeCategories.version });
    await tx.insert(noticeCategoryLocales).values((Object.keys(input.locales) as NoticeLocale[]).map((locale) => ({ categoryId: created.id, locale, name: input.locales[locale].name, updatedByActorId: actorId })));
    return created;
  });
}

export async function setNoticeCategoryActive(id: string, isActive: boolean, expectedVersion: number, actorId: string) {
  return getDb().transaction(async (tx) => { await bump(tx, id, expectedVersion, actorId); await tx.update(noticeCategories).set({ isActive }).where(eq(noticeCategories.id, id)); return { id, isActive, version: expectedVersion + 1 }; });
}
