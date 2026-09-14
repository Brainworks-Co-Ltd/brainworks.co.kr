import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  saveSnapshot,
  snapshotKey,
  takeSnapshot,
  useSessionSnapshot,
} from "@/hooks/useSessionSnapshot";

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("snapshotKey", () => {
  it("kind와 id로 키를 만들고, id가 없으면 new를 쓴다", () => {
    expect(snapshotKey("notice", "n1")).toBe("brainworks:admin:snapshot:notice:n1");
    expect(snapshotKey("notice", undefined)).toBe("brainworks:admin:snapshot:notice:new");
  });
});

describe("saveSnapshot / takeSnapshot", () => {
  it("저장 후 한 번 복원하면 두 번째 조회에서는 없다", () => {
    saveSnapshot("k", { title: "제목" });
    expect(takeSnapshot("k")).toEqual({ title: "제목" });
    expect(takeSnapshot("k")).toBeNull();
  });

  it("스토리지가 던져도 예외 없이 무시한다", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    expect(() => saveSnapshot("k", { a: 1 })).not.toThrow();
    setItem.mockRestore();

    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    expect(takeSnapshot("k")).toBeNull();
    getItem.mockRestore();
  });
});

describe("useSessionSnapshot", () => {
  it("마운트 시 스냅숏이 있으면 복원 콜백을 한 번 호출하고 지운다", () => {
    saveSnapshot("hook-key", { title: "복원된 제목" });
    const restore = vi.fn();

    renderHook(() => useSessionSnapshot("hook-key", restore));

    expect(restore).toHaveBeenCalledTimes(1);
    expect(restore).toHaveBeenCalledWith({ title: "복원된 제목" });
    expect(sessionStorage.getItem("hook-key")).toBeNull();
  });

  it("스냅숏이 없으면 복원 콜백을 호출하지 않는다", () => {
    const restore = vi.fn();

    renderHook(() => useSessionSnapshot("missing-key", restore));

    expect(restore).not.toHaveBeenCalled();
  });
});
