import type { NextApiRequest } from "next";
import { HttpError } from "@/server/http/errors";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function assertSameOrigin(
  request: Pick<NextApiRequest, "method" | "headers">,
  expectedOrigin = process.env.APP_ORIGIN,
) {
  if (safeMethods.has(request.method || "GET")) {
    return;
  }

  const origin = request.headers.origin;
  const fetchSite = request.headers["sec-fetch-site"];
  const isSameSite = fetchSite === "same-origin" || fetchSite === "same-site";
  const isExpectedOrigin = Boolean(expectedOrigin && origin === expectedOrigin);

  if (!isExpectedOrigin && !isSameSite) {
    throw new HttpError("FORBIDDEN");
  }
}
