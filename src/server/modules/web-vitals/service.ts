import { and, count, desc, eq, gt, lt, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { webVitals } from "@/server/db/schema/web-vitals";
import {
  classifyCause,
  type SlowMetric,
  type VitalCause,
  type VitalName,
} from "@/lib/performance-dashboard";
import type {
  VitalAttribution,
  WebVitalInput,
} from "@/shared/schemas/web-vitals";

const PURGE_INTERVAL_MS = 60 * 60 * 1000;
let lastPurgeAt = 0;

/**
 * 받은 지표를 저장하고, 한 시간에 한 번 90일 지난 행을 지운다. now는 시험용이다.
 * 같은 id로 다시 온 CLS, INP는 새 행 대신 값과 원인 내역만 고쳐 페이지 보기마다 마지막 값 하나를 남긴다.
 */
export async function recordWebVitals(
  metrics: WebVitalInput[],
  now = Date.now(),
) {
  const db = getDb();
  await db
    .insert(webVitals)
    .values(metrics)
    .onConflictDoUpdate({
      target: webVitals.metricId,
      set: {
        value: sql`excluded.value`,
        rating: sql`excluded.rating`,
        attribution: sql`excluded.attribution`,
      },
    });
  if (now - lastPurgeAt < PURGE_INTERVAL_MS) return;
  lastPurgeAt = now;
  await db
    .delete(webVitals)
    .where(lt(webVitals.createdAt, sql`now() - interval '90 days'`));
}

export type VitalStat = { p75: number; count: number };
export type VitalStats = Partial<Record<VitalName, VitalStat>>;

export type PerformanceDashboard = {
  days: number;
  devices: Record<"mobile" | "desktop", VitalStats>;
  /** 첫 진입(LCP 표본) 많은 순 */
  routes: { route: string; stats: VitalStats }[];
  /** 처음 수집한 시각이 늦은 순으로 5개 */
  builds: {
    buildId: string;
    firstSeenAt: string;
    count: number;
    stats: VitalStats;
  }[];
};

type StatRow = { key: string; name: VitalName; p75: number; count: number };

function groupStats(rows: StatRow[]) {
  const grouped = new Map<string, VitalStats>();
  for (const { key, name, p75, count } of rows) {
    grouped.set(key, { ...grouped.get(key), [name]: { p75, count } });
  }
  return grouped;
}

/** 기간 안의 지표를 key 열로 나눠 이름별 p75와 표본 수를 낸다. */
function statsBy(key: "device" | "route", days: number) {
  return getDb().execute(sql`
    SELECT ${sql.identifier(key)} AS key, name,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY value) AS p75,
      count(*)::int AS count
    FROM web_vitals
    WHERE created_at > now() - make_interval(days => ${days})
    GROUP BY 1, name
  `) as unknown as Promise<StatRow[]>;
}

/**
 * 배포별은 기간 선택과 관계없이 배포마다 보관 중인 값 전체로 낸다. 기간으로 자르면
 * 기간보다 먼저 나간 배포의 처음 수집 시각이 기간 시작으로 잘못 보인다.
 */
function buildStats() {
  return getDb().execute(sql`
    WITH builds AS (
      SELECT build_id, min(created_at) AS first_seen, count(*)::int AS total
      FROM web_vitals
      GROUP BY build_id
      ORDER BY first_seen DESC, build_id
      LIMIT 5
    )
    SELECT b.build_id AS "buildId", b.first_seen AS "firstSeenAt", b.total, v.name,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY v.value) AS p75,
      count(v.id)::int AS count
    FROM builds b
    LEFT JOIN web_vitals v ON v.build_id = b.build_id
      AND v.name IN ('LCP', 'TTFB', 'Next.js-route-change-to-render')
    GROUP BY b.build_id, b.first_seen, b.total, v.name
    ORDER BY b.first_seen DESC, b.build_id
  `) as unknown as Promise<
    {
      buildId: string;
      firstSeenAt: string | Date;
      total: number;
      name: VitalName | null;
      p75: number | null;
      count: number;
    }[]
  >;
}

export async function getPerformanceDashboard({
  days,
}: {
  days: number;
}): Promise<PerformanceDashboard> {
  if (!process.env.DATABASE_URL) {
    return {
      days,
      devices: { mobile: {}, desktop: {} },
      routes: [],
      builds: [],
    };
  }

  const [deviceRows, routeRows, buildRows] = await Promise.all([
    statsBy("device", days),
    statsBy("route", days),
    buildStats(),
  ]);

  const devices = groupStats(deviceRows);
  const routes = [...groupStats(routeRows)]
    .map(([route, stats]) => ({ route, stats }))
    .sort(
      (a, b) =>
        (b.stats.LCP?.count ?? 0) - (a.stats.LCP?.count ?? 0) ||
        a.route.localeCompare(b.route),
    );

  const builds: PerformanceDashboard["builds"] = [];
  for (const row of buildRows) {
    let build = builds.at(-1);
    if (build?.buildId !== row.buildId) {
      build = {
        buildId: row.buildId,
        firstSeenAt: new Date(row.firstSeenAt).toISOString(),
        count: row.total,
        stats: {},
      };
      builds.push(build);
    }
    if (row.name && row.p75 !== null)
      build.stats[row.name] = { p75: row.p75, count: row.count };
  }

  return {
    days,
    devices: {
      mobile: devices.get("mobile") ?? {},
      desktop: devices.get("desktop") ?? {},
    },
    routes,
    builds,
  };
}

/** 느린 방문 조회 조건. threshold를 넘은(초과) 값만 느린 방문이다. */
export type SlowFilter = {
  days: number;
  metric: SlowMetric;
  device: "all" | "mobile" | "desktop";
  threshold: number;
};

export type SlowVisit = {
  id: string;
  /** ISO 시각 */
  createdAt: string;
  route: string;
  device: string;
  connection: string | null;
  /** 화면 폭(CSS px). 원인 내역이 없는 예전 행은 null이다. */
  viewport: number | null;
  value: number;
  rating: string | null;
  attribution: VitalAttribution | null;
  buildId: string;
  navigationType: string | null;
  cause: VitalCause;
};

export type CauseBreakdown = {
  /** 기간, 지표, 기기에 맞는 전체 표본 수 */
  total: number;
  /** 그중 기준을 넘은 수 */
  slow: number;
  /** 원인을 센 느린 방문 수. 느린 방문이 CAUSE_SAMPLE보다 많으면 최근 것만 센다. */
  sample: number;
  /**
   * 많은 순. share는 센 방문 중 그 원인의 비율(0~1)이다.
   * CLS는 원인이 늘 레이아웃 밀림이라 밀린 요소(element)로 나눠 센다. 다른 지표는 element가 null이다.
   */
  causes: {
    cause: VitalCause;
    element: string | null;
    count: number;
    share: number;
  }[];
};

/**
 * ponytail: 분류가 TS 함수(classifyCause)라 내역을 읽어 센다. 수집 API로 행을 채워도
 * 화면을 열 때 메모리가 버티게 최근 것만 읽는다. 전부 세야 하면 저장할 때 원인 열을 채워 SQL로 센다.
 */
const CAUSE_SAMPLE = 5_000;

function matching(
  { days, metric, device, threshold }: SlowFilter,
  slowOnly = true,
) {
  return and(
    eq(webVitals.name, metric),
    gt(webVitals.createdAt, sql`now() - make_interval(days => ${days})`),
    device === "all" ? undefined : eq(webVitals.device, device),
    slowOnly ? gt(webVitals.value, threshold) : undefined,
  );
}

/** 기준을 넘은 방문을 값이 큰 순으로 낸다. */
export async function getSlowVisits({
  limit = 50,
  ...filter
}: SlowFilter & { limit?: number }): Promise<SlowVisit[]> {
  if (!process.env.DATABASE_URL) return [];
  const rows = await getDb()
    .select({
      id: webVitals.id,
      createdAt: webVitals.createdAt,
      route: webVitals.route,
      device: webVitals.device,
      connection: webVitals.connection,
      value: webVitals.value,
      rating: webVitals.rating,
      attribution: webVitals.attribution,
      buildId: webVitals.buildId,
      navigationType: webVitals.navigationType,
    })
    .from(webVitals)
    .where(matching(filter))
    .orderBy(desc(webVitals.value), desc(webVitals.createdAt))
    .limit(limit);
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    viewport: row.attribution?.viewport ?? null,
    cause: classifyCause(filter.metric, row.attribution),
  }));
}

