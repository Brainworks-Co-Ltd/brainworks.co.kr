import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { renderMarkdownPreview } from "@/server/modules/preview/preview-service";
import { previewCommandSchema } from "@/server/modules/preview/schema";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";

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
  const command = parseBody(previewCommandSchema, request.body);
  response.status(200).json({
    data: { html: renderMarkdownPreview(command.markdown) },
  });
}

export default withApiErrorBoundary(handler);
