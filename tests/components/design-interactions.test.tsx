import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BusinessAreaExplorer from "@/components/services/BusinessAreaExplorer";
import IndustrialHero from "@/components/industrial/IndustrialHero";

const router = vi.hoisted(() => ({
  query: {},
  pathname: "/services",
  replace: vi.fn(),
  push: vi.fn(),
}));
vi.mock("next/router", () => ({ useRouter: () => router }));
vi.mock("@/shared/routing/useLocale", () => ({
  useLocale: () => ({ language: "ko" }),
}));

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("디자인 개선의 탐색과 제목", () => {
  it("탭 방향키를 연속해서 누르면 선택과 초점이 함께 이동하고 양끝을 순환한다", async () => {
    const user = userEvent.setup();
    render(<BusinessAreaExplorer />);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(tabs[2]).toHaveFocus();
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{End}{ArrowRight}");
    expect(tabs[0]).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(tabs[3]).toHaveFocus();
    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();
  });

  it("첫 화면은 시간이 지나도 완성된 질문을 유지하고 직접 선택한 현장의 답을 읽을 수 있다", () => {
    vi.useFakeTimers();
    render(<IndustrialHero />);
    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toHaveAccessibleName(
      "제조 현장의 문제를 AI로 풀 수 있을까요?",
    );
    act(() => vi.advanceTimersByTime(2500));
    expect(title).toHaveAccessibleName(
      "제조 현장의 문제를 AI로 풀 수 있을까요?",
    );
    fireEvent.click(screen.getByRole("button", { name: /진료 현장/ }));
    expect(title).toHaveTextContent("진료 현장의 문제를 AI로 풀 수 있을까요?");
    expect(
      screen.getByText("심전도와 치과 영상 판독을 자동화했습니다."),
    ).toBeVisible();
    act(() => vi.advanceTimersByTime(10000));
    expect(title).toHaveTextContent("진료 현장의 문제를 AI로 풀 수 있을까요?");
  });

  it("그래픽을 정지한 뒤 다른 현장을 선택해도 멈춤을 유지하고 직접 다시 재생한다", () => {
    render(<IndustrialHero />);
    const hero = screen.getByRole("region", { name: "브레인웍스 사업 영역" });
    fireEvent.click(screen.getByRole("button", { name: "움직임 정지" }));
    expect(hero).toHaveAttribute("data-motion-paused", "true");
    fireEvent.click(screen.getByRole("button", { name: /도시 관제/ }));
    expect(hero).toHaveAttribute("data-motion-paused", "true");
    fireEvent.click(screen.getByRole("button", { name: "움직임 다시 보기" }));
    expect(hero).toHaveAttribute("data-motion-paused", "false");
  });

  it("동작 줄이기 설정은 그래픽 재생보다 우선한다", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    render(<IndustrialHero />);
    expect(
      screen.getByRole("region", { name: "브레인웍스 사업 영역" }),
    ).toHaveAttribute("data-motion-paused", "true");
    expect(
      screen.getByRole("button", { name: "동작 줄이기 적용 중" }),
    ).toBeDisabled();
  });
});
