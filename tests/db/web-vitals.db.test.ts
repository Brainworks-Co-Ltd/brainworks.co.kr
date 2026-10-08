import { beforeEach, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import { webVitals } from "@/server/db/schema/web-vitals";
import {
  getCauseBreakdown,
  getPerformanceDashboard,
  getSlowVisits,
  recordWebVitals,
} from "@/server/modules/web-vitals/service";
import type {
  LcpAttribution,
  WebVitalInput,
} from "@/shared/schemas/web-vitals";
import { hasTestDatabase } from "./setup";

const day = 24 * 60 * 60 * 1000;

function vital(overrides: Partial<WebVitalInput>): WebVitalInput {
  return {
    name: "LCP",
    value: 1000,
    rating: "good",
    navigationType: "navigate",
    route: "/",
    locale: "ko",
    buildId: "build-a",
    device: "mobile",
    connection: "4g",
    metricId: null,
    attribution: null,
    ...overrides,
  };
}

function lcp(stages: Partial<LcpAttribution>): LcpAttribution {
  return {
    viewport: 390,
    dpr: 3,
    ttfb: 100,
    loadDelay: 0,
    loadDuration: 0,
    renderDelay: 0,
    element: "img.object-cover",
    resource: "/images/about/hero.webp w828",
    resourceKb: 120,
    transfer: { doc: 15, js: 50, css: 10, font: 280, image: 120, other: 0 },
    nav: {
      redirect: 0,
      redirectCount: 0,
      dns: 0,
      connect: 0,
      tls: 0,
      wait: 100,
      before: 0,
    },
    ...stages,
  };
}

/** 수집 시각을 정해 넣는다. 저장 경로(recordWebVitals)는 시각을 받지 않는다. */
function insertAt(daysAgo: number, overrides: Partial<WebVitalInput>) {
  return getDb()
    .insert(webVitals)
    .values({
      ...vital(overrides),
      createdAt: new Date(Date.now() - daysAgo * day),
    });
}

describe.skipIf(!hasTestDatabase)("성능 지표 저장과 집계", () => {
  beforeEach(async () => {
    await getDb().delete(webVitals);
  });

  it("받은 지표를 그대로 저장한다", async () => {
    await recordWebVitals([
      vital({}),
      vital({
        name: "Next.js-hydration",
        value: 12.5,
        rating: null,
        navigationType: null,
        connection: null,
      }),
    ]);

    const rows = await getDb().select().from(webVitals);
    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.name === "Next.js-hydration")).toMatchObject({
      value: 12.5,
      rating: null,
      navigationType: null,
      route: "/",
      locale: "ko",
      buildId: "build-a",
      device: "mobile",
      connection: null,
    });
  });

  it("같은 id로 다시 보고된 CLS는 새 행 없이 마지막 값과 원인 내역으로 고친다", async () => {
    const shift = { viewport: 390, dpr: 3, time: 800 };
    const cls = vital({
      name: "CLS",
      value: 0.02,
      metricId: "v4-1-1",
      attribution: { ...shift, element: "img.logo", largestShift: 0.02 },
    });
    await recordWebVitals([cls]);
    await recordWebVitals([
      {
        ...cls,
        value: 0.3,
        rating: "poor",
        attribution: { ...shift, element: "section#news", largestShift: 0.28 },
      },
    ]);

    const rows = await getDb().select().from(webVitals);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      value: 0.3,
      rating: "poor",
      attribution: { ...shift, element: "section#news", largestShift: 0.28 },
    });
  });

  it("기기별 p75와 표본 수를 기간 안의 값으로만 낸다", async () => {
    await recordWebVitals(
      [1000, 2000, 3000, 4000].map((value) => vital({ value })),
    );
    await recordWebVitals([
      vital({ device: "desktop", name: "CLS", value: 0.05 }),
    ]);
    await insertAt(10, { value: 90000 });

    const week = await getPerformanceDashboard({ days: 7 });
    // percentile_cont: 3000과 4000 사이 1/4 지점
    expect(week.devices.mobile.LCP).toEqual({ p75: 3250, count: 4 });
    expect(week.devices.desktop).toEqual({ CLS: { p75: 0.05, count: 1 } });

    const month = await getPerformanceDashboard({ days: 30 });
    expect(month.devices.mobile.LCP?.count).toBe(5);
  });

  it("경로별은 기기를 합치고 첫 진입(LCP 표본)이 많은 순으로 낸다", async () => {
    await recordWebVitals([
      vital({ route: "/news", device: "mobile", value: 1000 }),
      vital({ route: "/news", device: "desktop", value: 3000 }),
      vital({ route: "/about", value: 500 }),
      vital({
        route: "/about",
        name: "Next.js-route-change-to-render",
        value: 200,
        rating: null,
      }),
      vital({
        route: "/contact",
        name: "Next.js-route-change-to-render",
        value: 700,
        rating: null,
      }),
    ]);

    const { routes } = await getPerformanceDashboard({ days: 7 });
    expect(routes.map((row) => row.route)).toEqual([
      "/news",
      "/about",
      "/contact",
    ]);
    expect(routes[0].stats.LCP).toEqual({ p75: 2500, count: 2 });
    expect(routes[1].stats["Next.js-route-change-to-render"]).toEqual({
      p75: 200,
      count: 1,
    });
    expect(routes[2].stats.LCP).toBeUndefined();
  });

  it("배포별은 처음 수집 시각이 늦은 5개를 기간과 관계없이 낸다", async () => {
    for (let index = 0; index < 6; index += 1) {
      await insertAt(20 - index, {
        buildId: `build-${index}`,
        value: 1000 + index,
      });
    }
    await insertAt(1, { buildId: "build-5", name: "TTFB", value: 300 });
    await insertAt(1, { buildId: "build-5", name: "CLS", value: 0.1 });

    const { builds } = await getPerformanceDashboard({ days: 7 });
    expect(builds.map((build) => build.buildId)).toEqual([
      "build-5",
      "build-4",
      "build-3",
      "build-2",
      "build-1",
    ]);
    expect(builds[0]).toMatchObject({
      count: 3,
      stats: { LCP: { p75: 1005, count: 1 }, TTFB: { p75: 300, count: 1 } },
    });
    expect(new Date(builds[0].firstSeenAt).getTime()).toBeLessThan(
      Date.now() - 14 * day,
    );
  });

  it("90일 지난 행은 한 시간에 한 번 저장할 때 지운다", async () => {
    // 다른 시험이 실제 시각으로 정리를 이미 돌렸을 수 있어 두 시간 뒤로 잡는다.
    const now = Date.now() + 2 * 60 * 60 * 1000;
    await insertAt(91, { buildId: "old-1" });
    await insertAt(89, { buildId: "recent" });
    await recordWebVitals([vital({})], now);

    await insertAt(91, { buildId: "old-2" });
    await recordWebVitals([vital({})], now + 30 * 60 * 1000);
    let ids = (await getDb().select().from(webVitals)).map(
      (row) => row.buildId,
    );
    expect(ids).not.toContain("old-1");
    expect(ids).toContain("old-2");
    expect(ids).toContain("recent");

    await recordWebVitals([vital({})], now + 61 * 60 * 1000);
    ids = (await getDb().select().from(webVitals)).map((row) => row.buildId);
    expect(ids).not.toContain("old-2");
    expect(ids).toContain("recent");
  });
});

