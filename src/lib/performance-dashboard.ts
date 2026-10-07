/*
 * 성능 화면 기준값. 화면, 수집 스크립트, 서버가 같이 쓴다.
 * 서버 모듈(src/server/modules/web-vitals/service.ts)을 화면에서 직접 가져오면
 * DB 클라이언트까지 브라우저 묶음에 딸려 들어간다.
 */

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
