import { beforeAll, describe, expect, it } from "vitest";
import {
  createNoticeCategory,
  saveNoticeCategory,
} from "@/server/modules/notices/category-repository";
import { getTestActorId, hasTestDatabase } from "./setup";

describe.skipIf(!hasTestDatabase)("공지 카테고리 이름 중복 차단", () => {
  let actorId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  it("활성 카테고리와 국문 이름이 같으면 생성이 막힌다", async () => {
    await createNoticeCategory(
      { locales: { ko: { name: "고객지원" }, en: { name: "Support" } } },
      actorId,
    );

    await expect(
      createNoticeCategory(
        { locales: { ko: { name: "고객지원" }, en: { name: "Customer Care" } } },
        actorId,
      ),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "같은 이름의 카테고리가 이미 있습니다.",
    });
  });

  it("활성 카테고리와 영문 이름이 같으면 생성이 막힌다", async () => {
    await expect(
      createNoticeCategory(
        { locales: { ko: { name: "새 소식" }, en: { name: " Support " } } },
        actorId,
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("이름이 겹치지 않으면 생성된다", async () => {
    const created = await createNoticeCategory(
      { locales: { ko: { name: "채용" }, en: { name: "Careers" } } },
      actorId,
    );
    expect(created.id).toBeTruthy();
  });

  it("다른 활성 카테고리 이름으로 변경하면 막히고, 자기 자신 이름으로는 저장된다", async () => {
    const target = await createNoticeCategory(
      { locales: { ko: { name: "공고" }, en: { name: "Announcement" } } },
      actorId,
    );

    await expect(
      saveNoticeCategory(
        target.id,
        { locales: { ko: { name: "채용" }, en: { name: "Careers Renamed" } } },
        target.version,
        actorId,
      ),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    await expect(
      saveNoticeCategory(
        target.id,
        { locales: { ko: { name: "공고" }, en: { name: "Announcement" } } },
        target.version,
        actorId,
      ),
    ).resolves.toMatchObject({ id: target.id, version: target.version + 1 });
  });
});
