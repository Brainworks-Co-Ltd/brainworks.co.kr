import { beforeAll, describe, expect, it } from "vitest";
import {
  createPopupNotice,
  publishPopupNotice,
} from "@/server/modules/popup-notices/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

const day = 24 * 60 * 60 * 1000;

describe.skipIf(!hasTestDatabase)("팝업 공지 기간 겹침 제한", () => {
  let actorId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  async function createPopup(title: string) {
    return createPopupNotice(
      {
        locales: {
          ko: { title },
          en: { title: `${title} (EN)` },
        },
      },
      actorId,
    );
  }

  it("같은 로케일에 겹치는 팝업은 3건까지 게시되고 4번째는 막힌다", async () => {
    const window = {
      startsAt: new Date(Date.now() - day),
      endsAt: new Date(Date.now() + 10 * day),
    };

    for (const index of [1, 2, 3]) {
      const popup = await createPopup(`겹침 팝업 ${index}`);
      await expect(
        publishPopupNotice(popup.id, "ko", popup.version, actorId, window),
      ).resolves.toMatchObject({ locale: "ko" });
    }

    const fourth = await createPopup("겹침 팝업 4");
    const overflow = publishPopupNotice(
      fourth.id,
      "ko",
      fourth.version,
      actorId,
      window,
    );
    await expect(overflow).rejects.toMatchObject({
      code: "POPUP_OVERLAP_LIMIT",
    });

    // 겹치지 않는 기간이면 같은 팝업이 그대로 게시된다.
    await expect(
      publishPopupNotice(fourth.id, "ko", fourth.version, actorId, {
        startsAt: new Date(Date.now() + 20 * day),
        endsAt: new Date(Date.now() + 30 * day),
      }),
    ).resolves.toMatchObject({ locale: "ko", version: fourth.version + 1 });
  });

  it("다른 로케일은 ko의 겹침 건수에 영향을 받지 않는다", async () => {
    const popup = await createPopup("영문 팝업");
    await expect(
      publishPopupNotice(popup.id, "en", popup.version, actorId, {
        startsAt: new Date(Date.now() - day),
        endsAt: new Date(Date.now() + 10 * day),
      }),
    ).resolves.toMatchObject({ locale: "en" });
  });
});
