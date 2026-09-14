import { beforeEach, describe, expect, it } from "vitest";
import { dismissForDay, dismissForSession, isDismissed } from "@/components/popup-notices/dismissal-store";

describe("팝업 방문자 제외 저장", () => {
  beforeEach(() => window.sessionStorage.clear());
  it("세션 닫기와 오늘 하루 제외를 리비전별로 저장한다", () => {
    expect(isDismissed("p1", 1)).toBe(false);
    dismissForSession("p1", 1);
    expect(isDismissed("p1", 1)).toBe(true);
    expect(isDismissed("p1", 2)).toBe(false);
    dismissForDay("p2", 1);
    expect(isDismissed("p2", 1)).toBe(true);
    expect(isDismissed("p2", 2)).toBe(false);
  });
});
