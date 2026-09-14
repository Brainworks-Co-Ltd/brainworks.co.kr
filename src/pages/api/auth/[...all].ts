import { toNodeHandler } from "better-auth/node";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@/server/auth/config";

export const config = { api: { bodyParser: false } };

export default function authHandler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  return toNodeHandler(getAuth().handler)(request, response);
}
