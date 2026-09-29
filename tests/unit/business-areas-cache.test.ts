import { describe, expect, it } from "vitest";
import { getLocalizedBusinessAreas } from "@/data/businessAreas";

describe("getLocalizedBusinessAreas 캐시", () => {
  it("같은 언어로 두 번 호출하면 동일한 참조를 반환한다", () => {
    expect(getLocalizedBusinessAreas("ko")).toBe(
      getLocalizedBusinessAreas("ko"),
    );
  });

  it("다른 언어는 서로 다른 객체와 문구를 반환한다", () => {
    const ko = getLocalizedBusinessAreas("ko");
    const en = getLocalizedBusinessAreas("en");

    expect(ko).not.toBe(en);
    // 사업 영역 이름(title)은 브랜드성 표기라 ko/en이 같을 수 있어,
    // 실제로 언어별 문구가 갈리는 subtitle로 확인한다.
    expect(ko[0].subtitle).not.toBe(en[0].subtitle);
  });

  it("캐시된 결과의 첫 사업 영역 제목이 언어별로 기대한 값과 일치한다", () => {
    expect(getLocalizedBusinessAreas("ko")[0].title).toBe("Manufacturing AI");
    expect(getLocalizedBusinessAreas("en")[0].title).toBe("Manufacturing AI");
  });
});
