import { describe, expect, it } from "vitest";
import {
  buildAdminDashboardData,
  emptySignals,
  type DashboardRow,
  type DashboardSignals,
} from "@/server/modules/admin/dashboard";

const now = new Date("2026-10-06T03:00:00.000Z");
const day = 24 * 60 * 60 * 1000;
const at = (offsetDays: number) => new Date(now.getTime() + offsetDays * day).toISOString();

function row(overrides: Partial<DashboardRow> & Pick<DashboardRow, "contentId" | "locale">): DashboardRow {
  return {
    contentType: "news",
    itemStatus: "ACTIVE",
    publicationStatus: "DRAFT",
    localeUpdatedAt: at(-1),
    title: `${overrides.contentId} ${overrides.locale}`,
    adminHref: `/admin/x/${overrides.contentId}`,
    ...overrides,
  };
}

function pair(
  base: Partial<DashboardRow> & { contentId: string },
  ko: Partial<DashboardRow>,
  en: Partial<DashboardRow>,
) {
  return [row({ ...base, locale: "ko", ...ko }), row({ ...base, locale: "en", ...en })];
}

describe("운영 현황: 지금 홈페이지에 보이는 것", () => {
  it("노출 중인 팝업만 언어별로 곧 끝나는 순서로 보여 준다", () => {
    const popup = { contentType: "popup-notices" as const };
    const data = buildAdminDashboardData(
      [
        ...pair({ ...popup, contentId: "p-late" }, { publicationStatus: "PUBLISHED", publishEndsAt: at(10) }, {}),
        ...pair({ ...popup, contentId: "p-soon" }, { publicationStatus: "PUBLISHED", publishEndsAt: at(2) }, {}),
        ...pair({ ...popup, contentId: "p-open" }, { publicationStatus: "PUBLISHED" }, { publicationStatus: "PUBLISHED" }),
        ...pair({ ...popup, contentId: "p-ended" }, { publicationStatus: "PUBLISHED", publishEndsAt: at(-1) }, {}),
        ...pair({ ...popup, contentId: "p-future" }, { publicationStatus: "SCHEDULED", publishStartsAt: at(1) }, {}),
        ...pair(
          { ...popup, contentId: "p-archived", itemStatus: "ARCHIVED" },
          { publicationStatus: "PUBLISHED" },
          {},
        ),
      ],
      now,
    );

    expect(data.live.popups.ko.map((item) => item.contentId)).toEqual(["p-soon", "p-late", "p-open"]);
    expect(data.live.popups.ko[0]).toMatchObject({ endsAt: at(2), daysLeft: 2 });
    expect(data.live.popups.en.map((item) => item.contentId)).toEqual(["p-open"]);
    expect(data.live.popupLimit).toBe(3);
  });

  it("상단 고정 공지는 지금 공개 중인 언어와 함께 보여 준다", () => {
    const notice = { contentType: "notices" as const };
    const data = buildAdminDashboardData(
      [
        ...pair({ ...notice, contentId: "pinned", isPinned: true }, { publicationStatus: "PUBLISHED" }, { publicationStatus: "DRAFT" }),
        ...pair({ ...notice, contentId: "pinned-draft", isPinned: true }, {}, {}),
        ...pair({ ...notice, contentId: "plain", isPinned: false }, { publicationStatus: "PUBLISHED" }, {}),
      ],
      now,
    );

    expect(data.live.pinnedNotices).toEqual([
      { contentId: "pinned", title: "pinned ko", adminHref: "/admin/x/pinned", locales: ["ko"] },
    ]);
  });
});

describe("운영 현황: 7일 안에 바뀌는 것", () => {
  it("7일 안에 시작하거나 끝나는 공지와 팝업만 시각 순으로 모은다", () => {
    const data = buildAdminDashboardData(
      [
        ...pair(
          { contentType: "notices", contentId: "starts" },
          { publicationStatus: "SCHEDULED", publishStartsAt: at(3) },
          {},
        ),
        ...pair(
          { contentType: "notices", contentId: "far" },
          { publicationStatus: "SCHEDULED", publishStartsAt: at(8) },
          {},
        ),
        ...pair(
          { contentType: "popup-notices", contentId: "ends" },
          { publicationStatus: "PUBLISHED", publishEndsAt: at(1.5) },
          {},
        ),
        ...pair(
          { contentType: "popup-notices", contentId: "no-end" },
          { publicationStatus: "PUBLISHED" },
          {},
        ),
        ...pair(
          { contentType: "notices", contentId: "short" },
          { publicationStatus: "SCHEDULED", publishStartsAt: at(4), publishEndsAt: at(6) },
          {},
        ),
        ...pair(
          { contentType: "news", contentId: "news" },
          { publicationStatus: "PUBLISHED" },
          {},
        ),
      ],
      now,
    );

    expect(data.upcoming.map((item) => [item.id, item.change, item.daysLeft])).toEqual([
      ["ends:ko:end", "end", 2],
      ["starts:ko:start", "start", 3],
      ["short:ko:start", "start", 4],
      ["short:ko:end", "end", 6],
    ]);
  });
});

