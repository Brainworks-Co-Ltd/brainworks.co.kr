export function translate(value, language) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] ?? value.ko ?? value.en ?? "";
}

export const FILTER_KEYWORDS = {
  all: [],
  company: ["회사", "company", "press", "브리핑"],
  business: ["사업", "business", "solution", "product"],
  partnership: ["협약", "mou", "업무협약", "partnership", "agreement"],
  awards: ["수상", "award", "awards", "인증", "certification"],
};

export function filterNewsItems(
  newsItems,
  {
    query = "",
    activeFilter = "all",
    keywordsByFilter = FILTER_KEYWORDS,
    translate: translateFn = translate,
  } = {},
) {
  const normalizedQuery = (query || "").trim().toLowerCase();

  return newsItems.filter((item) => {
    const categoryKo = translateFn(item.category, "ko").toLowerCase();
    const categoryEn = translateFn(item.category, "en").toLowerCase();

    if (normalizedQuery) {
      const matches =
        translateFn(item.title, "ko").toLowerCase().includes(normalizedQuery) ||
        translateFn(item.title, "en").toLowerCase().includes(normalizedQuery) ||
        translateFn(item.summary, "ko").toLowerCase().includes(normalizedQuery) ||
        translateFn(item.summary, "en").toLowerCase().includes(normalizedQuery) ||
        categoryKo.includes(normalizedQuery) ||
        categoryEn.includes(normalizedQuery);
      if (!matches) return false;
    }

    if (activeFilter === "all") return true;
    const keywords = keywordsByFilter[activeFilter] || [];
    if (keywords.length === 0) return true;
    return [categoryKo, categoryEn].some((value) =>
      keywords.some((keyword) => value.includes(keyword.toLowerCase())),
    );
  });
}
