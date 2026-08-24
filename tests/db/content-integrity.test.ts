import { describe, expect, it } from "vitest";
import {
  assertCompleteLocales,
  assertContinuousOrder,
  assertExpectedVersion,
  isPublicSolution,
  isPublicContent,
} from "@/server/db/integrity";

describe("콘텐츠 무결성 계약", () => {
  it("부모 콘텐츠는 국문·영문 로케일을 모두 가져야 한다", () => {
    expect(() => assertCompleteLocales(["ko", "en"])).not.toThrow();
    expect(() => assertCompleteLocales(["ko"])).toThrow("PUBLICATION_INVALID");
    expect(() => assertCompleteLocales(["ko", "en", "en"])).toThrow(
      "PUBLICATION_INVALID",
    );
  });

  it("표시 순서는 1부터 끊김 없이 이어져야 한다", () => {
    expect(assertContinuousOrder([1, 2, 3])).toBe(true);
    expect(assertContinuousOrder([3, 1, 2])).toBe(true);
    expect(assertContinuousOrder([1, 3])).toBe(false);
    expect(assertContinuousOrder([1, 1])).toBe(false);
  });

  it("오래된 버전은 저장을 거부한다", () => {
    expect(() => assertExpectedVersion(4, 4)).not.toThrow();
    expect(() => assertExpectedVersion(5, 4)).toThrow("VERSION_CONFLICT");
  });

  it("공개 콘텐츠는 활성 부모와 게시 로케일만 통과한다", () => {
    expect(isPublicContent("ACTIVE", "PUBLISHED")).toBe(true);
    expect(isPublicContent("ARCHIVED", "PUBLISHED")).toBe(false);
    expect(isPublicContent("ACTIVE", "DRAFT")).toBe(false);
  });

  it("솔루션은 고정 사업 영역 참조와 무관하게 자체 상태로 공개된다", () => {
    expect(isPublicSolution("ACTIVE", "PUBLISHED")).toBe(true);
    expect(isPublicSolution("ARCHIVED", "PUBLISHED")).toBe(false);
    expect(isPublicSolution("ACTIVE", "DRAFT")).toBe(false);
  });
});
