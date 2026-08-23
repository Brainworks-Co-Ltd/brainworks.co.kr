import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { noticeCategories, noticeCategoryLocales, noticeLocales, noticeSlugs, notices } from "@/server/db/schema/notices";
import { effectiveNoticeVisibility } from "@/server/modules/notices/domain";
import type { NoticeLocale } from "@/server/modules/notices/contracts";

export type PublicNoticeQuery = { q?: string; categoryId?: string; page?: number; pageSize?: number };

export async function getPublishedNoticeList(locale: NoticeLocale, query: PublicNoticeQuery = {}) {
  if (!process.env.DATABASE_URL) return { items: [], page: query.page ?? 1, pageSize: query.pageSize ?? 12, total: 0, totalPages: 1 };
  const page = Math.max(1, Math.min(query.page ?? 1, 1000));
  const pageSize = Math.max(1, Math.min(query.pageSize ?? 12, 50));
  const filters = [
    eq(notices.itemStatus, "ACTIVE"),
    eq(noticeSlugs.isCurrent, true),
    eq(noticeLocales.locale, locale),
    or(eq(noticeLocales.publicationStatus, "PUBLISHED"), eq(noticeLocales.publicationStatus, "SCHEDULED"))!,
  ];
  if (query.categoryId) filters.push(eq(notices.categoryId, query.categoryId));
  if (query.q) filters.push(or(ilike(noticeLocales.title, `%${query.q}%`), ilike(noticeLocales.bodyMarkdown, `%${query.q}%`))!);
  const rows = await getDb()
    .select({ id: notices.id, slug: noticeSlugs.slug, title: noticeLocales.title, displayDate: notices.displayDate, categoryId: notices.categoryId, isPinned: notices.isPinned, pinOrder: notices.pinOrder, status: noticeLocales.publicationStatus, startsAt: noticeLocales.publishStartsAt, endsAt: noticeLocales.publishEndsAt })
    .from(notices)
    .innerJoin(noticeLocales, eq(noticeLocales.noticeId, notices.id))
    .innerJoin(noticeSlugs, eq(noticeSlugs.noticeId, notices.id))
    .where(and(...filters))
    .orderBy(desc(notices.isPinned), asc(notices.pinOrder), desc(notices.displayDate));
  const visible = rows.filter((row) => effectiveNoticeVisibility({ status: row.status, startsAt: row.startsAt, endsAt: row.endsAt }));
  const start = (page - 1) * pageSize;
  return { items: visible.slice(start, start + pageSize).map((row) => ({ ...row, date: String(row.displayDate) })), page, pageSize, total: visible.length, totalPages: Math.max(1, Math.ceil(visible.length / pageSize)) };
}

export async function getPublishedNoticeDetail(slug: string, locale: NoticeLocale) {
  if (!process.env.DATABASE_URL) return null;
  const row = await getDb()
    .select({ id: notices.id, slug: noticeSlugs.slug, title: noticeLocales.title, bodyMarkdown: noticeLocales.bodyMarkdown, displayDate: notices.displayDate, categoryId: notices.categoryId, status: noticeLocales.publicationStatus, startsAt: noticeLocales.publishStartsAt, endsAt: noticeLocales.publishEndsAt })
    .from(noticeSlugs)
    .innerJoin(notices, eq(notices.id, noticeSlugs.noticeId))
    .innerJoin(noticeLocales, eq(noticeLocales.noticeId, notices.id))
    .where(and(eq(noticeSlugs.slug, slug), eq(notices.itemStatus, "ACTIVE"), eq(noticeLocales.locale, locale), or(eq(noticeLocales.publicationStatus, "PUBLISHED"), eq(noticeLocales.publicationStatus, "SCHEDULED"))!))
    .limit(1);
  if (!row[0] || !effectiveNoticeVisibility({ status: row[0].status, startsAt: row[0].startsAt, endsAt: row[0].endsAt })) return null;
  return { ...row[0], date: String(row[0].displayDate) };
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