describe("운영 현황: 한 언어만 게시된 항목", () => {
  it("한쪽만 공개 중이거나 예약된 항목을 다른 쪽 상태와 함께 모은다", () => {
    const data = buildAdminDashboardData(
      [
        ...pair({ contentId: "ko-only" }, { publicationStatus: "PUBLISHED" }, { title: "" }),
        ...pair({ contentId: "en-only" }, { publicationStatus: "HIDDEN" }, { publicationStatus: "PUBLISHED" }),
        ...pair({ contentId: "both" }, { publicationStatus: "PUBLISHED" }, { publicationStatus: "PUBLISHED" }),
        ...pair({ contentId: "none" }, {}, {}),
        ...pair(
          { contentType: "notices", contentId: "scheduled" },
          { publicationStatus: "SCHEDULED", publishStartsAt: at(2) },
          {},
        ),
        ...pair(
          { contentId: "archived", itemStatus: "ARCHIVED" },
          { publicationStatus: "PUBLISHED" },
          {},
        ),
      ],
      now,
    );

    const byId = Object.fromEntries(data.oneLanguage.map((item) => [item.contentId, item]));
    expect(Object.keys(byId).sort()).toEqual(["en-only", "ko-only", "scheduled"]);
    expect(byId["ko-only"]).toMatchObject({ publicLocale: "ko", otherState: "DRAFT", otherHasTitle: false });
    expect(byId["en-only"]).toMatchObject({ publicLocale: "en", otherState: "HIDDEN", otherHasTitle: true });
    expect(byId["ko-only"].publicState).toBe("LIVE");
    // 예약만 된 언어를 게시 중으로 보여 주면 안 된다.
    expect(byId["scheduled"].publicState).toBe("SCHEDULED");
  });
});

describe("운영 현황: 작성 중인 초안", () => {
  it("한 번도 공개하지 않은 초안을 오래된 순으로 두고 30일 넘은 초안을 표시한다", () => {
    const data = buildAdminDashboardData(
      [
        ...pair({ contentId: "fresh", localeUpdatedAt: at(-2) }, {}, { title: "" }),
        ...pair({ contentId: "old", localeUpdatedAt: at(-45) }, { title: "" }, {}),
        ...pair({ contentId: "hidden" }, { publicationStatus: "HIDDEN" }, { title: "" }),
        ...pair({ contentId: "published" }, { publicationStatus: "PUBLISHED" }, {}),
        ...pair({ contentId: "empty" }, { title: "" }, { title: " " }),
        // 국문은 숨기고 영문만 제목이 있는 초안: 일부러 내린 글이라 초안이 아니다.
        ...pair({ contentId: "hidden-ko-draft-en", localeUpdatedAt: at(-60) }, { publicationStatus: "HIDDEN" }, {}),
        // 기간이 끝난 공지와 영문 초안도 마찬가지다.
        ...pair(
          { contentType: "notices", contentId: "ended-ko-draft-en" },
          { publicationStatus: "PUBLISHED", publishEndsAt: at(-3) },
          {},
        ),
      ],
      now,
    );

    expect(data.drafts.map((item) => [item.contentId, item.locales, item.stale])).toEqual([
      ["old", ["en"], true],
      ["fresh", ["ko"], false],
    ]);
    expect(data.drafts[0].title).toBe("old en");
  });

  it("대표 이미지 없이 공개 중인 뉴스를 따로 모은다", () => {
    const data = buildAdminDashboardData(
      [
        ...pair({ contentId: "no-cover", hasCover: false }, { publicationStatus: "PUBLISHED" }, {}),
        ...pair({ contentId: "cover", hasCover: true }, { publicationStatus: "PUBLISHED" }, {}),
        ...pair({ contentId: "draft-no-cover", hasCover: false }, {}, {}),
      ],
      now,
    );

    expect(data.newsWithoutCover.map((item) => item.contentId)).toEqual(["no-cover"]);
  });
});

