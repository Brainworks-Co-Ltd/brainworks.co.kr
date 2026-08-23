import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { ensureAdminActor, saveNews } from "@/server/modules/news/repository";
import { withApiErrorBoundary } from "@/server/http/api-handler";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method !== "PATCH") {
    response.setHeader("Allow", "PATCH");
    response
      .status(405)
      .json({ error: { code: "BAD_REQUEST", message: "PATCH만 허용됩니다." } });
    return;
  }
  const expectedVersion = Number(request.body?.expectedVersion);
  if (!Number.isInteger(expectedVersion) || !request.body?.input) {
    response
      .status(400)
      .json({
        error: {
          code: "BAD_REQUEST",
          message: "버전과 저장 입력값이 필요합니다.",
        },
      });
    return;
  }
  const actorId = await ensureAdminActor(session.user.id);
  const saved = await saveNews(
    request.query.id as string,
    request.body.input,
    expectedVersion,
    actorId,
  );
  response.status(200).json({ data: saved });
}

export default withApiErrorBoundary(handler);
