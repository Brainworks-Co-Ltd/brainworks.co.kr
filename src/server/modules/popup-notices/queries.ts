import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { popupNoticeLocales, popupNotices } from "@/server/db/schema/popup-notices";
import { effectiveNoticeVisibility, resolvePopupDetailUrl } from "@/server/modules/notices/domain";
import type { PopupLocale } from "@/server/modules/popup-notices/contracts";

export type PublishedPopupNotice = { id: string; title: string; bodyMarkdown: string | null; imageAssetId: string | null; imageAlt: string | null; dismissalRevision: number; displayOrder: number; detailUrl: string | null };

export async function getPublishedPopupNotices(locale: PopupLocale, now = new Date()): Promise<PublishedPopupNotice[]> {
  if (!process.env.DATABASE_URL) return [];
  const rows = await getDb()
    .select({ id: popupNotices.id, noticeId: popupNotices.noticeId, dismissalRevision: popupNotices.dismissalRevision, title: popupNoticeLocales.title, bodyMarkdown: popupNoticeLocales.bodyMarkdown, imageAssetId: popupNoticeLocales.imageAssetId, imageAlt: popupNoticeLocales.imageAlt, displayOrder: popupNoticeLocales.displayOrder, status: popupNoticeLocales.publicationStatus, startsAt: popupNoticeLocales.publishStartsAt, endsAt: popupNoticeLocales.publishEndsAt })
    .from(popupNotices)
    .innerJoin(popupNoticeLocales, eq(popupNoticeLocales.popupNoticeId, popupNotices.id))
    .where(and(eq(popupNotices.itemStatus, "ACTIVE"), eq(popupNoticeLocales.locale, locale), eq(popupNoticeLocales.publicationStatus, "PUBLISHED")))
    .orderBy(asc(popupNoticeLocales.displayOrder))
    .limit(3);
  return rows.filter((row) => effectiveNoticeVisibility({ status: row.status, startsAt: row.startsAt, endsAt: row.endsAt }, now)).map((row) => ({ ...row, detailUrl: resolvePopupDetailUrl({ noticeSlug: null }, null) }));
}
