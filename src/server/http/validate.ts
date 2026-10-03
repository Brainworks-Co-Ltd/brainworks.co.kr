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

/** 언어별 게시 기간. 빈 칸은 null로 비우고, 키가 빠지면 저장된 값을 그대로 둔다. */
export const publicationDateTimeSchema = isoDateTimeSchema
  .nullable()
  .optional()
  .transform((value) => (value == null ? value : new Date(value)));

export const expectedVersionSchema = z.number().int().nonnegative();

/** 낙관적 잠금 버전만 받는 명령 본문. */
export const versionCommandSchema = z.object({
  expectedVersion: expectedVersionSchema,
});

/** 언어별 명령 본문. */
export const localeCommandSchema = versionCommandSchema.extend({
  locale: localeSchema,
});

/** 목록 안에서 한 칸 옮기는 명령 본문. */
export const moveCommandSchema = versionCommandSchema.extend({
  direction: z.enum(["up", "down"]),
});
