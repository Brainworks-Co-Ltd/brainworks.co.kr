import type { NextApiRequest, NextApiResponse } from "next";

export default function live(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response
      .status(405)
      .json({ error: { code: "BAD_REQUEST", message: "GET만 허용됩니다." } });
    return;
  }
  response.status(200).json({ status: "ok" });
}
