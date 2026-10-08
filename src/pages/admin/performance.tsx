import Link from "next/link";
import type { GetServerSideProps } from "next";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Callout,
  Column,
  formatDateTime,
  listClass,
  Panel,
} from "@/components/admin/fields";
import {
  causeInfo,
  causeStages,
  CORE_VITALS,
  gradeLabels,
  gradeVital,
  ROUTE_CHANGE,
  slowThresholds,
  splitServerWait,
  type SlowMetric,
  type VitalCause,
  type VitalGrade,
  type VitalName,
  type VitalStage,
} from "@/lib/performance-dashboard";
import type { NavTiming } from "@/shared/schemas/web-vitals";
import { requireAdminPage } from "@/server/auth/require-admin";
import {
  getCauseBreakdown,
  getPerformanceDashboard,
  getSlowVisits,
  type CauseBreakdown,
  type PerformanceDashboard,
  type SlowFilter,
  type SlowVisit,
  type VitalStat,
  type VitalStats,
} from "@/server/modules/web-vitals/service";

/*
 * 기준보다 느렸던 방문과 그 원인을 본다. 모든 방문의 p75 분포는 맨 아래에 접어 둔다.
 * 위계와 콜아웃은 운영 현황과 같은 부품(fields.tsx)을 쓴다. 색은 등급과 막대의 원인 단계에만 쓴다.
 */

const numberFormat = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 1,
});

const percentFormat = new Intl.NumberFormat("ko-KR", {
  style: "percent",
  maximumFractionDigits: 0,
});

/** 표본이 이보다 적은 p75는 몇 건에 크게 흔들려서 흐리게 둔다. */
const MIN_SAMPLES = 20;

const shortNames = Object.fromEntries(
  CORE_VITALS.map((vital) => [vital.name, vital.short]),
) as Record<VitalName, string>;

const gradeTone: Record<VitalGrade, string> = {
  good: "text-emerald-800",
  "needs-improvement": "text-amber-800",
  poor: "text-red-700",
};

const deviceLabels: Record<SlowFilter["device"], string> = {
  all: "전체",
  mobile: "모바일",
  desktop: "데스크톱",
};

const navigationLabels: Record<string, string> = {
  navigate: "일반 이동",
  reload: "새로 고침",
  "back-forward": "앞뒤 이동",
  "back-forward-cache": "뒤로 가기 캐시",
  prerender: "미리 렌더링",
  restore: "복원",
};

const slowMetrics = Object.keys(slowThresholds) as SlowMetric[];

// 주소에는 Next 지표 이름 대신 짧은 이름을 쓴다.
const metricParam = (metric: SlowMetric) =>
  metric === ROUTE_CHANGE ? "route-change" : metric;

/** 기본값은 주소에서 뺀다. 그래야 선택된 칩의 주소가 지금 주소와 같다. */
function viewHref({ days, metric, device, threshold }: SlowFilter) {
  const params = new URLSearchParams();
  if (days !== 7) params.set("days", String(days));
  if (metric !== "LCP") params.set("metric", metricParam(metric));
  if (device !== "all") params.set("device", device);
  if (threshold !== slowThresholds[metric].default)
    params.set("over", String(threshold));
  const query = params.toString();
  return query ? `/admin/performance?${query}` : "/admin/performance";
}

function formatMs(ms: number | null) {
  return ms === null ? "기록 없음" : `${numberFormat.format(Math.round(ms))}ms`;
}

/** CLS는 넷째 자리까지 쓴다. 둘째 자리에서 반올림하면 기준 0.1을 갓 넘은 0.1003이 0.10으로 보인다. */
function formatValue(name: VitalName, value: number) {
  return name === "CLS" ? String(Number(value.toFixed(4))) : formatMs(value);
}

/** 기준값 글자. 1초 이상은 초로 쓴다(2000 → 2초). */
function formatThreshold(metric: SlowMetric, value: number) {
  if (metric === "CLS") return String(value);
  return value >= 1000 ? `${value / 1000}초` : `${value}ms`;
}

const chipClass =
  "inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--bw-color-brand)]/50";

