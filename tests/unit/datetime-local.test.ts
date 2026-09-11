import { describe, expect, it } from "vitest";
import { toDateTimeLocal } from "@/lib/datetime-local";

describe("toDateTimeLocal", () => {
  it("로컬 벽시계와 왕복 항등을 만족한다", () => {
    const local = "2026-09-11T18:00";
    const iso = new Date(local).toISOString(); // 폼의 toIso와 같은 변환
    expect(toDateTimeLocal(iso)).toBe(local);
    expect(toDateTimeLocal(new Date(iso))).toBe(local);
  });
  it("빈 값은 빈 문자열", () => {
    expect(toDateTimeLocal(null)).toBe("");
    expect(toDateTimeLocal(undefined)).toBe("");
  });
});
