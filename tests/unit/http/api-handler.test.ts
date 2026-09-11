import { describe, expect, it, vi } from "vitest";
import { withApiErrorBoundary } from "@/server/http/api-handler";

function mockResponse() {
  const response: any = { headersSent: false, headers: {} as Record<string, string> };
  response.setHeader = vi.fn((k: string, v: string) => { response.headers[k] = v; });
  response.status = vi.fn(() => response);
  response.json = vi.fn(() => response);
  response.end = vi.fn(() => response);
  return response;
}

describe("withApiErrorBoundary 메서드 허용 목록", () => {
  it("목록 밖 메서드는 405와 Allow 헤더를 받고 핸들러는 호출되지 않는다", async () => {
    const handler = vi.fn();
    const wrapped = withApiErrorBoundary(handler, ["POST"]);
    const response = mockResponse();
    await wrapped({ method: "GET" } as any, response);
    expect(handler).not.toHaveBeenCalled();
    expect(response.setHeader).toHaveBeenCalledWith("Allow", "POST");
    expect(response.status).toHaveBeenCalledWith(405);
  });
  it("목록 안 메서드는 핸들러로 전달된다", async () => {
    const handler = vi.fn();
    const wrapped = withApiErrorBoundary(handler, ["POST"]);
    await wrapped({ method: "POST" } as any, mockResponse());
    expect(handler).toHaveBeenCalledTimes(1);
  });
  it("허용 목록이 없으면 기존처럼 모든 메서드를 통과시킨다", async () => {
    const handler = vi.fn();
    await withApiErrorBoundary(handler)({ method: "DELETE" } as any, mockResponse());
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("withApiErrorBoundary 예외 로깅", () => {
  it("HttpError가 아닌 예외는 console.error로 기록하고 500을 반환한다", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("boom");
    const handler = vi.fn(async () => {
      throw error;
    });
    const response = mockResponse();
    await withApiErrorBoundary(handler)(
      { method: "POST", url: "/api/admin/notices/1/archive" } as any,
      response,
    );
    expect(consoleError).toHaveBeenCalledWith(
      "[api]",
      "POST",
      "/api/admin/notices/1/archive",
      error,
    );
    expect(response.status).toHaveBeenCalledWith(500);
    consoleError.mockRestore();
  });
});
