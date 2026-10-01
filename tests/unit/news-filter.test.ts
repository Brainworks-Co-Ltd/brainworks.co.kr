import { describe, expect, it, vi } from "vitest";
import { filterNewsItems, translate } from "@/lib/news-filter";
import { NEWS_CATEGORY_CODES, newsCategoryLabel } from "@/lib/news-categories";

const ITEMS = [
  {
    slug: "a",
    title: { ko: "회사 소식 발표", en: "Company update announced" },
    summary: { ko: "새로운 사업 계획을 공개합니다", en: "Unveiling new business plans" },
    category: "COMPANY",
  },
  {
    slug: "b",
    title: { ko: "협약 체결", en: "Agreement signed" },
    summary: { ko: "글로벌 파트너와 협력합니다", en: "Collaborating with a global partner" },
    category: "PARTNERSHIP",
  },
  {
    slug: "c",
    title: { ko: "대상 수상", en: "Grand prize" },
    summary: { ko: "우수 기업 인증을 받았습니다", en: "Certified as an outstanding company" },
    category: "AWARD",
  },
  {
    slug: "d",
    title: { ko: "실습 교육 마무리", en: "Training wrapped up" },
    summary: { ko: "임직원 대상 교육", en: "Staff training" },
    category: "BUSINESS",
  },
];

const slugs = (items: { slug: string }[]) => items.map((item) => item.slug);

describe("filterNewsItems", () => {
  it("all 필터는 전체를 반환한다", () => {
    expect(filterNewsItems(ITEMS, { activeFilter: "all" })).toEqual(ITEMS);
  });

  it("분류 탭은 코드가 같은 항목만 남긴다", () => {
    expect(slugs(filterNewsItems(ITEMS, { activeFilter: "COMPANY" }))).toEqual(["a"]);
    expect(slugs(filterNewsItems(ITEMS, { activeFilter: "BUSINESS" }))).toEqual(["d"]);
    expect(slugs(filterNewsItems(ITEMS, { activeFilter: "PARTNERSHIP" }))).toEqual(["b"]);
    expect(slugs(filterNewsItems(ITEMS, { activeFilter: "AWARD" }))).toEqual(["c"]);
  });

  it("제목에 '회사'가 들어가도 다른 분류 탭에는 섞이지 않는다", () => {
    const companyTitledPartnership = [{ ...ITEMS[1], title: { ko: "회사 간 협약", en: "Company pact" } }];
    expect(filterNewsItems(companyTitledPartnership, { activeFilter: "COMPANY" })).toEqual([]);
  });

  it("검색어는 제목, 요약, 분류 표시 이름에 걸린다", () => {
    expect(slugs(filterNewsItems(ITEMS, { query: "협약 체결" }))).toEqual(["b"]);
    expect(slugs(filterNewsItems(ITEMS, { query: "우수 기업 인증" }))).toEqual(["c"]);
    expect(slugs(filterNewsItems(ITEMS, { query: "업무협약" }))).toEqual(["b"]);
    expect(slugs(filterNewsItems(ITEMS, { query: "partnerships" }))).toEqual(["b"]);
  });

  it("검색어와 분류 탭을 함께 적용한다", () => {
    expect(filterNewsItems(ITEMS, { query: "교육", activeFilter: "AWARD" })).toEqual([]);
    expect(slugs(filterNewsItems(ITEMS, { query: "교육", activeFilter: "BUSINESS" }))).toEqual(["d"]);
  });

  it("아무 항목과도 맞지 않는 검색어는 빈 배열을 반환한다", () => {
    expect(filterNewsItems(ITEMS, { query: "존재하지않는검색어xyz" })).toEqual([]);
  });

  it("검색어가 없으면 translate를 호출하지 않는다", () => {
    const translateSpy = vi.fn(translate);
    filterNewsItems(ITEMS, { activeFilter: "all", translate: translateSpy });
    expect(translateSpy).not.toHaveBeenCalled();
  });
});

describe("newsCategoryLabel", () => {
  it("모든 코드에 한국어와 영어 표시 이름이 있다", () => {
    for (const code of NEWS_CATEGORY_CODES) {
      expect(newsCategoryLabel(code, "ko")).not.toBe(code);
      expect(newsCategoryLabel(code, "en")).not.toBe(code);
    }
  });

  it("알 수 없는 값은 그대로 보여준다", () => {
    expect(newsCategoryLabel("특별공지", "ko")).toBe("특별공지");
    expect(newsCategoryLabel(undefined, "ko")).toBe("");
  });
});
