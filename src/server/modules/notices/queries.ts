import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import { noticeAttachments, noticeCategories, noticeCategoryLocales, noticeLocales, noticeSlugs, notices } from "@/server/db/schema/notices";
import { effectiveNoticeVisibility } from "@/server/modules/notices/domain";
import type { NoticeLocale } from "@/server/modules/notices/contracts";

export type PublicNoticeQuery = { q?: string; categoryId?: string; page?: number; pageSize?: number };

export function toPublishedNoticeListItem<
  T extends {
    publicNumber: number;
    title: string;
    displayDate: string | Date;
    isPinned: boolean;
  },
>(row: T) {
  return {
    publicNumber: row.publicNumber,
    title: row.title,
    date: String(row.displayDate),
    isPinned: row.isPinned,
  };
}

export function toPublishedNoticeDetail<
  T extends {
    title: string;
    bodyMarkdown: string;
    displayDate: string | Date;
  },
>(
  row: T,
  attachments: Array<{
    id: string;
    displayName: string;
    downloadUrl: string;
  }>,
) {
  return {
    title: row.title,
    bodyMarkdown: row.bodyMarkdown,
    date: String(row.displayDate),
    attachments,
  };
}

export async function getPublishedNoticeList(locale: NoticeLocale, query: PublicNoticeQuery = {}) {
  if (!process.env.DATABASE_URL) return { items: [], page: query.page ?? 1, pageSize: query.pageSize ?? 12, total: 0, totalPages: 1 };
  const page = Math.max(1, Math.min(query.page ?? 1, 1000));
  const pageSize = Math.max(1, Math.min(query.pageSize ?? 12, 50));
  const filters = [
    eq(notices.itemStatus, "ACTIVE"),
    eq(noticeLocales.locale, locale),
    or(eq(noticeLocales.publicationStatus, "PUBLISHED"), eq(noticeLocales.publicationStatus, "SCHEDULED"))!,
  ];
  if (query.categoryId) filters.push(eq(notices.categoryId, query.categoryId));
  if (query.q) filters.push(ilike(noticeLocales.title, `%${query.q}%`));
  const rows = await getDb()
    .select({ id: notices.id, publicNumber: notices.publicNumber, title: noticeLocales.title, displayDate: notices.displayDate, categoryId: notices.categoryId, isPinned: notices.isPinned, pinOrder: notices.pinOrder, status: noticeLocales.publicationStatus, startsAt: noticeLocales.publishStartsAt, endsAt: noticeLocales.publishEndsAt })
    .from(notices)
    .innerJoin(noticeLocales, eq(noticeLocales.noticeId, notices.id))
    .where(and(...filters))
    .orderBy(desc(notices.isPinned), asc(notices.pinOrder), desc(notices.displayDate));
  const visible = rows.filter((row) => effectiveNoticeVisibility({ status: row.status, startsAt: row.startsAt, endsAt: row.endsAt }));
  const start = (page - 1) * pageSize;
  return { items: visible.slice(start, start + pageSize).map(toPublishedNoticeListItem), page, pageSize, total: visible.length, totalPages: Math.max(1, Math.ceil(visible.length / pageSize)) };
}

export async function getPublishedNoticeDetail(publicNumber: number, locale: NoticeLocale) {
  if (!process.env.DATABASE_URL) return null;
  const row = await getDb()
    .select({ id: notices.id, localeId: noticeLocales.id, publicNumber: notices.publicNumber, title: noticeLocales.title, bodyMarkdown: noticeLocales.bodyMarkdown, displayDate: notices.displayDate, categoryId: notices.categoryId, status: noticeLocales.publicationStatus, startsAt: noticeLocales.publishStartsAt, endsAt: noticeLocales.publishEndsAt })
    .from(notices)
    .innerJoin(noticeLocales, eq(noticeLocales.noticeId, notices.id))
    .where(and(eq(notices.publicNumber, publicNumber), eq(notices.itemStatus, "ACTIVE"), eq(noticeLocales.locale, locale), or(eq(noticeLocales.publicationStatus, "PUBLISHED"), eq(noticeLocales.publicationStatus, "SCHEDULED"))!))
    .limit(1);
  if (!row[0] || !effectiveNoticeVisibility({ status: row[0].status, startsAt: row[0].startsAt, endsAt: row[0].endsAt })) return null;
  const attachments = await getDb()
    .select({ id: noticeAttachments.id, displayName: noticeAttachments.displayName })
    .from(noticeAttachments)
    .innerJoin(assets, eq(assets.id, noticeAttachments.assetId))
    .where(and(eq(noticeAttachments.noticeLocaleId, row[0].localeId), eq(assets.status, "READY")))
    .orderBy(asc(noticeAttachments.displayOrder));
  return toPublishedNoticeDetail(
    row[0],
    attachments.map((attachment) => ({
      ...attachment,
      downloadUrl: `/api/notices/${row[0].publicNumber}/attachments/${encodeURIComponent(attachment.id)}/download?locale=${locale}`,
    })),
  );
}

