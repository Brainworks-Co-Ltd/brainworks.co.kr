import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { setNoticeCategoryActive } from "@/server/modules/notices/category-repository";
import { noticeCategoryActiveSchema } from "@/server/modules/notices/schema";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  const id = typeof request.query.id === "string" ? request.query.id : "";
  const command = parseBody(noticeCategoryActiveSchema, request.body);
  const data = await setNoticeCategoryActive(
    id,
    command.isActive,
    command.expectedVersion,
    await ensureNoticeAdminActor(session.user.id),
  );
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler, ["POST"]);
