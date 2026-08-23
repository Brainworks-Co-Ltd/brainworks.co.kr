import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import {
  changeNewsSlug,
  ensureAdminActor,
} from "@/server/modules/news/repository";
import { withApiErrorBoundary } from "@/server/http/api-handler";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }
  const expectedVersion = Number(request.body?.expectedVersion);
  if (
    !Number.isInteger(expectedVersion) ||
    typeof request.body?.slug !== "string"
  ) {
    response
      .status(400)
      .json({
        error: { code: "BAD_REQUEST", message: "슬러그와 버전이 필요합니다." },
      });
    return;
  }
  const result = await changeNewsSlug(
    request.query.id as string,
    request.body.slug,
    expectedVersion,
    await ensureAdminActor(session.user.id),
  );
  response.status(200).json({ data: result });
}

export default withApiErrorBoundary(handler);
