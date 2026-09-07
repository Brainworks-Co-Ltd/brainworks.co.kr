import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { renderMarkdownPreview } from "@/server/modules/preview/preview-service";
import { withApiErrorBoundary } from "@/server/http/api-handler";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  await requireAdmin(request);
  if (request.method !== "POST" || request.query.contentType !== "news") {
    response.setHeader("Allow", "POST");
    response
      .status(405)
      .json({
        error: {
          code: "BAD_REQUEST",
          message: "뉴스 미리보기 POST만 허용됩니다.",
        },
      });
    return;
  }
  const markdown =
    typeof request.body?.markdown === "string" ? request.body.markdown : "";
  response.status(200).json({
    data: { html: renderMarkdownPreview(markdown) },
  });
}

export default withApiErrorBoundary(handler);
