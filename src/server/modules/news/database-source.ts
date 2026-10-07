import { and, asc, desc, eq } from "drizzle-orm";
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

/** 공개 기사를 최신순으로 한 번에 읽는다. 홈처럼 앞의 몇 건만 쓰면 limit으로 SQL에서 자른다. */
export async function readDatabaseNewsList(
  locale: "ko" | "en",
  limit?: number,
) {
  const query = getDb()
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
    .where(
      and(
        eq(newsSlugs.isCurrent, true),
        eq(news.itemStatus, "ACTIVE"),
        eq(newsLocales.locale, locale),
        eq(newsLocales.publicationStatus, "PUBLISHED"),
      ),
    )
    .orderBy(desc(news.displayDate))
    .$dynamic();
  const rows = await (limit === undefined ? query : query.limit(limit));
  return rows.map(({ storageKey, ...rest }) => ({
    ...rest,
    date: String(rest.date),
    thumbnail: (storageKey && resolvePublicAssetUrl(storageKey)) || "",
  }));
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
  // 현재 주소와 본문은 둘 다 newsId에만 기대므로 함께 보낸다. 외부 링크는 본문 id가 있어야 해서 뒤에 둔다.
  const [currentSlug, row] = await Promise.all([
    db
      .select({ slug: newsSlugs.slug })
      .from(newsSlugs)
      .where(
        and(
          eq(newsSlugs.newsId, requested[0].newsId),
          eq(newsSlugs.isCurrent, true),
        ),
      )
      .limit(1),
    db
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
      .limit(1),
  ]);
  if (!currentSlug[0]) return null;
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
      slug: currentSlug[0].slug,
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
