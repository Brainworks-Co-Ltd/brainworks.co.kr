import { afterEach, describe, expect, it, vi } from "vitest";
import { resolvePublicAssetUrl } from "@/server/modules/assets/public-url";

const { getDbMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
}));

vi.mock("@/server/db/client", () => ({
  getDb: getDbMock,
}));

import { getPublishedHonors } from "@/server/modules/honors/queries";

const originalDatabaseUrl = process.env.DATABASE_URL;

function restoreDatabaseUrl() {
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
}

function makeChain(result: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
}

describe("DB 수상 및 인증 조회", () => {
  afterEach(() => {
    process.env.ASSET_PUBLIC_BASE_URL = "https://cdn.example.com";
    restoreDatabaseUrl();
    getDbMock.mockReset();
  });

  it("이미지 자산이 있으면 image를 공개 URL로 채운다", async () => {
    process.env.DATABASE_URL = "postgres://test";
    process.env.ASSET_PUBLIC_BASE_URL = "https://cdn.example.com";
    const chain = makeChain([
      {
        id: "award-1",
        type: "AWARD",
        year: 2026,
        date: "2026-06-24",
        displayOrder: 1,
        title: "수상 제목",
        organization: "주최",
        description: "설명",
        storageKey: "honors/award.webp",
      },
    ]);
    getDbMock.mockReturnValue(chain);

    const result = await getPublishedHonors("ko");

    expect(chain.leftJoin).toHaveBeenCalled();
    expect(result.awards[0].image).toBe(
      resolvePublicAssetUrl("honors/award.webp"),
    );
    expect(result.awards[0].title.ko).toBe("수상 제목");
  });

  it("이미지 자산이 없으면 image는 빈 문자열이다", async () => {
    process.env.DATABASE_URL = "postgres://test";
    const chain = makeChain([
      {
        id: "award-2",
        type: "AWARD",
        year: 2025,
        date: null,
        displayOrder: 1,
        title: "제목2",
        organization: "주최2",
        description: "설명2",
        storageKey: null,
      },
    ]);
    getDbMock.mockReturnValue(chain);

    const result = await getPublishedHonors("ko");

    expect(result.awards[0].image).toBe("");
  });

  it("영문 로케일이면 title이 en 키로만 채워진다", async () => {
    process.env.DATABASE_URL = "postgres://test";
    const chain = makeChain([
      {
        id: "cert-1",
        type: "CERTIFICATION",
        year: 2025,
        date: null,
        displayOrder: 1,
        title: "Cert title",
        organization: "Org",
        description: "Desc",
        storageKey: null,
      },
    ]);
    getDbMock.mockReturnValue(chain);

    const result = await getPublishedHonors("en");

    expect(result.certifications[0].title.en).toBe("Cert title");
    expect(result.certifications[0].title.ko).toBeUndefined();
  });
});

describe("정적 수상 및 인증 조회", () => {
  afterEach(() => {
    restoreDatabaseUrl();
  });

  it("DATABASE_URL이 없으면 DB 경로와 같은 키 모양을 반환한다", async () => {
    delete process.env.DATABASE_URL;

    const result = await getPublishedHonors("ko");

    expect(result.awards[0].title).toHaveProperty("ko");
    expect(result.awards[0].title).toHaveProperty("en");
    expect(result.certifications[0].title).toHaveProperty("ko");
    expect(result.certifications[0].title).toHaveProperty("en");
    expect(typeof result.awards[0].image).toBe("string");
  });
});
