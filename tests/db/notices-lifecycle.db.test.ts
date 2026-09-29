import { beforeAll, describe, expect, it } from "vitest";
import { HttpError } from "@/server/http/errors";
import { createNoticeCategory } from "@/server/modules/notices/category-repository";
import {
  archiveNotice,
  createNotice,
  getAdminNotice,
  publishNotice,
  restoreNotice,
  saveNotice,
} from "@/server/modules/notices/repository";
import {
  getAdminNoticeList,
  getPublishedNoticeList,
} from "@/server/modules/notices/queries";
import { getTestActorId, hasTestDatabase } from "./setup";
import fixtures from "./fixtures/notices.json";

const [fixture] = fixtures;
const day = 24 * 60 * 60 * 1000;

function noticeInput() {
  return {
    categoryId: null as string | null,
    displayDate: fixture.date,
    locales: {
      ko: { title: fixture.title, bodyMarkdown: fixture.body },
      en: { title: "", bodyMarkdown: "" },
    },
  };
}

describe.skipIf(!hasTestDatabase)("공지 수명주기", () => {
  let actorId = "";
  let categoryId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
    categoryId = (
      await createNoticeCategory(
        { locales: { ko: { name: "입찰공고" }, en: { name: "Bid Notice" } } },
        actorId,
      )
    ).id;
  });

  it("초안에서 예약, 게시, 보관, 복원까지 공개 노출이 정확히 따라간다", async () => {
    const created = await createNotice(
      { ...noticeInput(), categoryId },
      actorId,
    );
    expect(created.publicNumber).toBeGreaterThan(0);

    const draftList = await getPublishedNoticeList("ko");
    expect(draftList.total).toBe(0);

    // 미래 시각 예약 게시는 공개 목록에 뜨지 않지만 관리자 목록에는 남는다.
    const scheduled = await publishNotice(
      created.id,
      "ko",
      created.version,
      actorId,
      { startsAt: new Date(Date.now() + day) },
    );
    expect((await getPublishedNoticeList("ko")).total).toBe(0);
    const adminList = await getAdminNoticeList();
    expect(
      adminList.find((item) => item.id === created.id)?.locales.ko
        .publicationStatus,
    ).toBe("SCHEDULED");

    // 과거 시각으로 다시 게시하면 공개 목록에 뜬다. 영문은 여전히 초안이다.
    await publishNotice(created.id, "ko", scheduled.version, actorId, {
      startsAt: new Date(Date.now() - day),
    });
    const publicList = await getPublishedNoticeList("ko");
    expect(publicList.total).toBe(1);
    expect(publicList.items[0]).toMatchObject({
      publicNumber: created.publicNumber,
      title: fixture.title,
      date: fixture.date,
    });
    expect((await getPublishedNoticeList("en")).total).toBe(0);
  });

  it("낡은 expectedVersion으로 저장하면 VERSION_CONFLICT를 던진다", async () => {
    const created = await createNotice(
      { ...noticeInput(), categoryId },
      actorId,
    );
    await publishNotice(created.id, "ko", created.version, actorId, {
      startsAt: new Date(Date.now() - day),
    });

    const stale = saveNotice(
      created.id,
      { ...noticeInput(), categoryId },
      created.version,
      actorId,
    );
    await expect(stale).rejects.toThrow(HttpError);
    await expect(stale).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
  });

  it("보관하면 공개에서 사라지고 복원은 초안으로 되돌린다", async () => {
    const created = await createNotice(
      { ...noticeInput(), categoryId },
      actorId,
    );
    const published = await publishNotice(
      created.id,
      "ko",
      created.version,
      actorId,
      { startsAt: new Date(Date.now() - day) },
    );
    const before = await getPublishedNoticeList("ko");

    const archived = await archiveNotice(
      created.id,
      published.version,
      actorId,
    );
    expect((await getPublishedNoticeList("ko")).total).toBe(before.total - 1);

    // restoreNotice는 itemStatus만 살리고 로케일은 DRAFT로 되돌린다.
    const restored = await restoreNotice(created.id, archived.version, actorId);
    const restoredNotice = await getAdminNotice(created.id);
    expect(restoredNotice.itemStatus).toBe("ACTIVE");
    expect(
      restoredNotice.locales.find((locale) => locale.locale === "ko")
        ?.publicationStatus,
    ).toBe("DRAFT");
    expect((await getPublishedNoticeList("ko")).total).toBe(before.total - 1);

    await publishNotice(created.id, "ko", restored.version, actorId, {
      startsAt: new Date(Date.now() - day),
    });
    expect((await getPublishedNoticeList("ko")).total).toBe(before.total);
  });
});
