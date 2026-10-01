import type { NextApiRequest, NextApiResponse } from "next";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/require-admin", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { id: "admin-1" } }),
}));

import previewHandler from "@/pages/api/admin/previews/[contentType]";

function mockResponse() {
  const response = { headersSent: false } as unknown as NextApiResponse;
  response.setHeader = vi.fn(() => response) as unknown as NextApiResponse["setHeader"];
  response.status = vi.fn(() => response) as unknown as NextApiResponse["status"];
  response.json = vi.fn(() => response) as unknown as NextApiResponse["json"];
  return response;
}

function post(contentType: string, markdown: string) {
  return {
    method: "POST",
    query: { contentType },
    body: { markdown },
  } as unknown as NextApiRequest;
}

describe("관리자 본문 미리보기 API", () => {
  it.each(["news", "notice", "popup"])(
    "%s 본문을 같은 렌더러로 HTML로 바꾼다",
    async (contentType) => {
      const response = mockResponse();
      await previewHandler(post(contentType, "**굵게**"), response);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        data: { html: "<p><strong>굵게</strong></p>" },
      });
    },
  );

  it("다른 콘텐츠 유형은 받지 않는다", async () => {
    const response = mockResponse();
    await previewHandler(post("honors", "**굵게**"), response);
    expect(response.status).toHaveBeenCalledWith(405);
  });
});
