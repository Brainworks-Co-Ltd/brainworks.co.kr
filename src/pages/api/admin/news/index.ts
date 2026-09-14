import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/server/auth/require-admin";
import { ensureAdminActor, createNews } from "@/server/modules/news/repository";
import { getAdminNewsList } from "@/server/modules/news/admin-queries";
import { withApiErrorBoundary } from "@/server/http/api-handler";

function isNewsInput(
  value: unknown,
): value is Parameters<typeof createNews>[0] {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  const locales = input.locales as Record<string, unknown> | undefined;
  return Boolean(
    input.slug &&
    input.category &&
    input.displayDate &&
    locales?.ko &&
    locales?.en,
  );
}

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
    if (!isNewsInput(request.body)) {
      response.status(400).json({
        error: {
          code: "BAD_REQUEST",
          message: "뉴스 입력값이 올바르지 않습니다.",
        },
      });
      return;
    }
    const actorId = await ensureAdminActor(session.user.id);
    const created = await createNews(request.body, actorId);
    response.status(201).json({ data: created });
    return;
  }
  response.setHeader("Allow", "GET, POST");
  response.status(405).json({
    error: { code: "BAD_REQUEST", message: "허용되지 않은 메서드입니다." },
  });
}

export default withApiErrorBoundary(handler);
