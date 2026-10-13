/*
 * 성능 화면 기준값. 화면, 수집 스크립트, 서버가 같이 쓴다.
 * 서버 모듈(src/server/modules/web-vitals/service.ts)을 화면에서 직접 가져오면
 * DB 클라이언트까지 브라우저 묶음에 딸려 들어간다.
 */

import type { NavTiming, VitalAttribution } from "@/shared/schemas/web-vitals";

export const ROUTE_CHANGE = "Next.js-route-change-to-render";

/** 받는 지표. 앞의 다섯은 web-vitals, 뒤의 셋은 Next가 재는 값이다. FID는 INP로 대체되어 받지 않는다. */
export const VITAL_NAMES = [
  "LCP",
  "INP",
  "CLS",
  "FCP",
  "TTFB",
  ROUTE_CHANGE,
  "Next.js-render",
  "Next.js-hydration",
] as const;

export type VitalName = (typeof VITAL_NAMES)[number];

/** ms 지표의 상한(10분). 이보다 길면 기기가 잠들었던 값이라 버린다. */
export const MAX_VITAL_MS = 600_000;

/** 핵심 지표 패널에 보여 줄 순서. short는 표 머리와 항목 이름, label은 보조 설명이다. */
export const CORE_VITALS: { name: VitalName; short: string; label: string }[] =
  [
    { name: "LCP", short: "LCP", label: "가장 큰 콘텐츠 표시" },
    { name: "INP", short: "INP", label: "입력 반응" },
    { name: "CLS", short: "CLS", label: "레이아웃 밀림" },
    { name: "FCP", short: "FCP", label: "첫 콘텐츠 표시" },
    { name: "TTFB", short: "TTFB", label: "서버 첫 응답" },
    {
      name: ROUTE_CHANGE,
      short: "화면 전환",
      label: "사이트 안 링크를 누른 뒤 새 화면까지",
    },
  ];

/** Google 공식 기준. 첫 값 이하면 좋음, 둘째 값 초과면 나쁨. Next 전용 지표는 기준이 없다. */
const thresholds: Partial<Record<VitalName, [number, number]>> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

export type VitalGrade = "good" | "needs-improvement" | "poor";

export const gradeLabels: Record<VitalGrade, string> = {
  good: "좋음",
  "needs-improvement": "개선 필요",
  poor: "나쁨",
};

export function gradeVital(name: VitalName, value: number): VitalGrade | null {
  const limits = thresholds[name];
  if (!limits) return null;
  if (value <= limits[0]) return "good";
  return value <= limits[1] ? "needs-improvement" : "poor";
}

/** 느린 방문 기준 선택지와 처음 보이는 값. 기준을 넘은 방문만 느린 방문으로 센다. */
export const slowThresholds = {
  LCP: { options: [1500, 2000, 2500, 4000], default: 2000 },
  INP: { options: [200, 500], default: 200 },
  CLS: { options: [0.1, 0.25], default: 0.1 },
  TTFB: { options: [800, 1800], default: 800 },
  FCP: { options: [1800, 3000], default: 1800 },
  [ROUTE_CHANGE]: { options: [300, 1000], default: 300 },
} satisfies Partial<Record<VitalName, { options: number[]; default: number }>>;

export type SlowMetric = keyof typeof slowThresholds;

/**
 * 느린 방문의 원인. label은 막대와 목록의 이름이다. hint는 그 단계가 길었다는 뜻과 흔한 원인을
 * 두 문장으로 적는다. ttfb는 LCP와 FCP가 같이 쓴다.
 */
