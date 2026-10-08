import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("@/server/modules/web-vitals/service", () => ({
  recordWebVitals: vi.fn().mockResolvedValue(undefined),
}));

import vitalsHandler from "@/pages/api/vitals";
import {
  causeStages,
  classifyCause,
  gradeVital,
  ROUTE_CHANGE,
  splitServerWait,
} from "@/lib/performance-dashboard";
import { recordWebVitals } from "@/server/modules/web-vitals/service";
import {
  type LcpAttribution,
  type NavTiming,
  webVitalsInputSchema,
} from "@/shared/schemas/web-vitals";

const metric = {
  name: "LCP",
  value: 2100,
  rating: "good",
  navigationType: "navigate",
  route: "/news/[slug]",
  locale: "ko",
  buildId: "Abc_123-xyz",
  device: "mobile",
  connection: "4g",
  metricId: null,
  attribution: null,
};

const env = { viewport: 390, dpr: 3 };
const nav: NavTiming = {
  redirect: 0,
  redirectCount: 0,
  dns: 30,
  connect: 80,
  tls: 50,
  wait: 120,
  before: 5,
};
const lcp: LcpAttribution = {
  ...env,
  ttfb: 300,
  loadDelay: 50,
  loadDuration: 400,
  renderDelay: 100,
  element: "img.object-cover",
  resource: "/images/about/hero.webp w828",
  resourceKb: 120.5,
  transfer: { doc: 12, js: 200, css: 30, font: 280, image: 120.5, other: 0 },
  nav,
};

const accepts = (overrides: Record<string, unknown>) =>
  webVitalsInputSchema.safeParse([{ ...metric, ...overrides }]).success;

describe("성능 지표 입력 스키마", () => {
  it("허용 범위의 경계값을 받는다", () => {
    expect(accepts({})).toBe(true);
    expect(accepts({ value: 0 })).toBe(true);
    expect(
      accepts({
        name: "Next.js-route-change-to-render",
        value: 600000,
        rating: null,
        navigationType: null,
      }),
    ).toBe(true);
    expect(accepts({ name: "CLS", value: 100 })).toBe(true);
    expect(accepts({ route: "/bid-notice/[[...slug]]" })).toBe(true);
    expect(accepts({ route: `/${"a".repeat(119)}` })).toBe(true);
    expect(accepts({ buildId: "b".repeat(64), connection: null })).toBe(true);
    expect(accepts({ metricId: "v4-1759800000000-1234567890123" })).toBe(true);
    expect(webVitalsInputSchema.safeParse(Array(30).fill(metric)).success).toBe(
      true,
    );
  });

  it("모르는 탐색 유형은 묶음을 거절하지 않고 null로 저장한다", () => {
    // Next 16.4의 web-vitals는 soft-navigation을 보낸다. 한 값 때문에 묶음 전체가 400이 되면 안 된다.
    const parsed = webVitalsInputSchema.parse([
      { ...metric, navigationType: "soft-navigation" },
    ]);
    expect(parsed[0].navigationType).toBeNull();
  });

  it("범위 밖이나 목록 밖 값은 거절한다", () => {
    expect(accepts({ name: "FID" })).toBe(false);
    expect(accepts({ value: -1 })).toBe(false);
    expect(accepts({ value: 600001 })).toBe(false);
    expect(accepts({ value: Number.NaN })).toBe(false);
    expect(accepts({ value: Number.POSITIVE_INFINITY })).toBe(false);
    expect(accepts({ name: "CLS", value: 100.01 })).toBe(false);
    expect(accepts({ route: "news" })).toBe(false);
    expect(accepts({ route: "/news?q=1" })).toBe(false);
    expect(accepts({ route: `/${"a".repeat(120)}` })).toBe(false);
    expect(accepts({ locale: "ja" })).toBe(false);
    expect(accepts({ buildId: "b".repeat(65) })).toBe(false);
    expect(accepts({ buildId: "a/b" })).toBe(false);
    expect(accepts({ device: "tablet" })).toBe(false);
    expect(accepts({ connection: "5g" })).toBe(false);
    expect(accepts({ rating: "bad" })).toBe(false);
    expect(accepts({ metricId: "v4 1" })).toBe(false);
    expect(
      webVitalsInputSchema.safeParse([
        { ...metric, metricId: "v4-1" },
        { ...metric, name: "CLS", value: 0.1, metricId: "v4-1" },
      ]).success,
    ).toBe(false);
    expect(webVitalsInputSchema.safeParse([]).success).toBe(false);
    expect(webVitalsInputSchema.safeParse(Array(31).fill(metric)).success).toBe(
      false,
    );
  });
});

