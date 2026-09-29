import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";
import { createNoticeCategory, listAdminNoticeCategories } from "@/server/modules/notices/category-repository";
import { noticeCategoryCommandSchema } from "@/server/modules/notices/schema";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method === "GET") {
    response.status(200).json({ data: await listAdminNoticeCategories() });
    return;
  }
  if (request.method === "POST") {
    const data = await createNoticeCategory(
      parseBody(noticeCategoryCommandSchema, request.body),
      await ensureNoticeAdminActor(session.user.id),
    );
    response.status(201).json({ data });
    return;
  }
  response.setHeader("Allow", "GET, POST");
  response.status(405).end();
}

export default withApiErrorBoundary(handler);
