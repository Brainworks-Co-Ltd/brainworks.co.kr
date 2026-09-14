import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";
import { createPopupNotice } from "@/server/modules/popup-notices/repository";
import { popupCommandSchema } from "@/server/modules/popup-notices/schema";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { getAdminPopupNoticeList } from "@/server/modules/popup-notices/queries";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method === "GET") {
    response.status(200).json({ data: await getAdminPopupNoticeList() });
    return;
  }
  if (request.method === "POST") {
    const data = await createPopupNotice(
      parseBody(popupCommandSchema, request.body),
      await ensureNoticeAdminActor(session.user.id),
    );
    response.status(201).json({ data });
    return;
  }
  response.setHeader("Allow", "GET, POST");
  response.status(405).end();
}

export default withApiErrorBoundary(handler);
