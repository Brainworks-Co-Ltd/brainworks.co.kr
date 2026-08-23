import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { createPopupNotice } from "@/server/modules/popup-notices/repository";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { getPublishedPopupNotices } from "@/server/modules/popup-notices/queries";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method === "GET") { response.status(200).json({ data: await getPublishedPopupNotices("ko") }); return; }
  if (request.method === "POST") { const data = await createPopupNotice(request.body, await ensureNoticeAdminActor(session.user.id)); response.status(201).json({ data }); return; }
  response.setHeader("Allow", "GET, POST"); response.status(405).end();
}

export default withApiErrorBoundary(handler);
