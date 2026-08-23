import { describe, expect, it } from "vitest";
import {
  isActiveAdmin,
  normalizeReturnTo,
  shouldExposeGenericResetResponse,
} from "@/server/auth/policy";

describe("관리자 계정 정책", () => {
  it("ADMIN이면서 ACTIVE인 계정만 보호 영역에 들어간다", () => {
    expect(isActiveAdmin({ role: "ADMIN", accountStatus: "ACTIVE" })).toBe(
      true,
    );
    expect(isActiveAdmin({ role: "ADMIN", accountStatus: "INACTIVE" })).toBe(
      false,
    );
    expect(isActiveAdmin({ role: "USER", accountStatus: "ACTIVE" })).toBe(
      false,
    );
  });

  it("returnTo는 같은 출처의 /admin 경로만 보존한다", () => {
    expect(normalizeReturnTo("/admin/news")).toBe("/admin/news");
    expect(normalizeReturnTo("https://evil.example/admin")).toBe("/admin");
    expect(normalizeReturnTo("/public")).toBe("/admin");
  });

  it("비밀번호 재설정 요청은 계정 존재 여부와 같은 응답을 사용한다", () => {
    expect(shouldExposeGenericResetResponse()).toBe(true);
  });
});