export async function getPublishedNoticePublicNumberByLegacySlug(
  slug: string,
  locale: NoticeLocale,
) {
  if (!process.env.DATABASE_URL) return null;
  const row = await getDb()
    .select({
      publicNumber: notices.publicNumber,
      status: noticeLocales.publicationStatus,
      startsAt: noticeLocales.publishStartsAt,
      endsAt: noticeLocales.publishEndsAt,
    })
    .from(noticeSlugs)
    .innerJoin(notices, eq(notices.id, noticeSlugs.noticeId))
    .innerJoin(noticeLocales, eq(noticeLocales.noticeId, notices.id))
    .where(
      and(
        eq(noticeSlugs.slug, slug),
        eq(notices.itemStatus, "ACTIVE"),
        eq(noticeLocales.locale, locale),
        or(
          eq(noticeLocales.publicationStatus, "PUBLISHED"),
          eq(noticeLocales.publicationStatus, "SCHEDULED"),
        )!,
      ),
    )
    .limit(1);
  if (
    !row[0] ||
    !effectiveNoticeVisibility({
      status: row[0].status,
      startsAt: row[0].startsAt,
      endsAt: row[0].endsAt,
    })
  ) {
    return null;
  }
  return row[0].publicNumber;
}

export async function getAdminNoticeList() {
  if (!process.env.DATABASE_URL) return [];
  const rows = await getDb()
    .select({
      id: notices.id,
      itemStatus: notices.itemStatus,
      version: notices.version,
      publicNumber: notices.publicNumber,
      displayDate: notices.displayDate,
      isPinned: notices.isPinned,
      pinOrder: notices.pinOrder,
      locale: noticeLocales.locale,
      title: noticeLocales.title,
      publicationStatus: noticeLocales.publicationStatus,
      updatedAt: noticeLocales.updatedAt,
    })
    .from(notices)
    .innerJoin(noticeLocales, eq(noticeLocales.noticeId, notices.id))
    .orderBy(desc(notices.updatedAt), asc(notices.pinOrder), desc(notices.displayDate));
  const grouped = new Map<string, {
    id: string;
    itemStatus: typeof rows[number]["itemStatus"];
    version: number;
    publicNumber: number;
    displayDate: string;
    isPinned: boolean;
    pinOrder: number | null;
    locales: Record<string, { title: string; publicationStatus: typeof rows[number]["publicationStatus"] }>;
  }>();
  for (const row of rows) {
    const item = grouped.get(row.id) ?? {
      id: row.id,
      itemStatus: row.itemStatus,
      version: row.version,
      publicNumber: row.publicNumber,
      displayDate: String(row.displayDate),
      isPinned: row.isPinned,
      pinOrder: row.pinOrder,
      locales: {},
    };
    item.locales[row.locale] = { title: row.title, publicationStatus: row.publicationStatus };
    grouped.set(row.id, item);
  }
  return Array.from(grouped.values());
}

export async function getPublishedNoticeCategories(locale: NoticeLocale) {
  if (!process.env.DATABASE_URL) return [];
  return getDb()
    .select({ id: noticeCategories.id, name: noticeCategoryLocales.name })
    .from(noticeCategories)
    .innerJoin(noticeCategoryLocales, eq(noticeCategoryLocales.categoryId, noticeCategories.id))
    .where(and(eq(noticeCategories.isActive, true), eq(noticeCategories.itemStatus, "ACTIVE"), eq(noticeCategoryLocales.locale, locale)))
    .orderBy(asc(noticeCategories.displayOrder));
}
