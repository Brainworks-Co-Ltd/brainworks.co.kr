import { newsCategoryLabel } from "@/lib/news-categories";

export function translate(value, language) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] ?? value.ko ?? value.en ?? "";
}

/** activeFilter는 "all" 또는 분류 코드(COMPANY 등)다. */
export function filterNewsItems(
  newsItems,
  { query = "", activeFilter = "all", translate: translateFn = translate } = {},
) {
  const normalizedQuery = (query || "").trim().toLowerCase();

  return newsItems.filter((item) => {
    if (activeFilter !== "all" && item.category !== activeFilter) return false;
    if (!normalizedQuery) return true;

    return [
      translateFn(item.title, "ko"),
      translateFn(item.title, "en"),
      translateFn(item.summary, "ko"),
      translateFn(item.summary, "en"),
      newsCategoryLabel(item.category, "ko"),
      newsCategoryLabel(item.category, "en"),
    ].some((text) => text.toLowerCase().includes(normalizedQuery));
  });
}
