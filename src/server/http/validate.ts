import { z, type ZodType } from "zod";
import { HttpError } from "@/server/http/errors";

export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first?.path.join(".") || "본문";
    throw new HttpError("BAD_REQUEST", `입력값을 확인해 주세요. (${path})`);
  }
  return result.data;
}

export const localeSchema = z.enum(["ko", "en"]);

/** `<input type="date">`가 보내는 YYYY-MM-DD. DB의 date 열과 형태를 맞춘다. */
export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const isoDateTimeSchema = z.string().datetime({ offset: true });

export const expectedVersionSchema = z.number().int().nonnegative();

/** 낙관적 잠금 버전만 받는 명령 본문. */
export const versionCommandSchema = z.object({
  expectedVersion: expectedVersionSchema,
});

/** 언어별 명령 본문. */
export const localeCommandSchema = versionCommandSchema.extend({
  locale: localeSchema,
});

/** 게시 기간을 함께 받는 언어별 명령 본문. */
export const publishCommandSchema = localeCommandSchema.extend({
  startsAt: isoDateTimeSchema.nullable().optional(),
  endsAt: isoDateTimeSchema.nullable().optional(),
});
