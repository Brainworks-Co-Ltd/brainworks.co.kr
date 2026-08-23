import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { ensureAdminActor } from "@/server/modules/news/repository";
import { publishHonor } from "@/server/modules/honors/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) { const session = await requireAdmin(request); const id = typeof request.query.id === "string" ? request.query.id : ""; response.status(200).json({ data: await publishHonor(id, request.body?.locale === "en" ? "en" : "ko", Number(request.body?.expectedVersion), await ensureAdminActor(session.user.id)) }); }
export default withApiErrorBoundary(handler);
