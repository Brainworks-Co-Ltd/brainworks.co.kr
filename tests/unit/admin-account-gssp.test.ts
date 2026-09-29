import type { GetServerSidePropsContext } from "next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeReturnTo } from "@/server/auth/policy";
import { HttpError } from "@/server/http/errors";

const { requireAdminMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
}));

vi.mock("@/server/auth/require-admin", () => ({
  requireAdmin: requireAdminMock,
}));

import { getServerSideProps } from "@/pages/admin/account";

function makeContext(resolvedUrl: string): GetServerSidePropsContext {
  return {
    req: {},
    resolvedUrl,
  } as unknown as GetServerSidePropsContext;
}

describe("관리자 계정 페이지 GSSP", () => {
  afterEach(() => {
    requireAdminMock.mockReset();
  });

  it("세션을 한 번만 조회해 계정 정보를 props로 구성한다", async () => {
    requireAdminMock.mockResolvedValue({
      user: {
        name: "관리자",
        email: "admin@brainworks.local",
        role: "ADMIN",
        accountStatus: "ACTIVE",
      },
    });

    const result = await getServerSideProps(
      makeContext("/admin/account"),
    );

    expect(requireAdminMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      props: {
        account: {
          name: "관리자",
          email: "admin@brainworks.local",
          role: "ADMIN",
          accountStatus: "ACTIVE",
        },
      },
    });
  });

  it("세션 조회에 실패하면 requireAdminPage와 동일한 리다이렉트를 반환한다", async () => {
    requireAdminMock.mockRejectedValue(new HttpError("UNAUTHORIZED"));
    const resolvedUrl = "/admin/account?tab=security";

    const result = await getServerSideProps(makeContext(resolvedUrl));

    const expectedReturnTo = normalizeReturnTo(resolvedUrl);
    expect(result).toEqual({
      redirect: {
        destination: `/admin/auth/sign-in?returnTo=${encodeURIComponent(expectedReturnTo)}`,
        permanent: false,
      },
    });
  });

  it("HttpError가 아닌 예외(DB 장애 등)는 그대로 다시 던진다", async () => {
    requireAdminMock.mockRejectedValue(new Error("db down"));

    await expect(
      getServerSideProps(makeContext("/admin/account")),
    ).rejects.toThrow("db down");
  });
});
