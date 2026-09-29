import { describe, expect, it } from "vitest";
import { assertDraftLocales } from "@/server/db/integrity";
import { validatePopupLocale } from "@/server/modules/notices/domain";

describe("관리자 초안과 게시 검증", () => {
  it("한 언어 제목만 있는 초안은 허용하고 빈 초안은 거부한다", () => {
    expect(() =>
      assertDraftLocales({ ko: { title: "국문 초안" }, en: { title: "" } }),
    ).not.toThrow();
    expect(() =>
      assertDraftLocales({ ko: { title: "" }, en: { title: " " } }),
    ).toThrow("국문 또는 영문 제목");
  });

  it("팝업 게시 조건은 선택한 언어 값만 검사한다", () => {
    expect(validatePopupLocale({ title: "국문 팝업" })).toEqual({ valid: true });
    expect(validatePopupLocale({ title: "" })).toMatchObject({
      code: "POPUP_TITLE_REQUIRED",
    });
  });
});
