import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

const on = vi.fn();
const off = vi.fn();
const emit = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({ events: { on, off, emit }, asPath: "/admin/notices/1" }),
}));

import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

afterEach(() => {
  vi.restoreAllMocks();
  on.mockClear();
  off.mockClear();
  emit.mockClear();
});

describe("좌측 내비게이션 이동 시 미저장 변경 경고", () => {
  it("dirty면 routeChangeStart를 구독하고 취소 시 이동을 막는다", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderHook(() => useUnsavedChanges(true));
    const handler = on.mock.calls.find(([name]) => name === "routeChangeStart")?.[1];
    expect(handler).toBeTypeOf("function");
    expect(() => handler("/admin/news")).toThrow();
    expect(emit).toHaveBeenCalledWith("routeChangeError");
  });

  it("dirty가 아니면 구독하지 않는다", () => {
    renderHook(() => useUnsavedChanges(false));
    expect(on).not.toHaveBeenCalledWith("routeChangeStart", expect.anything());
  });

  it("목록으로 클릭으로 이미 확인했다면 다음 routeChangeStart에서 다시 묻지 않는다", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { result } = renderHook(() => useUnsavedChanges(true));

    expect(result.current()).toBe(true);
    expect(confirm).toHaveBeenCalledOnce();

    const handler = on.mock.calls.find(([name]) => name === "routeChangeStart")?.[1];
    expect(handler).toBeTypeOf("function");
    handler("/admin/notices");

    expect(confirm).toHaveBeenCalledOnce();
  });
});
