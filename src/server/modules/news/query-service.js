import { validateNewsQuery } from "@/server/modules/news/publication-policy";
import {
  readStaticNewsDetail,
  readStaticNewsList,
} from "@/server/modules/news/static-source";
import {
  readDatabaseNewsDetail,
  readDatabaseNewsList,
} from "@/server/modules/news/database-source";

function matches(item, q, category) {
  const searchable = [item.title, item.summary, item.category]
    .join(" ")
    .toLowerCase();
  return (
    (!q || searchable.includes(q.toLowerCase())) &&
    (!category || item.category.toLowerCase().includes(category.toLowerCase()))
  );
}

export async function getPublishedNewsList({ locale = "ko", query = {} } = {}) {
  if (process.env.DATABASE_URL) {
    return readDatabaseNewsList(locale, query);
  }
  const options = validateNewsQuery(query);
  const items = readStaticNewsList(locale).filter((item) =>
    matches(item, options.q, options.category),
  );
  const start = (options.page - 1) * options.pageSize;
  return {
    items: items.slice(start, start + options.pageSize),
    page: options.page,
    pageSize: options.pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / options.pageSize)),
  };
}

/** 소식 목록 페이지는 탭과 검색을 화면에서 거르므로 공개 기사 전부가 필요하다. */
// ponytail: 페이지마다 다시 조회한다. 기사가 수백 건이 되면 화면 페이지 나눔으로 바꿀 것.
export async function getAllPublishedNews({ locale = "ko", query = {} } = {}) {
  const first = await getPublishedNewsList({ locale, query });
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, index) =>
      getPublishedNewsList({ locale, query: { ...query, page: String(index + 2) } }),
    ),
  );
  return [first, ...rest].flatMap((result) => result.items);
}

export async function getPublishedNewsDetail({ slug, locale = "ko" }) {
  if (process.env.DATABASE_URL) {
    return readDatabaseNewsDetail(slug, locale);
  }
  return readStaticNewsDetail(slug, locale);
}
