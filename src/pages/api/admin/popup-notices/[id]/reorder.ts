import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { reorderPopupNotices } from "@/server/modules/popup-notices/repository";
import { popupReorderCommandSchema } from "@/server/modules/popup-notices/schema";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  const id = typeof request.query.id === "string" ? request.query.id : "";
  const command = parseBody(popupReorderCommandSchema, request.body);
  const data = await reorderPopupNotices(
    id,
    command.locale,
    command.displayOrder,
    command.expectedVersion,
    await ensureNoticeAdminActor(session.user.id),
  );
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler, ["POST"]);
