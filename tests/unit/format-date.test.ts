import { describe, expect, it } from "vitest";
import { formatDate } from "@/lib/format-date";

const OPTIONS = { year: "numeric", month: "short", day: "2-digit" } as const;

describe("formatDate", () => {
  it("ko 로케일에서 신선한 Intl.DateTimeFormat과 같은 결과를 낸다", () => {
    const known = "2026-09-11T00:00:00.000Z";
    const expected = new Intl.DateTimeFormat("ko-KR", OPTIONS).format(new Date(known));
    expect(formatDate(known, "ko")).toBe(expected);
  });

  it("en 로케일에서 신선한 Intl.DateTimeFormat과 같은 결과를 낸다", () => {
    const known = "2026-09-11T00:00:00.000Z";
    const expected = new Intl.DateTimeFormat("en-US", OPTIONS).format(new Date(known));
    expect(formatDate(known, "en")).toBe(expected);
  });

  it("빈 값은 빈 문자열", () => {
    expect(formatDate("", "ko")).toBe("");
    expect(formatDate(null as unknown as string, "en")).toBe("");
  });

  it("파싱 실패 시 원본 문자열을 반환한다", () => {
    expect(formatDate("not-a-date", "ko")).toBe("not-a-date");
  });
});
