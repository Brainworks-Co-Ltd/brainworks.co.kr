import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { ensureAdminActor } from "@/server/modules/news/repository";
import { createAiSolution } from "@/server/modules/catalog/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) { const session = await requireAdmin(request); response.status(201).json({ data: await createAiSolution(request.body, await ensureAdminActor(session.user.id)) }); }
export default withApiErrorBoundary(handler);
