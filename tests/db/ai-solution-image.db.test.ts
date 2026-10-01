import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import {
  createAiSolution,
  hideAiSolution,
  listAdminBusinessAreaOptions,
  publishAiSolution,
  saveAiSolution,
  type AiSolutionInput,
} from "@/server/modules/catalog/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

describe.skipIf(!hasTestDatabase)("AI 솔루션 대표 이미지와 순서", () => {
  let actorId = "";
  let areaId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
    const [area] = await listAdminBusinessAreaOptions();
    areaId = area.id;
  });

  function solutionInput(
    displayOrder: number,
    imageAssetId: string | null,
  ): AiSolutionInput {
    return {
      businessAreaId: areaId,
      displayOrder,
      imageAssetId,
      locales: {
        ko: {
          name: "이미지 테스트 솔루션",
          summary: "요약",
          description: "상세 설명",
          imageAlt: "대표 그림",
        },
        en: { name: "", summary: "", description: "", imageAlt: null },
      },
    };
  }

  async function readyAsset(checksum: string) {
    const [asset] = await getDb()
      .insert(assets)
      .values({
        assetType: "IMAGE",
        status: "READY",
        storageKey: `media/${checksum}.webp`,
        originalFilename: `${checksum}.webp`,
        bytes: 10,
        checksum,
        createdByActorId: actorId,
      })
      .returning({ id: assets.id });
    return asset.id;
  }

  it("게시 중인 솔루션은 대표 이미지를 뺄 수 없고, 숨긴 뒤에는 뺄 수 있다", async () => {
    const assetId = await readyAsset("ai-image-guard");
    const created = await createAiSolution(solutionInput(21, assetId), actorId);
    const published = await publishAiSolution(created.id, "ko", created.version, actorId);

    await expect(
      saveAiSolution(created.id, solutionInput(21, null), published.version, actorId),
    ).rejects.toMatchObject({
      code: "PUBLICATION_INVALID",
      message: "게시 중인 솔루션은 대표 이미지를 뺄 수 없습니다. 먼저 숨김으로 바꿔 주세요.",
    });

    const hidden = await hideAiSolution(created.id, "ko", published.version, actorId);
    await expect(
      saveAiSolution(created.id, solutionInput(21, null), hidden.version, actorId),
    ).resolves.toMatchObject({ version: hidden.version + 1 });
  });

  it("같은 영역에서 순서 번호가 겹치면 ORDER_CONFLICT", async () => {
    await createAiSolution(solutionInput(22, null), actorId);
    await expect(
      createAiSolution(solutionInput(22, null), actorId),
    ).rejects.toMatchObject({ code: "ORDER_CONFLICT" });
  });

  it("게시 조건이 빠지면 언어와 함께 알려 준다", async () => {
    const created = await createAiSolution(solutionInput(23, null), actorId);
    await expect(
      publishAiSolution(created.id, "en", created.version, actorId),
    ).rejects.toMatchObject({
      code: "PUBLICATION_INVALID",
      message:
        "영문 이름, 요약, 상세 설명, 이미지 대체 설명과 대표 이미지가 있어야 게시할 수 있습니다.",
    });
  });
});
