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
// 공지와 같은 공개 번호 규칙(양의 안전 정수, 앞자리 0 없음)을 쓴다.
import { parseNoticePublicNumber as parsePublicNumber } from "@/server/modules/notices/contracts";

/**
 * 공개 기사를 최신순으로 한 번에 읽는다. 홈처럼 앞의 몇 건만 쓰면 limit으로 SQL에서 자른다.
 * slug는 주소 조각이다. DB 기사는 공개 번호, DB 없는 정적 원본은 파일 이름을 쓴다.
 */
export async function readDatabaseNewsList(
  locale: "ko" | "en",
  limit?: number,
) {
  const query = getDb()
    .select({
      publicNumber: news.publicNumber,
      date: news.displayDate,
      category: news.category,
      title: newsLocales.title,
      summary: newsLocales.summary,
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
        eq(news.itemStatus, "ACTIVE"),
        eq(newsLocales.locale, locale),
        eq(newsLocales.publicationStatus, "PUBLISHED"),
      ),
    )
    .orderBy(desc(news.displayDate))
    .$dynamic();
  const rows = await (limit === undefined ? query : query.limit(limit));
  return rows.map(({ storageKey, publicNumber, ...rest }) => ({
    slug: String(publicNumber),
    ...rest,
    date: String(rest.date),
    thumbnail: (storageKey && resolvePublicAssetUrl(storageKey)) || "",
  }));
}

/**
 * identifier가 공개 번호면 그 기사를 준다. 번호 주소 이전의 슬러그면 번호 주소로 보낸다.
 * 이동한 뒤의 게시 여부는 번호 주소에서 다시 본다.
 */
export async function readDatabaseNewsDetail(
  identifier: string,
  locale: "ko" | "en",
) {
  const db = getDb();
  const publicNumber = parsePublicNumber(identifier);
  const row = publicNumber
    ? await db
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
            eq(news.publicNumber, publicNumber),
            eq(news.itemStatus, "ACTIVE"),
            eq(newsLocales.locale, locale),
            eq(newsLocales.publicationStatus, "PUBLISHED"),
          ),
        )
        .limit(1)
    : [];
  if (!row[0]) {
    const legacy = await db
      .select({ publicNumber: news.publicNumber })
      .from(newsSlugs)
      .innerJoin(news, eq(newsSlugs.newsId, news.id))
      .where(eq(newsSlugs.slug, identifier))
      .limit(1);
    return legacy[0]
      ? { redirect: String(legacy[0].publicNumber), news: null }
      : null;
  }
  const externalLinks = await db
    .select({
      label: newsExternalLinks.label,
      url: newsExternalLinks.url,
    })
    .from(newsExternalLinks)
    .where(eq(newsExternalLinks.newsLocaleId, row[0].newsLocaleId))
    .orderBy(asc(newsExternalLinks.displayOrder));
  return {
    redirect: null,
    news: {
      slug: String(publicNumber),
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
