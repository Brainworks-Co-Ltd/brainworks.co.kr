import { afterEach, describe, expect, it, vi } from "vitest";
import { getLocalizedBusinessAreas } from "@/data/businessAreas";

const { getDbMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
}));

vi.mock("@/server/db/client", () => ({
  getDb: getDbMock,
}));

import { getPublishedBusinessAreas } from "@/server/modules/catalog/queries";

describe("공개 사업 영역 조회", () => {
  afterEach(() => {
    delete process.env.DATABASE_URL;
    getDbMock.mockReset();
  });

  it("DATABASE_URL이 없으면 고정 사업 영역 분류를 사용하고 DB를 호출하지 않는다", async () => {
    await expect(getPublishedBusinessAreas("ko")).resolves.toEqual(
      getLocalizedBusinessAreas("ko"),
    );
    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("DATABASE_URL이 있으면 영역 분류는 고정 목록을 쓰고 각 영역의 솔루션만 DB에서 읽는다", async () => {
    process.env.DATABASE_URL = "postgresql://user:pw@localhost:5433/db";
    const chain = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    };
    getDbMock.mockReturnValue(chain);

    const areas = await getPublishedBusinessAreas("ko");

    expect(getDbMock).toHaveBeenCalled();
    expect(areas.map((area) => area.id)).toEqual(
      getLocalizedBusinessAreas("ko").map((area) => area.id),
    );
    expect(
      areas.every(
        (area) => Array.isArray(area.solutions) && area.solutions.length === 0,
      ),
    ).toBe(true);
  });
});
