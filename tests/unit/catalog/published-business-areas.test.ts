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

  it("DB 연결 여부와 관계없이 승인된 고정 사업 영역 분류를 사용한다", async () => {
    process.env.DATABASE_URL = "postgres://example.test/brainworks";

    await expect(getPublishedBusinessAreas("ko")).resolves.toEqual(
      getLocalizedBusinessAreas("ko"),
    );
    expect(getDbMock).not.toHaveBeenCalled();
  });
});
