import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import {
  changeNewsSlug,
  ensureAdminActor,
} from "@/server/modules/news/repository";
import { newsSlugCommandSchema } from "@/server/modules/news/schema";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }
  const command = parseBody(newsSlugCommandSchema, request.body);
  const result = await changeNewsSlug(
    request.query.id as string,
    command.slug,
    command.expectedVersion,
    await ensureAdminActor(session.user.id),
  );
  response.status(200).json({ data: result });
}

export default withApiErrorBoundary(handler);
