import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatementBand } from "@/components/public/StatementBand";

let observed: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
const disconnect = vi.fn();

beforeEach(() => {
  observed = undefined;
  disconnect.mockClear();
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (callback) {
      observed = callback;
      return { observe: vi.fn(), disconnect };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("선언 문구 강조", () => {
  it("처음에는 흐리지 않고, 화면에 들어오면 핵심 구절 밖 어절이 순서대로 흐려진다", () => {
    const { container } = render(
      <StatementBand
        eyebrow="선언"
        text="각 산업에 맞는 AI로 함께 일하는 기업을 만듭니다."
        emphasis={["함께 일하는 기업"]}
      />,
    );
    const text = container.querySelector(".bw-statement__text");
    const lit = Array.from(container.querySelectorAll(".bw-statement__lit"));
    const dim = Array.from(
      container.querySelectorAll<HTMLElement>(".bw-statement__dim"),
    );

    expect(lit.map((node) => node.textContent)).toEqual([
      "함께",
      "일하는",
      "기업을",
    ]);
    // 흐려질 어절은 시작 0.75초 뒤부터 0.15초 간격이다.
    expect(dim.map((node) => node.style.transitionDelay)).toEqual([
      "750ms",
      "900ms",
      "1050ms",
      "1200ms",
      "1350ms",
    ]);
    expect(text?.classList.contains("is-dimmed")).toBe(false);

    observed?.([{ isIntersecting: false }]);
    expect(text?.classList.contains("is-dimmed")).toBe(false);

    observed?.([{ isIntersecting: true }]);
    expect(text?.classList.contains("is-dimmed")).toBe(true);
    expect(disconnect).toHaveBeenCalled();
  });

  it("핵심 구절이 없으면 흐려지지 않는다", () => {
    const { container } = render(
      <StatementBand eyebrow="선언" text="첫 번째 두 번째" />,
    );
    expect(observed).toBeUndefined();
    expect(
      container
        .querySelector(".bw-statement__text")
        ?.classList.contains("is-dimmed"),
    ).toBe(false);
  });
});
