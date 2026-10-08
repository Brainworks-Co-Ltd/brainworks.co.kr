import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GetServerSidePropsContext } from "next";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/router", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/server/auth/require-admin", () => ({
  requireAdminPage: vi.fn(async () => ({ props: {} })),
}));
vi.mock("@/server/modules/web-vitals/service", () => ({
  getPerformanceDashboard: vi.fn(),
  getSlowVisits: vi.fn(),
  getCauseBreakdown: vi.fn(),
}));

import { ROUTE_CHANGE } from "@/lib/performance-dashboard";
import AdminPerformance, {
  getServerSideProps,
} from "@/pages/admin/performance";
import {
  getSlowVisits,
  type PerformanceDashboard,
  type SlowFilter,
  type SlowVisit,
} from "@/server/modules/web-vitals/service";

const view: SlowFilter = {
  days: 7,
  metric: "LCP",
  device: "all",
  threshold: 2000,
};

const dashboard: PerformanceDashboard = {
  days: 7,
  devices: { mobile: {}, desktop: {} },
  routes: [],
  builds: [],
};

const lcpVisit: SlowVisit = {
  id: "1",
  createdAt: "2026-10-07T05:03:00.000Z",
  route: "/about",
  device: "desktop",
  connection: "3g",
  viewport: 1280,
  value: 7800,
  rating: "poor",
  attribution: {
    viewport: 1280,
    dpr: 1.25,
    ttfb: 4300,
    loadDelay: 200,
    loadDuration: 1500,
    renderDelay: 1800,
    element: "img.object-cover",
    resource: "/images/about/hero.webp w828",
    resourceKb: 182.4,
    transfer: { doc: 12.1, js: 240, css: 18, font: 0, image: 182.4, other: 0 },
    nav: {
      redirect: 0,
      redirectCount: 0,
      dns: 120,
      connect: 900,
      tls: 400,
      wait: 3100,
      before: 5,
    },
  },
  buildId: "abcdefgh12345",
  navigationType: "navigate",
  cause: "ttfb",
};

const oldVisit: SlowVisit = {
  ...lcpVisit,
  id: "2",
  value: 2400,
  connection: null,
  viewport: null,
  attribution: null,
  cause: "unknown",
};

function renderPage(props: Partial<Parameters<typeof AdminPerformance>[0]>) {
  return render(
    <AdminPerformance
      view={view}
      breakdown={{ total: 0, slow: 0, sample: 0, causes: [] }}
      visits={[]}
      dashboard={dashboard}
      {...props}
    />,
  );
}

const slowBreakdown = {
  total: 140,
  slow: 12,
  sample: 12,
  causes: [
    { cause: "ttfb" as const, element: null, count: 8, share: 8 / 12 },
    { cause: "unknown" as const, element: null, count: 4, share: 4 / 12 },
  ],
};

