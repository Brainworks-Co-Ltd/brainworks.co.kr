import { beforeAll, describe, expect, it } from "vitest";
import { getAdminDashboardData } from "@/server/modules/admin/dashboard";
import {
  createAiSolution,
  listAdminBusinessAreaOptions,
} from "@/server/modules/catalog/repository";
import { createHonor } from "@/server/modules/honors/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

describe.skipIf(!hasTestDatabase)("운영 현황 조회", () => {
  let actorId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  it("수상 편집은 상세 화면으로 가고, AI 솔루션도 함께 집계한다", async () => {
    const honor = await createHonor(
      {
        honorType: "AWARD",
        occurredYear: 2026,
        displayOrder: 31,
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
        displayOrder: 31,
        imageAssetId: null,
        locales: {
          ko: { name: "운영 현황 솔루션", summary: "", description: "" },
          en: { name: "", summary: "", description: "" },
        },
      },
      actorId,
    );

    const data = await getAdminDashboardData();

    const hrefs = data.attention.map((item) => item.adminHref);
    expect(hrefs).toContain(`/admin/honors/${honor.id}`);
    expect(hrefs).toContain(`/admin/ai-solutions/${solution.id}`);
    expect(
      data.summary.find((item) => item.contentType === "ai-solutions")?.activeCount,
    ).toBe(1);
  });
});
