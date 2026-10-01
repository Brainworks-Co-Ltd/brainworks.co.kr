import { beforeAll, describe, expect, it } from "vitest";
import { createNoticeCategory } from "@/server/modules/notices/category-repository";
import type { NoticeCommandInput } from "@/server/modules/notices/contracts";
import { getAdminNoticeList } from "@/server/modules/notices/queries";
import {
  createNotice,
  getAdminNotice,
  publishNotice,
  saveNotice,
} from "@/server/modules/notices/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

const day = 24 * 60 * 60 * 1000;

type NoticeWindow = { publishStartsAt?: Date | null; publishEndsAt?: Date | null };

describe.skipIf(!hasTestDatabase)("공지 게시 기간 저장", () => {
  let actorId = "";
  let categoryId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
    categoryId = (
      await createNoticeCategory(
        { locales: { ko: { name: "기간 공지" }, en: { name: "Window" } } },
        actorId,
      )
    ).id;
  });

  function noticeInput(window: NoticeWindow = {}): NoticeCommandInput {
    return {
      categoryId,
      displayDate: "2026-10-01",
      locales: {
        ko: { title: "기간 공지", bodyMarkdown: "본문", ...window },
        en: { title: "", bodyMarkdown: "" },
      },
    };
  }

  async function koLocale(id: string) {
    const notice = await getAdminNotice(id);
    return notice.locales.find((locale) => locale.locale === "ko")!;
  }

  it("변경 저장이 언어별 게시 기간을 저장한다", async () => {
    const created = await createNotice(noticeInput(), actorId);
    const startsAt = new Date(Date.now() + day);
    const endsAt = new Date(Date.now() + 2 * day);

    await saveNotice(
      created.id,
      noticeInput({ publishStartsAt: startsAt, publishEndsAt: endsAt }),
      created.version,
      actorId,
    );

    const ko = await koLocale(created.id);
    expect(ko.publishStartsAt).toEqual(startsAt);
    expect(ko.publishEndsAt).toEqual(endsAt);
    expect(ko.publicationStatus).toBe("DRAFT");
  });

  it("종료가 시작보다 빠르면 저장을 PUBLICATION_WINDOW_INVALID로 거절한다", async () => {
    const created = await createNotice(noticeInput(), actorId);
    await expect(
      saveNotice(
        created.id,
        noticeInput({
          publishStartsAt: new Date(Date.now() + 2 * day),
          publishEndsAt: new Date(Date.now() + day),
        }),
        created.version,
        actorId,
      ),
    ).rejects.toMatchObject({ code: "PUBLICATION_WINDOW_INVALID" });
  });

  it("게시 요청은 기간 인자 없이 저장된 기간을 쓴다", async () => {
    const created = await createNotice(noticeInput(), actorId);
    const startsAt = new Date(Date.now() + day);
    const saved = await saveNotice(
      created.id,
      noticeInput({ publishStartsAt: startsAt, publishEndsAt: null }),
      created.version,
      actorId,
    );

    await publishNotice(created.id, "ko", saved.version, actorId);

    const ko = await koLocale(created.id);
    expect(ko.publicationStatus).toBe("SCHEDULED");
    expect(ko.publishStartsAt).toEqual(startsAt);
  });

  it("예약 중인 언어의 시작을 과거로 저장하면 게시 중으로 다시 정한다", async () => {
    const created = await createNotice(noticeInput(), actorId);
    const saved = await saveNotice(
      created.id,
      noticeInput({ publishStartsAt: new Date(Date.now() + day) }),
      created.version,
      actorId,
    );
    const scheduled = await publishNotice(created.id, "ko", saved.version, actorId);
    expect((await koLocale(created.id)).publicationStatus).toBe("SCHEDULED");

    await saveNotice(
      created.id,
      noticeInput({ publishStartsAt: new Date(Date.now() - day) }),
      scheduled.version,
      actorId,
    );

    expect((await koLocale(created.id)).publicationStatus).toBe("PUBLISHED");
    const listed = (await getAdminNoticeList()).find((item) => item.id === created.id);
    expect(listed?.locales.ko.displayState).toBe("LIVE");
  });

  it("제목이나 본문이 빠진 언어를 게시하면 서버가 빠진 항목을 알려 준다", async () => {
    const created = await createNotice(noticeInput(), actorId);
    await expect(
      publishNotice(created.id, "en", created.version, actorId),
    ).rejects.toMatchObject({
      code: "PUBLICATION_INVALID",
      message: "영문 제목과 본문이 있어야 게시할 수 있습니다.",
    });
  });
});
