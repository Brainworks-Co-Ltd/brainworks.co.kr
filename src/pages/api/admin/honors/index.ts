import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";
import { ensureAdminActor } from "@/server/modules/news/repository";
import { createHonor, listAdminHonors } from "@/server/modules/honors/repository";
import { honorCommandSchema } from "@/server/modules/honors/schema";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method === "GET") {
    response.status(200).json({ data: await listAdminHonors() });
    return;
  }
  if (request.method === "POST") {
    const data = await createHonor(
      parseBody(honorCommandSchema, request.body),
      await ensureAdminActor(session.user.id),
    );
    response.status(201).json({ data });
    return;
  }
  response.setHeader("Allow", "GET, POST");
  response.status(405).end();
}

export default withApiErrorBoundary(handler);
