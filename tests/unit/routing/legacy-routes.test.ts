import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config.js";
import { getServerSideProps } from "@/pages/bid-notice/[[...slug]]";

describe("레거시 공개 경로", () => {
  it("중복 경로를 새 공개 경로로 영구 이동한다", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/Home",
          destination: "/",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/outbound",
          destination: "/global-programs",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/services/consulting",
          destination: "/consulting",
          permanent: true,
        }),
      ]),
    );
  });

  it("입찰공고 경로는 410 상태를 반환한다", async () => {
    const response = { statusCode: 200 };
    const result = await getServerSideProps({ res: response } as never);
    expect(response.statusCode).toBe(410);
    expect(result).toEqual({ props: {} });
  });
});
