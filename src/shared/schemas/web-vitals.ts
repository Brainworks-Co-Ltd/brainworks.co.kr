import { z } from "zod";
import {
  MAX_VITAL_MS,
  ROUTE_CHANGE,
  VITAL_NAMES,
  type VitalName,
} from "@/lib/performance-dashboard";

/*
 * 원인 내역(attribution). 계산은 src/lib/web-vitals-attribution.ts가 한다.
 * 지표마다 키가 정해져 있어 모르는 키는 거절한다. 시간은 모두 ms다.
 * 값 하나만 범위를 벗어나도 묶음 전체가 400이 되므로 수집 쪽에서 미리 자르고, 여기 범위는 넉넉히 둔다.
 */
const ms = z.number().min(0).max(MAX_VITAL_MS);
const kb = z.number().min(0).max(100_000);
const page = {
  viewport: z.number().int().min(0).max(100_000),
  dpr: z.number().min(0).max(100),
};
// 태그, id, 앞 클래스 2개만. 요소의 글자 내용은 담지 않는다.
// jsonb는 NUL과 짝 없는 서로게이트를 거절해 저장이 500이 되므로 여기서 400으로 막는다.
const element = z
  .string()
  .max(80)
  .regex(/^[^\0\p{Cs}]*$/u)
  .nullable();
// 파일 경로와 호스트는 URL 파서가, 이벤트 이름은 브라우저가 ASCII로 만든다.
const ascii = (max: number) =>
  z
    .string()
    .max(max)
    .regex(/^[\x20-\x7e]*$/);

const navShape = {
  redirect: ms,
  redirectCount: z.number().int().min(0).max(100),
  dns: ms,
  connect: ms,
  tls: ms,
  wait: ms,
  before: ms,
  // 서버가 Server-Timing 머리글을 줄 때만 있다. 이름은 머리글 규격의 token 문자다.
  // 지금은 보내지 않아 개수를 줄여 행 하나의 최대 크기를 낮춘다.
  serverTiming: z
    .array(
      z.strictObject({
        name: z
          .string()
          .max(40)
          .regex(/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/),
        duration: ms,
      }),
    )
    .max(3)
    .optional(),
};
const navTiming = z.strictObject(navShape);

const lcpAttribution = z.strictObject({
  ...page,
  ttfb: ms,
  // LCP 그림의 resource 기록이 없으면(캐시 등) null이다.
  loadDelay: ms.nullable(),
  loadDuration: ms.nullable(),
  renderDelay: ms,
  element,
  resource: ascii(120).nullable(),
  resourceKb: kb.nullable(),
  transfer: z.strictObject({
    doc: kb,
    js: kb,
    css: kb,
    font: kb,
    image: kb,
    other: kb,
  }),
  nav: navTiming,
});
const ttfbAttribution = z.strictObject({ ...page, ...navShape });
const inpAttribution = z.strictObject({
  ...page,
  event: ascii(40),
  target: element,
  inputDelay: ms,
  processing: ms,
  presentation: ms,
});
const clsAttribution = z.strictObject({
  ...page,
  element,
  largestShift: z.number().min(0).max(100),
  time: ms,
});
const fcpAttribution = z.strictObject({
  ...page,
  ttfb: ms,
  afterTtfb: ms,
  nav: navTiming,
});
const routeChangeAttribution = z.strictObject({
  ...page,
  data: ms,
  chunks: ms,
  render: ms,
});

const attributionSchemas: Partial<Record<VitalName, z.ZodType>> = {
  LCP: lcpAttribution,
  TTFB: ttfbAttribution,
  INP: inpAttribution,
  CLS: clsAttribution,
  FCP: fcpAttribution,
  [ROUTE_CHANGE]: routeChangeAttribution,
};

export const webVitalSchema = z
  .object({
    name: z.enum(VITAL_NAMES),
    // z.number()는 NaN과 Infinity를 받지 않는다.
    value: z.number().min(0).max(MAX_VITAL_MS),
    rating: z.enum(["good", "needs-improvement", "poor"]).nullable(),
    // 브라우저가 새 값을 보내도 묶음 전체가 400이 되지 않게 모르는 값은 null로 저장한다.
    navigationType: z
      .enum([
        "navigate",
        "reload",
        "back-forward",
        "back-forward-cache",
        "prerender",
        "restore",
      ])
      .nullable()
      .catch(null),
    // 실제 주소가 아니라 페이지 파일 경로다. 점은 /bid-notice/[[...slug]] 때문에 받는다.
    route: z
      .string()
      .max(120)
      .regex(/^\/[A-Za-z0-9/_\-[\].]*$/),
    locale: z.enum(["ko", "en"]),
    buildId: z
      .string()
      .max(64)
      .regex(/^[A-Za-z0-9_-]+$/),
    device: z.enum(["mobile", "desktop"]),
    connection: z.enum(["slow-2g", "2g", "3g", "4g"]).nullable(),
    // web-vitals id(v4-시각-난수). Next 전용 지표는 null.
    metricId: z
      .string()
      .max(64)
      .regex(/^[A-Za-z0-9-]+$/)
      .nullable(),
    attribution: z
      .union([
        lcpAttribution,
        ttfbAttribution,
        inpAttribution,
        clsAttribution,
        fcpAttribution,
        routeChangeAttribution,
      ])
      .nullable(),
  })
  .refine((metric) => metric.name !== "CLS" || metric.value <= 100, {
    path: ["value"],
  })
  // 합집합만으로는 LCP 이름에 FCP 모양 내역이 와도 통과하므로 이름에 맞는 모양인지 다시 본다.
  .refine(
    (metric) =>
      metric.attribution === null ||
      attributionSchemas[metric.name]?.safeParse(metric.attribution).success,
    { path: ["attribution"] },
  );

export const webVitalsInputSchema = z
  .array(webVitalSchema)
  .min(1)
  .max(30)
  // 한 묶음에 같은 id가 두 번 있으면 ON CONFLICT가 한 행을 두 번 고치려다 500이 된다.
  .refine((metrics) => {
    const ids = metrics.flatMap((metric) => metric.metricId ?? []);
    return new Set(ids).size === ids.length;
  });

export type WebVitalInput = z.infer<typeof webVitalSchema>;
export type VitalAttribution = NonNullable<WebVitalInput["attribution"]>;
export type NavTiming = z.infer<typeof navTiming>;
export type LcpAttribution = z.infer<typeof lcpAttribution>;
export type TtfbAttribution = z.infer<typeof ttfbAttribution>;
export type InpAttribution = z.infer<typeof inpAttribution>;
export type ClsAttribution = z.infer<typeof clsAttribution>;
export type FcpAttribution = z.infer<typeof fcpAttribution>;
export type RouteChangeAttribution = z.infer<typeof routeChangeAttribution>;
