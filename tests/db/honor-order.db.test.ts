import { beforeAll, describe, expect, it } from "vitest";
import {
  archiveHonor,
  createHonor,
  publishHonor,
  saveHonor,
  type HonorInput,
} from "@/server/modules/honors/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

function honorInput(displayOrder: number): HonorInput {
  return {
    honorType: "AWARD",
    occurredYear: 2026,
    displayOrder,
    imageAssetId: null,
    locales: {
      ko: { title: "순서 테스트 수상", organization: "기관", description: "설명" },
      en: { title: "", organization: "", description: "" },
    },
  };
}

describe.skipIf(!hasTestDatabase)("수상 및 인증 순서 중복", () => {
  let actorId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  it("같은 유형에서 순서 번호가 겹치면 ORDER_CONFLICT", async () => {
    await createHonor(honorInput(11), actorId);
    await expect(createHonor(honorInput(11), actorId)).rejects.toMatchObject({
      code: "ORDER_CONFLICT",
    });
  });

  it("보관한 항목의 순서 번호와 겹쳐도 ORDER_CONFLICT", async () => {
    const archived = await createHonor(honorInput(12), actorId);
    await archiveHonor(archived.id, archived.version, actorId);
    const other = await createHonor(honorInput(13), actorId);

    await expect(
      saveHonor(other.id, honorInput(12), other.version, actorId),
    ).rejects.toMatchObject({ code: "ORDER_CONFLICT" });
  });

  it("게시할 때 빠진 항목을 언어와 함께 알려 준다", async () => {
    const created = await createHonor(honorInput(14), actorId);
    await expect(
      publishHonor(created.id, "en", created.version, actorId),
    ).rejects.toMatchObject({
      code: "PUBLICATION_INVALID",
      message: "영문 제목, 기관, 설명이 있어야 게시할 수 있습니다.",
    });
  });
});