describe.skipIf(!hasTestDatabase)("느린 방문 조회", () => {
  const filter = {
    days: 7,
    metric: "LCP",
    device: "all",
    threshold: 2000,
  } as const;

  beforeEach(async () => {
    await getDb().delete(webVitals);
    await recordWebVitals([
      vital({
        value: 7800,
        route: "/about",
        connection: "3g",
        attribution: lcp({ ttfb: 4300, renderDelay: 3500 }),
      }),
      vital({
        value: 4000,
        attribution: lcp({ ttfb: 2500, renderDelay: 1400 }),
      }),
      vital({
        value: 3000,
        device: "desktop",
        attribution: lcp({ viewport: 1440, loadDuration: 2500 }),
      }),
      // 원인 내역을 모으기 전 버전에서 온 행
      vital({ value: 2500 }),
      // 기준과 같은 값은 넘은 것이 아니다.
      vital({ value: 2000, attribution: lcp({ renderDelay: 1900 }) }),
      vital({ name: "TTFB", value: 5000 }),
    ]);
    await insertAt(10, { value: 9000 });
  });

  it("기준을 넘은 방문을 값이 큰 순으로 원인과 함께 낸다", async () => {
    const visits = await getSlowVisits(filter);
    expect(visits.map((visit) => visit.value)).toEqual([
      7800, 4000, 3000, 2500,
    ]);
    expect(visits[0]).toMatchObject({
      route: "/about",
      device: "mobile",
      connection: "3g",
      viewport: 390,
      rating: "good",
      buildId: "build-a",
      navigationType: "navigate",
      cause: "ttfb",
      attribution: { ttfb: 4300, element: "img.object-cover" },
    });
    expect(Date.parse(visits[0].createdAt)).toBeGreaterThan(Date.now() - day);
    expect(visits[2]).toMatchObject({ viewport: 1440, cause: "load-duration" });
    expect(visits[3]).toMatchObject({
      viewport: null,
      attribution: null,
      cause: "unknown",
    });
  });

  it("기기, 기간, 개수로 거른다", async () => {
    const values = async (overrides: object) =>
      (await getSlowVisits({ ...filter, ...overrides })).map(
        (visit) => visit.value,
      );
    expect(await values({ device: "mobile" })).toEqual([7800, 4000, 2500]);
    expect(await values({ limit: 1 })).toEqual([7800]);
    expect(await values({ days: 30 })).toEqual([9000, 7800, 4000, 3000, 2500]);
    expect(await values({ threshold: 4000 })).toEqual([7800]);
  });

  it("원인별 건수와 비율, 전체 표본 수를 낸다", async () => {
    expect(await getCauseBreakdown(filter)).toEqual({
      total: 5,
      slow: 4,
      sample: 4,
      causes: [
        { cause: "ttfb", element: null, count: 2, share: 0.5 },
        { cause: "load-duration", element: null, count: 1, share: 0.25 },
        { cause: "unknown", element: null, count: 1, share: 0.25 },
      ],
    });
    expect(
      await getCauseBreakdown({
        ...filter,
        device: "desktop",
        threshold: 4000,
      }),
    ).toEqual({ total: 1, slow: 0, sample: 0, causes: [] });
  });

  it("CLS는 원인 대신 밀린 요소로 나눠 센다", async () => {
    const shift = (element: string | null) => ({
      viewport: 390,
      dpr: 3,
      element,
      largestShift: 0.2,
      time: 800,
    });
    await recordWebVitals(
      [shift("img.hero"), shift("img.hero"), shift("footer"), null].map(
        (attribution) => vital({ name: "CLS", value: 0.2, attribution }),
      ),
    );
    expect(
      (await getCauseBreakdown({ ...filter, metric: "CLS", threshold: 0.1 }))
        .causes,
    ).toEqual([
      {
        cause: "layout-shift",
        element: "img.hero",
        count: 2,
        share: 0.5,
      },
      { cause: "layout-shift", element: "footer", count: 1, share: 0.25 },
      { cause: "unknown", element: null, count: 1, share: 0.25 },
    ]);
  });

  it("느린 방문이 많으면 최근 5,000건만 읽어 원인을 센다", async () => {
    await getDb()
      .insert(webVitals)
      .values(
        Array.from({ length: 5001 }, (_, index) => ({
          ...vital({ name: "TTFB", value: 3000 }),
          createdAt: new Date(Date.now() - index * 1000),
        })),
      );
    expect(
      await getCauseBreakdown({ ...filter, metric: "TTFB", threshold: 800 }),
    ).toEqual({
      total: 5002,
      slow: 5002,
      sample: 5000,
      causes: [{ cause: "unknown", element: null, count: 5000, share: 1 }],
    });
  });
});
