import { describe, expect, it } from "vitest";
import { parseNoticePublicNumber } from "@/server/modules/notices/contracts";
import { noticeCommandSchema } from "@/server/modules/notices/schema";

describe("공지 공개 번호 계약", () => {
  it("양의 안전 정수만 공개 번호로 받는다", () => {
    expect(parseNoticePublicNumber("123")).toBe(123);

    for (const value of [
      "0",
      "-1",
      "1.2",
      "01",
      "9007199254740992",
      "notice",
    ]) {
      expect(parseNoticePublicNumber(value)).toBeNull();
    }
  });

  it("슬러그 없이 국문·영문 입력을 받는다", () => {
    expect(
      noticeCommandSchema.safeParse({
        displayDate: "2026-08-27",
        locales: {
          ko: { title: "공지", bodyMarkdown: "본문" },
          en: { title: "Notice", bodyMarkdown: "Body" },
        },
      }).success,
    ).toBe(true);
  });
});
