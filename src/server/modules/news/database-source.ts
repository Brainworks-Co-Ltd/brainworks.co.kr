import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { markdownToHtml } from "@/lib/markdown";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import {
  news,
  newsExternalLinks,
  newsLocales,
  newsSlugs,
} from "@/server/db/schema/news";
import { resolvePublicAssetUrl } from "@/server/modules/assets/public-url";
import { validateNewsQuery } from "@/server/modules/news/publication-policy";

export async function readDatabaseNewsList(
  locale: "ko" | "en",
  query: Record<string, unknown> = {},
) {
  const options = validateNewsQuery(
    query as {
      q?: string;
      category?: string;
      page?: string;
      pageSize?: string;
    },
  );
  const filters = [
    eq(newsSlugs.isCurrent, true),
    eq(news.itemStatus, "ACTIVE"),
    eq(newsLocales.locale, locale),
    eq(newsLocales.publicationStatus, "PUBLISHED"),
  ];
  if (options.category)
    filters.push(ilike(news.category, `%${options.category}%`));
  if (options.q)
    filters.push(
      or(
        ilike(newsLocales.title, `%${options.q}%`),
        ilike(newsLocales.summary, `%${options.q}%`),
      )!,
    );
  const rows = await getDb()
    .select({
      slug: newsSlugs.slug,
      date: news.displayDate,
      category: news.category,
      title: newsLocales.title,
      summary: newsLocales.summary,
      storageKey: assets.storageKey,
    })
    .from(newsSlugs)
    .innerJoin(news, eq(newsSlugs.newsId, news.id))
    .innerJoin(newsLocales, eq(newsLocales.newsId, news.id))
    .leftJoin(
      assets,
      and(eq(assets.id, news.coverAssetId), eq(assets.status, "READY")),
    )
    .where(and(...filters))
    .orderBy(desc(news.displayDate));
  const start = (options.page - 1) * options.pageSize;
  return {
    items: rows.slice(start, start + options.pageSize).map((row) => {
      const { storageKey, ...rest } = row;
      return {
        ...rest,
        date: String(row.date),
        thumbnail: (storageKey && resolvePublicAssetUrl(storageKey)) || "",
      };
    }),
    page: options.page,
    pageSize: options.pageSize,
    total: rows.length,
    totalPages: Math.max(1, Math.ceil(rows.length / options.pageSize)),
  };
}

export async function readDatabaseNewsDetail(
  slug: string,
  locale: "ko" | "en",
) {
  const db = getDb();
  const requested = await db
    .select({ newsId: newsSlugs.newsId, isCurrent: newsSlugs.isCurrent })
    .from(newsSlugs)
    .where(eq(newsSlugs.slug, slug))
    .limit(1);
  if (!requested[0]) return null;
  const currentSlug = await db
    .select({ slug: newsSlugs.slug })
    .from(newsSlugs)
    .where(
      and(
        eq(newsSlugs.newsId, requested[0].newsId),
        eq(newsSlugs.isCurrent, true),
      ),
    )
    .limit(1);
  if (!currentSlug[0]) return null;
  const row = await db
    .select({
      newsLocaleId: newsLocales.id,
      date: news.displayDate,
      category: news.category,
      title: newsLocales.title,
      summary: newsLocales.summary,
      bodyMarkdown: newsLocales.bodyMarkdown,
      storageKey: assets.storageKey,
    })
    .from(news)
    .innerJoin(newsLocales, eq(newsLocales.newsId, news.id))
    .leftJoin(
      assets,
      and(eq(assets.id, news.coverAssetId), eq(assets.status, "READY")),
    )
    .where(
      and(
        eq(news.id, requested[0].newsId),
        eq(news.itemStatus, "ACTIVE"),
        eq(newsLocales.locale, locale),
        eq(newsLocales.publicationStatus, "PUBLISHED"),
      ),
    )
    .limit(1);
  if (!row[0])
    return requested[0].isCurrent
      ? null
      : { redirect: currentSlug[0].slug, news: null };
  const externalLinks = await db
    .select({
      label: newsExternalLinks.label,
      url: newsExternalLinks.url,
    })
    .from(newsExternalLinks)
    .where(eq(newsExternalLinks.newsLocaleId, row[0].newsLocaleId))
    .orderBy(asc(newsExternalLinks.displayOrder));
  return {
    redirect: requested[0].isCurrent ? null : currentSlug[0].slug,
    news: {
      date: String(row[0].date),
      category: row[0].category,
      title: row[0].title,
      summary: row[0].summary,
      thumbnail:
        (row[0].storageKey && resolvePublicAssetUrl(row[0].storageKey)) || "",
      content: markdownToHtml(row[0].bodyMarkdown),
      externalLinks,
    },
  };
}
