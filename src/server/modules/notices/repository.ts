import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { auditActors } from "@/server/db/schema/audit";
import {
  noticeCategories,
  noticeCategoryLocales,
  noticeLocales,
  notices,
} from "@/server/db/schema/notices";
import {
  assertCompleteLocales,
  assertDraftLocales,
  assertExpectedVersion,
} from "@/server/db/integrity";
import { HttpError } from "@/server/http/errors";
import type { NoticeCommandInput, NoticeLocale, NoticePublicationWindow } from "@/server/modules/notices/contracts";

async function bumpNoticeVersion(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  id: string,
  expectedVersion: number,
  actorId: string,
) {
  const [updated] = await tx
    .update(notices)
    .set({ version: sql`${notices.version} + 1`, updatedAt: new Date(), updatedByActorId: actorId })
    .where(and(eq(notices.id, id), eq(notices.version, expectedVersion)))
    .returning({ id: notices.id, version: notices.version });
  if (!updated) throw new HttpError("VERSION_CONFLICT");
  return updated;
}

function assertNoticeInput(input: NoticeCommandInput) {
  assertCompleteLocales(Object.keys(input.locales));
  assertDraftLocales(input.locales);
  if (input.isPinned && (!input.pinOrder || input.pinOrder < 1)) {
    throw new HttpError("PUBLICATION_INVALID");
  }
  if (!input.isPinned && input.pinOrder != null) {
    throw new HttpError("PUBLICATION_INVALID");
  }
}

export async function createNotice(input: NoticeCommandInput, actorId: string) {
  assertNoticeInput(input);
  return getDb().transaction(async (tx) => {
    const [created] = await tx
      .insert(notices)
      .values({
        categoryId: input.categoryId ?? null,
        displayDate: input.displayDate,
        isPinned: input.isPinned ?? false,
        pinOrder: input.isPinned ? input.pinOrder ?? 1 : null,
        createdByActorId: actorId,
        updatedByActorId: actorId,
      })
      .returning({
        id: notices.id,
        version: notices.version,
        publicNumber: notices.publicNumber,
      });
    await tx.insert(noticeLocales).values(
      (Object.keys(input.locales) as NoticeLocale[]).map((locale) => ({
        noticeId: created.id,
        locale,
        title: input.locales[locale].title,
        bodyMarkdown: input.locales[locale].bodyMarkdown,
        updatedByActorId: actorId,
      })),
    );
    return created;
  });
}

export async function getAdminNotice(id: string) {
  const db = getDb();
  const parent = await db.select().from(notices).where(eq(notices.id, id)).limit(1);
  if (!parent[0]) throw new HttpError("NOT_FOUND");
  const locales = await db.select().from(noticeLocales).where(eq(noticeLocales.noticeId, id));
  return { ...parent[0], locales };
}

export async function saveNotice(id: string, input: NoticeCommandInput, expectedVersion: number, actorId: string) {
  assertNoticeInput(input);
  return getDb().transaction(async (tx) => {
    const current = await tx.query.notices.findFirst({ where: eq(notices.id, id) });
    if (!current) throw new HttpError("NOT_FOUND");
    assertExpectedVersion(current.version, expectedVersion);
    await bumpNoticeVersion(tx, id, expectedVersion, actorId);
    await tx
      .update(notices)
      .set({ categoryId: input.categoryId ?? null, displayDate: input.displayDate, isPinned: input.isPinned ?? false, pinOrder: input.isPinned ? input.pinOrder ?? 1 : null })
      .where(eq(notices.id, id));
    for (const locale of ["ko", "en"] as const) {
      await tx
        .update(noticeLocales)
        .set({ ...input.locales[locale], updatedAt: new Date(), updatedByActorId: actorId })
        .where(and(eq(noticeLocales.noticeId, id), eq(noticeLocales.locale, locale)));
    }
    return { id, version: expectedVersion + 1 };
  });
}

