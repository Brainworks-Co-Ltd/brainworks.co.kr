import { describe, expect, it } from "vitest";
import {
  buildAdminDashboardData,
  type DashboardRow,
} from "@/server/modules/admin/dashboard";

const regressionRows: DashboardRow[] = [
  {
    contentType: "news",
    contentId: "n1",
    itemStatus: "ACTIVE",
    locale: "ko",
    publicationStatus: "DRAFT",
    itemUpdatedAt: "2026-01-10T00:00:00.000Z",
    localeUpdatedAt: "2026-01-10T00:00:00.000Z",
    title: "뉴스 초안 1",
    adminHref: "/admin/news/n1",
  },
  {
    contentType: "news",
    contentId: "n1",
    itemStatus: "ACTIVE",
    locale: "en",
    publicationStatus: "PUBLISHED",
    itemUpdatedAt: "2026-01-10T00:00:00.000Z",
    localeUpdatedAt: "2026-01-01T00:00:00.000Z",
    title: "News draft 1 en",
    adminHref: "/admin/news/n1",
  },
  {
    contentType: "news",
    contentId: "n2",
    itemStatus: "ACTIVE",
    locale: "en",
    publicationStatus: "HIDDEN",
    itemUpdatedAt: "2026-01-10T00:00:00.000Z",
    localeUpdatedAt: "2026-01-10T00:00:00.000Z",
    title: "News hidden 2",
    adminHref: "/admin/news/n2",
  },
  {
    contentType: "news",
    contentId: "n3",
    itemStatus: "ACTIVE",
    locale: "ko",
    publicationStatus: "DRAFT",
    itemUpdatedAt: "2026-01-07T00:00:00.000Z",
    localeUpdatedAt: "2026-01-07T00:00:00.000Z",
    title: "뉴스 초안 3",
    adminHref: "/admin/news/n3",
  },
  {
    contentType: "news",
    contentId: "n4",
    itemStatus: "ACTIVE",
    locale: "en",
    publicationStatus: "UNPUBLISHED",
    itemUpdatedAt: "2026-01-06T00:00:00.000Z",
    localeUpdatedAt: "2026-01-06T00:00:00.000Z",
    title: "News unpublished 4",
    adminHref: "/admin/news/n4",
  },
  {
    contentType: "news",
    contentId: "n5",
    itemStatus: "ARCHIVED",
    locale: "ko",
    publicationStatus: "HIDDEN",
    itemUpdatedAt: "2026-01-03T00:00:00.000Z",
    localeUpdatedAt: "2026-01-03T00:00:00.000Z",
    title: "뉴스 보관 5",
    adminHref: "/admin/news/n5",
  },
  {
    contentType: "notices",
    contentId: "no1",
    itemStatus: "ACTIVE",
    locale: "ko",
    publicationStatus: "UNPUBLISHED",
    itemUpdatedAt: "2026-01-09T00:00:00.000Z",
    localeUpdatedAt: "2026-01-09T00:00:00.000Z",
    title: "공지 미게시 1",
    adminHref: "/admin/notices/no1",
  },
  {
    contentType: "notices",
    contentId: "no2",
    itemStatus: "ACTIVE",
    locale: "en",
    publicationStatus: "DRAFT",
    itemUpdatedAt: "2026-01-11T00:00:00.000Z",
    localeUpdatedAt: "2026-01-11T00:00:00.000Z",
    title: "Notice draft 2",
    adminHref: "/admin/notices/no2",
  },
  {
    contentType: "notices",
    contentId: "no3",
    itemStatus: "ACTIVE",
    locale: "ko",
    publicationStatus: "HIDDEN",
    itemUpdatedAt: "2026-01-07T00:00:00.000Z",
    localeUpdatedAt: "2026-01-07T00:00:00.000Z",
    title: "공지 숨김 3",
    adminHref: "/admin/notices/no3",
  },
  {
    contentType: "notices",
    contentId: "no4",
    itemStatus: "ACTIVE",
    locale: "en",
    publicationStatus: "DRAFT",
    itemUpdatedAt: "2026-01-06T00:00:00.000Z",
    localeUpdatedAt: "2026-01-06T00:00:00.000Z",
    title: "Notice draft 4",
    adminHref: "/admin/notices/no4",
  },
  {
    contentType: "notices",
    contentId: "no5",
    itemStatus: "ACTIVE",
    locale: "ko",
    publicationStatus: "SCHEDULED",
    itemUpdatedAt: "2026-01-04T00:00:00.000Z",
    localeUpdatedAt: "2026-01-04T00:00:00.000Z",
    title: "공지 예약 5",
    adminHref: "/admin/notices/no5",
  },
  {
    contentType: "popup-notices",
    contentId: "p1",
    itemStatus: "ACTIVE",
    locale: "ko",
    publicationStatus: "HIDDEN",
    itemUpdatedAt: "2026-01-08T00:00:00.000Z",
    localeUpdatedAt: "2026-01-08T00:00:00.000Z",
    title: "팝업 숨김 1",
    adminHref: "/admin/popup-notices/p1",
  },
  {
    contentType: "popup-notices",
    contentId: "p2",
    itemStatus: "ACTIVE",
    locale: "en",
    publicationStatus: "UNPUBLISHED",
    itemUpdatedAt: "2026-01-12T00:00:00.000Z",
    localeUpdatedAt: "2026-01-12T00:00:00.000Z",
    title: "Popup unpublished 2",
    adminHref: "/admin/popup-notices/p2",
  },
  {
    contentType: "popup-notices",
    contentId: "p3",
    itemStatus: "ACTIVE",
    locale: "ko",
    publicationStatus: "DRAFT",
    itemUpdatedAt: "2026-01-13T00:00:00.000Z",
    localeUpdatedAt: "2026-01-13T00:00:00.000Z",
    title: "팝업 초안 3",
    adminHref: "/admin/popup-notices/p3",
  },
  {
    contentType: "popup-notices",
    contentId: "p4",
    itemStatus: "ACTIVE",
    locale: "en",
    publicationStatus: "HIDDEN",
    itemUpdatedAt: "2026-01-05T00:00:00.000Z",
    localeUpdatedAt: "2026-01-05T00:00:00.000Z",
    title: "Popup hidden 4",
    adminHref: "/admin/popup-notices/p4",
  },
  {
    contentType: "popup-notices",
    contentId: "p5",
    itemStatus: "ACTIVE",
    locale: "en",
    publicationStatus: "SCHEDULED",
    itemUpdatedAt: "2026-01-15T00:00:00.000Z",
    localeUpdatedAt: "2026-01-15T00:00:00.000Z",
    title: "Popup scheduled 5",
    adminHref: "/admin/popup-notices/p5",
  },
  {
    contentType: "honors",
    contentId: "h1",
    itemStatus: "ACTIVE",
    locale: "ko",
    publicationStatus: "PUBLISHED",
    itemUpdatedAt: "2026-01-14T00:00:00.000Z",
    localeUpdatedAt: "2026-01-14T00:00:00.000Z",
    title: "수상 1",
    adminHref: "/admin/honors",
  },
  {
    contentType: "honors",
    contentId: "h1",
    itemStatus: "ACTIVE",
    locale: "en",
    publicationStatus: "PUBLISHED",
    itemUpdatedAt: "2026-01-14T00:00:00.000Z",
    localeUpdatedAt: "2026-01-02T00:00:00.000Z",
    title: "Honor 1 en",
    adminHref: "/admin/honors",
  },
  {
    contentType: "honors",
    contentId: "h2",
    itemStatus: "ARCHIVED",
    locale: "ko",
    publicationStatus: "HIDDEN",
    itemUpdatedAt: "2026-01-03T00:00:00.000Z",
    localeUpdatedAt: "2026-01-03T00:00:00.000Z",
    title: "수상 보관 2",
    adminHref: "/admin/honors",
  },
];

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

  it("리팩터 전후 집계 결과가 정확히 동일하다 (순서 포함, 8개 초과 항목의 slice 경계 포함)", () => {
    // 리팩터 전(HEAD 7610f2f) buildAdminDashboardData(regressionRows)를 실행해
    // 한 번 캡처한 값을 그대로 고정한 스냅샷이다. 리팩터 후에도 이 값과
    // byte-identical해야 한다 (동률 처리 순서 포함).
    const expected = JSON.parse(
      '{"summary":[{"contentType":"news","activeCount":4,"archivedCount":1,"locales":{"ko":{"DRAFT":2,"PUBLISHED":0,"HIDDEN":0},"en":{"DRAFT":0,"PUBLISHED":1,"HIDDEN":1,"UNPUBLISHED":1}}},{"contentType":"notices","activeCount":5,"archivedCount":0,"locales":{"ko":{"DRAFT":0,"SCHEDULED":1,"PUBLISHED":0,"UNPUBLISHED":1,"HIDDEN":1},"en":{"DRAFT":2,"SCHEDULED":0,"PUBLISHED":0,"UNPUBLISHED":0}}},{"contentType":"popup-notices","activeCount":5,"archivedCount":0,"locales":{"ko":{"DRAFT":1,"SCHEDULED":0,"PUBLISHED":0,"UNPUBLISHED":0,"HIDDEN":1},"en":{"DRAFT":0,"SCHEDULED":1,"PUBLISHED":0,"UNPUBLISHED":1,"HIDDEN":1}}},{"contentType":"honors","activeCount":1,"archivedCount":1,"locales":{"ko":{"DRAFT":0,"PUBLISHED":1,"HIDDEN":0},"en":{"DRAFT":0,"PUBLISHED":1,"HIDDEN":0}}}],"attention":[{"id":"popup-notices:p3:ko","contentId":"p3","contentType":"popup-notices","title":"팝업 초안 3","locale":"ko","publicationStatus":"DRAFT","updatedAt":"2026-01-13T00:00:00.000Z","adminHref":"/admin/popup-notices/p3"},{"id":"popup-notices:p2:en","contentId":"p2","contentType":"popup-notices","title":"Popup unpublished 2","locale":"en","publicationStatus":"UNPUBLISHED","updatedAt":"2026-01-12T00:00:00.000Z","adminHref":"/admin/popup-notices/p2"},{"id":"notices:no2:en","contentId":"no2","contentType":"notices","title":"Notice draft 2","locale":"en","publicationStatus":"DRAFT","updatedAt":"2026-01-11T00:00:00.000Z","adminHref":"/admin/notices/no2"},{"id":"news:n1:ko","contentId":"n1","contentType":"news","title":"뉴스 초안 1","locale":"ko","publicationStatus":"DRAFT","updatedAt":"2026-01-10T00:00:00.000Z","adminHref":"/admin/news/n1"},{"id":"news:n2:en","contentId":"n2","contentType":"news","title":"News hidden 2","locale":"en","publicationStatus":"HIDDEN","updatedAt":"2026-01-10T00:00:00.000Z","adminHref":"/admin/news/n2"},{"id":"notices:no1:ko","contentId":"no1","contentType":"notices","title":"공지 미게시 1","locale":"ko","publicationStatus":"UNPUBLISHED","updatedAt":"2026-01-09T00:00:00.000Z","adminHref":"/admin/notices/no1"},{"id":"popup-notices:p1:ko","contentId":"p1","contentType":"popup-notices","title":"팝업 숨김 1","locale":"ko","publicationStatus":"HIDDEN","updatedAt":"2026-01-08T00:00:00.000Z","adminHref":"/admin/popup-notices/p1"},{"id":"news:n3:ko","contentId":"n3","contentType":"news","title":"뉴스 초안 3","locale":"ko","publicationStatus":"DRAFT","updatedAt":"2026-01-07T00:00:00.000Z","adminHref":"/admin/news/n3"}],"recent":[{"id":"popup-notices:p5:en","contentId":"p5","contentType":"popup-notices","title":"Popup scheduled 5","locale":"en","publicationStatus":"SCHEDULED","updatedAt":"2026-01-15T00:00:00.000Z","adminHref":"/admin/popup-notices/p5"},{"id":"honors:h1:ko","contentId":"h1","contentType":"honors","title":"수상 1","locale":"ko","publicationStatus":"PUBLISHED","updatedAt":"2026-01-14T00:00:00.000Z","adminHref":"/admin/honors"},{"id":"popup-notices:p3:ko","contentId":"p3","contentType":"popup-notices","title":"팝업 초안 3","locale":"ko","publicationStatus":"DRAFT","updatedAt":"2026-01-13T00:00:00.000Z","adminHref":"/admin/popup-notices/p3"},{"id":"popup-notices:p2:en","contentId":"p2","contentType":"popup-notices","title":"Popup unpublished 2","locale":"en","publicationStatus":"UNPUBLISHED","updatedAt":"2026-01-12T00:00:00.000Z","adminHref":"/admin/popup-notices/p2"},{"id":"notices:no2:en","contentId":"no2","contentType":"notices","title":"Notice draft 2","locale":"en","publicationStatus":"DRAFT","updatedAt":"2026-01-11T00:00:00.000Z","adminHref":"/admin/notices/no2"},{"id":"news:n1:ko","contentId":"n1","contentType":"news","title":"뉴스 초안 1","locale":"ko","publicationStatus":"DRAFT","updatedAt":"2026-01-10T00:00:00.000Z","adminHref":"/admin/news/n1"},{"id":"news:n2:en","contentId":"n2","contentType":"news","title":"News hidden 2","locale":"en","publicationStatus":"HIDDEN","updatedAt":"2026-01-10T00:00:00.000Z","adminHref":"/admin/news/n2"},{"id":"notices:no1:ko","contentId":"no1","contentType":"notices","title":"공지 미게시 1","locale":"ko","publicationStatus":"UNPUBLISHED","updatedAt":"2026-01-09T00:00:00.000Z","adminHref":"/admin/notices/no1"}]}',
    );

    const result = buildAdminDashboardData(regressionRows);

    expect(result.attention.length).toBeGreaterThan(0);
    expect(JSON.parse(JSON.stringify(result))).toEqual(expected);
  });
});
