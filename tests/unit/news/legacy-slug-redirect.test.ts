import { describe, expect, it, vi } from "vitest";

const { getPublishedNewsDetailMock } = vi.hoisted(() => ({
  getPublishedNewsDetailMock: vi.fn(),
}));

vi.mock("@/server/modules/news/query-service", () => ({
  getPublishedNewsDetail: getPublishedNewsDetailMock,
}));

import { getServerSideProps } from "@/pages/news/[slug]";

describe("뉴스 예전 주소 이동", () => {
  it.each([
    ["en", "/en/news/new-slug"],
    ["ko", "/news/new-slug"],
  ])("%s 방문자는 같은 언어의 새 주소로 간다", async (locale, destination) => {
    getPublishedNewsDetailMock.mockResolvedValue({ redirect: "new-slug", news: null });

    await expect(
      getServerSideProps({ params: { slug: "old-slug" }, locale } as never),
    ).resolves.toEqual({ redirect: { destination, permanent: true } });
  });
});
