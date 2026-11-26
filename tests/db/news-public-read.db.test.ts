import { and, eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import {
  newsExternalLinks,
  newsLocales,
  newsSlugs,
} from "@/server/db/schema/news";
import {
  readDatabaseNewsDetail,
  readDatabaseNewsList,
} from "@/server/modules/news/database-source";
import {
  archiveNews,
  createNews,
  hideNewsLocale,
  publishNewsLocale,
  type NewsCommandInput,
} from "@/server/modules/news/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

function newsInput(label: string, day: number): NewsCommandInput {
  return {
    category: "COMPANY",
    displayDate: `2026-01-${String(day).padStart(2, "0")}`,
    locales: {
      ko: {
        title: `제목 ${label}`,
        summary: `요약 ${label}`,
        bodyMarkdown: "**본문**",
      },
      en: {
        title: `Title ${label}`,
        summary: `Summary ${label}`,
        bodyMarkdown: "Body",
      },
    },
  };
}

describe.skipIf(!hasTestDatabase)("공개 뉴스 읽기", () => {
  let actorId = "";

  async function created(label: string, day: number) {
    return createNews(newsInput(label, day), actorId);
  }

  async function published(
    label: string,
    day: number,
    locale: "ko" | "en" = "ko",
  ) {
    const news = await created(label, day);
    const result = await publishNewsLocale(
      news.id,
      locale,
      news.version,
      actorId,
    );
    return { ...result, publicNumber: news.publicNumber };
  }

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  it("새 기사는 DB가 붙인 공개 번호를 차례로 받는다", async () => {
    const first = await created("number-a", 1);
    const second = await created("number-b", 1);
    expect(first.publicNumber).toBeGreaterThan(0);
    expect(second.publicNumber).toBe(first.publicNumber + 1);
  });

  it("목록은 게시된 기사 전부를 공개 번호 주소와 함께 최신순으로 주고 limit은 앞의 몇 건만 준다", async () => {
    // 예전 구현의 페이지 크기(12)를 넘겨 페이지 경계에서 빠지거나 겹치지 않는지 본다.
    const numbers = new Map<number, number>();
    for (let day = 1; day <= 13; day += 1) {
      numbers.set(day, (await published(`list-${day}`, day)).publicNumber);
    }
    await created("list-draft", 20);
    const hidden = await published("list-hidden", 21);
    await hideNewsLocale(hidden.id, "ko", hidden.version, actorId);
    const archived = await published("list-archived", 22);
    await archiveNews(archived.id, archived.version, actorId);
    const englishOnly = await published("list-en-only", 23, "en");

    const expected = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((day) => ({
      slug: String(numbers.get(day)),
      date: `2026-01-${String(day).padStart(2, "0")}`,
      category: "COMPANY",
      title: `제목 list-${day}`,
      summary: `요약 list-${day}`,
      thumbnail: "",
    }));
    const list = (await readDatabaseNewsList("ko")).filter((item) =>
      item.title.startsWith("제목 list-"),
    );
    expect(list).toEqual(expected);
    expect(await readDatabaseNewsList("ko", 4)).toHaveLength(4);
    expect(
      (await readDatabaseNewsList("en")).map((item) => item.slug),
    ).toContain(String(englishOnly.publicNumber));
  });

  it("상세는 공개 번호로 본문과 외부 링크를 주고, 번호 주소 이전의 슬러그는 번호 주소로 보낸다", async () => {
    const news = await published("detail", 2);
    const [koLocale] = await getDb()
      .select({ id: newsLocales.id })
      .from(newsLocales)
      .where(
        and(eq(newsLocales.newsId, news.id), eq(newsLocales.locale, "ko")),
      );
    // 표시 순서를 뒤집어 넣어 정렬을 확인한다.
    await getDb()
      .insert(newsExternalLinks)
      .values([
        {
          newsLocaleId: koLocale.id,
          label: "둘째",
          url: "https://example.com/2",
          displayOrder: 2,
        },
        {
          newsLocaleId: koLocale.id,
          label: "첫째",
          url: "https://example.com/1",
          displayOrder: 1,
        },
      ]);
    // 번호 주소로 바꾸기 전에 쓰던 주소를 흉내 낸다.
    await getDb()
      .insert(newsSlugs)
      .values({
        newsId: news.id,
        slug: "detail-legacy",
        createdByActorId: actorId,
      });

    const number = String(news.publicNumber);
    expect(await readDatabaseNewsDetail(number, "ko")).toEqual({
      redirect: null,
      news: {
        slug: number,
        date: "2026-01-02",
        category: "COMPANY",
        title: "제목 detail",
        summary: "요약 detail",
        thumbnail: "",
        content: "<p><strong>본문</strong></p>",
        externalLinks: [
          { label: "첫째", url: "https://example.com/1" },
          { label: "둘째", url: "https://example.com/2" },
        ],
      },
    });
    expect(await readDatabaseNewsDetail("detail-legacy", "ko")).toEqual({
      redirect: number,
      news: null,
    });
    // 영문은 게시하지 않았다. 번호 주소는 404다.
    expect(await readDatabaseNewsDetail(number, "en")).toBeNull();
    expect(await readDatabaseNewsDetail("detail-missing", "ko")).toBeNull();
    expect(await readDatabaseNewsDetail("999999999", "ko")).toBeNull();
  });
});
