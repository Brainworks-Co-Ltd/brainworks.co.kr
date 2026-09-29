import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { ensureAdminActor, createNews } from "@/server/modules/news/repository";
import { newsCommandSchema } from "@/server/modules/news/schema";
import { getAdminNewsList } from "@/server/modules/news/admin-queries";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { parseBody } from "@/server/http/validate";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const session = await requireAdmin(request);
  if (request.method === "GET") {
    const q = typeof request.query.q === "string" ? request.query.q : "";
    const status =
      typeof request.query.status === "string" ? request.query.status : "ALL";
    response.status(200).json({
      data: await getAdminNewsList({
        q,
        status,
        page: Number(request.query.page) || 1,
      }),
    });
    return;
  }
  if (request.method === "POST") {
    const input = parseBody(newsCommandSchema, request.body);
    const actorId = await ensureAdminActor(session.user.id);
    const created = await createNews(input, actorId);
    response.status(201).json({ data: created });
    return;
  }
  response.setHeader("Allow", "GET, POST");
  response.status(405).json({
    error: { code: "BAD_REQUEST", message: "허용되지 않은 메서드입니다." },
  });
}

export default withApiErrorBoundary(handler);
