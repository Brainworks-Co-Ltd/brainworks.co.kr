import { validateNewsQuery } from "@/server/modules/news/publication-policy";
import {
  readStaticNewsDetail,
  readStaticNewsList,
} from "@/server/modules/news/static-source";

function matches(item, q, category) {
  const searchable = [item.title, item.summary, item.category]
    .join(" ")
    .toLowerCase();
  return (
    (!q || searchable.includes(q.toLowerCase())) &&
    (!category || item.category.toLowerCase().includes(category.toLowerCase()))
  );
}

export function getPublishedNewsList({ locale = "ko", query = {} } = {}) {
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

export function getPublishedNewsDetail({ slug, locale = "ko" }) {
  return readStaticNewsDetail(slug, locale);
}
