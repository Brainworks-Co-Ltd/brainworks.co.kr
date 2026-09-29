import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody, publishCommandSchema } from "@/server/http/validate";
import { ensureNoticeAdminActor, publishNotice } from "@/server/modules/notices/repository";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }
  const id = typeof request.query.id === "string" ? request.query.id : "";
  const command = parseBody(publishCommandSchema, request.body);
  const data = await publishNotice(
    id,
    command.locale,
    command.expectedVersion,
    await ensureNoticeAdminActor(session.user.id),
    {
      startsAt: command.startsAt ? new Date(command.startsAt) : null,
      endsAt: command.endsAt ? new Date(command.endsAt) : null,
    },
  );
  response.status(200).json({ data });
}

export default withApiErrorBoundary(handler);
