import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { news, newsLocales, newsSlugs } from "@/server/db/schema/news";

export type AdminNewsQuery = {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export async function getAdminNewsList(query: AdminNewsQuery = {}) {
  const page = Math.max(1, Math.min(query.page || 1, 1000));
  const pageSize = Math.max(1, Math.min(query.pageSize || 12, 50));
  if (!process.env.DATABASE_URL) {
    return { items: [], page, pageSize, total: 0, totalPages: 1 };
  }
  const rows = await getDb()
    .select({
      id: news.id,
      version: news.version,
      itemStatus: news.itemStatus,
      category: news.category,
      displayDate: news.displayDate,
      slug: newsSlugs.slug,
      locale: newsLocales.locale,
      title: newsLocales.title,
      summary: newsLocales.summary,
      publicationStatus: newsLocales.publicationStatus,
    })
    .from(news)
    .innerJoin(
      newsSlugs,
      eq(newsSlugs.newsId, news.id),
    )
    .innerJoin(newsLocales, eq(newsLocales.newsId, news.id))
    .where(eq(newsSlugs.isCurrent, true))
    .orderBy(desc(news.updatedAt), desc(news.displayDate), asc(newsLocales.locale));

  const grouped = new Map<
    string,
    {
      id: string;
      version: number;
      itemStatus: (typeof rows)[number]["itemStatus"];
      category: string;
      displayDate: string;
      slug: string;
      locales: Record<
        string,
        {
          title: string;
          summary: string;
          publicationStatus: (typeof rows)[number]["publicationStatus"];
        }
      >;
    }
  >();
  for (const row of rows) {
    const item = grouped.get(row.id) ?? {
      id: row.id,
      version: row.version,
      itemStatus: row.itemStatus,
      category: row.category,
      displayDate: String(row.displayDate),
      slug: row.slug,
      locales: {},
    };
    item.locales[row.locale] = {
      title: row.title,
      summary: row.summary,
      publicationStatus: row.publicationStatus,
    };
    grouped.set(row.id, item);
  }

  const q = query.q?.trim().toLocaleLowerCase() || "";
  const status = query.status || "ALL";
  const filtered = Array.from(grouped.values()).filter((item) => {
    const matchesQuery =
      !q ||
      item.slug.toLocaleLowerCase().includes(q) ||
      item.category.toLocaleLowerCase().includes(q) ||
      Object.values(item.locales).some(
        (locale) =>
          locale.title.toLocaleLowerCase().includes(q) ||
          locale.summary.toLocaleLowerCase().includes(q),
      );
    const matchesStatus =
      status === "ALL" ||
      (status === "ARCHIVED"
        ? item.itemStatus === "ARCHIVED"
        : Object.values(item.locales).some(
            (locale) => locale.publicationStatus === status,
          ));
    return matchesQuery && matchesStatus;
  });
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    page,
    pageSize,
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
  };
}
