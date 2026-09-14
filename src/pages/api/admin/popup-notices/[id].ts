import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { getAdminPopupNotice, savePopupNotice } from "@/server/modules/popup-notices/repository";
import { popupSaveSchema } from "@/server/modules/popup-notices/schema";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  const id = typeof request.query.id === "string" ? request.query.id : "";
  if (request.method === "GET") {
    response.status(200).json({ data: await getAdminPopupNotice(id) });
    return;
  }
  const input = parseBody(popupSaveSchema, request.body);
  const data = await savePopupNotice(
    id,
    input,
    input.expectedVersion,
    await ensureNoticeAdminActor(session.user.id),
  );
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler, ["GET", "PUT"]);
