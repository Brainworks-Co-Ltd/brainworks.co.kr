import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatementBand } from "@/components/public/StatementBand";

let observed: ((entries: { isIntersecting: boolean }[]) => void) | undefined;

beforeEach(() => {
  observed = undefined;
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (callback) {
      observed = callback;
      return { observe: vi.fn(), disconnect: vi.fn() };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubPointer(fine: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: fine,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe("선언 문구 강조", () => {
  it("핵심 구절에 걸친 어절과 흐려질 어절을 나누고 평소에는 아무것도 흐리지 않는다", () => {
    stubPointer(true);
    const { container } = render(
      <StatementBand
        eyebrow="선언"
        text="각 산업에 맞는 AI로 함께 일하는 기업을 만듭니다."
        emphasis={["함께 일하는 기업"]}
      />,
    );
    const text = container.querySelector(".bw-statement__text");
    const lit = Array.from(container.querySelectorAll(".bw-statement__lit"));
    expect(lit.map((node) => node.textContent)).toEqual([
      "함께",
      "일하는",
      "기업을",
    ]);
    expect(text?.classList.contains("has-emphasis")).toBe(true);
    expect(text?.classList.contains("is-focused")).toBe(false);
    // 마우스가 있는 기기는 CSS :hover가 맡으므로 관찰자를 걸지 않는다.
    expect(observed).toBeUndefined();
  });

  it("마우스가 없는 기기에서는 화면 가운데에 들어올 때 흐려지고 벗어나면 돌아온다", () => {
    stubPointer(false);
    const { container } = render(
      <StatementBand
        eyebrow="선언"
        text="첫 번째 두 번째"
        emphasis={["두 번째"]}
      />,
    );
    const text = container.querySelector(".bw-statement__text");
    observed?.([{ isIntersecting: true }]);
    expect(text?.classList.contains("is-focused")).toBe(true);
    observed?.([{ isIntersecting: false }]);
    expect(text?.classList.contains("is-focused")).toBe(false);
  });

  it("핵심 구절이 없으면 흐려질 대상이 없다", () => {
    stubPointer(false);
    const { container } = render(
      <StatementBand eyebrow="선언" text="첫 번째 두 번째" />,
    );
    expect(
      container
        .querySelector(".bw-statement__text")
        ?.classList.contains("has-emphasis"),
    ).toBe(false);
    expect(observed).toBeUndefined();
  });
});
