import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatementBand } from "@/components/public/StatementBand";

let nextFrame: FrameRequestCallback | undefined;

beforeEach(() => {
  nextFrame = undefined;
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      nextFrame = callback;
      return 1;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("hover: hover"),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("선언 문구 포인터 강조", () => {
  it("포인터와 가까운 어절을 가장 밝게 표시하고 벗어나면 모두 복원한다", () => {
    const { container } = render(
      <StatementBand eyebrow="선언" text="첫 번째 두 번째" />,
    );
    const root = container.querySelector(".bw-statement__inner");
    const words = Array.from(
      container.querySelectorAll<HTMLElement>("[data-word]"),
    );
    vi.spyOn(words[0], "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 100,
      top: 0,
      bottom: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(words[1], "getBoundingClientRect").mockReturnValue({
      left: 200,
      right: 300,
      top: 0,
      bottom: 100,
      width: 100,
      height: 100,
      x: 200,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.pointerMove(root!, { clientX: 250, clientY: 50 });
    act(() => nextFrame?.(0));

    expect(words[1].style.opacity).toBe("1");
    expect(Number(words[0].style.opacity)).toBeLessThan(1);

    fireEvent.pointerLeave(root!);
    expect(words.every((word) => word.style.opacity === "1")).toBe(true);
  });

  it("정밀 포인터가 없는 환경에서는 인라인 투명도를 바꾸지 않는다", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const { container } = render(
      <StatementBand eyebrow="선언" text="첫 번째 두 번째" />,
    );
    const root = container.querySelector(".bw-statement__inner");
    const words = Array.from(
      container.querySelectorAll<HTMLElement>("[data-word]"),
    );

    fireEvent.pointerMove(root!, { clientX: 250, clientY: 50 });

    expect(words.every((word) => word.style.opacity === "")).toBe(true);
  });
});
