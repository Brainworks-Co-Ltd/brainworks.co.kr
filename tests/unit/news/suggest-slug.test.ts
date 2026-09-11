import { describe, expect, it } from "vitest";
import { suggestSlug } from "@/lib/news-slug";

describe("suggestSlug", () => {
  it("라틴 문자 제목은 소문자 하이픈 슬러그가 된다", () => {
    expect(suggestSlug("Hello World 2026", "2026-09-11")).toBe(
      "hello-world-2026",
    );
  });

  it("순한글 제목 두 개는 같은 날에도 서로 다른 값을 낸다", () => {
    const a = suggestSlug("브레인웍스 수상", "2026-09-11");
    const b = suggestSlug("브레인웍스 인증", "2026-09-11");
    expect(a).not.toBe(b);
    expect(a.startsWith("news-20260911")).toBe(true);
  });
});
