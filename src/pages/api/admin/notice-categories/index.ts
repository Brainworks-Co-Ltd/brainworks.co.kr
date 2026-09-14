import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { createNoticeCategory, listAdminNoticeCategories } from "@/server/modules/notices/category-repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method === "GET") { response.status(200).json({ data: await listAdminNoticeCategories() }); return; }
  if (request.method === "POST") { response.status(201).json({ data: await createNoticeCategory(request.body, await ensureNoticeAdminActor(session.user.id)) }); return; }
  response.setHeader("Allow", "GET, POST"); response.status(405).end();
}

export default withApiErrorBoundary(handler);
