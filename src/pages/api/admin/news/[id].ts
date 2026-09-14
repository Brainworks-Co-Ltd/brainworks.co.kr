import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import {
  ensureAdminActor,
  getAdminNews,
  saveNews,
} from "@/server/modules/news/repository";
import { newsSaveSchema } from "@/server/modules/news/schema";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method === "GET") {
    response
      .status(200)
      .json({ data: await getAdminNews(request.query.id as string) });
    return;
  }
  if (request.method !== "PATCH") {
    response.setHeader("Allow", "GET, PATCH");
    response
      .status(405)
      .json({ error: { code: "BAD_REQUEST", message: "PATCH만 허용됩니다." } });
    return;
  }
  const command = parseBody(newsSaveSchema, request.body);
  const actorId = await ensureAdminActor(session.user.id);
  const saved = await saveNews(
    request.query.id as string,
    command.input,
    command.expectedVersion,
    actorId,
  );
  response.status(200).json({ data: saved });
}

export default withApiErrorBoundary(handler);
