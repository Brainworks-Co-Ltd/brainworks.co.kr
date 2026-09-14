import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import {
  ensureAdminActor,
  hideNewsLocale,
} from "@/server/modules/news/repository";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { localeCommandSchema, parseBody } from "@/server/http/validate";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }
  const command = parseBody(localeCommandSchema, request.body);
  const result = await hideNewsLocale(
    request.query.id as string,
    command.locale,
    command.expectedVersion,
    await ensureAdminActor(session.user.id),
  );
  response.status(200).json({ data: result });
}

export default withApiErrorBoundary(handler);
