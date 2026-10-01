import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAllPublishedNews } from "@/server/modules/news/query-service";
import { NEWS_CATEGORY_CODES } from "@/lib/news-categories";

describe("getAllPublishedNews (DB 없는 마크다운 모드)", () => {
  const original = process.env.DATABASE_URL;
  beforeEach(() => {
    delete process.env.DATABASE_URL;
  });
  afterEach(() => {
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  });

  it("한 페이지(12건)를 넘는 기사도 모두 가져온다", async () => {
    const items = await getAllPublishedNews({ locale: "ko" });
    expect(items.length).toBe(13);
    expect(new Set(items.map((item) => item.slug)).size).toBe(13);
    expect(items.map((item) => item.slug)).toContain("daegu-legend50-tech-exchange");
  });

  it("모든 기사가 정해진 분류 코드를 가진다", async () => {
    const items = await getAllPublishedNews({ locale: "en" });
    for (const item of items) expect(NEWS_CATEGORY_CODES).toContain(item.category);
  });
});
