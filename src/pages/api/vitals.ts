import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { HttpError } from "@/server/http/errors";
import { assertSameOrigin } from "@/server/http/origin-guard";
import { parseBody } from "@/server/http/validate";
import { recordWebVitals } from "@/server/modules/web-vitals/service";
import { webVitalsInputSchema } from "@/shared/schemas/web-vitals";

// 한 번에 많아야 30개다. 원인 내역이 긴 LCP, FCP, TTFB(길어야 2kb)는 페이지마다 한 번이고
// 나머지 지표는 1kb 안이라 32kb면 넉넉하다.
export const config = { api: { bodyParser: { sizeLimit: "32kb" } } };

const BOT_PATTERN = /bot|crawl|spider|headless|lighthouse|pagespeed/i;
const WINDOW_MS = 60 * 1000;
const MAX_METRICS_PER_WINDOW = 300;
// 여러 IP로 나눠 보내도 1분에 이만큼만 저장해 하루 저장량에 상한을 둔다. 이 사이트 방문량의 수십 배다.
const MAX_TOTAL_PER_WINDOW = 1_000;
const quotas = new Map<string, { count: number; resetAt: number }>();

// nginx가 X-Real-IP를 접속한 주소로 덮어쓴다. IP는 제한 계산에만 쓰고 저장하지 않는다.
function clientIp(request: NextApiRequest) {
  const real = request.headers["x-real-ip"];
  return (
    (typeof real === "string" && real) ||
    request.socket.remoteAddress ||
    "unknown"
  );
}

function take(key: string, count: number, limit: number, now: number) {
  const quota = quotas.get(key);
  if (!quota || quota.resetAt <= now) {
    quotas.set(key, { count, resetAt: now + WINDOW_MS });
    return true;
  }
  if (quota.count + count > limit) return false;
  quota.count += count;
  return true;
}

// 프로세스 메모리 제한이라 재시작하면 초기화된다. 앱 프로세스가 하나라 충분하다.
function withinQuota(ip: string, count: number, now = Date.now()) {
  if (quotas.size > 10_000) {
    for (const [key, quota] of quotas) {
      if (quota.resetAt <= now) quotas.delete(key);
    }
  }
  // "*"는 IP가 될 수 없는 키라 전체 합계로 쓴다.
  return (
    take(ip, count, MAX_METRICS_PER_WINDOW, now) &&
    take("*", count, MAX_TOTAL_PER_WINDOW, now)
  );
}

let build: { id: string; pages: Set<string> } | undefined;

/**
 * 지금 떠 있는 빌드의 buildId와 페이지 목록. 브라우저가 보낸 buildId와 경로는 형식만 맞으면
 * 무엇이든 올 수 있어, 가짜 배포가 최근 배포 표를 밀어내거나 가짜 경로로 경로별 표가 한없이
 * 커지지 않게 이 목록에 없는 지표는 버린다. 배포하면 프로세스를 다시 띄우므로 한 번만 읽는다.
 * standalone server.js는 자기 폴더로 chdir하고 그 아래 .next에 두 파일이 들어 있다.
 */
function currentBuild() {
  if (!build) {
    const distDir = path.join(process.cwd(), ".next");
    const { staticRoutes, dynamicRoutes } = JSON.parse(
      readFileSync(path.join(distDir, "routes-manifest.json"), "utf8"),
    ) as Record<"staticRoutes" | "dynamicRoutes", { page: string }[]>;
    build = {
      id: readFileSync(path.join(distDir, "BUILD_ID"), "utf8").trim(),
      pages: new Set(
        [...staticRoutes, ...dynamicRoutes].map((route) => route.page),
      ),
    };
  }
  return build;
}

// sendBeacon에 문자열을 넘기면 text/plain으로 와서 Next가 JSON으로 풀지 않는다.
function parseJson(body: unknown) {
  if (typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch {
    throw new HttpError("BAD_REQUEST", "입력값을 확인해 주세요. (본문)");
  }
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  assertSameOrigin(request);
  // 봇, DB 없는 로컬 개발, 제한 초과는 저장하지 않고 성공으로 끝낸다. 브라우저에 오류를 보일 이유가 없다.
  if (!BOT_PATTERN.test(request.headers["user-agent"] ?? "")) {
    const metrics = parseBody(webVitalsInputSchema, parseJson(request.body));
    if (
      process.env.DATABASE_URL &&
      withinQuota(clientIp(request), metrics.length)
    ) {
      // 배포 직후 이전 빌드를 연 탭에서 온 값도 여기서 버려진다.
      const { id, pages } = currentBuild();
      const known = metrics.filter(
        (metric) => metric.buildId === id && pages.has(metric.route),
      );
      if (known.length) await recordWebVitals(known);
    }
  }
  response.status(204).end();
}

export default withApiErrorBoundary(handler, ["POST"]);