describe("운영 현황: 남은 날짜", () => {
  it("서울 달력 기준으로 오늘, 내일을 센다", () => {
    // 서울 시각 10월 6일 23시. 다음 날 새벽 1시에 끝나는 팝업은 내일 끝난다.
    const lateNight = new Date("2026-10-06T14:00:00.000Z");
    const data = buildAdminDashboardData(
      [
        ...pair(
          { contentType: "popup-notices", contentId: "tomorrow" },
          { publicationStatus: "PUBLISHED", publishEndsAt: "2026-10-06T16:00:00.000Z" },
          {},
        ),
        ...pair(
          { contentType: "popup-notices", contentId: "today" },
          { publicationStatus: "PUBLISHED", publishEndsAt: "2026-10-06T14:30:00.000Z" },
          {},
        ),
      ],
      lateNight,
    );

    expect(Object.fromEntries(data.live.popups.ko.map((item) => [item.contentId, item.daysLeft]))).toEqual({
      today: 0,
      tomorrow: 1,
    });
  });
});

describe("운영 현황: 문제 경고", () => {
  const signals = (overrides: Partial<DashboardSignals["server"]> & { failures?: number }): DashboardSignals => ({
    contactFailures: { count: overrides.failures ?? 0, latestAt: null },
    server: {
      checked: overrides.checked ?? true,
      latestBackupAt: overrides.latestBackupAt === undefined ? at(-0.1) : overrides.latestBackupAt,
      diskUsedRatio: overrides.diskUsedRatio ?? 0.4,
    },
  });

  it("문제가 없으면 경고를 띄우지 않는다", () => {
    expect(buildAdminDashboardData([], now, signals({})).warnings).toEqual([]);
    expect(buildAdminDashboardData([], now, emptySignals).warnings).toEqual([]);
  });

  it("문의 메일 실패, 12시간 넘은 백업, 80% 넘은 디스크를 경고한다", () => {
    const warnings = buildAdminDashboardData(
      [],
      now,
      signals({ failures: 2, latestBackupAt: new Date(now.getTime() - 13 * 60 * 60 * 1000).toISOString(), diskUsedRatio: 0.82 }),
    ).warnings;

    expect(warnings.map((warning) => warning.kind)).toEqual(["contact", "backup", "disk"]);
    expect(warnings[0].message).toContain("문의 2건");
    expect(warnings[1].message).toContain("13시간 전");
    expect(warnings[2].message).toContain("82%");
  });

  it("백업 파일이 하나도 없으면 경고하고, 서버를 확인하지 않은 환경에서는 조용히 넘어간다", () => {
    expect(buildAdminDashboardData([], now, signals({ latestBackupAt: null })).warnings.map((w) => w.kind)).toEqual([
      "backup",
    ]);
    expect(
      buildAdminDashboardData([], now, signals({ checked: false, latestBackupAt: null, diskUsedRatio: 0.99 })).warnings,
    ).toEqual([]);
  });
});

describe("운영 현황: 최근 변경", () => {
  it("항목마다 가장 최근 언어 한 줄을 고친 사람과 함께 8개까지 보여 준다", () => {
    const rows: DashboardRow[] = [];
    for (let index = 0; index < 10; index += 1) {
      rows.push(
        ...pair(
          // 보관한 항목도 최근 변경에는 남는다.
          { contentId: `n${index}`, itemStatus: index === 0 ? "ARCHIVED" : "ACTIVE" },
          { localeUpdatedAt: at(-index - 0.5), actorName: "관리자 국문" },
          { localeUpdatedAt: at(-index), actorName: "관리자 영문" },
        ),
      );
    }

    const recent = buildAdminDashboardData(rows, now).recent;

    expect(recent).toHaveLength(8);
    expect(recent.map((item) => item.contentId)).toEqual(["n0", "n1", "n2", "n3", "n4", "n5", "n6", "n7"]);
    expect(recent[0]).toMatchObject({ locale: "en", actorName: "관리자 영문", archived: true });
    expect(recent[1].archived).toBe(false);
  });
});
