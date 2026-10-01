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
import { assertPublicationWindow, validatePopupLocale } from "@/server/modules/notices/domain";
import { resolvePublicAssetUrl } from "@/server/modules/assets/public-url";
import { assertPopupOverlapLimit } from "@/server/modules/popup-notices/domain";
import type { PopupCommandInput, PopupLocale, PopupPublicationWindow } from "@/server/modules/popup-notices/contracts";

type Transaction = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

/** 같은 언어로 겹쳐 노출되는 팝업이 3개를 넘지 않게 막는다. 게시와 저장이 같이 쓴다. */
async function assertPopupWindowCapacity(
  tx: Transaction,
  popupId: string,
  locale: PopupLocale,
  startsAt: Date,
  endsAt: Date | null,
) {
  await tx.execute(
    sql`select pg_advisory_xact_lock(hashtext(${`popup-notices:${locale}`}))`,
  );
  const publishedIntervals = await tx
    .select({
      startsAt: popupNoticeLocales.publishStartsAt,
      endsAt: popupNoticeLocales.publishEndsAt,
    })
    .from(popupNoticeLocales)
    .innerJoin(popupNotices, eq(popupNotices.id, popupNoticeLocales.popupNoticeId))
    .where(
      and(
        eq(popupNoticeLocales.locale, locale),
        inArray(popupNoticeLocales.publicationStatus, ["SCHEDULED", "PUBLISHED"]),
        eq(popupNotices.itemStatus, "ACTIVE"),
        ne(popupNoticeLocales.popupNoticeId, popupId),
      ),
    );
  assertPopupOverlapLimit([
    ...publishedIntervals.map((interval) => ({
      startsAt: interval.startsAt ?? new Date(0),
      endsAt: interval.endsAt,
    })),
    { startsAt, endsAt },
  ]);
}

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
    const storedLocales = await tx.select().from(popupNoticeLocales).where(eq(popupNoticeLocales.popupNoticeId, id));
    await bumpPopupVersion(tx, id, expectedVersion, actorId);
    await tx.update(popupNotices).set({ noticeId: input.noticeId ?? null }).where(eq(popupNotices.id, id));
    const now = new Date();
    for (const locale of ["ko", "en"] as const) {
      const localeInput = input.locales[locale];
      const stored = storedLocales.find((row) => row.locale === locale);
      // 기간 키가 빠진 요청은 저장된 기간을 그대로 둔다.
      const startsAt = localeInput.publishStartsAt !== undefined ? localeInput.publishStartsAt : (stored?.publishStartsAt ?? null);
      const endsAt = localeInput.publishEndsAt !== undefined ? localeInput.publishEndsAt : (stored?.publishEndsAt ?? null);
      assertPublicationWindow(startsAt, endsAt);
      // 이미 예약이나 게시 중인 언어는 상태를 다시 정하고 동시 노출 3개 제한을 다시 검사한다.
      const isPublished = stored?.publicationStatus === "SCHEDULED" || stored?.publicationStatus === "PUBLISHED";
      if (isPublished && current.itemStatus === "ACTIVE") {
        await assertPopupWindowCapacity(tx, id, locale, startsAt ?? now, endsAt);
      }
      await tx
        .update(popupNoticeLocales)
        .set({
          ...localeInput,
          bodyMarkdown: localeInput.bodyMarkdown ?? null,
          imageAssetId: localeInput.imageAssetId ?? null,
          imageAlt: localeInput.imageAlt ?? null,
          publicationStatus: isPublished ? (startsAt && startsAt > now ? "SCHEDULED" : "PUBLISHED") : undefined,
          updatedAt: now,
          updatedByActorId: actorId,
        })
        .where(and(eq(popupNoticeLocales.popupNoticeId, id), eq(popupNoticeLocales.locale, locale)));
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
    // 게시 요청은 기간을 따로 받지 않는다. 인자가 없으면 저장된 기간을 쓰고, 시작이 비면 지금 게시한다.
    const startsAt = (window.startsAt !== undefined ? window.startsAt : current.publishStartsAt) ?? now;
    const endsAt = window.endsAt !== undefined ? window.endsAt : current.publishEndsAt;
    assertPublicationWindow(startsAt, endsAt);
    // 저장과 같은 순서로 잠근다(팝업 행, 그다음 언어별 어드바이저리 락). 반대로 잠그면 동시 요청이 교착한다.
    await bumpPopupVersion(tx, id, expectedVersion, actorId);
    await assertPopupWindowCapacity(tx, id, locale, startsAt, endsAt);
    await tx.update(popupNoticeLocales).set({ publicationStatus: startsAt > now ? "SCHEDULED" : "PUBLISHED", publishStartsAt: startsAt, publishEndsAt: endsAt, firstPublishedAt: current.firstPublishedAt ?? now, lastPublishedAt: now, lastPublishedByActorId: actorId, updatedAt: now, updatedByActorId: actorId }).where(and(eq(popupNoticeLocales.popupNoticeId, id), eq(popupNoticeLocales.locale, locale)));
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