export const causeInfo = {
  ttfb: {
    label: "TTFB",
    hint: "HTML의 첫 바이트가 늦게 도착했습니다. 원인은 TTFB 내역에서 가장 긴 구간(Waiting, Network, Server)입니다.",
  },
  "load-delay": {
    label: "Resource load delay",
    hint: "LCP 리소스 요청이 첫 바이트보다 한참 늦게 시작됐습니다. 흔한 원인은 그림의 지연 로딩과 낮은 우선순위(priority, fetchPriority), CSS 배경 그림, 영상의 preload 설정과 미리 받기 시점입니다.",
  },
  "load-duration": {
    label: "Resource load duration",
    hint: "LCP 리소스를 받는 데 오래 걸렸습니다. 흔한 원인은 큰 파일 용량과 화면보다 넓게 받는 그림(sizes)입니다.",
  },
  "render-delay": {
    label: "Element render delay",
    hint: "리소스를 다 받은 뒤에도 늦게 그려졌습니다. 흔한 원인은 자바스크립트 실행, 하이드레이션 대기, 등장 효과 같은 숨김 처리입니다.",
  },
  // 저장 필드 이름은 redirect지만 값은 web-vitals의 waitingDuration(내비게이션 시작부터 fetchStart까지)이다.
  redirect: {
    label: "Waiting",
    hint: "요청을 시작하기 전 대기가 길었습니다. 흔한 원인은 www나 http 주소에서 넘어오는 리다이렉트, 검색이나 메신저 링크의 중간 이동, 이전 페이지 정리입니다.",
  },
  connection: {
    label: "Network",
    hint: "DNS, 연결(TCP, TLS), 회선 왕복(RTT)에 시간이 걸렸습니다. 흔한 원인은 서버와 멀리 떨어진 방문자(해외 등)의 긴 왕복 시간입니다.",
  },
  "server-wait": {
    label: "Server",
    hint: "Request에서 RTT를 뺀 서버 처리 추정치가 깁니다. 흔한 원인은 서버 렌더링과 DB 조회입니다. 먼 방문에서는 왕복이 한 번 더 섞여 실제보다 크게 나올 수 있습니다.",
  },
  "before-request": {
    label: "Cache",
    hint: "요청을 보내기 전 브라우저 안에서 시간이 걸렸습니다. 브라우저 캐시 확인 같은 방문자 쪽 처리라 대개 고칠 것이 없습니다.",
  },
  "input-delay": {
    label: "Input delay",
    hint: "누른 뒤 처리가 시작되기까지 기다렸습니다. 흔한 원인은 그때 돌던 다른 자바스크립트(하이드레이션, 타이머, 등장 효과)입니다.",
  },
  processing: {
    label: "Processing duration",
    hint: "이벤트 처리 코드가 오래 걸렸습니다. 흔한 원인은 그 요소의 클릭 처리와 처리 뒤 다시 그려지는 컴포넌트입니다.",
  },
  presentation: {
    label: "Presentation delay",
    hint: "처리 뒤 화면에 반영되기까지 오래 걸렸습니다. 흔한 원인은 한 번에 바뀌는 요소가 많거나 레이아웃 계산이 큰 경우입니다.",
  },
  "layout-shift": {
    label: "Layout shift",
    hint: "화면 요소가 그려진 뒤 밀렸습니다. 흔한 원인은 크기를 정하지 않은 그림, 늦게 적용되는 글꼴, 나중에 끼어드는 배너입니다.",
  },
  data: {
    label: "Data",
    hint: "다음 화면의 데이터(/_next/data)를 받는 시간이 깁니다. 서버 렌더링 페이지는 클릭한 뒤에야 데이터를 받아서 생기며, 자주 길면 정적 생성(ISR)을 검토할 근거가 됩니다.",
  },
  chunks: {
    label: "JS chunks",
    hint: "다음 화면의 자바스크립트를 받는 시간이 깁니다. 흔한 원인은 미리 받기(prefetch)가 안 된 링크와 큰 화면별 코드입니다.",
  },
  // Next의 화면 전환 지표는 그리기 시작(beforeRender 표시)에서 끝난다. 받은 뒤 그리기 시작까지가 이 구간이다.
  render: {
    label: "Render",
    hint: "받은 뒤 새 화면을 그리기 시작하기까지 오래 걸렸습니다. 흔한 원인은 새 화면 코드의 실행과 그때 돌던 다른 자바스크립트입니다.",
  },
  "after-ttfb": {
    label: "First byte to FCP",
    hint: "HTML을 받은 뒤 처음 그리기까지 오래 걸렸습니다. 흔한 원인은 렌더링을 막는 CSS와 글꼴, 자바스크립트이고, 먼 방문자는 이 파일들을 받는 왕복이 늘어 더 길어집니다.",
  },
  unknown: {
    label: "원인 기록 없음(이전 버전)",
    hint: "원인 내역을 모으기 전 버전에서 온 기록입니다.",
  },
} satisfies Record<string, { label: string; hint: string }>;

export type VitalCause = keyof typeof causeInfo;

/**
 * 원인 내역을 시간 순 단계로 편다. 화면의 단계 막대와 원인 분류가 같이 쓴다.
 * 화면 전환의 data와 chunks는 동시에 받을 수 있어 합이 값과 맞지 않는다. CLS는 단계가 없다.
 */
export function causeStages(a: VitalAttribution): VitalStage[] {
  const stages = (...pairs: [VitalCause, number | null][]) =>
    pairs.map(([cause, ms]) => ({ cause, ms }));
  // 지표마다 키가 달라 키 하나로 어느 지표의 내역인지 가린다.
  if ("renderDelay" in a)
    return stages(
      ["ttfb", a.ttfb],
      ["load-delay", a.loadDelay],
      ["load-duration", a.loadDuration],
      ["render-delay", a.renderDelay],
    );
  if ("wait" in a) {
    const { rtt, server } = splitServerWait(a);
    return stages(
      ["redirect", a.redirect],
      ["before-request", a.before],
      ["connection", a.dns + a.connect + rtt],
      ["server-wait", server],
    );
  }
  if ("inputDelay" in a)
    return stages(
      ["input-delay", a.inputDelay],
      ["processing", a.processing],
      ["presentation", a.presentation],
    );
  if ("afterTtfb" in a)
    return stages(["ttfb", a.ttfb], ["after-ttfb", a.afterTtfb]);
  if ("chunks" in a)
    return stages(["data", a.data], ["chunks", a.chunks], ["render", a.render]);
  return [];
}

/**
 * 요청에서 첫 바이트까지(wait)에는 서버 처리와 회선 왕복 1번이 함께 들어 있다. 느린 회선에서는
 * 서버가 빨라도 이 값이 커서 서버 문제로 잘못 읽힌다. 새 연결이면 TCP 연결(connect - tls)이
 * 대략 왕복 1번이라 이것으로 왕복을 추정해 뺀다. 연결을 다시 쓴 방문(connect 0)은 왕복을 알 수 없어 그대로 둔다.
 */
export function splitServerWait(nav: NavTiming) {
  const rtt = Math.min(nav.wait, Math.max(0, nav.connect - nav.tls));
  return { rtt, server: nav.wait - rtt };
}

/** 단계 하나. LCP 리소스의 resource 기록이 없으면 load delay와 load duration은 null이다. */
export type VitalStage = { cause: VitalCause; ms: number | null };

/** 가장 긴 단계를 원인으로 본다. 같으면 앞 단계다. 원인 내역이 없는 예전 행은 unknown이다. */
export function classifyCause(
  name: VitalName,
  attribution: VitalAttribution | null,
): VitalCause {
  if (!attribution) return "unknown";
  if (name === "CLS") return "layout-shift";
  let top: VitalStage | undefined;
  for (const stage of causeStages(attribution)) {
    if (!top || (stage.ms ?? 0) > (top.ms ?? 0)) top = stage;
  }
  return top?.cause ?? "unknown";
}
