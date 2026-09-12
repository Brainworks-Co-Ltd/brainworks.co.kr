import { describe, expect, it } from "vitest";
import { markdownToHtml, __markdownCacheSize } from "@/lib/markdown";

describe("markdownToHtml 캐시", () => {
  it("같은 입력을 두 번 호출하면 동일한 문자열을 반환하고 캐시에 한 번만 쌓인다", () => {
    const sizeBefore = __markdownCacheSize();
    const markdown = "# 캐시 테스트\n\n본문입니다.";

    const first = markdownToHtml(markdown);
    const sizeAfterFirst = __markdownCacheSize();
    const second = markdownToHtml(markdown);
    const sizeAfterSecond = __markdownCacheSize();

    expect(second).toBe(first);
    expect(sizeAfterFirst).toBe(sizeBefore + 1);
    expect(sizeAfterSecond).toBe(sizeAfterFirst);
  });

  it("201개의 서로 다른 입력을 넣으면 캐시 크기는 200을 넘지 않는다", () => {
    for (let i = 0; i < 201; i += 1) {
      markdownToHtml(`# 문서 ${i}\n\n본문 ${i}`);
    }

    expect(__markdownCacheSize()).toBeLessThanOrEqual(200);
  });

  it("빈 입력은 캐시하지 않고 빈 문자열을 반환한다", () => {
    const sizeBefore = __markdownCacheSize();

    expect(markdownToHtml("")).toBe("");
    expect(__markdownCacheSize()).toBe(sizeBefore);
  });
});
