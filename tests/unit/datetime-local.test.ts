import { describe, expect, it } from "vitest";
import { toDateTimeLocal, todayInSeoul } from "@/lib/datetime-local";

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

describe("todayInSeoul", () => {
  it("UTC 15시 전까지는 서울도 같은 날이다", () => {
    expect(todayInSeoul(new Date("2026-09-30T14:59:59.999Z"))).toBe("2026-09-30");
  });

  it("UTC 15시부터는 서울 날짜가 다음 날로 넘어간다", () => {
    expect(todayInSeoul(new Date("2026-09-30T15:00:00.000Z"))).toBe("2026-10-01");
  });
});