function Chip({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`${chipClass} ${current ? "border-[var(--bw-color-ink)] bg-[var(--bw-color-ink)] font-semibold text-white" : "border-slate-300 font-medium text-[var(--bw-color-ink)] hover:bg-slate-100"}`}
    >
      {children}
    </Link>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-start gap-2">
      <span
        aria-hidden
        className="w-16 shrink-0 pt-2 text-[13px] font-semibold text-slate-500"
      >
        {label}
      </span>
      {/* 좁은 화면에서 줄이 넘어가도 칩이 라벨 오른쪽 칸에 머문다. */}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Filters({ view }: { view: SlowFilter }) {
  return (
    <nav aria-label="보기 조건" className="mt-6 grid gap-2">
      <FilterGroup label="지표">
        {slowMetrics.map((metric) => (
          <Chip
            key={metric}
            href={viewHref({
              ...view,
              metric,
              // 기준 선택지가 지표마다 달라서 다른 지표로 가면 기본값으로 돌린다.
              threshold:
                metric === view.metric
                  ? view.threshold
                  : slowThresholds[metric].default,
            })}
            current={metric === view.metric}
          >
            {shortNames[metric]}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="기기">
        {(["all", "mobile", "desktop"] as const).map((device) => (
          <Chip
            key={device}
            href={viewHref({ ...view, device })}
            current={device === view.device}
          >
            {deviceLabels[device]}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup label="느림 기준">
        {slowThresholds[view.metric].options.map((threshold) => (
          <Chip
            key={threshold}
            href={viewHref({ ...view, threshold })}
            current={threshold === view.threshold}
          >
            {formatThreshold(view.metric, threshold)} 초과
          </Chip>
        ))}
      </FilterGroup>
    </nav>
  );
}

function SlowSummary({
  view,
  breakdown: { slow, total },
}: {
  view: SlowFilter;
  breakdown: CauseBreakdown;
}) {
  if (!total)
    return (
      <Callout>최근 {view.days}일 동안 조건에 맞는 기록이 없습니다.</Callout>
    );
  if (!slow)
    return <Callout tone="ok">기간 안에 기준을 넘은 방문이 없습니다.</Callout>;
  const threshold = formatThreshold(view.metric, view.threshold);
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 text-[15px] text-slate-600">
      {/* 0.1처럼 받침 있는 숫자로 끝나면 "을"이다. 초와 ms는 "를". */}
      <span>
        기준 {threshold}
        {/[013678]$/.test(threshold) ? "을" : "를"} 넘은 방문
      </span>
      <strong className="text-3xl font-semibold tabular-nums text-[var(--bw-color-ink)]">
        {numberFormat.format(slow)}건
      </strong>
      <span className="tabular-nums">
        / 전체 {numberFormat.format(total)}건 (
        {percentFormat.format(slow / total)})
      </span>
    </p>
  );
}

function Causes({
  metric,
  breakdown: { causes, sample, slow },
}: {
  metric: SlowMetric;
  breakdown: CauseBreakdown;
}) {
  // CLS는 원인이 늘 레이아웃 밀림이라 밀린 요소로 나눠 세고, 어디를 볼지는 머리말에 한 번 둔다.
  const how =
    metric === "CLS"
      ? causeInfo["layout-shift"].hint
      : "방문마다 가장 오래 걸린 단계를 원인으로 셉니다.";
  const sampled =
    sample < slow
      ? ` 느린 방문 중 최근 ${numberFormat.format(sample)}건으로 셉니다.`
      : "";
  return (
    <Panel id="causes-heading" title="원인" note={how + sampled}>
      <ul className={listClass}>
        {causes.map(({ cause, element, count, share }) => (
          <li key={`${cause} ${element}`} className="grid gap-1.5 py-3">
            <div className="flex flex-wrap items-baseline gap-x-2 text-[15px] text-[var(--bw-color-ink)]">
              <span className={`font-semibold ${element ? "font-mono" : ""}`}>
                {element ?? causeInfo[cause].label}
              </span>
              <span className="font-semibold tabular-nums">
                {numberFormat.format(count)}건
              </span>
              <span className="text-[13px] tabular-nums text-slate-500">
                {percentFormat.format(share)}
              </span>
            </div>
            <span aria-hidden className="block max-w-xl">
              <span
                className={`block h-2 rounded-sm ${cause === "unknown" ? "bg-[var(--bw-color-ink)]/25" : "bg-[var(--bw-color-ink)]"}`}
                style={{ width: `${share * 100}%` }}
              />
            </span>
            {cause === "layout-shift" ? null : (
              <p className="text-[13px] leading-5 text-slate-500">
                {causeInfo[cause].hint}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// 단계는 잉크 농도로 나누고 원인 단계만 강조색으로 칠한다. 범례는 목록 위에 한 번만 둔다.
const stageShades = [
  "bg-[var(--bw-color-ink)]",
  "bg-[var(--bw-color-ink)]/65",
  "bg-[var(--bw-color-ink)]/40",
  "bg-[var(--bw-color-ink)]/20",
];
const causeShade = "bg-[var(--bw-accent,#5b63d3)]";

function Legend({ stages }: { stages: VitalStage[] }) {
  return (
    <p
      aria-hidden
      className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500"
    >
      {[
        ...stages.map((stage, index) => ({
          label: causeInfo[stage.cause].label,
          shade: stageShades[index],
        })),
        { label: "원인 단계", shade: causeShade },
      ].map(({ label, shade }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className={`size-2.5 rounded-sm ${shade}`} />
          {label}
        </span>
      ))}
    </p>
  );
}

/** 단계를 걸린 시간 비율로 이어 붙인 막대. 같은 내용은 펼친 상세의 표가 글자로 말한다. */
function StageBar({
  stages,
  cause,
}: {
  stages: VitalStage[];
  cause: VitalCause;
}) {
  if (!stages.some((stage) => stage.ms)) return null;
  return (
    <span
      aria-hidden
      className="ml-6 flex h-2 max-w-xl gap-px overflow-hidden rounded-sm"
    >
      {stages.map((stage, index) =>
        stage.ms ? (
          <span
            key={stage.cause}
            className={`basis-0 ${stage.cause === cause ? causeShade : stageShades[index]}`}
            style={{ flexGrow: stage.ms }}
          />
        ) : null,
      )}
    </span>
  );
}

/** 라벨과 값을 붙여 늘어놓는다. 값이 없는 항목은 뺀다. */
function Pairs({
  title,
  items,
}: {
  title: string;
  items: [string, ReactNode][];
}) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold text-slate-500">{title}</h4>
      <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
        {items
          .filter(([, value]) => value != null)
          .map(([label, value]) => (
            <div key={label} className="flex min-w-0 gap-1.5">
              <dt className="shrink-0 text-slate-500">{label}</dt>
              <dd className="break-all font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

const formatKb = (kb: number | null) =>
  kb === null ? null : `${numberFormat.format(kb)}KB`;

function VisitDetail({
  visit,
  stages,
}: {
  visit: SlowVisit;
  stages: VitalStage[];
}) {
  const a = visit.attribution;
  // TTFB는 내역 자체가 첫 바이트 내역이고, LCP와 FCP는 nav에 담아 온다.
  const nav: NavTiming | null =
    a && "wait" in a ? a : a && "nav" in a ? a.nav : null;
  const wait = nav ? splitServerWait(nav) : null;
  return (
    <div className="grid gap-4 pb-4 pl-6 text-[15px] text-[var(--bw-color-ink)]">
      <p className="font-medium leading-6">{causeInfo[visit.cause].hint}</p>
      {stages.length ? (
        // 그리드 칸 폭으로 늘어나면 시간이 단계 이름에서 멀어진다.
        <table className="justify-self-start">
          <caption className="mb-1 text-left text-[13px] font-semibold text-slate-500">
            단계별 시간
          </caption>
          <tbody>
            {stages.map((stage) => {
              const strong = stage.cause === visit.cause;
              return (
                <tr key={stage.cause}>
                  <th
                    scope="row"
                    className={`py-0.5 pr-4 text-left ${strong ? "font-semibold" : "font-normal text-slate-600"}`}
                  >
                    {causeInfo[stage.cause].label}
                  </th>
                  <td
                    className={`py-0.5 text-right tabular-nums ${strong ? "font-semibold" : ""}`}
                  >
                    {formatMs(stage.ms)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}
      {a && "renderDelay" in a ? (
        <Pairs
          title="LCP 요소"
          items={[
            ["요소", a.element],
            ["파일", a.resource],
            ["크기", formatKb(a.resourceKb)],
          ]}
        />
      ) : null}
      {a && "inputDelay" in a ? (
        <Pairs
          title="입력"
          items={[
            ["이벤트", a.event],
            ["대상", a.target],
          ]}
        />
      ) : null}
      {a && "largestShift" in a ? (
        <Pairs
          title="가장 크게 밀린 요소"
          items={[
            ["요소", a.element],
            ["밀림", formatValue("CLS", a.largestShift)],
            ["시각", formatMs(a.time)],
          ]}
        />
      ) : null}
      {nav ? (
        <Pairs
          title="첫 바이트 내역"
          items={[
            [
              "리다이렉트",
              `${formatMs(nav.redirect)}${nav.redirectCount ? ` (${nav.redirectCount}회)` : ""}`,
            ],
            ["요청 전", formatMs(nav.before)],
            ["DNS", formatMs(nav.dns)],
            // TLS는 연결 안에 들어 있어 따로 두면 둘을 더해 읽는다.
            [
              "연결",
              `${formatMs(nav.connect)}${nav.tls ? ` (TLS ${formatMs(nav.tls)})` : ""}`,
            ],
            // 서버 대기에는 회선 왕복 1번이 섞여 있어, 추정한 왕복을 나눠 보여 준다.
            [
              "서버 대기",
              wait?.rtt
                ? `${formatMs(nav.wait)} (회선 왕복 약 ${formatMs(wait.rtt)}, 서버 처리 약 ${formatMs(wait.server)})`
                : formatMs(nav.wait),
            ],
          ]}
        />
      ) : null}
      {a && "transfer" in a ? (
        <Pairs
          title="LCP까지 받은 용량"
          items={[
            ["문서", formatKb(a.transfer.doc)],
            ["JS", formatKb(a.transfer.js)],
            ["CSS", formatKb(a.transfer.css)],
            ["글꼴", formatKb(a.transfer.font)],
            ["그림", formatKb(a.transfer.image)],
            ["기타", formatKb(a.transfer.other)],
          ]}
        />
      ) : null}
      <Pairs
        title="환경"
        items={[
          ["화면 폭", a ? `${a.viewport}px` : null],
          ["dpr", a?.dpr],
          ["배포", visit.buildId.slice(0, 8)],
          [
            "내비게이션",
            visit.navigationType &&
              (navigationLabels[visit.navigationType] ?? visit.navigationType),
          ],
        ]}
      />
    </div>
  );
}

function VisitRow({ metric, visit }: { metric: SlowMetric; visit: SlowVisit }) {
  const a = visit.attribution;
  const stages = a ? causeStages(a) : [];
  const subject =
    a && ("element" in a ? a.element : "target" in a ? a.target : null);
  return (
    <li>
      <details className="group">
        <summary className="grid cursor-pointer list-none gap-1.5 py-3 [&::-webkit-details-marker]:hidden">
          <span className="flex flex-wrap items-baseline gap-x-2 text-[15px] text-[var(--bw-color-ink)]">
            <ChevronRight
              aria-hidden
              className="size-4 shrink-0 self-center text-slate-500 transition-transform group-open:rotate-90"
            />
            <span className="font-semibold tabular-nums">
              {formatValue(metric, visit.value)}
            </span>
            <span>{causeInfo[visit.cause].label}</span>
            {subject ? (
              <span className="font-mono text-[13px] text-slate-500">
                {subject}
              </span>
            ) : null}
          </span>
          <span className="flex flex-wrap gap-x-2 pl-6 text-[13px] text-slate-500">
            <span>{formatDateTime(visit.createdAt)}</span>
            <span>{visit.route}</span>
            <span>
              {visit.device === "mobile" ? "모바일" : "데스크톱"}
              {visit.viewport ? ` ${visit.viewport}px` : ""}
            </span>
            {visit.connection ? <span>연결 {visit.connection}</span> : null}
          </span>
          <StageBar stages={stages} cause={visit.cause} />
        </summary>
        <VisitDetail visit={visit} stages={stages} />
      </details>
    </li>
  );
}

function SlowList({
  metric,
  visits,
}: {
  metric: SlowMetric;
  visits: SlowVisit[];
}) {
  const legend =
    visits
      .map((visit) => (visit.attribution ? causeStages(visit.attribution) : []))
      .find((stages) => stages.length) ?? [];
  return (
    <Panel
      id="visits-heading"
      title="느린 방문 목록"
      note="값이 큰 순으로 50건까지 보여 줍니다. 줄을 누르면 내역이 펼쳐집니다."
    >
      {legend.length ? <Legend stages={legend} /> : null}
      <ul className={listClass}>
        {visits.map((visit) => (
          <VisitRow key={visit.id} metric={metric} visit={visit} />
        ))}
      </ul>
    </Panel>
  );
}

/** p75 옆에 표본 수를 붙인다. 표본이 적으면 값을 흐리게 두고 "표본 적음"을 적는다. */
function StatValue({ name, stat }: { name: VitalName; stat?: VitalStat }) {
  if (!stat) return "-";
  const few = stat.count < MIN_SAMPLES;
  return (
    <>
      <span className={few ? "text-slate-500" : undefined}>
        {formatValue(name, stat.p75)}
      </span>{" "}
      <span className="text-[13px] font-normal text-slate-500">
        {numberFormat.format(stat.count)}건{few ? ", 표본 적음" : ""}
      </span>
    </>
  );
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
                <div className="flex flex-wrap items-baseline gap-x-2 text-[15px] text-[var(--bw-color-ink)]">
                  <span className="font-semibold">{short}</span>
                  <span className="font-semibold tabular-nums">
                    <StatValue name={name} stat={stat} />
                  </span>
                  {grade ? (
                    // 표본이 적으면 등급도 믿기 어려워 색을 뺀다.
                    <span
                      className={`text-sm font-semibold ${stat && stat.count < MIN_SAMPLES ? "text-slate-500" : gradeTone[grade]}`}
                    >
                      {gradeLabels[grade]}
                    </span>
                  ) : null}
                </div>
                <p className="text-[13px] text-slate-500">{label}</p>
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
  return names.map((name) => (
    <td key={name} className={cellClass}>
      <StatValue name={name} stat={stats[name]} />
    </td>
  ));
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
  // 바로 방문(LCP)도 화면 전환도 없는 경로는 하이드레이션 같은 Next 지표뿐이라 볼 것이 없다.
  // 바로 방문 수는 LCP 칸의 표본 수와 같아 따로 열을 두지 않는다.
  const rows = routes.filter(({ stats }) => stats.LCP || stats[ROUTE_CHANGE]);
  return (
    <Panel
      id="routes-heading"
      title="경로별"
      note={
        rows.length
          ? "모바일과 데스크톱을 합친 값입니다. 화면 전환은 도착한 경로로 셉니다."
          : undefined
      }
    >
      {rows.length ? (
        <Table head={["경로", ...routeVitals.map((name) => shortNames[name])]}>
          {rows.map(({ route, stats }) => (
            <tr key={route}>
              <th scope="row" className={`${cellClass} font-medium`}>
                {route}
              </th>
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

function Distribution({ dashboard }: { dashboard: PerformanceDashboard }) {
  const { days } = dashboard;
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2 border-b-2 border-[var(--bw-color-ink)] pb-2 [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 transition-transform group-open:rotate-90"
        />
        <h2 className="text-base font-bold text-[var(--bw-color-ink)]">
          전체 분포
        </h2>
      </summary>
      <p className="mt-2 text-[13px] leading-5 text-slate-500">
        모든 방문의 75번째 백분위입니다. 값 옆 숫자는 표본 수이고, {MIN_SAMPLES}
        건 미만은 흐리게 둡니다.
      </p>
      <div className="mt-4 grid gap-6">
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
        <Routes routes={dashboard.routes} days={days} />
        <Builds builds={dashboard.builds} />
      </div>
    </details>
  );
}

export default function AdminPerformance({
  view,
  breakdown,
  visits,
  dashboard,
}: {
  view: SlowFilter;
  breakdown: CauseBreakdown;
  visits: SlowVisit[];
  dashboard: PerformanceDashboard;
}) {
  return (
    <AdminShell activePath="/admin/performance">
      <AdminPageHeader
        title="성능"
        description="기준보다 느렸던 방문과 그 원인을 봅니다."
        action={[7, 30].map((days) => (
          <Chip
            key={days}
            href={viewHref({ ...view, days })}
            current={days === view.days}
          >
            최근 {days}일
          </Chip>
        ))}
      />
      <Filters view={view} />
      <div className="mt-8 grid gap-10">
        <Column id="slow-heading" title="느린 방문">
          <SlowSummary view={view} breakdown={breakdown} />
          {breakdown.slow ? (
            <>
              <Causes metric={view.metric} breakdown={breakdown} />
              <SlowList metric={view.metric} visits={visits} />
            </>
          ) : null}
        </Column>
        <Distribution dashboard={dashboard} />
      </div>
    </AdminShell>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const { query } = context;
  const metric =
    slowMetrics.find((name) => metricParam(name) === query.metric) ?? "LCP";
  const { options, default: fallback } = slowThresholds[metric];
  const view: SlowFilter = {
    days: query.days === "30" ? 30 : 7,
    metric,
    device:
      (["mobile", "desktop"] as const).find((name) => name === query.device) ??
      "all",
    // 선택지에 없는 기준은 그 지표의 기본값으로 돌린다.
    threshold:
      options.find((value) => String(value) === query.over) ?? fallback,
  };
  const [breakdown, visits, dashboard] = await Promise.all([
    getCauseBreakdown(view),
    getSlowVisits(view),
    getPerformanceDashboard({ days: view.days }),
  ]);
  return { props: { view, breakdown, visits, dashboard } };
};
