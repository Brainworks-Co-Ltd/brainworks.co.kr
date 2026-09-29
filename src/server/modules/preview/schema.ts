import { z } from "zod";

/** `/api/admin/previews/[contentType]`의 본문. contentType은 URL 경로로 받으므로 마크다운만 검증한다. */
export const previewCommandSchema = z.object({
  markdown: z.string(),
});
