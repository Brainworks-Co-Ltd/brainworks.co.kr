import { beforeEach, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import { webVitals } from "@/server/db/schema/web-vitals";
import {
  getPerformanceDashboard,
  recordWebVitals,
} from "@/server/modules/web-vitals/service";
import type { WebVitalInput } from "@/shared/schemas/web-vitals";
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
    ...overrides,
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

  it("같은 id로 다시 보고된 CLS는 새 행 없이 마지막 값으로 고친다", async () => {
    const cls = vital({ name: "CLS", value: 0.02, metricId: "v4-1-1" });
    await recordWebVitals([cls]);
    await recordWebVitals([{ ...cls, value: 0.3, rating: "poor" }]);

    const rows = await getDb().select().from(webVitals);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ value: 0.3, rating: "poor" });
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
