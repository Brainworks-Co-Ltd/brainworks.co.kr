import { describe, expect, it } from "vitest";
import {
  effectiveNoticeVisibility,
  renotify,
  resolvePopupDetailUrl,
  validatePopupLocale,
} from "@/server/modules/notices/domain";

describe("공지·팝업 공개 정책", () => {
  const now = new Date("2026-08-24T00:00:00.000Z");

  it("공지 예약·게시 기간을 현재 시각과 함께 판정한다", () => {
    expect(effectiveNoticeVisibility({ status: "PUBLISHED" }, now)).toBe(true);
    expect(effectiveNoticeVisibility({ status: "SCHEDULED", startsAt: "2026-08-25T00:00:00Z" }, now)).toBe(false);
    expect(effectiveNoticeVisibility({ status: "PUBLISHED", endsAt: "2026-08-23T00:00:00Z" }, now)).toBe(false);
  });

  it("연결된 공지가 현재 로케일에서 공개되지 않으면 버튼을 만들지 않는다", () => {
    expect(resolvePopupDetailUrl({ noticePublicNumber: 123 }, { isPublished: true })).toBe("/notices/123");
    expect(resolvePopupDetailUrl({ noticePublicNumber: 123 }, { isPublished: false })).toBeNull();
    expect(resolvePopupDetailUrl({ noticePublicNumber: null }, null)).toBeNull();
  });

  it("이미지 전용 팝업도 식별 제목과 이미지 대체 설명을 요구한다", () => {
    expect(validatePopupLocale({ title: "공지", imageAssetId: "asset", imageAlt: "설명" })).toEqual({ valid: true });
    expect(validatePopupLocale({ imageAssetId: "asset" })).toMatchObject({ code: "POPUP_TITLE_REQUIRED" });
    expect(validatePopupLocale({ title: "공지", imageAssetId: "asset" })).toMatchObject({ code: "POPUP_IMAGE_ALT_REQUIRED" });
  });

  it("수정 내용을 다시 알리면 방문자 제외 리비전이 증가한다", () => {
    expect(renotify({ revision: 2, expectedVersion: 4 })).toEqual({ revision: 3, version: 5 });
  });
});
