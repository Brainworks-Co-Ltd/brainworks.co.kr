import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { HttpError, toPublicError } from "@/server/http/errors";

export type ApiHandler = NextApiHandler;

export function withApiErrorBoundary(
  handler: ApiHandler,
  allowedMethods?: readonly string[],
): ApiHandler {
  return async function apiHandler(
    request: NextApiRequest,
    response: NextApiResponse,
  ) {
    if (allowedMethods && !allowedMethods.includes(request.method ?? "")) {
      response.setHeader("Allow", allowedMethods.join(", "));
      response.status(405).json({
        error: { code: "METHOD_NOT_ALLOWED", message: "허용되지 않는 요청 방식입니다." },
      });
      return;
    }
    try {
      await handler(request, response);
    } catch (error) {
      if (response.headersSent) {
        return;
      }
      if (!(error instanceof HttpError)) {
        console.error("[api]", request.method, request.url, error);
      }
      const publicError = toPublicError(error);
      const status = error instanceof HttpError ? error.status : 500;
      response.status(status).json({ error: publicError });
    }
  };
}
