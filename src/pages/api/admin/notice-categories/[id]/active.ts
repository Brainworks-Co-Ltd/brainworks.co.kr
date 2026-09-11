import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { setNoticeCategoryActive } from "@/server/modules/notices/category-repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request); const id = typeof request.query.id === "string" ? request.query.id : "";
  response.status(200).json({ data: await setNoticeCategoryActive(id, Boolean(request.body?.isActive), Number(request.body?.expectedVersion), await ensureNoticeAdminActor(session.user.id)) });
}
export default withApiErrorBoundary(handler, ["POST"]);
