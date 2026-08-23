import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { ensureAdminActor } from "@/server/modules/news/repository";
import { createBusinessArea, listAdminBusinessAreas } from "@/server/modules/catalog/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) { const session = await requireAdmin(request); if (request.method === "GET") { response.status(200).json({ data: await listAdminBusinessAreas() }); return; } response.status(201).json({ data: await createBusinessArea(request.body, await ensureAdminActor(session.user.id)) }); }
export default withApiErrorBoundary(handler);
