import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  await requireAdmin(request);
  response
    .status(501)
    .json({
      error: {
        code: "DEPENDENCY_UNAVAILABLE",
        message: "자산 업로드 저장소가 아직 연결되지 않았습니다.",
      },
    });
}

export default withApiErrorBoundary(handler);
