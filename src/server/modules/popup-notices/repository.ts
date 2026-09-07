import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import { popupNoticeLocales, popupNotices } from "@/server/db/schema/popup-notices";
import {
  assertCompleteLocales,
  assertDraftLocales,
  assertExpectedVersion,
} from "@/server/db/integrity";
import { HttpError } from "@/server/http/errors";
import { validatePopupLocale } from "@/server/modules/notices/domain";
import { resolvePublicAssetUrl } from "@/server/modules/assets/public-url";
import { assertPopupOverlapLimit } from "@/server/modules/popup-notices/domain";
import type { PopupCommandInput, PopupLocale, PopupPublicationWindow } from "@/server/modules/popup-notices/contracts";

async function bumpPopupVersion(tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0], id: string, expectedVersion: number, actorId: string) {
  const [updated] = await tx.update(popupNotices).set({ version: sql`${popupNotices.version} + 1`, updatedAt: new Date(), updatedByActorId: actorId }).where(and(eq(popupNotices.id, id), eq(popupNotices.version, expectedVersion))).returning({ id: popupNotices.id, version: popupNotices.version });
  if (!updated) throw new HttpError("VERSION_CONFLICT");
  return updated;
}

function assertPopupInput(input: PopupCommandInput) {
  assertCompleteLocales(Object.keys(input.locales));
  assertDraftLocales(input.locales);
}

export async function createPopupNotice(input: PopupCommandInput, actorId: string) {
  assertPopupInput(input);
  return getDb().transaction(async (tx) => {
    const [created] = await tx.insert(popupNotices).values({ noticeId: input.noticeId ?? null, createdByActorId: actorId, updatedByActorId: actorId }).returning({ id: popupNotices.id, version: popupNotices.version });
    await tx.insert(popupNoticeLocales).values((Object.keys(input.locales) as PopupLocale[]).map((locale) => ({ popupNoticeId: created.id, locale, title: input.locales[locale].title, bodyMarkdown: input.locales[locale].bodyMarkdown ?? null, imageAssetId: input.locales[locale].imageAssetId ?? null, imageAlt: input.locales[locale].imageAlt ?? null, displayOrder: input.locales[locale].displayOrder ?? 0, updatedByActorId: actorId })));
    return created;
  });
}

export async function getAdminPopupNotice(id: string) {
  const parent = await getDb().select().from(popupNotices).where(eq(popupNotices.id, id)).limit(1);
  if (!parent[0]) throw new HttpError("NOT_FOUND");
  const rows = await getDb()
    .select({
      id: popupNoticeLocales.id,
      locale: popupNoticeLocales.locale,
      publicationStatus: popupNoticeLocales.publicationStatus,
      publishStartsAt: popupNoticeLocales.publishStartsAt,
      publishEndsAt: popupNoticeLocales.publishEndsAt,
      displayOrder: popupNoticeLocales.displayOrder,
      title: popupNoticeLocales.title,
      bodyMarkdown: popupNoticeLocales.bodyMarkdown,
      imageAssetId: popupNoticeLocales.imageAssetId,
      imageAlt: popupNoticeLocales.imageAlt,
      assetStatus: assets.status,
      storageKey: assets.storageKey,
    })
    .from(popupNoticeLocales)
    .leftJoin(assets, eq(assets.id, popupNoticeLocales.imageAssetId))
    .where(eq(popupNoticeLocales.popupNoticeId, id));
  const locales = rows.map(({ assetStatus, storageKey, ...locale }) => ({
    ...locale,
    imageUrl:
      assetStatus === "READY" && storageKey
        ? resolvePublicAssetUrl(storageKey)
        : null,
  }));
  return { ...parent[0], locales };
}

export async function savePopupNotice(id: string, input: PopupCommandInput, expectedVersion: number, actorId: string) {
  assertPopupInput(input);
  return getDb().transaction(async (tx) => {
    const current = await tx.query.popupNotices.findFirst({ where: eq(popupNotices.id, id) });
    if (!current) throw new HttpError("NOT_FOUND");
    assertExpectedVersion(current.version, expectedVersion);
    await bumpPopupVersion(tx, id, expectedVersion, actorId);
    await tx.update(popupNotices).set({ noticeId: input.noticeId ?? null }).where(eq(popupNotices.id, id));
    for (const locale of ["ko", "en"] as const) {
      await tx.update(popupNoticeLocales).set({ ...input.locales[locale], bodyMarkdown: input.locales[locale].bodyMarkdown ?? null, imageAssetId: input.locales[locale].imageAssetId ?? null, imageAlt: input.locales[locale].imageAlt ?? null, updatedAt: new Date(), updatedByActorId: actorId }).where(and(eq(popupNoticeLocales.popupNoticeId, id), eq(popupNoticeLocales.locale, locale)));
    }
    return { id, version: expectedVersion + 1 };
  });
}

