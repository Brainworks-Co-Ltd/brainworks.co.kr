import { afterEach, describe, expect, it, vi } from "vitest";
import { resolvePublicAssetUrl } from "@/server/modules/assets/public-url";

const { getDbMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
}));

vi.mock("@/server/db/client", () => ({
  getDb: getDbMock,
}));

import {
  readDatabaseNewsDetail,
  readDatabaseNewsList,
} from "@/server/modules/news/database-source";

function makeChain(result: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
}

describe("DB 뉴스 목록 조회", () => {
  afterEach(() => {
    process.env.ASSET_PUBLIC_BASE_URL = "https://cdn.example.com";
    getDbMock.mockReset();
  });

  it("커버 자산이 있으면 thumbnail을 공개 URL로 채운다", async () => {
    process.env.ASSET_PUBLIC_BASE_URL = "https://cdn.example.com";
    const chain = makeChain([
      {
        slug: "news-1",
        date: "2026-01-01",
        category: "일반",
        title: "제목",
        summary: "요약",
        storageKey: "news/cover.webp",
      },
    ]);
    getDbMock.mockReturnValue(chain);

    const result = await readDatabaseNewsList("ko");

    expect(chain.leftJoin).toHaveBeenCalled();
    expect(result.items[0].thumbnail).toBe(
      resolvePublicAssetUrl("news/cover.webp"),
    );
  });

  it("커버 자산이 없으면 thumbnail은 빈 문자열이다", async () => {
    const chain = makeChain([
      {
        slug: "news-2",
        date: "2026-01-02",
        category: "일반",
        title: "제목2",
        summary: "요약2",
        storageKey: null,
      },
    ]);
    getDbMock.mockReturnValue(chain);

    const result = await readDatabaseNewsList("ko");

    expect(result.items[0].thumbnail).toBe("");
  });
});

describe("DB 뉴스 상세 조회", () => {
  afterEach(() => {
    process.env.ASSET_PUBLIC_BASE_URL = "https://cdn.example.com";
    getDbMock.mockReset();
  });

  it("외부 링크를 표시 순서대로 매핑하고 커버 URL을 채운다", async () => {
    process.env.ASSET_PUBLIC_BASE_URL = "https://cdn.example.com";
    const slugRow = [{ newsId: "news-id-1", isCurrent: true }];
    const currentSlugRow = [{ slug: "news-1" }];
    const detailRow = [
      {
        newsLocaleId: "locale-1",
        date: "2026-01-01",
        category: "일반",
        title: "제목",
        summary: "요약",
        bodyMarkdown: "# 본문",
        storageKey: "news/cover.webp",
      },
    ];
    const externalLinksRows = [
      { label: "원문", url: "https://example.com/a" },
    ];

    let call = 0;
    const selectResults = [slugRow, currentSlugRow, detailRow, externalLinksRows];
    getDbMock.mockReturnValue({
      select: vi.fn(() => {
        const result = selectResults[call];
        call += 1;
        return makeChain(result);
      }),
    });

    const detail = await readDatabaseNewsDetail("news-1", "ko");

    expect(detail?.news?.slug).toBe("news-1");
    expect(detail?.news?.thumbnail).toBe(
      resolvePublicAssetUrl("news/cover.webp"),
    );
    expect(detail?.news?.externalLinks).toEqual([
      { label: "원문", url: "https://example.com/a" },
    ]);
  });
});
