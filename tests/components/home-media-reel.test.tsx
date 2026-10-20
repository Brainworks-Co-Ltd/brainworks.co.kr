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

  it("첫 컷만 먼저 받고 나머지 컷의 영상 파일과 포스터는 1.5초 뒤에 받는다", () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal("fetch", fetchSpy);
    const { container } = render(<HomeMedia />);
    const videos = () => Array.from(container.querySelectorAll("video"));
    expect(videos().map((v) => v.getAttribute("preload"))).toEqual([
      "auto",
      "none",
      "none",
      "none",
    ]);
    // 첫 컷은 영상 포스터 대신 크기를 고를 수 있는 그림을 깐다
    expect(videos().map((v) => v.hasAttribute("poster"))).toEqual([
      false,
      false,
      false,
      false,
    ]);
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/images/services/hero/manufacturing.webp",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    // 안 보이는 컷의 video는 비워 둔다. 데이터를 채우면 그 첫 프레임이 LCP로 다시 잡힌다.
    expect(videos().map((v) => v.getAttribute("preload"))).toEqual([
      "auto",
      "none",
      "none",
      "none",
    ]);
    expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
      "/videos/home/agent.mp4",
      "/videos/home/healthcare.mp4",
      "/videos/home/smartcity.mp4",
    ]);
    expect(videos().map((v) => v.hasAttribute("poster"))).toEqual([
      false,
      true,
      true,
      true,
    ]);
    vi.unstubAllGlobals();
  });

  it("페이지가 다 뜨기 전에는 영상을 받지도 넘기지도 않는다", () => {
    const readyState = vi
      .spyOn(document, "readyState", "get")
      .mockReturnValue("loading");
    const { container } = render(<HomeMedia />);
    const preloads = () =>
      Array.from(container.querySelectorAll("video")).map((v) =>
        v.getAttribute("preload"),
      );
    expect(preloads()).toEqual(["none", "none", "none", "none"]);
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    readyState.mockReturnValue("complete");
    act(() => {
      window.dispatchEvent(new Event("load"));
    });
    expect(preloads()).toEqual(["auto", "none", "none", "none"]);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    readyState.mockRestore();
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
