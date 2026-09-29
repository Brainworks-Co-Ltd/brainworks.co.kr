import { and, eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import { newsSlugs } from "@/server/db/schema/news";
import { HttpError } from "@/server/http/errors";
import {
  changeNewsSlug,
  createNews,
  type NewsCommandInput,
} from "@/server/modules/news/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

const duplicateMessage = "이미 사용 중인 공개 주소 이름입니다.";

function newsInput(slug: string): NewsCommandInput {
  return {
    slug,
    category: "회사 소식",
    displayDate: "2025-06-16",
    locales: {
      ko: {
        title: "브레인웍스 공개 주소 테스트",
        summary: "슬러그 고유 제약을 확인한다.",
        bodyMarkdown: "본문",
      },
      en: {
        title: "Brainworks slug test",
        summary: "Checks the slug unique constraint.",
        bodyMarkdown: "Body",
      },
    },
  };
}

describe.skipIf(!hasTestDatabase)("뉴스 공개 주소 고유 제약", () => {
  let actorId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  it("같은 슬러그로 두 번 생성하면 BAD_REQUEST를 던진다", async () => {
    await createNews(newsInput("slug-conflict-a"), actorId);

    const duplicate = createNews(newsInput("slug-conflict-a"), actorId);
    await expect(duplicate).rejects.toThrow(HttpError);
    await expect(duplicate).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(duplicate).rejects.toThrow(new RegExp(`^${duplicateMessage}`));
  });

  it("이미 쓰인 슬러그로 변경하면 같은 오류이고 기존 슬러그는 그대로다", async () => {
    const created = await createNews(newsInput("slug-change-b"), actorId);

    const conflicting = changeNewsSlug(
      created.id,
      "slug-conflict-a",
      created.version,
      actorId,
    );
    await expect(conflicting).rejects.toMatchObject({ code: "BAD_REQUEST" });

    const rows = await getDb()
      .select({ slug: newsSlugs.slug, isCurrent: newsSlugs.isCurrent })
      .from(newsSlugs)
      .where(eq(newsSlugs.newsId, created.id));
    expect(rows).toEqual([{ slug: "slug-change-b", isCurrent: true }]);
  });

  it("슬러그를 바꾸면 이전 슬러그가 isCurrent=false로 남는다", async () => {
    const created = await createNews(newsInput("slug-history-c"), actorId);

    await changeNewsSlug(
      created.id,
      "slug-history-d",
      created.version,
      actorId,
    );

    const previous = await getDb()
      .select({ isCurrent: newsSlugs.isCurrent })
      .from(newsSlugs)
      .where(
        and(
          eq(newsSlugs.newsId, created.id),
          eq(newsSlugs.slug, "slug-history-c"),
        ),
      );
    expect(previous).toEqual([{ isCurrent: false }]);

    const current = await getDb()
      .select({ slug: newsSlugs.slug })
      .from(newsSlugs)
      .where(
        and(eq(newsSlugs.newsId, created.id), eq(newsSlugs.isCurrent, true)),
      );
    expect(current).toEqual([{ slug: "slug-history-d" }]);
  });
});