async function assertCategoryLocale(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  categoryId: string | null,
  locale: NoticeLocale,
) {
  if (!categoryId) throw new HttpError("NOTICE_CATEGORY_LOCALE_REQUIRED");
  const category = await tx
    .select({ id: noticeCategoryLocales.id })
    .from(noticeCategoryLocales)
    .innerJoin(noticeCategories, eq(noticeCategories.id, noticeCategoryLocales.categoryId))
    .where(and(eq(noticeCategoryLocales.categoryId, categoryId), eq(noticeCategoryLocales.locale, locale), eq(noticeCategories.isActive, true)))
    .limit(1);
  if (!category[0]) throw new HttpError("NOTICE_CATEGORY_LOCALE_REQUIRED");
}

export async function publishNotice(
  id: string,
  locale: NoticeLocale,
  expectedVersion: number,
  actorId: string,
  window: NoticePublicationWindow = {},
) {
  return getDb().transaction(async (tx) => {
    const parent = await tx.query.notices.findFirst({ where: eq(notices.id, id) });
    const current = await tx.query.noticeLocales.findFirst({ where: and(eq(noticeLocales.noticeId, id), eq(noticeLocales.locale, locale)) });
    if (!parent || !current) throw new HttpError("NOT_FOUND");
    if (!current.title.trim() || !current.bodyMarkdown.trim()) throw new HttpError("PUBLICATION_INVALID");
    await assertCategoryLocale(tx, parent.categoryId, locale);
    await bumpNoticeVersion(tx, id, expectedVersion, actorId);
    const now = new Date();
    const startsAt = window.startsAt ?? now;
    await tx
      .update(noticeLocales)
      .set({
        publicationStatus: startsAt > now ? "SCHEDULED" : "PUBLISHED",
        publishStartsAt: startsAt,
        publishEndsAt: window.endsAt ?? null,
        firstPublishedAt: current.firstPublishedAt ?? now,
        lastPublishedAt: now,
        lastPublishedByActorId: actorId,
        updatedAt: now,
        updatedByActorId: actorId,
      })
      .where(and(eq(noticeLocales.noticeId, id), eq(noticeLocales.locale, locale)));
    return { id, locale, version: expectedVersion + 1 };
  });
}

export async function unpublishNotice(id: string, locale: NoticeLocale, expectedVersion: number, actorId: string) {
  return getDb().transaction(async (tx) => {
    const current = await tx.query.noticeLocales.findFirst({ where: and(eq(noticeLocales.noticeId, id), eq(noticeLocales.locale, locale)) });
    if (!current) throw new HttpError("NOT_FOUND");
    await bumpNoticeVersion(tx, id, expectedVersion, actorId);
    const now = new Date();
    await tx.update(noticeLocales).set({ publicationStatus: "UNPUBLISHED", unpublishedAt: now, unpublishedByActorId: actorId, updatedAt: now, updatedByActorId: actorId }).where(and(eq(noticeLocales.noticeId, id), eq(noticeLocales.locale, locale)));
    return { id, locale, version: expectedVersion + 1 };
  });
}

export async function archiveNotice(id: string, expectedVersion: number, actorId: string) {
  return getDb().transaction(async (tx) => {
    await bumpNoticeVersion(tx, id, expectedVersion, actorId);
    await tx.update(notices).set({ itemStatus: "ARCHIVED", archivedAt: new Date(), archivedByActorId: actorId }).where(eq(notices.id, id));
    return { id, version: expectedVersion + 1 };
  });
}

export async function restoreNotice(id: string, expectedVersion: number, actorId: string) {
  return getDb().transaction(async (tx) => {
    await bumpNoticeVersion(tx, id, expectedVersion, actorId);
    await tx.update(notices).set({ itemStatus: "ACTIVE", archivedAt: null, archivedByActorId: null }).where(eq(notices.id, id));
    await tx
      .update(noticeLocales)
      .set({
        publicationStatus: "DRAFT",
        publishStartsAt: null,
        publishEndsAt: null,
        updatedAt: new Date(),
        updatedByActorId: actorId,
      })
      .where(eq(noticeLocales.noticeId, id));
    return { id, version: expectedVersion + 1 };
  });
}

export async function ensureNoticeAdminActor(adminAccountId: string) {
  const db = getDb();
  const existing = await db.query.auditActors.findFirst({ where: eq(auditActors.adminAccountId, adminAccountId) });
  if (existing) return existing.id;
  const [created] = await db.insert(auditActors).values({ actorType: "ADMIN", adminAccountId, displayName: "관리자" }).returning({ id: auditActors.id });
  return created.id;
}
