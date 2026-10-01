import { readFileSync } from "node:fs";
import { eq, sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import { news } from "@/server/db/schema/news";
import { createNews } from "@/server/modules/news/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

const migrationSql = readFileSync(
  "src/server/db/migrations/0005_news_category_codes.sql",
  "utf8",
);

async function seedNews(actorId: string, slug: string, storedCategory: string) {
  const created = await createNews(
    {
      slug,
      category: "COMPANY",
      displayDate: "2025-04-09",
      locales: {
        ko: { title: slug, summary: "", bodyMarkdown: "" },
        en: { title: slug, summary: "", bodyMarkdown: "" },
      },
    },
    actorId,
  );
  // 마이그레이션 이전 데이터처럼 분류를 표시 이름으로 되돌려 둔다.
  await getDb().update(news).set({ category: storedCategory }).where(eq(news.id, created.id));
  return created.id;
}

async function categoryOf(id: string) {
  const [row] = await getDb().select({ category: news.category }).from(news).where(eq(news.id, id));
  return row.category;
}

describe.skipIf(!hasTestDatabase)("뉴스 분류 코드 마이그레이션", () => {
  let actorId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  it("표시 이름을 코드로 바꾸고 기존 기사를 내용에 맞게 다시 나눈다", async () => {
    const mou = await seedNews(actorId, "soonchunhyang-mou-2025", "회사 소식");
    const talk = await seedNews(actorId, "daegu-legend50-tech-exchange", "회사 소식");
    const training = await seedNews(actorId, "jeonnam-technopark-ai-training-2025", "회사 소식");
    const award = await seedNews(actorId, "ai-process-anomaly-award-2025", "회사 소식");
    const labelled = await seedNews(actorId, "new-partnership-item", "업무협약");
    const adminEdited = await seedNews(actorId, "kongju-future-mobility-mou-2025", "BUSINESS");

    for (const statement of migrationSql.split("--> statement-breakpoint")) {
      await getDb().execute(sql.raw(statement));
    }

    expect(await categoryOf(mou)).toBe("PARTNERSHIP");
    expect(await categoryOf(talk)).toBe("COMPANY");
    expect(await categoryOf(training)).toBe("BUSINESS");
    expect(await categoryOf(award)).toBe("AWARD");
    expect(await categoryOf(labelled)).toBe("PARTNERSHIP");
    // 관리자가 이미 다른 분류로 바꾼 기사는 그대로 둔다.
    expect(await categoryOf(adminEdited)).toBe("BUSINESS");
  });
});