describe("성능 등급", () => {
  it("기준값 이하는 좋음, 둘째 기준값 이하는 개선 필요, 넘으면 나쁨이다", () => {
    expect(gradeVital("LCP", 2500)).toBe("good");
    expect(gradeVital("LCP", 2501)).toBe("needs-improvement");
    expect(gradeVital("LCP", 4000)).toBe("needs-improvement");
    expect(gradeVital("LCP", 4001)).toBe("poor");
    expect(gradeVital("CLS", 0.1)).toBe("good");
    expect(gradeVital("CLS", 0.26)).toBe("poor");
    expect(gradeVital("INP", 200)).toBe("good");
    expect(gradeVital("TTFB", 1800)).toBe("needs-improvement");
  });

  it("Next 전용 지표는 등급이 없다", () => {
    expect(gradeVital("Next.js-route-change-to-render", 100)).toBeNull();
  });
});

describe("원인 내역 스키마", () => {
  it("지표 이름에 맞는 모양만 받는다", () => {
    expect(accepts({ attribution: lcp })).toBe(true);
    expect(
      accepts({
        attribution: {
          ...lcp,
          loadDelay: null,
          loadDuration: null,
          resourceKb: null,
        },
      }),
    ).toBe(true);
    expect(
      accepts({
        name: "TTFB",
        attribution: {
          ...env,
          ...nav,
          serverTiming: [{ name: "db", duration: 40 }],
        },
      }),
    ).toBe(true);
    expect(
      accepts({
        name: ROUTE_CHANGE,
        attribution: { ...env, data: 0, chunks: 80, render: 300 },
      }),
    ).toBe(true);
    // 합집합에는 맞는 FCP 모양이라도 LCP 이름으로 오면 거절한다.
    expect(
      accepts({ attribution: { ...env, ttfb: 300, afterTtfb: 200, nav } }),
    ).toBe(false);
    expect(accepts({ name: "Next.js-hydration", attribution: lcp })).toBe(
      false,
    );
    expect(accepts({ attribution: undefined })).toBe(false);
    // 요소 이름에는 한글 id도 올 수 있다.
    expect(accepts({ attribution: { ...lcp, element: "h2#회사-소개" } })).toBe(
      true,
    );
  });

  it("모르는 키와 범위 밖 값은 거절한다", () => {
    const reject = (attribution: unknown) =>
      expect(accepts({ attribution })).toBe(false);
    reject({ ...lcp, text: "홍길동" });
    reject({ ...lcp, nav: { ...nav, ip: "203.0.113.1" } });
    reject({ ...lcp, transfer: { ...lcp.transfer, video: 1 } });
    reject({ ...lcp, ttfb: -1 });
    reject({ ...lcp, renderDelay: 600001 });
    reject({ ...lcp, transfer: { ...lcp.transfer, js: 100001 } });
    reject({ ...lcp, element: "a".repeat(81) });
    reject({ ...lcp, resource: "a".repeat(121) });
    reject({ ...lcp, viewport: 390.5 });
    reject({
      ...lcp,
      nav: {
        ...nav,
        serverTiming: Array(4).fill({ name: "db", duration: 1 }),
      },
    });
    reject({
      ...lcp,
      nav: { ...nav, serverTiming: [{ name: "db 조회", duration: 1 }] },
    });
    // jsonb가 거절하는 NUL과 짝 없는 서로게이트는 저장 전에 400으로 막는다.
    reject({ ...lcp, element: "a\u0000b" });
    reject({ ...lcp, element: "a\ud800" });
    // 파일 경로는 URL 파서가 퍼센트 인코딩한 ASCII다.
    reject({ ...lcp, resource: "/images/회사.webp" });
    reject("lcp");
  });
});

