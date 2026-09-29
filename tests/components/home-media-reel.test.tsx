import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));
vi.mock("@/shared/routing/useLocale", () => ({
  useLocale: () => ({ language: "ko" }),
}));
vi.mock("next/head", () => ({
  default: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

import HomeMedia from "@/components/home/HomeMedia";

describe("홈 영상 릴 조작", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("6초마다 다음 컷으로 넘어가고, 다음 버튼은 곧바로 넘긴다", () => {
    render(<HomeMedia />);
    expect(screen.getByText("01")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByText("02")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("일시정지하면 자동으로 넘어가지 않고, 이전/다음은 일시정지를 풀지 않는다", () => {
    render(<HomeMedia />);
    fireEvent.click(screen.getByRole("button", { name: "일시정지" }));
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByText("01")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "재생" })).toBeInTheDocument();
  });
});
