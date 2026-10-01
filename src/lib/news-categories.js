// 뉴스 분류는 코드값 하나로 저장하고, 화면에서만 표시 이름으로 바꾼다.
export const NEWS_CATEGORIES = [
  { code: "COMPANY", label: { ko: "회사 소식", en: "Company" } },
  { code: "BUSINESS", label: { ko: "사업", en: "Business" } },
  { code: "PARTNERSHIP", label: { ko: "업무협약", en: "Partnerships" } },
  { code: "AWARD", label: { ko: "수상 및 인증", en: "Awards" } },
];

export const NEWS_CATEGORY_CODES = NEWS_CATEGORIES.map(({ code }) => code);

/** 알 수 없는 값은 그대로 돌려줘서 화면이 비지 않게 한다. */
export function newsCategoryLabel(code, language = "ko") {
  const category = NEWS_CATEGORIES.find((item) => item.code === code);
  return category ? category.label[language] : code || "";
}
