import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatementBand } from "@/components/public/StatementBand";

describe("선언 문구 강조", () => {
  it("강조 구절만 밝은 글자로 세우고 나머지는 옅게 둔다", () => {
    const { container } = render(
      <StatementBand
        eyebrow="선언"
        text="AI가 모든 것을 대신한다고 믿지 않습니다. 다르게 설계합니다."
        emphasis={["믿지 않습니다", "다르게 설계합니다"]}
      />,
    );
    const lit = Array.from(container.querySelectorAll(".bw-statement__lit"));
    const dim = Array.from(container.querySelectorAll(".bw-statement__dim"));

    expect(lit.map((node) => node.textContent)).toEqual([
      "믿지 않습니다",
      "다르게 설계합니다",
    ]);
    expect(dim.map((node) => node.textContent)).toEqual([
      "AI가 모든 것을 대신한다고 ",
      ". ",
      ".",
    ]);
    // 나누어 그려도 문장은 한 글자도 빠지지 않는다.
    expect(container.querySelector(".bw-statement__text")?.textContent).toBe(
      "AI가 모든 것을 대신한다고 믿지 않습니다. 다르게 설계합니다.",
    );
  });

  it("강조 구절이 없으면 문장 전체를 밝게 둔다", () => {
    const { container } = render(
      <StatementBand eyebrow="선언" text="첫 번째 두 번째" />,
    );
    expect(container.querySelectorAll(".bw-statement__dim")).toHaveLength(0);
    expect(container.querySelector(".bw-statement__lit")?.textContent).toBe(
      "첫 번째 두 번째",
    );
  });
});