/** 기준을 넘은 방문의 원인별 건수와 전체 표본 수. 원인 내역이 없는 예전 행은 unknown으로 센다. */
export async function getCauseBreakdown(
  filter: SlowFilter,
): Promise<CauseBreakdown> {
  if (!process.env.DATABASE_URL)
    return { total: 0, slow: 0, sample: 0, causes: [] };
  const db = getDb();
  const [rows, [{ slow }], [{ total }]] = await Promise.all([
    db
      .select({ attribution: webVitals.attribution })
      .from(webVitals)
      .where(matching(filter))
      .orderBy(desc(webVitals.createdAt))
      .limit(CAUSE_SAMPLE),
    db.select({ slow: count() }).from(webVitals).where(matching(filter)),
    db
      .select({ total: count() })
      .from(webVitals)
      .where(matching(filter, false)),
  ]);
  const counts = new Map<string, CauseBreakdown["causes"][number]>();
  for (const { attribution } of rows) {
    const cause = classifyCause(filter.metric, attribution);
    const element =
      attribution && "largestShift" in attribution ? attribution.element : null;
    const key = `${cause} ${element}`;
    const item = counts.get(key) ?? { cause, element, count: 0, share: 0 };
    item.count += 1;
    item.share = item.count / rows.length;
    counts.set(key, item);
  }
  return {
    total,
    slow,
    sample: rows.length,
    causes: [...counts]
      // 건수가 같으면 원인과 요소 이름 순으로 두어 새로 고쳐도 순서가 바뀌지 않게 한다.
      .sort(
        ([keyA, a], [keyB, b]) => b.count - a.count || keyA.localeCompare(keyB),
      )
      .map(([, item]) => item),
  };
}
