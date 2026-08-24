import { and, asc, eq, or } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { popupNoticeLocales, popupNotices } from "@/server/db/schema/popup-notices";
import { effectiveNoticeVisibility, resolvePopupDetailUrl } from "@/server/modules/notices/domain";
import type { PopupLocale } from "@/server/modules/popup-notices/contracts";

export type PublishedPopupNotice = { id: string; title: string; bodyMarkdown: string | null; imageAssetId: string | null; imageAlt: string | null; dismissalRevision: number; displayOrder: number; detailUrl: string | null };

const popupStatusOrder = { PUBLISHED: 0, SCHEDULED: 1, DRAFT: 2, UNPUBLISHED: 3 } as const;

export async function getPublishedPopupNotices(locale: PopupLocale, now = new Date()): Promise<PublishedPopupNotice[]> {
  if (!process.env.DATABASE_URL) return [];
  const rows = await getDb()
    .select({ id: popupNotices.id, noticeId: popupNotices.noticeId, dismissalRevision: popupNotices.dismissalRevision, title: popupNoticeLocales.title, bodyMarkdown: popupNoticeLocales.bodyMarkdown, imageAssetId: popupNoticeLocales.imageAssetId, imageAlt: popupNoticeLocales.imageAlt, displayOrder: popupNoticeLocales.displayOrder, status: popupNoticeLocales.publicationStatus, startsAt: popupNoticeLocales.publishStartsAt, endsAt: popupNoticeLocales.publishEndsAt })
    .from(popupNotices)
    .innerJoin(popupNoticeLocales, eq(popupNoticeLocales.popupNoticeId, popupNotices.id))
    .where(and(eq(popupNotices.itemStatus, "ACTIVE"), eq(popupNoticeLocales.locale, locale), or(eq(popupNoticeLocales.publicationStatus, "PUBLISHED"), eq(popupNoticeLocales.publicationStatus, "SCHEDULED"))!))
    .orderBy(asc(popupNoticeLocales.displayOrder));
  return rows
    .filter((row) => effectiveNoticeVisibility({ status: row.status, startsAt: row.startsAt, endsAt: row.endsAt }, now))
    .slice(0, 3)
    .map((row) => ({ ...row, detailUrl: resolvePopupDetailUrl({ noticeSlug: null }, null) }));
}

export async function getAdminPopupNoticeList() {
  if (!process.env.DATABASE_URL) return [];
  const rows = await getDb()
    .select({
      id: popupNotices.id,
      itemStatus: popupNotices.itemStatus,
      version: popupNotices.version,
      dismissalRevision: popupNotices.dismissalRevision,
      locale: popupNoticeLocales.locale,
      title: popupNoticeLocales.title,
      publicationStatus: popupNoticeLocales.publicationStatus,
      displayOrder: popupNoticeLocales.displayOrder,
      updatedAt: popupNoticeLocales.updatedAt,
    })
    .from(popupNotices)
    .innerJoin(popupNoticeLocales, eq(popupNoticeLocales.popupNoticeId, popupNotices.id))
    .orderBy(asc(popupNoticeLocales.displayOrder), asc(popupNoticeLocales.updatedAt));
  const grouped = new Map<string, {
    id: string;
    itemStatus: typeof rows[number]["itemStatus"];
    version: number;
    dismissalRevision: number;
    locales: Record<string, { title: string; publicationStatus: typeof rows[number]["publicationStatus"]; displayOrder: number }>;
  }>();
  for (const row of rows) {
    const item = grouped.get(row.id) ?? {
      id: row.id,
      itemStatus: row.itemStatus,
      version: row.version,
      dismissalRevision: row.dismissalRevision,
      locales: {},
    };
    item.locales[row.locale] = {
      title: row.title,
      publicationStatus: row.publicationStatus,
      displayOrder: row.displayOrder,
    };
    grouped.set(row.id, item);
  }
  return Array.from(grouped.values()).sort((a, b) => {
    const aStatus = popupStatusOrder[a.locales.ko?.publicationStatus ?? "DRAFT"];
    const bStatus = popupStatusOrder[b.locales.ko?.publicationStatus ?? "DRAFT"];
    return aStatus - bStatus;
  });
}
