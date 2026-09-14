import type { NextApiRequest, NextApiResponse } from "next";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { createContactMailPort } from "@/server/infrastructure/ses-mail";
import { submitContact } from "@/server/modules/contact/service";

function clientIp(request: NextApiRequest) {
  const forwarded = request.headers["x-forwarded-for"];
  return (typeof forwarded === "string" ? forwarded.split(",")[0] : request.socket.remoteAddress) || "unknown";
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== "POST") { response.setHeader("Allow", "POST"); response.status(405).json({ error: { code: "BAD_REQUEST", message: "POST만 허용됩니다." } }); return; }
  const recipient = process.env.CONTACT_RECIPIENT || "austin@brainworks.co.kr";
  const result = await submitContact(request.body, { origin: request.headers.origin, ipAddress: clientIp(request), mail: createContactMailPort(), recipient });
  response.status(200).json({ data: result });
}

export default withApiErrorBoundary(handler);
