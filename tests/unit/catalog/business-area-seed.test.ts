import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { businessAreas } from "@/data/businessAreas";

describe("사업 영역 시드 마이그레이션", () => {
  const sql = readFileSync(
    "src/server/db/migrations/0004_seed_business_areas.sql",
    "utf8",
  );

  it("고정 분류의 모든 영역과 두 언어 이름을 담는다", () => {
    for (const area of businessAreas) {
      expect(sql).toContain(`'${area.id}'`);
      expect(sql).toContain(area.name.ko);
      expect(sql).toContain(area.name.en);
    }
  });
});
