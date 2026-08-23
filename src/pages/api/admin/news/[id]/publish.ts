import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import {
  ensureAdminActor,
  publishNewsLocale,
} from "@/server/modules/news/repository";
import { withApiErrorBoundary } from "@/server/http/api-handler";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }
  const locale =
    request.body?.locale === "en"
      ? "en"
      : request.body?.locale === "ko"
        ? "ko"
        : null;
  const expectedVersion = Number(request.body?.expectedVersion);
  if (!locale || !Number.isInteger(expectedVersion)) {
    response
      .status(400)
      .json({
        error: { code: "BAD_REQUEST", message: "로케일과 버전이 필요합니다." },
      });
    return;
  }
  const result = await publishNewsLocale(
    request.query.id as string,
    locale,
    expectedVersion,
    await ensureAdminActor(session.user.id),
  );
  response.status(200).json({ data: result });
}

export default withApiErrorBoundary(handler);
