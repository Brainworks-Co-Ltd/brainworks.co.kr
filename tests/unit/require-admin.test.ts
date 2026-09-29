import type { GetServerSidePropsContext } from "next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeReturnTo } from "@/server/auth/policy";

const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
}));

vi.mock("@/server/auth/config", () => ({
  getAuth: () => ({ api: { getSession: getSessionMock } }),
}));

import { requireAdminPage } from "@/server/auth/require-admin";

function makeContext(resolvedUrl = "/admin"): GetServerSidePropsContext {
  return {
    req: { method: "GET", headers: {} },
    resolvedUrl,
  } as unknown as GetServerSidePropsContext;
}

describe("requireAdminPage", () => {
  afterEach(() => {
    getSessionMock.mockReset();
  });

  it("HttpError(UNAUTHORIZED)는 로그인 화면 리다이렉트로 바뀐다", async () => {
    getSessionMock.mockResolvedValue(null);
    const resolvedUrl = "/admin?tab=security";

    const result = await requireAdminPage(makeContext(resolvedUrl));

    const expectedReturnTo = normalizeReturnTo(resolvedUrl);
    expect(result).toEqual({
      redirect: {
        destination: `/admin/auth/sign-in?returnTo=${encodeURIComponent(expectedReturnTo)}`,
        permanent: false,
      },
    });
  });

  it("HttpError가 아닌 예외(DB 장애 등)는 삼키지 않고 다시 던진다", async () => {
    getSessionMock.mockRejectedValue(new Error("db down"));

    await expect(requireAdminPage(makeContext())).rejects.toThrow("db down");
  });
});
