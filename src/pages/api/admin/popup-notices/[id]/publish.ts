import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { localeCommandSchema, parseBody } from "@/server/http/validate";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { publishPopupNotice } from "@/server/modules/popup-notices/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  const id = typeof request.query.id === "string" ? request.query.id : "";
  // 노출 기간은 "변경 저장"으로 저장된 값을 쓴다.
  const command = parseBody(localeCommandSchema, request.body);
  const data = await publishPopupNotice(
    id,
    command.locale,
    command.expectedVersion,
    await ensureNoticeAdminActor(session.user.id),
  );
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler, ["POST"]);
