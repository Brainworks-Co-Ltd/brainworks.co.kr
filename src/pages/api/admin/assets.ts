import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { ensureAdminActor } from "@/server/modules/news/repository";
import { uploadImageAsset } from "@/server/modules/assets/upload-service";
import { withApiErrorBoundary } from "@/server/http/api-handler";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response
      .status(405)
      .json({ error: { code: "BAD_REQUEST", message: "POST만 허용됩니다." } });
    return;
  }
  const asset = await uploadImageAsset(
    request,
    await ensureAdminActor(session.user.id),
  );
  response.status(201).json({ data: asset });
}

export const config = { api: { bodyParser: false } };
export default withApiErrorBoundary(handler);
