import { beforeAll, describe, expect, it } from "vitest";
import type { PopupCommandInput } from "@/server/modules/popup-notices/contracts";
import { getAdminPopupNoticeList } from "@/server/modules/popup-notices/queries";
import {
  createPopupNotice,
  getAdminPopupNotice,
  publishPopupNotice,
  savePopupNotice,
} from "@/server/modules/popup-notices/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

const day = 24 * 60 * 60 * 1000;

type PopupWindow = { publishStartsAt?: Date | null; publishEndsAt?: Date | null };

function popupInput(
  title: string,
  windows: Partial<Record<"ko" | "en", PopupWindow>> = {},
): PopupCommandInput {
  return {
    locales: {
      ko: { title, ...windows.ko },
      en: { title: `${title} (EN)`, ...windows.en },
    },
  };
}

describe.skipIf(!hasTestDatabase)("팝업 게시 기간 저장", () => {
  let actorId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  async function statusOf(id: string, locale: "ko" | "en") {
    const popup = await getAdminPopupNotice(id);
    return popup.locales.find((item) => item.locale === locale)?.publicationStatus;
  }

  async function liveKoPopup(title: string, startsAt: Date, endsAt: Date) {
    const created = await createPopupNotice(popupInput(title), actorId);
    const saved = await savePopupNotice(
      created.id,
      popupInput(title, { ko: { publishStartsAt: startsAt, publishEndsAt: endsAt } }),
      created.version,
      actorId,
    );
    return publishPopupNotice(created.id, "ko", saved.version, actorId);
  }

  it("게시 중인 팝업의 기간을 저장으로 늘려 4개가 겹치면 POPUP_OVERLAP_LIMIT로 막는다", async () => {
    const start = new Date(Date.now() - day);
    const end = new Date(Date.now() + 5 * day);
    for (const index of [1, 2, 3]) {
      await liveKoPopup(`겹침 기준 ${index}`, start, end);
    }
    const later = await liveKoPopup(
      "나중 팝업",
      new Date(Date.now() + 10 * day),
      new Date(Date.now() + 20 * day),
    );
    expect(await statusOf(later.id, "ko")).toBe("SCHEDULED");

    await expect(
      savePopupNotice(
        later.id,
        popupInput("나중 팝업", {
          ko: { publishStartsAt: start, publishEndsAt: new Date(Date.now() + 20 * day) },
        }),
        later.version,
        actorId,
      ),
    ).rejects.toMatchObject({ code: "POPUP_OVERLAP_LIMIT" });

    expect(await statusOf(later.id, "ko")).toBe("SCHEDULED");
    const listed = (await getAdminPopupNoticeList()).find((item) => item.id === later.id);
    expect(listed?.locales.ko.displayState).toBe("SCHEDULED");
  });

  it("게시 예약 언어의 시작을 과거로 저장하면 게시 중으로 다시 정한다", async () => {
    const created = await createPopupNotice(popupInput("영문 예약 팝업"), actorId);
    const saved = await savePopupNotice(
      created.id,
      popupInput("영문 예약 팝업", { en: { publishStartsAt: new Date(Date.now() + day) } }),
      created.version,
      actorId,
    );
    const scheduled = await publishPopupNotice(created.id, "en", saved.version, actorId);
    expect(await statusOf(created.id, "en")).toBe("SCHEDULED");

    await savePopupNotice(
      created.id,
      popupInput("영문 예약 팝업", { en: { publishStartsAt: new Date(Date.now() - day) } }),
      scheduled.version,
      actorId,
    );

    expect(await statusOf(created.id, "en")).toBe("PUBLISHED");
  });

  it("종료가 시작보다 빠른 저장과 게시는 PUBLICATION_WINDOW_INVALID로 막는다", async () => {
    const created = await createPopupNotice(popupInput("잘못된 기간"), actorId);
    const startsAt = new Date(Date.now() + 2 * day);
    const endsAt = new Date(Date.now() + day);

    await expect(
      savePopupNotice(
        created.id,
        popupInput("잘못된 기간", { ko: { publishStartsAt: startsAt, publishEndsAt: endsAt } }),
        created.version,
        actorId,
      ),
    ).rejects.toMatchObject({ code: "PUBLICATION_WINDOW_INVALID" });
    await expect(
      publishPopupNotice(created.id, "ko", created.version, actorId, { startsAt, endsAt }),
    ).rejects.toMatchObject({ code: "PUBLICATION_WINDOW_INVALID" });
  });
});