describe("관리자 성능 화면", () => {
  it("느린 방문이 없으면 콜아웃 하나로 알리고 원인과 목록을 그리지 않는다", () => {
    const { rerender } = renderPage({
      breakdown: { total: 140, slow: 0, sample: 0, causes: [] },
    });
    expect(
      screen.getByText("기간 안에 기준을 넘은 방문이 없습니다."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "원인" })).toBeNull();
    expect(screen.queryByRole("region", { name: "느린 방문 목록" })).toBeNull();
    expect(screen.getByRole("link", { name: "성능" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    rerender(
      <AdminPerformance
        view={view}
        breakdown={{ total: 0, slow: 0, sample: 0, causes: [] }}
        visits={[]}
        dashboard={dashboard}
      />,
    );
    expect(
      screen.getByText("최근 7일 동안 조건에 맞는 기록이 없습니다."),
    ).toBeInTheDocument();
  });

  it("느린 방문 수를 전체와 붙여 보여 주고 원인을 많은 순으로 막대와 함께 그린다", () => {
    renderPage({ breakdown: slowBreakdown, visits: [lcpVisit, oldVisit] });
    expect(screen.getByText("기준 2초를 넘은 방문")).toBeInTheDocument();
    expect(screen.getByText("12건")).toBeInTheDocument();
    expect(screen.getByText("/ 전체 140건 (9%)")).toBeInTheDocument();

    const causes = within(screen.getByRole("region", { name: "원인" }));
    const items = causes.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("첫 바이트")).toBeInTheDocument();
    expect(within(items[0]).getByText("8건")).toBeInTheDocument();
    expect(within(items[0]).getByText("67%")).toBeInTheDocument();
    expect(
      within(items[0]).getByText(/첫 바이트 내역에서 연결과 서버 대기/),
    ).toBeInTheDocument();
    // 막대는 화면 읽기에서 빼고 건수와 비율 글자가 같은 내용을 말한다.
    const bar = items[0].querySelector<HTMLElement>("[aria-hidden] > span");
    expect(bar?.style.width).toBe(`${(8 / 12) * 100}%`);
    expect(
      within(items[1]).getByText("원인 기록 없음(이전 버전)"),
    ).toBeInTheDocument();
  });

  it("목록 줄을 펼치면 단계별 시간 표와 원인 내역을 보여 준다", async () => {
    const user = userEvent.setup();
    renderPage({ breakdown: slowBreakdown, visits: [lcpVisit, oldVisit] });
    const list = screen.getByRole("region", { name: "느린 방문 목록" });
    const [first, second] = within(list).getAllByRole("listitem");

    expect(within(first).getByText("7,800ms")).toBeInTheDocument();
    expect(within(first).getByText("10월 7일 14:03")).toBeInTheDocument();
    expect(within(first).getByText("데스크톱 1280px")).toBeInTheDocument();
    expect(within(first).getByText("연결 3g")).toBeInTheDocument();
    const table = within(first).getByRole("table", { name: "단계별 시간" });
    expect(table).not.toBeVisible();

    await user.click(within(first).getByText("7,800ms"));
    expect(table).toBeVisible();
    const ttfb = within(table).getByRole("row", { name: /첫 바이트/ });
    expect(ttfb).toHaveTextContent("4,300ms");
    expect(
      within(first).getByText("/images/about/hero.webp w828"),
    ).toBeVisible();
    expect(
      within(first).getByText("크기").nextElementSibling,
    ).toHaveTextContent("182.4KB");
    expect(
      within(first).getByText("서버 대기").nextElementSibling,
    ).toHaveTextContent("3,100ms");
    // TLS는 연결 안에 들어 있어 연결 값 옆에 붙인다.
    expect(
      within(first).getByText("연결").nextElementSibling,
    ).toHaveTextContent("900ms (TLS 400ms)");
    expect(within(first).queryByText("TLS")).toBeNull();
    expect(within(first).getByText("abcdefgh")).toBeVisible();
    expect(within(first).getByText("일반 이동")).toBeVisible();

    await user.click(within(second).getByText("2,400ms"));
    expect(
      within(second).getByText("원인 내역을 모으기 전 버전에서 온 기록입니다."),
    ).toBeVisible();
    expect(within(second).queryByRole("table")).toBeNull();
  });

  it("CLS는 밀린 요소로 나눠 세고, 기준을 갓 넘은 값도 기준과 다르게 보인다", () => {
    const clsVisit: SlowVisit = {
      ...lcpVisit,
      id: "3",
      value: 0.1003,
      attribution: {
        viewport: 390,
        dpr: 3,
        element: "img.hero",
        largestShift: 0.1003,
        time: 800,
      },
      cause: "layout-shift",
    };
    renderPage({
      view: { ...view, metric: "CLS", threshold: 0.1 },
      breakdown: {
        total: 9000,
        slow: 6000,
        sample: 5000,
        causes: [
          {
            cause: "layout-shift",
            element: "img.hero",
            count: 4000,
            share: 0.8,
          },
          { cause: "unknown", element: null, count: 1000, share: 0.2 },
        ],
      },
      visits: [clsVisit],
    });
    const causes = screen.getByRole("region", { name: "원인" });
    expect(
      within(causes).getByText(
        /밀린 요소 위쪽에.*느린 방문 중 최근 5,000건으로 셉니다\./,
      ),
    ).toBeInTheDocument();
    const [element, unknown] = within(causes).getAllByRole("listitem");
    expect(within(element).getByText("img.hero")).toBeInTheDocument();
    expect(within(element).queryByText(/밀린 요소 위쪽에/)).toBeNull();
    expect(
      within(unknown).getByText("원인 기록 없음(이전 버전)"),
    ).toBeInTheDocument();

    const list = screen.getByRole("region", { name: "느린 방문 목록" });
    expect(within(list).getAllByText("0.1003")).toHaveLength(2);
  });

  it("필터 칩은 현재 선택을 표시하고 기본값을 뺀 주소로 잇는다", () => {
    renderPage({
      view: {
        days: 30,
        metric: ROUTE_CHANGE,
        device: "mobile",
        threshold: 1000,
      },
    });
    expect(screen.getByRole("link", { name: "화면 전환" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "화면 전환" })).toHaveAttribute(
      "href",
      "/admin/performance?days=30&metric=route-change&device=mobile&over=1000",
    );
    // 지표를 바꾸면 기준은 그 지표의 기본값으로 돌아간다.
    expect(screen.getByRole("link", { name: "LCP" })).toHaveAttribute(
      "href",
      "/admin/performance?days=30&device=mobile",
    );
    expect(screen.getByRole("link", { name: "최근 7일" })).toHaveAttribute(
      "href",
      "/admin/performance?metric=route-change&device=mobile&over=1000",
    );
    expect(screen.getByRole("link", { name: "전체" })).toHaveAttribute(
      "href",
      "/admin/performance?days=30&metric=route-change&over=1000",
    );
    expect(
      screen.getByRole("link", { name: "300ms 초과" }),
    ).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "1초 초과" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("전체 분포에 표본 수를 붙이고 표본이 적은 값과 볼 것 없는 경로를 가린다", () => {
    renderPage({
      dashboard: {
        ...dashboard,
        devices: {
          mobile: {
            LCP: { p75: 4200, count: 12 },
            CLS: { p75: 0.04, count: 40 },
          },
          desktop: {},
        },
        routes: [
          { route: "/news/[slug]", stats: { LCP: { p75: 4200, count: 12 } } },
          {
            route: "/hydration-only",
            stats: { "Next.js-hydration": { p75: 30, count: 3 } },
          },
        ],
        builds: [
          {
            buildId: "abcdefgh12345",
            firstSeenAt: "2026-10-06T03:00:00.000Z",
            count: 24,
            stats: { TTFB: { p75: 512.4, count: 24 } },
          },
        ],
      },
    });
    const mobile = within(screen.getByRole("region", { name: "모바일" }));
    expect(mobile.getByText("4,200ms")).toBeInTheDocument();
    expect(mobile.getByText("12건, 표본 적음")).toBeInTheDocument();
    expect(mobile.getByText("나쁨")).not.toHaveClass("text-red-700");
    expect(mobile.getByText("0.04")).toBeInTheDocument();
    expect(mobile.getByText("40건")).toBeInTheDocument();
    expect(mobile.getByText("좋음")).toHaveClass("text-emerald-800");

    expect(
      screen.queryByRole("columnheader", { name: "바로 방문" }),
    ).toBeNull();
    expect(
      screen.getByRole("rowheader", { name: "/news/[slug]" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("rowheader", { name: "/hydration-only" }),
    ).toBeNull();
    expect(
      screen.getByRole("rowheader", { name: "abcdefgh" }),
    ).toBeInTheDocument();
    expect(screen.getByText("512ms")).toBeInTheDocument();
    expect(screen.getByText("10월 6일 12:00")).toBeInTheDocument();
  });

  it("주소의 조건을 읽고 선택지에 없는 기준은 기본값으로 돌린다", async () => {
    const context = (query: Record<string, string>) =>
      ({ query }) as unknown as GetServerSidePropsContext;
    await getServerSideProps(
      context({
        days: "30",
        metric: "route-change",
        device: "mobile",
        over: "1000",
      }),
    );
    expect(getSlowVisits).toHaveBeenLastCalledWith({
      days: 30,
      metric: ROUTE_CHANGE,
      device: "mobile",
      threshold: 1000,
    });
    await getServerSideProps(
      context({ days: "9", metric: "FID", device: "tv", over: "1234" }),
    );
    expect(getSlowVisits).toHaveBeenLastCalledWith({
      days: 7,
      metric: "LCP",
      device: "all",
      threshold: 2000,
    });
  });
});
