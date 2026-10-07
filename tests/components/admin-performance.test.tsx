import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/router", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/server/auth/require-admin", () => ({ requireAdminPage: vi.fn() }));
vi.mock("@/server/modules/web-vitals/service", () => ({
  getPerformanceDashboard: vi.fn(),
}));

import AdminPerformance from "@/pages/admin/performance";

const empty = {
  days: 7,
  devices: { mobile: {}, desktop: {} },
  routes: [],
  builds: [],
};

describe("관리자 성능 화면", () => {
  it("기록이 없으면 패널마다 콜아웃 하나로 알린다", () => {
    render(<AdminPerformance dashboard={empty} />);
    expect(
      screen.getAllByText("최근 7일 동안 수집된 기록이 없습니다."),
    ).toHaveLength(3);
    expect(
      screen.getByText("아직 수집된 기록이 없습니다."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "성능" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("등급을 글자로 함께 보여 주고 표에 경로와 배포를 그린다", () => {
    render(
      <AdminPerformance
        dashboard={{
          ...empty,
          days: 30,
          devices: {
            mobile: {
              LCP: { p75: 4200, count: 12 },
              CLS: { p75: 0.04, count: 12 },
            },
            desktop: {},
          },
          routes: [
            { route: "/news/[slug]", stats: { LCP: { p75: 4200, count: 12 } } },
          ],
          builds: [
            {
              buildId: "abcdefgh12345",
              firstSeenAt: "2026-10-06T03:00:00.000Z",
              count: 24,
              stats: { TTFB: { p75: 512.4, count: 12 } },
            },
          ],
        }}
      />,
    );
    const mobile = screen.getByRole("region", { name: "모바일" });
    expect(within(mobile).getByText("4,200ms")).toBeInTheDocument();
    expect(within(mobile).getByText("나쁨")).toBeInTheDocument();
    expect(within(mobile).getByText("0.04")).toBeInTheDocument();
    expect(within(mobile).getByText("좋음")).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "/news/[slug]" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "abcdefgh" }),
    ).toBeInTheDocument();
    expect(screen.getByText("10월 6일 12:00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "최근 30일" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
