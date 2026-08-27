import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { ensureNoticeAdminActor, createNotice } from "@/server/modules/notices/repository";
import { getAdminNoticeList } from "@/server/modules/notices/queries";
import { isNoticeCommandInput } from "@/server/modules/notices/contracts";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method === "GET") {
    response.status(200).json({ data: await getAdminNoticeList() });
    return;
  }
  if (request.method === "POST") {
    if (!isNoticeCommandInput(request.body)) { response.status(400).json({ error: { code: "BAD_REQUEST", message: "공지 입력값이 올바르지 않습니다." } }); return; }
    const created = await createNotice(request.body, await ensureNoticeAdminActor(session.user.id));
    response.status(201).json({ data: created });
    return;
  }
  response.setHeader("Allow", "GET, POST");
  response.status(405).json({ error: { code: "BAD_REQUEST", message: "허용되지 않은 메서드입니다." } });
}

export default withApiErrorBoundary(handler);
