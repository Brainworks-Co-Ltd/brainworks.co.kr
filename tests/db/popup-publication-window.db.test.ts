import { sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
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

  it("같은 팝업을 저장과 게시가 동시에 해도 교착 없이 한쪽만 성공하고 다른 쪽은 VERSION_CONFLICT가 된다", async () => {
    // 앞 테스트가 지금 노출되는 팝업 3개를 남겨 두므로, 겹치지 않는 먼 기간으로 예약해 둔다.
    const live = await liveKoPopup(
      "동시 저장 게시",
      new Date(Date.now() + 30 * day),
      new Date(Date.now() + 35 * day),
    );

    // 연결이 하나뿐이면 새 연결을 여는 동안 한쪽이 먼저 끝나 버리므로, 연결 두 개를 미리 열어 둔다.
    await Promise.all([
      getDb().execute(sql`select pg_sleep(0.1)`),
      getDb().execute(sql`select pg_sleep(0.1)`),
    ]);

    const results = await Promise.allSettled([
      savePopupNotice(live.id, popupInput("동시 저장 게시"), live.version, actorId),
      publishPopupNotice(live.id, "ko", live.version, actorId),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected).toMatchObject({ reason: { code: "VERSION_CONFLICT" } });
  });
});
