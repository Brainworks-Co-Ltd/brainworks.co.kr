import { and, eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import { newsExternalLinks, newsLocales } from "@/server/db/schema/news";
import {
  readDatabaseNewsDetail,
  readDatabaseNewsList,
} from "@/server/modules/news/database-source";
import {
  archiveNews,
  changeNewsSlug,
  createNews,
  hideNewsLocale,
  publishNewsLocale,
  type NewsCommandInput,
} from "@/server/modules/news/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

function newsInput(slug: string, day: number): NewsCommandInput {
  return {
    slug,
    category: "COMPANY",
    displayDate: `2026-01-${String(day).padStart(2, "0")}`,
    locales: {
      ko: {
        title: `제목 ${slug}`,
        summary: `요약 ${slug}`,
        bodyMarkdown: "**본문**",
      },
      en: {
        title: `Title ${slug}`,
        summary: `Summary ${slug}`,
        bodyMarkdown: "Body",
      },
    },
  };
}

describe.skipIf(!hasTestDatabase)("공개 뉴스 읽기", () => {
  let actorId = "";

  async function created(slug: string, day: number) {
    return createNews(newsInput(slug, day), actorId);
  }

  async function published(
    slug: string,
    day: number,
    locale: "ko" | "en" = "ko",
  ) {
    const news = await created(slug, day);
    return publishNewsLocale(news.id, locale, news.version, actorId);
  }

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  it("목록은 게시된 기사 전부를 한 번에 최신순으로 주고 limit은 앞의 몇 건만 준다", async () => {
    // 예전 구현의 페이지 크기(12)를 넘겨 페이지 경계에서 빠지거나 겹치지 않는지 본다.
    for (let day = 1; day <= 13; day += 1) await published(`list-${day}`, day);
    await created("list-draft", 20);
    const hidden = await published("list-hidden", 21);
    await hideNewsLocale(hidden.id, "ko", hidden.version, actorId);
    const archived = await published("list-archived", 22);
    await archiveNews(archived.id, archived.version, actorId);
    await published("list-en-only", 23, "en");
    const moved = await published("list-moved-old", 14);
    await changeNewsSlug(moved.id, "list-moved-new", moved.version, actorId);

    const expected = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(
      (day) => {
        const slug = day === 14 ? "list-moved-new" : `list-${day}`;
        const source = day === 14 ? "list-moved-old" : slug;
        return {
          slug,
          date: `2026-01-${String(day).padStart(2, "0")}`,
          category: "COMPANY",
          title: `제목 ${source}`,
          summary: `요약 ${source}`,
          thumbnail: "",
        };
      },
    );
    expect(await readDatabaseNewsList("ko")).toEqual(expected);
    expect(await readDatabaseNewsList("ko", 4)).toEqual(expected.slice(0, 4));
    expect((await readDatabaseNewsList("en")).map((item) => item.slug)).toEqual(
      ["list-en-only"],
    );
  });

  it("상세는 현재 주소에서 본문과 외부 링크를, 예전 주소에서 리다이렉트를 준다", async () => {
    const news = await published("detail-old", 2);
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
    await changeNewsSlug(news.id, "detail-new", news.version, actorId);

    const current = {
      slug: "detail-new",
      date: "2026-01-02",
      category: "COMPANY",
      title: "제목 detail-old",
      summary: "요약 detail-old",
      thumbnail: "",
      content: "<p><strong>본문</strong></p>",
      externalLinks: [
        { label: "첫째", url: "https://example.com/1" },
        { label: "둘째", url: "https://example.com/2" },
      ],
    };
    expect(await readDatabaseNewsDetail("detail-new", "ko")).toEqual({
      redirect: null,
      news: current,
    });
    expect(await readDatabaseNewsDetail("detail-old", "ko")).toEqual({
      redirect: "detail-new",
      news: current,
    });
    // 영문은 게시하지 않았다. 현재 주소는 404, 예전 주소는 현재 주소로 보낸다.
    expect(await readDatabaseNewsDetail("detail-new", "en")).toBeNull();
    expect(await readDatabaseNewsDetail("detail-old", "en")).toEqual({
      redirect: "detail-new",
      news: null,
    });
    expect(await readDatabaseNewsDetail("detail-missing", "ko")).toBeNull();
  });
});
