import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { restorePopupNotice } from "@/server/modules/popup-notices/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  const id = typeof request.query.id === "string" ? request.query.id : "";
  response.status(200).json({ data: await restorePopupNotice(id, Number(request.body?.expectedVersion), await ensureNoticeAdminActor(session.user.id)) });
}

export default withApiErrorBoundary(handler, ["POST"]);
