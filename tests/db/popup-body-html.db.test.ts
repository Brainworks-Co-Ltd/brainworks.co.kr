import { beforeAll, describe, expect, it } from "vitest";
import { getPublishedPopupNotices } from "@/server/modules/popup-notices/queries";
import {
  createPopupNotice,
  publishPopupNotice,
} from "@/server/modules/popup-notices/repository";
import { getTestActorId, hasTestDatabase } from "./setup";

describe.skipIf(!hasTestDatabase)("공개 팝업 본문", () => {
  let actorId = "";

  beforeAll(async () => {
    actorId = await getTestActorId();
  });

  it("Markdown 본문을 정화된 HTML로 내려 준다", async () => {
    const popup = await createPopupNotice(
      {
        locales: {
          ko: {
            title: "굵은 본문 팝업",
            bodyMarkdown: "**굵게**<script>alert(1)</script>",
          },
          en: { title: "Bold popup" },
        },
      },
      actorId,
    );
    await publishPopupNotice(popup.id, "ko", popup.version, actorId);

    const [published] = await getPublishedPopupNotices("ko");

    expect(published.bodyHtml).toContain("<strong>굵게</strong>");
    expect(published.bodyHtml).not.toContain("script");
  });
});
