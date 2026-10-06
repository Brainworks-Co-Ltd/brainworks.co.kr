import type { NextApiRequest, NextApiResponse } from "next";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { createContactMailPort } from "@/server/infrastructure/ses-mail";
import { submitContact } from "@/server/modules/contact/service";

// 앱은 127.0.0.1에서만 듣고, nginx가 X-Real-IP를 접속한 주소로 덮어쓴다.
// X-Forwarded-For 첫 값은 방문자가 마음대로 넣을 수 있어 시간당 제한을 우회할 수 있었다.
function clientIp(request: NextApiRequest) {
  const real = request.headers["x-real-ip"];
  return (typeof real === "string" && real) || request.socket.remoteAddress || "unknown";
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== "POST") { response.setHeader("Allow", "POST"); response.status(405).json({ error: { code: "BAD_REQUEST", message: "POST만 허용됩니다." } }); return; }
  const recipient = process.env.CONTACT_RECIPIENT || "austin@brainworks.co.kr";
  const result = await submitContact(request.body, { origin: request.headers.origin, ipAddress: clientIp(request), mail: createContactMailPort(), recipient });
  response.status(200).json({ data: result });
}

export default withApiErrorBoundary(handler);
