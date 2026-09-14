import { describe, expect, it, vi } from "vitest";
import { filterNewsItems, translate } from "@/lib/news-filter";

const ITEMS = [
  {
    slug: "a",
    title: { ko: "회사 소식 발표", en: "Company update announced" },
    summary: { ko: "새로운 사업 계획을 공개합니다", en: "Unveiling new business plans" },
    category: { ko: "회사소식", en: "Company" },
  },
  {
    slug: "b",
    title: { ko: "업무협약 체결", en: "Partnership agreement signed" },
    summary: { ko: "글로벌 파트너와 협력합니다", en: "Collaborating with a global partner" },
    category: { ko: "업무협약", en: "Partnership" },
  },
  {
    slug: "c",
    title: { ko: "수상 소식", en: "Award news" },
    summary: { ko: "우수 기업 인증을 받았습니다", en: "Certified as an outstanding company" },
    category: { ko: "수상", en: "Awards" },
  },
  {
    slug: "e",
    title: { ko: "무제 항목", en: "Untitled item" },
    summary: { ko: "설명 없음", en: "No description" },
    category: { ko: "특별공지", en: "Special Notice" },
  },
];

describe("filterNewsItems", () => {
  it("빈 검색어 + all 필터는 전체를 반환한다", () => {
    const result = filterNewsItems(ITEMS, { query: "", activeFilter: "all" });
    expect(result).toEqual(ITEMS);
  });

  it("빈 검색어 + 분류 필터는 ko/en 분류 키워드로 매칭한다", () => {
    const koResult = filterNewsItems(ITEMS, { query: "", activeFilter: "partnership" });
    expect(koResult.map((item: { slug: string }) => item.slug)).toEqual(["b"]);

    const enOnlyItems = [
      {
        slug: "d",
        title: { ko: "", en: "" },
        summary: { ko: "", en: "" },
        category: { ko: "", en: "Awards" },
      },
    ];
    const enResult = filterNewsItems(enOnlyItems, { query: "", activeFilter: "awards" });
    expect(enResult.map((item: { slug: string }) => item.slug)).toEqual(["d"]);
  });

  it("검색어가 제목에만 걸리는 항목을 찾는다", () => {
    const result = filterNewsItems(ITEMS, { query: "협약 체결", activeFilter: "all" });
    expect(result.map((item: { slug: string }) => item.slug)).toEqual(["b"]);
  });

  it("검색어가 요약에만 걸리는 항목을 찾는다", () => {
    const result = filterNewsItems(ITEMS, { query: "우수 기업 인증", activeFilter: "all" });
    expect(result.map((item: { slug: string }) => item.slug)).toEqual(["c"]);
  });

  it("검색어가 분류에만 걸리는 항목을 찾는다", () => {
    const result = filterNewsItems(ITEMS, { query: "특별공지", activeFilter: "all" });
    expect(result.map((item: { slug: string }) => item.slug)).toEqual(["e"]);
  });

  it("아무 항목과도 매칭되지 않는 검색어는 빈 배열을 반환한다", () => {
    const result = filterNewsItems(ITEMS, { query: "존재하지않는검색어xyz", activeFilter: "all" });
    expect(result).toEqual([]);
  });

  it("검색어가 없으면 title/summary에 대해 translate를 호출하지 않는다", () => {
    const translateSpy = vi.fn(translate);

    filterNewsItems(ITEMS, { query: "", activeFilter: "all", translate: translateSpy });

    const fieldsTranslated = translateSpy.mock.calls.map(([value]) =>
      ITEMS.some((item) => item.title === value)
        ? "title"
        : ITEMS.some((item) => item.summary === value)
          ? "summary"
          : "category",
    );

    expect(fieldsTranslated).not.toContain("title");
    expect(fieldsTranslated).not.toContain("summary");
    // category is still read for the (default) "all" filter branch check.
    expect(translateSpy).toHaveBeenCalled();
  });
});
