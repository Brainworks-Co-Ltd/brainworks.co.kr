import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomeHero from "@/components/HomeHero";

const scenes = [
  {
    id: "one",
    title: "첫 장면",
    description: "첫 설명",
    src: "/one.gif",
    poster: "/one.jpg",
  },
  {
    id: "two",
    title: "두 번째 장면",
    description: "두 번째 설명",
    src: "/two.gif",
    poster: "/two.jpg",
  },
];

describe("HomeHero", () => {
  it("수동 이전·다음·일시정지 제어를 제공한다", () => {
    render(<HomeHero scenes={scenes} />);

    expect(screen.getByRole("heading", { name: "첫 장면" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByRole("heading", { name: "두 번째 장면" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "일시정지" }));
    expect(screen.getByRole("button", { name: "재생" })).toBeVisible();
  });

  it("직접 선택은 aria-current와 진행 표시를 갱신한다", () => {
    render(<HomeHero scenes={scenes} />);
    fireEvent.click(screen.getByRole("button", { name: "두 번째 장면 선택" }));

    expect(
      screen.getByRole("button", { name: "두 번째 장면 선택" }),
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("progressbar", { name: /두 번째 장면/ }),
    ).toBeVisible();
  });

  it("단일 장면에서는 자동 진행 상태 영역을 표시하지 않는다", () => {
    render(<HomeHero scenes={[scenes[0]]} />);

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("자동 진행")).not.toBeInTheDocument();
  });

  it("장면 미디어 오류 시 텍스트와 CTA는 유지한다", () => {
    render(<HomeHero scenes={[scenes[0]]} />);
    fireEvent.error(screen.getByRole("img", { name: "첫 장면" }));
    expect(screen.getByRole("heading", { name: "첫 장면" })).toBeVisible();
    expect(screen.getByText("미디어를 표시할 수 없습니다.")).toBeVisible();
  });

  it("자동 전환은 기본 시간 기준을 사용한다", () => {
    vi.useFakeTimers();
    render(<HomeHero scenes={scenes} />);
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByRole("heading", { name: "두 번째 장면" })).toBeVisible();
    vi.useRealTimers();
  });

  it("일시정지 후 재생해도 현재 진행률을 유지한다", () => {
    vi.useFakeTimers();

    try {
      render(<HomeHero scenes={scenes} />);
      const progress = screen.getByRole("progressbar", {
        name: /첫 장면 진행률/,
      });

      act(() => vi.advanceTimersByTime(1800));
      const pausedValue = Number(progress.getAttribute("aria-valuenow"));

      fireEvent.click(screen.getByRole("button", { name: "일시정지" }));
      act(() => vi.advanceTimersByTime(1000));
      expect(Number(progress.getAttribute("aria-valuenow"))).toBe(
        pausedValue,
      );

      fireEvent.click(screen.getByRole("button", { name: "재생" }));
      act(() => vi.advanceTimersByTime(100));
      expect(Number(progress.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(
        pausedValue,
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
