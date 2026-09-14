import { describe, expect, it } from "vitest";
import { resolvePublishedNoticeRoute } from "@/server/modules/notices/public-route";

describe("공지 공개 상세 경로", () => {
  const notice = { publicNumber: 123, title: "공지" };

  it("숫자 식별자로 공개 공지를 조회한다", async () => {
    const result = await resolvePublishedNoticeRoute("123", "ko", {
      getByPublicNumber: async (publicNumber) =>
        publicNumber === 123 ? notice : null,
      getPublicNumberByLegacySlug: async () => null,
    });

    expect(result).toEqual({ kind: "notice", notice });
  });

  it("과거 슬러그는 로케일을 보존한 숫자 주소로 이동한다", async () => {
    const result = await resolvePublishedNoticeRoute("old-slug", "en", {
      getByPublicNumber: async () => null,
      getPublicNumberByLegacySlug: async (slug) =>
        slug === "old-slug" ? 123 : null,
    });

    expect(result).toEqual({
      kind: "redirect",
      destination: "/en/notices/123",
    });
  });

  it("공개 번호와 과거 슬러그가 모두 없으면 찾을 수 없다", async () => {
    const result = await resolvePublishedNoticeRoute("missing", "ko", {
      getByPublicNumber: async () => null,
      getPublicNumberByLegacySlug: async () => null,
    });

    expect(result).toEqual({ kind: "notFound" });
  });
});
