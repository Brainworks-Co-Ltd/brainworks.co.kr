import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import { contactSubmissionReceipts } from "@/server/db/schema/contact";
import { getAdminDashboardData } from "@/server/modules/admin/dashboard";
import {
  createAiSolution,
  listAdminBusinessAreaOptions,
} from "@/server/modules/catalog/repository";
import { createHonor } from "@/server/modules/honors/repository";
import { createNotice, publishNotice } from "@/server/modules/notices/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

describe.skipIf(!hasTestDatabase)("운영 현황 조회", () => {
  let actorId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  it("수상과 AI 솔루션 초안을 상세 편집 주소와 함께 초안 목록에 넣는다", async () => {
    const honor = await createHonor(
      {
        honorType: "AWARD",
        occurredYear: 2026,
        imageAssetId: null,
        locales: {
          ko: { title: "운영 현황 수상", organization: "기관", description: "설명" },
          en: { title: "", organization: "", description: "" },
        },
      },
      actorId,
    );
    const [area] = await listAdminBusinessAreaOptions();
    const solution = await createAiSolution(
      {
        businessAreaId: area.id,
        imageAssetId: null,
        locales: {
          ko: { name: "운영 현황 솔루션", summary: "", description: "" },
          en: { name: "", summary: "", description: "" },
        },
      },
      actorId,
    );

    const data = await getAdminDashboardData();

    const hrefs = data.drafts.map((item) => item.adminHref);
    expect(hrefs).toContain(`/admin/honors/${honor.id}`);
    expect(hrefs).toContain(`/admin/ai-solutions/${solution.id}`);
    expect(data.recent[0].actorName).toBe("DB 테스트 관리자");
  });

  it("국문만 게시한 상단 고정 공지를 고정 공지와 한 언어 목록에 함께 보여 준다", async () => {
    const created = await createNotice(
      {
        categoryId: null,
        displayDate: "2026-10-06",
        isPinned: true,
        pinOrder: 1,
        locales: {
          ko: { title: "고정 공지", bodyMarkdown: "본문" },
          en: { title: "", bodyMarkdown: "" },
        },
      },
      actorId,
    );
    await publishNotice(created.id, "ko", created.version, actorId);

    const data = await getAdminDashboardData();

    expect(data.live.pinnedNotices.map((item) => item.contentId)).toContain(created.id);
    expect(data.oneLanguage.find((item) => item.contentId === created.id)).toMatchObject({
      publicLocale: "ko",
      otherHasTitle: false,
    });
  });

  it("최근 7일 메일 발송에 실패한 문의를 경고한다", async () => {
    await getDb().insert(contactSubmissionReceipts).values({
      requestIdHash: "dashboard-failed-receipt",
      processingStatus: "FAILED",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const data = await getAdminDashboardData();

    expect(data.warnings.map((warning) => warning.kind)).toContain("contact");
    expect(data.warnings[0].message).toContain("문의 1건");
  });
});
