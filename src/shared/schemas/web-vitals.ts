import { z } from "zod";
import { MAX_VITAL_MS, VITAL_NAMES } from "@/lib/performance-dashboard";

export const webVitalSchema = z
  .object({
    name: z.enum(VITAL_NAMES),
    // z.number()는 NaN과 Infinity를 받지 않는다.
    value: z.number().min(0).max(MAX_VITAL_MS),
    rating: z.enum(["good", "needs-improvement", "poor"]).nullable(),
    navigationType: z
      .enum([
        "navigate",
        "reload",
        "back-forward",
        "back-forward-cache",
        "prerender",
        "restore",
      ])
      .nullable(),
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
  })
  .refine((metric) => metric.name !== "CLS" || metric.value <= 100, {
    path: ["value"],
  });

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
