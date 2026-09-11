import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { ensureNoticeAdminActor, restoreNotice } from "@/server/modules/notices/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  const id = typeof request.query.id === "string" ? request.query.id : "";
  const data = await restoreNotice(id, Number(request.body?.expectedVersion), await ensureNoticeAdminActor(session.user.id));
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler, ["POST"]);
