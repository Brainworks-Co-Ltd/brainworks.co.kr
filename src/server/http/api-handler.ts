import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { HttpError, toPublicError } from "@/server/http/errors";

export type ApiHandler = NextApiHandler;

export function withApiErrorBoundary(handler: ApiHandler): ApiHandler {
  return async function apiHandler(
    request: NextApiRequest,
    response: NextApiResponse,
  ) {
    try {
      await handler(request, response);
    } catch (error) {
      if (response.headersSent) {
        return;
      }
      const publicError = toPublicError(error);
      const status = error instanceof HttpError ? error.status : 500;
      response.status(status).json({ error: publicError });
    }
  };
}
