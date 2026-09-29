import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

  describe("스토리지 차단 환경", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("sessionStorage.getItem이 던지면 isDismissed는 false를 반환한다", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new DOMException("blocked", "SecurityError");
      });
      expect(isDismissed("p1", 1)).toBe(false);
    });

    it("setItem이 던져도 dismissForSession은 예외를 던지지 않는다", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("blocked", "SecurityError");
      });
      expect(() => dismissForSession("p1", 1)).not.toThrow();
    });

    it("setItem이 던져도 dismissForDay는 예외를 던지지 않는다", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("blocked", "SecurityError");
      });
      expect(() => dismissForDay("p1", 1)).not.toThrow();
    });
  });
});