describe("원인 분류", () => {
  it("가장 긴 단계를 원인으로 본다", () => {
    expect(classifyCause("LCP", lcp)).toBe("load-duration");
    expect(classifyCause("LCP", { ...lcp, ttfb: 4300 })).toBe("ttfb");
    expect(classifyCause("LCP", { ...lcp, loadDelay: 900 })).toBe("load-delay");
    expect(classifyCause("LCP", { ...lcp, renderDelay: 900 })).toBe(
      "render-delay",
    );
    // DNS, 연결, 회선 왕복을 합쳐 회선과 연결로 센다.
    expect(classifyCause("TTFB", { ...env, ...nav, wait: 100 })).toBe(
      "connection",
    );
    expect(classifyCause("TTFB", { ...env, ...nav, redirect: 500 })).toBe(
      "redirect",
    );
    expect(classifyCause("TTFB", { ...env, ...nav, before: 500 })).toBe(
      "before-request",
    );
    expect(classifyCause("TTFB", { ...env, ...nav, wait: 400 })).toBe(
      "server-wait",
    );
    // 느린 회선: 서버는 10ms 만에 답했지만 왕복 400ms가 서버 대기에 섞인다.
    // 연결(TCP 400 + TLS 400)로 왕복을 추정해 빼면 서버 문제가 아니다.
    const slowLine = { ...env, ...nav, connect: 800, tls: 400, wait: 410 };
    expect(classifyCause("TTFB", slowLine)).toBe("connection");
    expect(splitServerWait(slowLine)).toEqual({ rtt: 400, server: 10 });
    // 연결을 다시 쓴 방문은 왕복을 알 수 없어 서버 대기를 그대로 둔다.
    expect(splitServerWait({ ...nav, connect: 0, tls: 0, wait: 410 })).toEqual({
      rtt: 0,
      server: 410,
    });
    expect(
      classifyCause("INP", {
        ...env,
        event: "pointerup",
        target: "button.menu",
        inputDelay: 20,
        processing: 180,
        presentation: 40,
      }),
    ).toBe("processing");
    expect(
      classifyCause("CLS", {
        ...env,
        element: "img",
        largestShift: 0.2,
        time: 900,
      }),
    ).toBe("layout-shift");
    expect(
      classifyCause(ROUTE_CHANGE, {
        ...env,
        data: 400,
        chunks: 80,
        render: 20,
      }),
    ).toBe("data");
    expect(
      classifyCause("FCP", { ...env, ttfb: 300, afterTtfb: 1900, nav }),
    ).toBe("after-ttfb");
  });

  it("같으면 앞 단계, 내역이 없으면 unknown이다", () => {
    expect(
      classifyCause("FCP", { ...env, ttfb: 500, afterTtfb: 500, nav }),
    ).toBe("ttfb");
    expect(classifyCause("LCP", null)).toBe("unknown");
  });

  it("단계는 시간 순이고 resource 기록이 없는 단계는 null이다", () => {
    expect(
      causeStages({ ...lcp, loadDelay: null, loadDuration: null }),
    ).toEqual([
      { cause: "ttfb", ms: 300 },
      { cause: "load-delay", ms: null },
      { cause: "load-duration", ms: null },
      { cause: "render-delay", ms: 100 },
    ]);
    expect(causeStages({ ...env, ...nav }).map((stage) => stage.cause)).toEqual(
      ["redirect", "before-request", "connection", "server-wait"],
    );
  });
});

function mockResponse() {
  const response = { headersSent: false } as unknown as NextApiResponse;
  response.setHeader = vi.fn(
    () => response,
  ) as unknown as NextApiResponse["setHeader"];
  response.status = vi.fn(
    () => response,
  ) as unknown as NextApiResponse["status"];
  response.json = vi.fn(() => response) as unknown as NextApiResponse["json"];
  response.end = vi.fn(() => response) as unknown as NextApiResponse["end"];
  return response;
}

function post(
  body: unknown,
  { ip = "203.0.113.1", userAgent = "Mozilla/5.0 Chrome/141" } = {},
) {
  return {
    method: "POST",
    url: "/api/vitals/",
    headers: {
      "sec-fetch-site": "same-origin",
      "user-agent": userAgent,
      "x-real-ip": ip,
    },
    body,
  } as unknown as NextApiRequest;
}

