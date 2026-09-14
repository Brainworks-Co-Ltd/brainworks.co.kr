import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { archiveAiSolution } from "@/server/modules/catalog/repository";
import { ensureAdminActor } from "@/server/modules/news/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }
  const id = typeof request.query.id === "string" ? request.query.id : "";
  const data = await archiveAiSolution(
    id,
    Number(request.body?.expectedVersion),
    await ensureAdminActor(session.user.id),
  );
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler);
