import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { localeCommandSchema, parseBody } from "@/server/http/validate";
import { ensureAdminActor } from "@/server/modules/news/repository";
import { publishHonor } from "@/server/modules/honors/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  const id = typeof request.query.id === "string" ? request.query.id : "";
  const command = parseBody(localeCommandSchema, request.body);
  const data = await publishHonor(
    id,
    command.locale,
    command.expectedVersion,
    await ensureAdminActor(session.user.id),
  );
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler, ["POST"]);
