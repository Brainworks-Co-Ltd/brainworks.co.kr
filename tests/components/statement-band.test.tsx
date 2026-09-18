import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatementBand } from "@/components/public/StatementBand";

let nextFrame: FrameRequestCallback | undefined;

function rect(left: number) {
  return {
    left,
    right: left + 100,
    top: 0,
    bottom: 100,
    width: 100,
    height: 100,
    x: left,
    y: 0,
    toJSON: () => ({}),
  };
}

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

describe("선언 문구 강조", () => {
  it("핵심 구절에 걸친 어절은 서 있고 나머지는 옅게 깔린다", () => {
    const { container } = render(
      <StatementBand
        eyebrow="선언"
        text="현장에서 곧바로 쓰이는 AI를 설계합니다."
        emphasis={["곧바로 쓰이는"]}
      />,
    );
    const lit = Array.from(container.querySelectorAll(".bw-statement__lit"));
    const dim = Array.from(container.querySelectorAll(".bw-statement__dim"));
    expect(lit.map((node) => node.textContent)).toEqual(["곧바로", "쓰이는"]);
    expect(dim.map((node) => node.textContent)).toEqual([
      "현장에서",
      "AI를",
      "설계합니다.",
    ]);
  });

  it("포인터와 가까운 옅은 어절만 밝아지고 벗어나면 복원되며 핵심 구절은 건드리지 않는다", () => {
    const { container } = render(
      <StatementBand
        eyebrow="선언"
        text="첫 번째 두 번째"
        emphasis={["두 번째"]}
      />,
    );
    const root = container.querySelector(".bw-statement__inner");
    const dim = Array.from(
      container.querySelectorAll<HTMLElement>(".bw-statement__dim"),
    );
    const lit = container.querySelector<HTMLElement>(".bw-statement__lit");
    vi.spyOn(dim[0], "getBoundingClientRect").mockReturnValue(rect(0));
    vi.spyOn(dim[1], "getBoundingClientRect").mockReturnValue(rect(2000));

    fireEvent.pointerMove(root!, { clientX: 50, clientY: 50 });
    act(() => nextFrame?.(0));

    expect(dim[0].style.opacity).toBe("1");
    expect(Number(dim[1].style.opacity)).toBeCloseTo(0.34);
    expect(lit?.style.opacity).toBe("");

    fireEvent.pointerLeave(root!);
    expect(dim.every((word) => word.style.opacity === "")).toBe(true);
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
    fireEvent.pointerMove(root!, { clientX: 250, clientY: 50 });
    const words = Array.from(
      container.querySelectorAll<HTMLElement>(".bw-statement__word"),
    );
    expect(words.every((word) => word.style.opacity === "")).toBe(true);
  });
});
