import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";
import { ensureNoticeAdminActor, getAdminNotice, saveNotice } from "@/server/modules/notices/repository";
import { noticeSaveSchema } from "@/server/modules/notices/schema";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  const id = typeof request.query.id === "string" ? request.query.id : "";
  if (request.method === "GET") {
    response.status(200).json({ data: await getAdminNotice(id) });
    return;
  }
  if (request.method === "PUT") {
    const input = parseBody(noticeSaveSchema, request.body);
    const data = await saveNotice(
      id,
      input,
      input.expectedVersion,
      await ensureNoticeAdminActor(session.user.id),
    );
    response.status(200).json({ data });
    return;
  }
  response.setHeader("Allow", "GET, PUT");
  response.status(405).json({ error: { code: "BAD_REQUEST", message: "허용되지 않은 메서드입니다." } });
}

export default withApiErrorBoundary(handler);
