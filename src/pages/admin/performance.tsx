import Link from "next/link";
import type { GetServerSideProps } from "next";
import type { ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Callout,
  Column,
  formatDateTime,
  listClass,
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/admin/fields";
import {
  CORE_VITALS,
  gradeLabels,
  gradeVital,
  ROUTE_CHANGE,
  type VitalGrade,
  type VitalName,
} from "@/lib/performance-dashboard";
import { requireAdminPage } from "@/server/auth/require-admin";
import {
  getPerformanceDashboard,
  type PerformanceDashboard,
  type VitalStats,
} from "@/server/modules/web-vitals/service";

/*
 * 실제 방문자 브라우저에서 잰 성능. 값은 모두 p75다.
 * 위계와 콜아웃은 운영 현황과 같은 부품(fields.tsx)을 쓴다. 색은 등급에만 쓰고 글자를 함께 둔다.
 */

const numberFormat = new Intl.NumberFormat("ko-KR");

const shortNames = Object.fromEntries(
  CORE_VITALS.map((vital) => [vital.name, vital.short]),
) as Record<VitalName, string>;

const gradeTone: Record<VitalGrade, string> = {
  good: "text-emerald-800",
  "needs-improvement": "text-amber-800",
  poor: "text-red-700",
};

function formatValue(name: VitalName, value: number) {
  return name === "CLS"
    ? value.toFixed(2)
    : `${numberFormat.format(Math.round(value))}ms`;
}

function CoreVitals({
  id,
  title,
  stats,
  days,
}: {
  id: string;
  title: string;
  stats: VitalStats;
  days: number;
}) {
  return (
    <Panel id={id} title={title}>
      {Object.keys(stats).length ? (
        <ul className={listClass}>
          {CORE_VITALS.map(({ name, short, label }) => {
            const stat = stats[name];
            const grade = stat ? gradeVital(name, stat.p75) : null;
            return (
              <li key={name} className="grid gap-1 py-3">
                <div className="flex flex-wrap items-baseline gap-x-2 text-[15px]">
                  <span className="font-semibold text-[var(--bw-color-ink)]">
                    {short}
                  </span>
                  <span className="font-semibold tabular-nums text-[var(--bw-color-ink)]">
                    {stat ? formatValue(name, stat.p75) : "-"}
                  </span>
                  {grade ? (
                    <span
                      className={`text-sm font-semibold ${gradeTone[grade]}`}
                    >
                      {gradeLabels[grade]}
                    </span>
                  ) : null}
                </div>
                <p className="text-[13px] text-slate-500">
                  {label}, 표본 {numberFormat.format(stat?.count ?? 0)}개
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <Callout>최근 {days}일 동안 수집된 기록이 없습니다.</Callout>
      )}
    </Panel>
  );
}

const headClass = "px-3 py-2 font-semibold whitespace-nowrap";
const cellClass = "px-3 py-3 tabular-nums whitespace-nowrap";

function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="-mx-3 overflow-x-auto">
      <table className="w-full text-left text-[15px] text-[var(--bw-color-ink)]">
        <thead className="text-[13px] text-slate-500">
          <tr>
            {head.map((label) => (
              <th key={label} scope="col" className={headClass}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]">
          {children}
        </tbody>
      </table>
    </div>
  );
}

function StatCells({
  names,
  stats,
}: {
  names: VitalName[];
  stats: VitalStats;
}) {
  return names.map((name) => {
    const stat = stats[name];
    return (
      <td key={name} className={cellClass}>
        {stat ? formatValue(name, stat.p75) : "-"}
      </td>
    );
  });
}

const routeVitals: VitalName[] = ["LCP", "TTFB", "INP", "CLS", ROUTE_CHANGE];
const buildVitals: VitalName[] = ["LCP", "TTFB", ROUTE_CHANGE];

function Routes({
  routes,
  days,
}: {
  routes: PerformanceDashboard["routes"];
  days: number;
}) {
  return (
    <Panel
      id="routes-heading"
      title="경로별"
      note={
        routes.length
          ? "모바일과 데스크톱을 합친 값입니다. 화면 전환은 도착한 경로로 셉니다."
          : undefined
      }
    >
      {routes.length ? (
        <Table
          head={[
            "경로",
            "첫 진입",
            ...routeVitals.map((name) => shortNames[name]),
          ]}
        >
          {routes.map(({ route, stats }) => (
            <tr key={route}>
              <th scope="row" className={`${cellClass} font-medium`}>
                {route}
              </th>
              <td className={cellClass}>
                {numberFormat.format(stats.LCP?.count ?? 0)}
              </td>
              <StatCells names={routeVitals} stats={stats} />
            </tr>
          ))}
        </Table>
      ) : (
        <Callout>최근 {days}일 동안 수집된 기록이 없습니다.</Callout>
      )}
    </Panel>
  );
}

function Builds({ builds }: { builds: PerformanceDashboard["builds"] }) {
  return (
    <Panel
      id="builds-heading"
      title="배포별"
      note={
        builds.length
          ? "최근 배포 5개입니다. 기간과 관계없이 배포마다 모은 값 전체입니다."
          : undefined
      }
    >
      {builds.length ? (
        <Table
          head={[
            "배포",
            "처음 수집",
            "표본",
            ...buildVitals.map((name) => shortNames[name]),
          ]}
        >
          {builds.map((build) => (
            <tr key={build.buildId}>
              <th scope="row" className={`${cellClass} font-mono font-medium`}>
                {build.buildId.slice(0, 8)}
              </th>
              <td className={cellClass}>{formatDateTime(build.firstSeenAt)}</td>
              <td className={cellClass}>{numberFormat.format(build.count)}</td>
              <StatCells names={buildVitals} stats={build.stats} />
            </tr>
          ))}
        </Table>
      ) : (
        <Callout>아직 수집된 기록이 없습니다.</Callout>
      )}
    </Panel>
  );
}

export default function AdminPerformance({
  dashboard,
}: {
  dashboard: PerformanceDashboard;
}) {
  const { days } = dashboard;
  return (
    <AdminShell activePath="/admin/performance">
      <AdminPageHeader
        title="성능"
        description="실제 방문자 브라우저에서 잰 값의 75번째 백분위입니다."
        action={[7, 30].map((value) => (
          <Link
            key={value}
            href={
              value === 7
                ? "/admin/performance"
                : `/admin/performance?days=${value}`
            }
            aria-current={days === value ? "page" : undefined}
            className={
              days === value ? primaryButtonClass : secondaryButtonClass
            }
          >
            최근 {value}일
          </Link>
        ))}
      />
      <div className="mt-8 grid gap-10">
        <Column id="core-heading" title="핵심 지표">
          <div className="grid items-start gap-6 xl:grid-cols-2">
            <CoreVitals
              id="mobile-heading"
              title="모바일"
              stats={dashboard.devices.mobile}
              days={days}
            />
            <CoreVitals
              id="desktop-heading"
              title="데스크톱"
              stats={dashboard.devices.desktop}
              days={days}
            />
          </div>
        </Column>
        <Column id="breakdown-heading" title="경로와 배포">
          <Routes routes={dashboard.routes} days={days} />
          <Builds builds={dashboard.builds} />
        </Column>
      </div>
    </AdminShell>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const days = context.query.days === "30" ? 30 : 7;
  return { props: { dashboard: await getPerformanceDashboard({ days }) } };
};
