import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { localeCommandSchema, parseBody } from "@/server/http/validate";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { unpublishPopupNotice } from "@/server/modules/popup-notices/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  const id = typeof request.query.id === "string" ? request.query.id : "";
  const command = parseBody(localeCommandSchema, request.body);
  const data = await unpublishPopupNotice(
    id,
    command.locale,
    command.expectedVersion,
    await ensureNoticeAdminActor(session.user.id),
  );
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler, ["POST"]);
