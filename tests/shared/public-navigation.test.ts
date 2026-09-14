import { describe, expect, it } from "vitest";
import {
  buildPublicNavigation,
  getActiveNavigationGroup,
} from "@/shared/navigation/publicNavigation";

describe("공개 내비게이션 계약", () => {
  it("홈을 제외하고 세 그룹과 문의 행동만 노출한다", () => {
    const items = buildPublicNavigation("ko");

    expect(items.map((item) => item.id)).toEqual([
      "company",
      "business",
      "news",
      "contact",
    ]);
    expect(
      items.flatMap((item) => item.children ?? []).map((item) => item.href),
    ).not.toContain("/");
  });

  it("사업 상세와 소식 상세를 올바른 1차 그룹으로 판정한다", () => {
    expect(getActiveNavigationGroup("consulting")).toBe("business");
    expect(getActiveNavigationGroup("news.detail")).toBe("news");
    expect(getActiveNavigationGroup("notices.detail")).toBe("news");
    expect(getActiveNavigationGroup(null)).toBeNull();
  });

  it("영문 메뉴가 영문 경로를 사용한다", () => {
    const items = buildPublicNavigation("en");
    const business = items.find(
      (item) => item.type === "group" && item.id === "business",
    );

    expect(business?.children?.map((item) => item.href)).toEqual([
      "/en/services",
      "/en/consulting",
      "/en/education",
      "/en/global-programs",
    ]);
  });

  it("하위 메뉴는 항목명과 경로만 제공한다", () => {
    const items = buildPublicNavigation("ko");
    const children = items.flatMap((item) => item.children ?? []);

    expect(children.every((item) => !("description" in item))).toBe(true);
  });

  it("사업 영역 메가메뉴가 영역 이름과 실제 라우트를 제공한다", () => {
    const items = buildPublicNavigation("ko");
    const business = items.find(
      (item) => item.type === "group" && item.id === "business",
    );
    if (!business || business.type !== "group") {
      throw new Error("사업 영역 메뉴를 찾을 수 없습니다.");
    }

    expect(business.megaMenu?.areas.map((area) => area.id)).toEqual([
      "manufacturing",
      "agent",
      "healthcare",
      "smartcity",
    ]);
    expect(business.megaMenu?.areas[0]).toMatchObject({
      // 메뉴에서 영역을 누르면 사업 영역 구간까지 내려가야 한다.
      href: "/services?area=manufacturing#business-areas",
      label: "Manufacturing AI",
    });
    expect(business.megaMenu?.services.map((service) => service.href)).toEqual([
      "/consulting",
      "/education",
      "/global-programs",
    ]);
  });
});
