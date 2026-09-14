import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminApiError, adminApiErrorMessage, requestAdminApi } from "@/lib/admin-api";

afterEach(() => vi.unstubAllGlobals());

describe("관리자 API 안내", () => {
  it.each([
    ["VERSION_CONFLICT", "새로고침"],
    ["PUBLICATION_INVALID", "필수"],
    ["POPUP_OVERLAP_LIMIT", "게시 기간"],
    ["UNAUTHORIZED", "로그인"],
  ])("%s 오류에서 다음 행동을 안내한다", (code, action) => {
    expect(adminApiErrorMessage(new AdminApiError(code))).toContain(action);
    expect(adminApiErrorMessage(code)).not.toContain(code);
  });

  it("응답의 data를 반환하고 관리자 요청 헤더를 전달한다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { id: "notice-1" } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(requestAdminApi("/api/admin/notices", { method: "POST", body: "{}", headers: { "Content-Type": "application/json" } })).resolves.toEqual({ id: "notice-1" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe("same-origin");
    expect(new Headers(init.headers).get("X-Brainworks-Request")).toBe("admin");
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });

  it("실패 응답의 오류 코드를 보존한다", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: "VERSION_CONFLICT" } }), { status: 409 })));
    await expect(requestAdminApi("/api/admin/notices/1")).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
  });

  it("JSON이 아닌 실패 응답도 안전한 안내로 변환한다", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>오류</html>", { status: 502 })));
    await expect(requestAdminApi("/api/admin/notices")).rejects.toMatchObject({ code: "INTERNAL_ERROR" });
  });
});