export async function publishPopupNotice(id: string, locale: PopupLocale, expectedVersion: number, actorId: string, window: PopupPublicationWindow = {}) {
  return getDb().transaction(async (tx) => {
    const current = await tx.query.popupNoticeLocales.findFirst({ where: and(eq(popupNoticeLocales.popupNoticeId, id), eq(popupNoticeLocales.locale, locale)) });
    if (!current) throw new HttpError("NOT_FOUND");
    const result = validatePopupLocale(current);
    if (!result.valid) throw new HttpError(result.code);
    const now = new Date();
    const startsAt = window.startsAt ?? now;
    const endsAt = window.endsAt ?? null;
    if (
      Number.isNaN(startsAt.getTime()) ||
      (endsAt &&
        (Number.isNaN(endsAt.getTime()) || endsAt.getTime() <= startsAt.getTime()))
    ) {
      throw new HttpError("PUBLICATION_INVALID", "게시 기간을 확인해 주세요.");
    }
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`popup-notices:${locale}`}))`,
    );
    const publishedIntervals = await tx
      .select({
        startsAt: popupNoticeLocales.publishStartsAt,
        endsAt: popupNoticeLocales.publishEndsAt,
      })
      .from(popupNoticeLocales)
      .innerJoin(
        popupNotices,
        eq(popupNotices.id, popupNoticeLocales.popupNoticeId),
      )
      .where(
        and(
          eq(popupNoticeLocales.locale, locale),
          inArray(popupNoticeLocales.publicationStatus, [
            "SCHEDULED",
            "PUBLISHED",
          ]),
          eq(popupNotices.itemStatus, "ACTIVE"),
          ne(popupNoticeLocales.popupNoticeId, id),
        ),
      );
    assertPopupOverlapLimit([
      ...publishedIntervals.map((interval) => ({
        startsAt: interval.startsAt ?? new Date(0),
        endsAt: interval.endsAt,
      })),
      { startsAt, endsAt },
    ]);
    await bumpPopupVersion(tx, id, expectedVersion, actorId);
    await tx.update(popupNoticeLocales).set({ publicationStatus: startsAt > now ? "SCHEDULED" : "PUBLISHED", publishStartsAt: startsAt, publishEndsAt: window.endsAt ?? null, firstPublishedAt: current.firstPublishedAt ?? now, lastPublishedAt: now, lastPublishedByActorId: actorId, updatedAt: now, updatedByActorId: actorId }).where(and(eq(popupNoticeLocales.popupNoticeId, id), eq(popupNoticeLocales.locale, locale)));
    return { id, locale, version: expectedVersion + 1 };
  });
}

export async function unpublishPopupNotice(id: string, locale: PopupLocale, expectedVersion: number, actorId: string) {
  return getDb().transaction(async (tx) => {
    const current = await tx.query.popupNoticeLocales.findFirst({ where: and(eq(popupNoticeLocales.popupNoticeId, id), eq(popupNoticeLocales.locale, locale)) });
    if (!current) throw new HttpError("NOT_FOUND");
    await bumpPopupVersion(tx, id, expectedVersion, actorId);
    await tx.update(popupNoticeLocales).set({ publicationStatus: "UNPUBLISHED", unpublishedAt: new Date(), unpublishedByActorId: actorId, updatedAt: new Date(), updatedByActorId: actorId }).where(and(eq(popupNoticeLocales.popupNoticeId, id), eq(popupNoticeLocales.locale, locale)));
    return { id, locale, version: expectedVersion + 1 };
  });
}

export async function archivePopupNotice(id: string, expectedVersion: number, actorId: string) {
  return getDb().transaction(async (tx) => {
    await bumpPopupVersion(tx, id, expectedVersion, actorId);
    await tx.update(popupNotices).set({ itemStatus: "ARCHIVED", archivedAt: new Date(), archivedByActorId: actorId }).where(eq(popupNotices.id, id));
    return { id, version: expectedVersion + 1 };
  });
}

export async function restorePopupNotice(id: string, expectedVersion: number, actorId: string) {
  return getDb().transaction(async (tx) => {
    await bumpPopupVersion(tx, id, expectedVersion, actorId);
    await tx.update(popupNotices).set({ itemStatus: "ACTIVE", archivedAt: null, archivedByActorId: null }).where(eq(popupNotices.id, id));
    await tx
      .update(popupNoticeLocales)
      .set({
        publicationStatus: "DRAFT",
        publishStartsAt: null,
        publishEndsAt: null,
        updatedAt: new Date(),
        updatedByActorId: actorId,
      })
      .where(eq(popupNoticeLocales.popupNoticeId, id));
    return { id, version: expectedVersion + 1 };
  });
}

export async function renotifyPopupNotice(id: string, expectedVersion: number, actorId: string) {
  return getDb().transaction(async (tx) => {
    const current = await tx.query.popupNotices.findFirst({ where: eq(popupNotices.id, id) });
    if (!current) throw new HttpError("NOT_FOUND");
    await bumpPopupVersion(tx, id, expectedVersion, actorId);
    await tx.update(popupNotices).set({ dismissalRevision: sql`${popupNotices.dismissalRevision} + 1` }).where(eq(popupNotices.id, id));
    return { id, dismissalRevision: current.dismissalRevision + 1, version: expectedVersion + 1 };
  });
}

export async function reorderPopupNotices(id: string, locale: PopupLocale, displayOrder: number, expectedVersion: number, actorId: string) {
  return getDb().transaction(async (tx) => {
    await bumpPopupVersion(tx, id, expectedVersion, actorId);
    await tx.update(popupNoticeLocales).set({ displayOrder, updatedAt: new Date(), updatedByActorId: actorId }).where(and(eq(popupNoticeLocales.popupNoticeId, id), eq(popupNoticeLocales.locale, locale)));
    return { id, locale, displayOrder, version: expectedVersion + 1 };
  });
}
