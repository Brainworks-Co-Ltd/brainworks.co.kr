import { describe, expect, it } from "vitest";
import {
  createAdminAccountRows,
  normalizeAdminProvisioningInput,
  provisionAdminAccount,
} from "@/server/auth/provision-admin";

describe("로컬 통합 관리자 계정 프로비저닝", () => {
  it("이메일을 소문자·공백 제거 형태로 정규화한다", () => {
    expect(
      normalizeAdminProvisioningInput({
        email: "  ADMIN@Example.COM ",
        name: " 통합 관리자 ",
        password: "local-admin-password",
        passwordConfirmation: "local-admin-password",
      }),
    ).toEqual({
      email: "admin@example.com",
      name: "통합 관리자",
      password: "local-admin-password",
    });
  });

  it("짧거나 서로 다른 비밀번호를 거부한다", () => {
    expect(() =>
      normalizeAdminProvisioningInput({
        email: "admin@example.com",
        name: "통합 관리자",
        password: "short",
        passwordConfirmation: "short",
      }),
    ).toThrow("비밀번호는 8자 이상이어야 합니다.");

    expect(() =>
      normalizeAdminProvisioningInput({
        email: "admin@example.com",
        name: "통합 관리자",
        password: "local-admin-password",
        passwordConfirmation: "different-password",
      }),
    ).toThrow("비밀번호 확인이 일치하지 않습니다.");
  });

  it("통합 계정과 credential 로그인 자격 행을 함께 만든다", () => {
    const rows = createAdminAccountRows({
      id: "admin-id",
      email: "admin@example.com",
      name: "통합 관리자",
      passwordHash: "hashed-password",
      authAccountId: "auth-account-id",
    });

    expect(rows.user).toMatchObject({
      id: "admin-id",
      email: "admin@example.com",
      name: "통합 관리자",
      role: "ADMIN",
      accountStatus: "ACTIVE",
    });
    expect(rows.account).toMatchObject({
      id: "auth-account-id",
      accountId: "admin-id",
      providerId: "credential",
      issuer: "local:credential",
      userId: "admin-id",
      password: "hashed-password",
    });
  });

  it("새 계정을 트랜잭션으로 저장하고 평문 비밀번호를 저장하지 않는다", async () => {
    const insertedRows: unknown[] = [];
    const database = {
      transaction: async (callback: (transaction: unknown) => unknown) =>
        callback({
          select: () => ({
            from: () => ({
              where: () => ({ limit: async () => [] }),
            }),
          }),
          insert: () => ({
            values: async (row: unknown) => {
              insertedRows.push(row);
            },
          }),
        }),
    } as never;

    const result = await provisionAdminAccount(
      {
        email: "admin@example.com",
        name: "통합 관리자",
        password: "local-admin-password",
        passwordConfirmation: "local-admin-password",
      },
      database,
    );

    expect(result.email).toBe("admin@example.com");
    expect(insertedRows).toHaveLength(2);
    expect(insertedRows[1]).toMatchObject({
      providerId: "credential",
      password: expect.any(String),
    });
    expect((insertedRows[1] as { password: string }).password).not.toBe(
      "local-admin-password",
    );
  });
});
