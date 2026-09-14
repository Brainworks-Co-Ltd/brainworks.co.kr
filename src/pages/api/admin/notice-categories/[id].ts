import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";
import {
  saveNoticeCategory,
} from "@/server/modules/notices/category-repository";
import { noticeCategorySaveSchema } from "@/server/modules/notices/schema";
import { ensureNoticeAdminActor } from "@/server/modules/notices/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method !== "PUT") {
    response.setHeader("Allow", "PUT");
    response.status(405).end();
    return;
  }
  const id = typeof request.query.id === "string" ? request.query.id : "";
  const input = parseBody(noticeCategorySaveSchema, request.body);
  const data = await saveNoticeCategory(
    id,
    input,
    input.expectedVersion,
    await ensureNoticeAdminActor(session.user.id),
  );
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler);