describe("성능 지표 수집 API", () => {
  // 운영 서버처럼 작업 폴더의 .next에서 buildId와 페이지 목록을 읽게 한다.
  const buildDir = mkdtempSync(path.join(tmpdir(), "vitals-"));
  const cwd = vi.spyOn(process, "cwd");
  beforeAll(() => {
    mkdirSync(path.join(buildDir, ".next"));
    writeFileSync(path.join(buildDir, ".next", "BUILD_ID"), metric.buildId);
    writeFileSync(
      path.join(buildDir, ".next", "routes-manifest.json"),
      JSON.stringify({
        staticRoutes: [{ page: "/" }],
        dynamicRoutes: [{ page: metric.route }],
      }),
    );
    cwd.mockReturnValue(buildDir);
  });
  afterAll(() => {
    cwd.mockRestore();
    rmSync(buildDir, { recursive: true });
  });
  beforeEach(() => {
    vi.mocked(recordWebVitals).mockClear();
    vi.stubEnv("DATABASE_URL", "postgresql://example/db");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("sendBeacon이 보낸 text/plain 문자열을 풀어 저장하고 204를 준다", async () => {
    const response = mockResponse();
    await vitalsHandler(post(JSON.stringify([metric])), response);
    expect(response.status).toHaveBeenCalledWith(204);
    expect(recordWebVitals).toHaveBeenCalledWith([metric]);
  });

  it("봇은 저장하지 않고 204를 준다", async () => {
    const response = mockResponse();
    await vitalsHandler(
      post(JSON.stringify([metric]), {
        userAgent: "Mozilla/5.0 (compatible; Chrome-Lighthouse)",
      }),
      response,
    );
    expect(response.status).toHaveBeenCalledWith(204);
    expect(recordWebVitals).not.toHaveBeenCalled();
  });

  it("DB가 없으면 저장하지 않고 204를 준다", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const response = mockResponse();
    await vitalsHandler(post([metric]), response);
    expect(response.status).toHaveBeenCalledWith(204);
    expect(recordWebVitals).not.toHaveBeenCalled();
  });

  it("JSON이 아니거나 스키마에 맞지 않는 본문은 400이다", async () => {
    for (const body of [
      "{",
      JSON.stringify([{ ...metric, route: "/news/?q=1" }]),
    ]) {
      const response = mockResponse();
      await vitalsHandler(post(body), response);
      expect(response.status).toHaveBeenCalledWith(400);
    }
    expect(recordWebVitals).not.toHaveBeenCalled();
  });

  it("다른 사이트에서 보낸 요청은 403이다", async () => {
    const request = post([metric]);
    request.headers["sec-fetch-site"] = "cross-site";
    const response = mockResponse();
    await vitalsHandler(request, response);
    expect(response.status).toHaveBeenCalledWith(403);
  });

  it("같은 IP가 1분에 300개를 넘기면 저장하지 않고 204를 준다", async () => {
    const batch = Array(30).fill(metric);
    for (let i = 0; i < 10; i += 1)
      await vitalsHandler(post(batch, { ip: "198.51.100.7" }), mockResponse());
    expect(recordWebVitals).toHaveBeenCalledTimes(10);

    const response = mockResponse();
    await vitalsHandler(post([metric], { ip: "198.51.100.7" }), response);
    expect(response.status).toHaveBeenCalledWith(204);
    expect(recordWebVitals).toHaveBeenCalledTimes(10);

    await vitalsHandler(post([metric], { ip: "198.51.100.8" }), mockResponse());
    expect(recordWebVitals).toHaveBeenCalledTimes(11);
  });

  it("지금 빌드가 아닌 buildId와 없는 페이지 경로의 지표는 버린다", async () => {
    await vitalsHandler(
      post([
        metric,
        { ...metric, buildId: "zzzz0" },
        { ...metric, route: "/fake-0" },
      ]),
      mockResponse(),
    );
    expect(recordWebVitals).toHaveBeenCalledWith([metric]);

    const response = mockResponse();
    await vitalsHandler(post([{ ...metric, buildId: "zzzz1" }]), response);
    expect(response.status).toHaveBeenCalledWith(204);
    expect(recordWebVitals).toHaveBeenCalledTimes(1);
  });

  it("여러 IP로 나눠도 1분에 전체 1,000개를 넘기면 저장하지 않는다", async () => {
    // 앞 시험들이 쓴 1분 창을 지나 보낸다.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 2 * 60 * 1000);
    const batch = Array(25).fill(metric);
    for (let i = 0; i < 40; i += 1)
      await vitalsHandler(post(batch, { ip: `10.0.0.${i}` }), mockResponse());
    expect(recordWebVitals).toHaveBeenCalledTimes(40);

    await vitalsHandler(post([metric], { ip: "10.0.1.1" }), mockResponse());
    expect(recordWebVitals).toHaveBeenCalledTimes(40);
  });
});
