import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";
import {
  createAiSolution,
  listAdminAiSolutions,
} from "@/server/modules/catalog/repository";
import { aiSolutionCommandSchema } from "@/server/modules/catalog/schema";
import { ensureAdminActor } from "@/server/modules/news/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method === "GET") {
    response.status(200).json({ data: await listAdminAiSolutions() });
    return;
  }
  if (request.method === "POST") {
    const data = await createAiSolution(
      parseBody(aiSolutionCommandSchema, request.body),
      await ensureAdminActor(session.user.id),
    );
    response.status(201).json({ data });
    return;
  }
  response.setHeader("Allow", "GET, POST");
  response.status(405).end();
}

export default withApiErrorBoundary(handler);
