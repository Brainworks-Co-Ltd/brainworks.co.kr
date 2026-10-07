import { lt, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { webVitals } from "@/server/db/schema/web-vitals";
import type { VitalName } from "@/lib/performance-dashboard";
import type { WebVitalInput } from "@/shared/schemas/web-vitals";

const PURGE_INTERVAL_MS = 60 * 60 * 1000;
let lastPurgeAt = 0;

/**
 * 받은 지표를 저장하고, 한 시간에 한 번 90일 지난 행을 지운다. now는 시험용이다.
 * 같은 id로 다시 온 CLS, INP는 새 행 대신 값만 고쳐 페이지 보기마다 마지막 값 하나를 남긴다.
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
      set: { value: sql`excluded.value`, rating: sql`excluded.rating` },
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
