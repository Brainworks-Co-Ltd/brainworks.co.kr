import { beforeAll, describe, expect, it } from "vitest";
import {
  createAiSolution,
  getAdminAiSolution,
  listAdminBusinessAreaOptions,
  moveAiSolution,
  saveAiSolution,
  type AiSolutionInput,
} from "@/server/modules/catalog/repository";
import {
  createNotice,
  publishNotice,
} from "@/server/modules/notices/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

describe.skipIf(!hasTestDatabase)("관리자가 숫자를 고르지 않는 표시 순서", () => {
  let actorId = "";
  let areaIds: string[] = [];

  beforeAll(async () => {
    actorId = await getTestActorId();
    areaIds = (await listAdminBusinessAreaOptions()).map((area) => area.id);
  });

  function solutionInput(name: string, businessAreaId = areaIds[0]): AiSolutionInput {
    return {
      businessAreaId,
      imageAssetId: null,
      locales: {
        ko: { name, summary: "요약", description: "설명", imageAlt: null },
        en: { name: "", summary: "", description: "", imageAlt: null },
      },
    };
  }

  it("순서를 비우고 만들면 같은 영역의 맨 뒤에 붙는다", async () => {
    const first = await createAiSolution(solutionInput("첫째"), actorId);
    const second = await createAiSolution(solutionInput("둘째"), actorId);
    const [a, b] = await Promise.all([
      getAdminAiSolution(first.id),
      getAdminAiSolution(second.id),
    ]);
    expect(b.displayOrder).toBe(a.displayOrder + 1);
  });

  it("위로 옮기면 이웃과 순서를 맞바꾸고, 맨 앞에서는 그대로 둔다", async () => {
    const first = await createAiSolution(solutionInput("앞", areaIds[1]), actorId);
    const second = await createAiSolution(solutionInput("뒤", areaIds[1]), actorId);
    const before = await getAdminAiSolution(second.id);

    const moved = await moveAiSolution(second.id, "up", second.version, actorId);
    expect(moved.moved).toBe(true);
    const [a, b] = await Promise.all([
      getAdminAiSolution(first.id),
      getAdminAiSolution(second.id),
    ]);
    expect(b.displayOrder).toBe(before.displayOrder - 1);
    expect(a.displayOrder).toBe(before.displayOrder);

    const stuck = await moveAiSolution(second.id, "up", moved.version, actorId);
    expect(stuck.moved).toBe(false);
  });

  it("저장할 때 순서를 보내지 않으면 지키고, 영역이 바뀌면 새 영역의 맨 뒤로 간다", async () => {
    const stay = await createAiSolution(solutionInput("고정", areaIds[2]), actorId);
    const beforeSave = await getAdminAiSolution(stay.id);
    const saved = await saveAiSolution(
      stay.id,
      solutionInput("고정 수정", areaIds[2]),
      stay.version,
      actorId,
    );
    expect((await getAdminAiSolution(stay.id)).displayOrder).toBe(beforeSave.displayOrder);

    const occupant = await createAiSolution(solutionInput("새 영역 기존", areaIds[3]), actorId);
    await saveAiSolution(stay.id, solutionInput("이동", areaIds[3]), saved.version, actorId);
    const [movedItem, existing] = await Promise.all([
      getAdminAiSolution(stay.id),
      getAdminAiSolution(occupant.id),
    ]);
    expect(movedItem.businessAreaId).toBe(areaIds[3]);
    expect(movedItem.displayOrder).toBe(existing.displayOrder + 1);
  });

  it("카테고리가 없는 공지도 게시할 수 있다", async () => {
    const created = await createNotice(
      {
        categoryId: null,
        displayDate: "2026-10-04",
        locales: {
          ko: { title: "분류 없는 공지", bodyMarkdown: "본문" },
          en: { title: "", bodyMarkdown: "" },
        },
      },
      actorId,
    );
    await expect(
      publishNotice(created.id, "ko", created.version, actorId),
    ).resolves.toMatchObject({ locale: "ko" });
  });
});
