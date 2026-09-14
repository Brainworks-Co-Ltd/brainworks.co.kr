import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BusinessAreaCarousel from "@/components/home/BusinessAreaCarousel";

describe("홈 사업 영역", () => {
  it("사업 영역을 직접 선택하고 서비스 탐색 링크를 제공한다", () => {
    render(<BusinessAreaCarousel />);
    const tabs = screen.getAllByRole("button", { name: /사업 영역 보기|View/ });

    expect(tabs.length).toBeGreaterThanOrEqual(4);
    fireEvent.click(tabs[1]);
    expect(screen.getByRole("heading", { level: 3 })).toBeVisible();
    expect(
      screen.getByRole("link", { name: /전체 솔루션|View all solutions/ }),
    ).toHaveAttribute("href", expect.stringContaining("/services?area="));
  });

  it("일시정지 후 재생해도 현재 진행률을 유지한다", () => {
    vi.useFakeTimers();

    try {
      render(<BusinessAreaCarousel />);
      const progress = screen.getByRole("progressbar", {
        name: /Manufacturing AI 진행률/,
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
