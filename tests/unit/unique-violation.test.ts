import { describe, expect, it } from "vitest";
import { mapUniqueViolation } from "@/server/db/unique-violation";

/** drizzle는 드라이버 오류를 cause에 담아 다시 던진다. */
function drizzleError(code: string, constraintName: string) {
  return Object.assign(new Error("Failed query"), {
    cause: Object.assign(new Error("duplicate key value"), {
      code,
      constraint_name: constraintName,
    }),
  });
}

function caught(run: () => unknown) {
  try {
    run();
  } catch (error) {
    return error;
  }
  throw new Error("던지지 않았다");
}

describe("순서 고유 제약 위반 변환", () => {
  it("지정한 순서 제약의 23505는 ORDER_CONFLICT로 바꾼다", () => {
    expect(
      caught(() =>
        mapUniqueViolation(drizzleError("23505", "honors_type_order_uk"), [
          "honors_type_order_uk",
        ]),
      ),
    ).toMatchObject({ code: "ORDER_CONFLICT", status: 409 });
  });

  it("다른 제약의 위반이나 다른 오류는 그대로 다시 던진다", () => {
    const otherConstraint = drizzleError("23505", "news_slugs_slug_uk");
    expect(
      caught(() => mapUniqueViolation(otherConstraint, ["honors_type_order_uk"])),
    ).toBe(otherConstraint);
    const otherCode = drizzleError("23503", "honors_type_order_uk");
    expect(
      caught(() => mapUniqueViolation(otherCode, ["honors_type_order_uk"])),
    ).toBe(otherCode);
  });
});
