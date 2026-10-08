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

/** 느린 방문의 원인. label은 막대와 목록의 이름, hint는 어디를 보면 되는지다. ttfb는 LCP와 FCP가 같이 쓴다. */
export const causeInfo = {
  ttfb: {
    label: "첫 바이트",
    hint: "첫 바이트까지가 길었습니다. 첫 바이트 내역에서 연결과 서버 대기 중 어느 쪽인지 봅니다.",
  },
  "load-delay": {
    label: "발견 지연",
    hint: "그림을 늦게 찾기 시작했습니다. 지연 로딩, 우선순위(priority, fetchPriority), CSS 배경 그림인지 봅니다.",
  },
  "load-duration": {
    label: "받기",
    hint: "그림을 받는 데 오래 걸렸습니다. 파일 용량과 받는 너비(sizes)를 줄일 수 있는지 봅니다.",
  },
  "render-delay": {
    label: "그리기",
    hint: "받을 것은 다 받았는데 늦게 그려졌습니다. 자바스크립트 실행, 하이드레이션, 등장 효과 같은 숨김 처리를 봅니다.",
  },
  redirect: {
    label: "리다이렉트",
    hint: "리다이렉트에 시간이 갔습니다. www나 끝 슬래시 같은 주소 이동이 있었는지 봅니다.",
  },
  connection: {
    label: "회선과 연결",
    hint: "DNS, 연결(TLS), 회선 왕복에 시간이 갔습니다. 대개 방문자 회선 문제이고, 같은 원인이 많으면 리다이렉트와 연결 재사용을 봅니다.",
  },
  "server-wait": {
    label: "서버 처리",
    hint: "회선 왕복을 뺀 서버 처리 추정치가 깁니다. 이 경로의 서버 렌더링과 DB 조회를 봅니다.",
  },
  "before-request": {
    label: "요청 전",
    hint: "요청을 보내기 전에 시간이 갔습니다. 브라우저 캐시 확인 같은 방문자 쪽 처리라 대개 고칠 것이 없습니다.",
  },
  "input-delay": {
    label: "입력 지연",
    hint: "누른 뒤 처리가 시작되기까지 기다렸습니다. 그때 돌던 다른 자바스크립트(하이드레이션, 타이머, 등장 효과)를 봅니다.",
  },
  processing: {
    label: "처리",
    hint: "이벤트 처리 코드가 오래 걸렸습니다. 이 요소의 클릭 처리와 그 뒤 다시 그리는 컴포넌트를 봅니다.",
  },
  presentation: {
    label: "화면 반영",
    hint: "처리 뒤 화면에 반영되기까지 오래 걸렸습니다. 한 번에 바뀌는 요소 수와 레이아웃 계산을 봅니다.",
  },
  "layout-shift": {
    label: "레이아웃 밀림",
    hint: "밀린 요소 위쪽에 크기를 정하지 않은 그림이나 늦게 들어오는 글꼴, 배너가 있는지 봅니다.",
  },
  data: {
    label: "데이터",
    hint: "다음 화면의 데이터를 서버에서 받는 시간이 깁니다. 정적 생성(ISR) 도입을 검토할 근거입니다.",
  },
  chunks: {
    label: "코드 받기",
    hint: "다음 화면의 자바스크립트를 받는 시간이 깁니다. 미리 받기(prefetch)가 됐는지와 화면별 코드 크기를 봅니다.",
  },
  // Next의 화면 전환 지표는 그리기 시작(beforeRender 표시)에서 끝난다. 받은 뒤 그리기 시작까지가 이 구간이다.
  render: {
    label: "실행",
    hint: "받은 뒤 새 화면을 그리기 시작하기까지 오래 걸렸습니다. 새 화면 코드의 실행과 그때 돌던 다른 자바스크립트를 봅니다.",
  },
  "after-ttfb": {
    label: "첫 바이트 뒤",
    hint: "HTML을 받은 뒤 처음 그리기까지 오래 걸렸습니다. 렌더링을 막는 CSS와 글꼴, 자바스크립트를 봅니다.",
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

/** 단계 하나. LCP 그림의 resource 기록이 없으면 발견 지연과 받기는 null이다. */
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
