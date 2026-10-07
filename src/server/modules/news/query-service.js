import {
  readStaticNewsDetail,
  readStaticNewsList,
} from "@/server/modules/news/static-source";
import {
  readDatabaseNewsDetail,
  readDatabaseNewsList,
} from "@/server/modules/news/database-source";

/**
 * 소식 목록 페이지는 탭과 검색을 화면에서 거르므로 공개 기사 전부가 필요하다.
 * 홈은 limit으로 보이는 개수만 받는다.
 * @param {{ locale?: "ko" | "en", limit?: number }} [options]
 * @returns {ReturnType<typeof readDatabaseNewsList>}
 */
// ponytail: 기사 전부를 한 번에 싣는다. 기사가 수백 건이 되면 화면 페이지 나눔으로 바꿀 것.
export async function getPublishedNewsList({ locale = "ko", limit } = {}) {
  if (process.env.DATABASE_URL) {
    return readDatabaseNewsList(locale, limit);
  }
  return readStaticNewsList(locale).slice(0, limit);
}

export async function getPublishedNewsDetail({ slug, locale = "ko" }) {
  if (process.env.DATABASE_URL) {
    return readDatabaseNewsDetail(slug, locale);
  }
  return readStaticNewsDetail(slug, locale);
}
