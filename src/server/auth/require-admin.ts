import { fromNodeHeaders } from "better-auth/node";
import type { GetServerSidePropsContext } from "next";
import type { NextApiRequest } from "next";
import { getAuth } from "@/server/auth/config";
import { isActiveAdmin, normalizeReturnTo } from "@/server/auth/policy";
import { HttpError } from "@/server/http/errors";

export async function requireAdmin(request: Pick<NextApiRequest, "headers">) {
  const session = await getAuth().api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    throw new HttpError("UNAUTHORIZED");
  }

  if (
    !isActiveAdmin(session.user as { role?: string; accountStatus?: string })
  ) {
    throw new HttpError("FORBIDDEN");
  }

  return session;
}

export async function requireAdminPage(context: GetServerSidePropsContext) {
  try {
    await requireAdmin(context.req);
    return { props: {} };
  } catch {
    const returnTo = normalizeReturnTo(context.resolvedUrl);
    return {
      redirect: {
        destination: `/admin/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`,
        permanent: false,
      },
    };
  }
}
