import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { ensureAdminActor } from "@/server/modules/news/repository";
import { createHonor, listAdminHonors } from "@/server/modules/honors/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) { const session = await requireAdmin(request); if (request.method === "GET") { response.status(200).json({ data: await listAdminHonors() }); return; } if (request.method === "POST") { response.status(201).json({ data: await createHonor(request.body, await ensureAdminActor(session.user.id)) }); return; } response.setHeader("Allow", "GET, POST"); response.status(405).end(); }
export default withApiErrorBoundary(handler);
