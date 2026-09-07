import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import {
  getAdminHonor,
  saveHonor,
} from "@/server/modules/honors/repository";
import { ensureAdminActor } from "@/server/modules/news/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  const id = typeof request.query.id === "string" ? request.query.id : "";
  if (request.method === "GET") {
    response.status(200).json({ data: await getAdminHonor(id) });
    return;
  }
  if (request.method === "PUT") {
    const data = await saveHonor(
      id,
      request.body,
      Number(request.body?.expectedVersion),
      await ensureAdminActor(session.user.id),
    );
    response.status(200).json({ data });
    return;
  }
  response.setHeader("Allow", "GET, PUT");
  response.status(405).end();
}

export default withApiErrorBoundary(handler);
