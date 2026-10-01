import { HttpError } from "@/server/http/errors";

type PostgresErrorLike = {
  code?: string;
  constraint_name?: string;
  cause?: unknown;
};

/**
 * 순서 고유 제약(23505) 위반을 ORDER_CONFLICT로 바꾼다. 나머지 오류는 그대로 다시 던진다.
 * drizzle는 드라이버 오류를 DrizzleQueryError로 감싸므로 cause까지 본다.
 * 고유 인덱스 위반이면 Postgres가 인덱스 이름을 constraint_name으로 준다.
 */
export function mapUniqueViolation(
  error: unknown,
  constraintNames: string[],
): never {
  const candidates = [error, (error as PostgresErrorLike | undefined)?.cause];
  for (const candidate of candidates) {
    const pgError = candidate as PostgresErrorLike | undefined;
    if (
      pgError?.code === "23505" &&
      pgError.constraint_name &&
      constraintNames.includes(pgError.constraint_name)
    ) {
      throw new HttpError("ORDER_CONFLICT");
    }
  }
  throw error;
}
