import { getAllNewsMeta, getNewsDetail } from "@/lib/news";

function localized(value, locale) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.ko || value.en || "";
}

export function readStaticNewsList(locale) {
  return getAllNewsMeta().map((item) => ({
    ...item,
    title: localized(item.title, locale),
    summary: localized(item.summary, locale),
    category: localized(item.category, locale),
  }));
}

export function readStaticNewsDetail(slug, locale) {
  const item = getNewsDetail(slug);
  if (!item) return null;
  return {
    ...item,
    title: localized(item.title, locale),
    summary: localized(item.summary, locale),
    category: localized(item.category, locale),
    content: localized(item.content, locale),
    externalLinks: (item.externalLinks || []).map((link) => ({
      ...link,
      label: localized(link.label, locale),
    })),
  };
}
