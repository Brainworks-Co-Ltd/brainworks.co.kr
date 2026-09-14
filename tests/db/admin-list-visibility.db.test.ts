import { beforeAll, describe, expect, it } from "vitest";
import { getAdminNewsList } from "@/server/modules/news/admin-queries";
import { readDatabaseNewsList } from "@/server/modules/news/database-source";
import {
  archiveNews,
  createNews,
  publishNewsLocale,
  type NewsCommandInput,
} from "@/server/modules/news/repository";
import { createNoticeCategory } from "@/server/modules/notices/category-repository";
import {
  getAdminNoticeList,
  getPublishedNoticeList,
} from "@/server/modules/notices/queries";
import {
  archiveNotice,
  createNotice,
  publishNotice,
} from "@/server/modules/notices/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

const day = 24 * 60 * 60 * 1000;

function newsInput(slug: string, title: string): NewsCommandInput {
  return {
    slug,
    category: "회사 소식",
    displayDate: "2025-06-16",
    locales: {
      ko: { title, summary: "요약", bodyMarkdown: "본문" },
      en: { title: `${title} (EN)`, summary: "Summary", bodyMarkdown: "Body" },
    },
  };
}

describe.skipIf(!hasTestDatabase)("관리자 목록과 공개 목록 분리", () => {
  let actorId = "";
  let categoryId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
    categoryId = (
      await createNoticeCategory(
        { locales: { ko: { name: "공지" }, en: { name: "Notice" } } },
        actorId,
      )
    ).id;
  });

  it("공지의 DRAFT와 ARCHIVED는 관리자 목록에만 남는다", async () => {
    const draft = await createNotice(
      {
        categoryId,
        displayDate: "2026-07-06",
        locales: {
          ko: { title: "초안 공지", bodyMarkdown: "초안 본문" },
          en: { title: "", bodyMarkdown: "" },
        },
      },
      actorId,
    );
    const archived = await createNotice(
      {
        categoryId,
        displayDate: "2026-07-20",
        locales: {
          ko: { title: "보관 공지", bodyMarkdown: "보관 본문" },
          en: { title: "", bodyMarkdown: "" },
        },
      },
      actorId,
    );
    const published = await publishNotice(
      archived.id,
      "ko",
      archived.version,
      actorId,
      { startsAt: new Date(Date.now() - day) },
    );
    await archiveNotice(archived.id, published.version, actorId);

    const adminList = await getAdminNoticeList();
    expect(adminList.map((item) => item.id).sort()).toEqual(
      [draft.id, archived.id].sort(),
    );
    expect(
      adminList.find((item) => item.id === draft.id)?.locales.ko
        .publicationStatus,
    ).toBe("DRAFT");
    expect(adminList.find((item) => item.id === archived.id)?.itemStatus).toBe(
      "ARCHIVED",
    );

    expect((await getPublishedNoticeList("ko")).total).toBe(0);
  });

  it("뉴스의 DRAFT와 ARCHIVED는 관리자 목록에만 남는다", async () => {
    const draft = await createNews(
      newsInput("admin-visibility-draft", "초안 뉴스"),
      actorId,
    );
    const archived = await createNews(
      newsInput("admin-visibility-archived", "보관 뉴스"),
      actorId,
    );
    const published = await publishNewsLocale(
      archived.id,
      "ko",
      archived.version,
      actorId,
    );
    await archiveNews(archived.id, published.version, actorId);

    const adminList = await getAdminNewsList();
    expect(adminList.items.map((item) => item.id).sort()).toEqual(
      [draft.id, archived.id].sort(),
    );
    expect((await readDatabaseNewsList("ko")).total).toBe(0);
  });

  it("관리자 목록 반환값에 Date 인스턴스가 남지 않는다", async () => {
    const noticeList = await getAdminNoticeList();
    const newsList = await getAdminNewsList();

    expect(JSON.parse(JSON.stringify(noticeList))).toEqual(noticeList);
    expect(JSON.parse(JSON.stringify(newsList))).toEqual(newsList);
  });
});
