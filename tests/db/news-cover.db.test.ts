import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import { resolvePublicAssetUrl } from "@/server/modules/assets/public-url";
import { readDatabaseNewsList } from "@/server/modules/news/database-source";
import {
  changeNewsSlug,
  createNews,
  getAdminNews,
  publishNewsLocale,
  saveNews,
  type NewsCommandInput,
} from "@/server/modules/news/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

const storageKey = "media/news-cover-test.webp";

function newsInput(
  slug: string,
  cover: { coverAssetId?: string | null; coverAlt?: string | null } = {},
): NewsCommandInput {
  return {
    slug,
    category: "COMPANY",
    displayDate: "2026-10-01",
    coverAssetId: cover.coverAssetId,
    locales: {
      ko: {
        title: "대표 이미지 뉴스",
        summary: "요약",
        bodyMarkdown: "본문",
        coverAlt: cover.coverAlt ?? null,
      },
      en: { title: "", summary: "", bodyMarkdown: "", coverAlt: null },
    },
  };
}

describe.skipIf(!hasTestDatabase)("뉴스 대표 이미지", () => {
  let actorId = "";
  let coverAssetId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
    const [asset] = await getDb()
      .insert(assets)
      .values({
        assetType: "IMAGE",
        status: "READY",
        storageKey,
        originalFilename: "cover.webp",
        bytes: 10,
        checksum: "news-cover-test",
        createdByActorId: actorId,
      })
      .returning({ id: assets.id });
    coverAssetId = asset.id;
  });

  it("변경 저장한 대표 이미지가 공개 목록 썸네일로 나온다", async () => {
    const created = await createNews(newsInput("news-cover-saved"), actorId);
    const saved = await saveNews(
      created.id,
      newsInput("news-cover-saved", { coverAssetId, coverAlt: "협약식 사진" }),
      created.version,
      actorId,
    );
    expect((await getAdminNews(created.id)).coverAssetId).toBe(coverAssetId);

    await publishNewsLocale(created.id, "ko", saved.version, actorId);

    const list = await readDatabaseNewsList("ko");
    expect(
      list.items.find((item) => item.slug === "news-cover-saved")?.thumbnail,
    ).toBe(resolvePublicAssetUrl(storageKey));
  });

  it("대표 이미지가 있는데 그 언어 대체 설명이 없으면 게시를 막는다", async () => {
    const created = await createNews(
      newsInput("news-cover-no-alt", { coverAssetId }),
      actorId,
    );
    await expect(
      publishNewsLocale(created.id, "ko", created.version, actorId),
    ).rejects.toMatchObject({
      code: "PUBLICATION_INVALID",
      message: "국문 대표 이미지 대체 설명을 입력해 주세요.",
    });
  });

  it("제목이나 본문이 빠진 언어를 게시하면 언어와 함께 알려 준다", async () => {
    const created = await createNews(newsInput("news-cover-empty-en"), actorId);
    await expect(
      publishNewsLocale(created.id, "en", created.version, actorId),
    ).rejects.toMatchObject({
      code: "PUBLICATION_INVALID",
      message: "영문 제목과 본문이 있어야 게시할 수 있습니다.",
    });
  });

  it("주소 변경도 저장과 같은 주소 형식 검사를 거친다", async () => {
    const created = await createNews(newsInput("news-cover-slug"), actorId);
    await expect(
      changeNewsSlug(created.id, "Bad Slug", created.version, actorId),
    ).rejects.toMatchObject({
      code: "PUBLICATION_INVALID",
      message: "공개 주소 이름은 영문 소문자, 숫자, 하이픈만 쓸 수 있습니다.",
    });
  });
});
