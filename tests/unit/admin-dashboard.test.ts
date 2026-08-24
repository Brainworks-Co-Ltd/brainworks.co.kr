import { describe, expect, it } from "vitest";
import { buildAdminDashboardData } from "@/server/modules/admin/dashboard";

describe("관리자 운영 현황 데이터", () => {
  it("사업 영역을 관리자 운영 콘텐츠로 집계하지 않는다", () => {
    const result = buildAdminDashboardData([]);

    expect(result.summary.map((item) => item.contentType)).toEqual([
      "news",
      "notices",
      "popup-notices",
      "honors",
    ]);
  });

  it("콘텐츠 상태를 집계하고 처리할 항목과 최근 변경을 분리한다", () => {
    const result = buildAdminDashboardData([
      {
        contentType: "news",
        contentId: "news-1",
        itemStatus: "ACTIVE",
        locale: "ko",
        publicationStatus: "DRAFT",
        itemUpdatedAt: "2026-08-25T09:00:00.000Z",
        localeUpdatedAt: "2026-08-25T09:00:00.000Z",
        title: "국문 초안",
        adminHref: "/admin/news/news-1",
      },
      {
        contentType: "news",
        contentId: "news-1",
        itemStatus: "ACTIVE",
        locale: "en",
        publicationStatus: "PUBLISHED",
        itemUpdatedAt: "2026-08-25T09:00:00.000Z",
        localeUpdatedAt: "2026-08-24T09:00:00.000Z",
        title: "English news",
        adminHref: "/admin/news/news-1",
      },
      {
        contentType: "notices",
        contentId: "notice-1",
        itemStatus: "ARCHIVED",
        locale: "ko",
        publicationStatus: "UNPUBLISHED",
        itemUpdatedAt: "2026-08-23T09:00:00.000Z",
        localeUpdatedAt: "2026-08-23T09:00:00.000Z",
        title: "보관된 공지",
        adminHref: "/admin/notices/notice-1",
      },
    ]);

    expect(
      result.summary.find((item) => item.contentType === "news"),
    ).toMatchObject({
      activeCount: 1,
      archivedCount: 0,
      locales: {
        ko: { DRAFT: 1, PUBLISHED: 0, HIDDEN: 0 },
        en: { DRAFT: 0, PUBLISHED: 1, HIDDEN: 0 },
      },
    });
    expect(result.attention).toHaveLength(1);
    expect(result.attention[0]).toMatchObject({
      title: "국문 초안",
      publicationStatus: "DRAFT",
      locale: "ko",
    });
    expect(result.recent).toHaveLength(2);
    expect(result.recent[0].contentId).toBe("news-1");
  });
});
