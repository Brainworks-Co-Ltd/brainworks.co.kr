import { asc } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { businessAreas as staticBusinessAreas } from "@/data/businessAreas";
import { getDb } from "@/server/db/client";
import { businessAreas } from "@/server/db/schema/catalog";
import globalSetup from "./global-setup";
import { hasTestDatabase } from "./setup";

const expectedKeys = staticBusinessAreas.map((area) => area.id);

async function readSeededKeys() {
  const rows = await getDb()
    .select({ publicKey: businessAreas.publicKey })
    .from(businessAreas)
    .orderBy(asc(businessAreas.displayOrder));
  return rows.map((row) => row.publicKey);
}

describe.skipIf(!hasTestDatabase)("사업 영역 시드", () => {
  it("마이그레이션이 정적 데이터 순서대로 4건을 시드한다", async () => {
    expect(expectedKeys).toHaveLength(4);
    expect(await readSeededKeys()).toEqual(expectedKeys);
  });

  it("마이그레이션을 다시 실행해도 4건 그대로다", async () => {
    await globalSetup();
    expect(await readSeededKeys()).toEqual(expectedKeys);
  });
});
