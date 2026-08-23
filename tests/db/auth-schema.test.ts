import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  adminAccounts,
  adminSessions,
  authAccounts,
  authVerifications,
} from "@/server/db/schema/auth";

describe("Better Auth 저장 테이블 계약", () => {
  it("Better Auth 모델을 프로젝트 테이블 이름으로 고정한다", () => {
    expect(getTableName(adminAccounts)).toBe("admin_accounts");
    expect(getTableName(adminSessions)).toBe("admin_sessions");
    expect(getTableName(authAccounts)).toBe("auth_accounts");
    expect(getTableName(authVerifications)).toBe("auth_verifications");
  });
});
