import { describe, expect, it } from "vitest";
import { getAuthAdvancedOptions, getAuthBaseURL } from "@/server/auth/config";

describe("Better Auth 경로 설정", () => {
  it("앱 원본 주소에 /api/auth 경로를 붙여 인증 라우터 기준 주소를 만든다", () => {
    expect(getAuthBaseURL("http://127.0.0.1:3001")).toBe(
      "http://127.0.0.1:3001/api/auth",
    );
    expect(getAuthBaseURL("http://localhost:3000/")).toBe(
      "http://localhost:3000/api/auth",
    );
  });

  it("Next의 끝 슬래시 API 요청을 인증 라우터가 허용한다", () => {
    expect(getAuthAdvancedOptions()).toEqual({ skipTrailingSlashes: true });
  });
});
