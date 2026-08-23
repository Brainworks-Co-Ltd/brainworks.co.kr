import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { HttpError } from "@/server/http/errors";
import { productionDocumentPolicy } from "@/server/modules/assets/production-document-policy";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  await requireAdmin(request);
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: { code: "BAD_REQUEST", message: "POST만 허용됩니다." } });
    return;
  }
  if (!productionDocumentPolicy.productionApproved) {
    throw new HttpError("DEPENDENCY_UNAVAILABLE", "승인된 문서 업로드 정책이 아직 설정되지 않았습니다.");
  }
  throw new HttpError("DEPENDENCY_UNAVAILABLE", "문서 검사 제공자가 아직 연결되지 않았습니다.");
}

export const config = { api: { bodyParser: false } };
export default withApiErrorBoundary(handler);
