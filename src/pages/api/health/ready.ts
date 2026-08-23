import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";

export default async function ready(
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

  try {
    await getDb().execute(sql`select 1`);
    response.status(200).json({ status: "ok", database: "ready" });
  } catch {
    response
      .status(503)
      .json({
        error: {
          code: "DEPENDENCY_UNAVAILABLE",
          message: "서비스가 준비되지 않았습니다.",
        },
      });
  }
}
