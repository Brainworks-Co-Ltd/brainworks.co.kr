import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { ensureNoticeAdminActor, publishNotice } from "@/server/modules/notices/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method !== "POST") { response.setHeader("Allow", "POST"); response.status(405).end(); return; }
  const id = typeof request.query.id === "string" ? request.query.id : "";
  const locale = request.body?.locale === "en" ? "en" : "ko";
  const data = await publishNotice(id, locale, Number(request.body?.expectedVersion), await ensureNoticeAdminActor(session.user.id), { startsAt: request.body?.startsAt ? new Date(request.body.startsAt) : null, endsAt: request.body?.endsAt ? new Date(request.body.endsAt) : null });
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler);
