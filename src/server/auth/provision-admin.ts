import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { adminAccounts, authAccounts } from "@/server/db/schema/auth";

export const MIN_ADMIN_PASSWORD_LENGTH = 8;

export type AdminProvisioningInput = {
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
};

export type NormalizedAdminProvisioningInput = {
  email: string;
  name: string;
  password: string;
};

export type ProvisioningDatabase = Pick<
  ReturnType<typeof getDb>,
  "transaction"
>;

export function normalizeAdminProvisioningInput(
  input: AdminProvisioningInput,
): NormalizedAdminProvisioningInput {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("유효한 이메일을 입력해 주세요.");
  }
  if (!name) {
    throw new Error("관리자 이름을 입력해 주세요.");
  }
  if (input.password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(
      `비밀번호는 ${MIN_ADMIN_PASSWORD_LENGTH}자 이상이어야 합니다.`,
    );
  }
  if (input.password !== input.passwordConfirmation) {
    throw new Error("비밀번호 확인이 일치하지 않습니다.");
  }

  return { email, name, password: input.password };
}

export function createAdminAccountRows(input: {
  id: string;
  authAccountId: string;
  email: string;
  name: string;
  passwordHash: string;
}) {
  return {
    user: {
      id: input.id,
      email: input.email,
      name: input.name,
      role: "ADMIN",
      accountStatus: "ACTIVE",
    } satisfies typeof adminAccounts.$inferInsert,
    account: {
      id: input.authAccountId,
      accountId: input.id,
      providerId: "credential",
      userId: input.id,
      password: input.passwordHash,
    } satisfies typeof authAccounts.$inferInsert,
  };
}

export async function provisionAdminAccount(
  input: AdminProvisioningInput,
  database: ProvisioningDatabase = getDb(),
) {
  const normalized = normalizeAdminProvisioningInput(input);
  const passwordHash = await hashPassword(normalized.password);

  return database.transaction(async (transaction) => {
    const existing = await transaction
      .select({ id: adminAccounts.id })
      .from(adminAccounts)
      .where(eq(adminAccounts.email, normalized.email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("이미 존재하는 관리자 이메일입니다.");
    }

    const userId = randomUUID();
    const rows = createAdminAccountRows({
      id: userId,
      authAccountId: randomUUID(),
      email: normalized.email,
      name: normalized.name,
      passwordHash,
    });

    await transaction.insert(adminAccounts).values(rows.user);
    await transaction.insert(authAccounts).values(rows.account);

    return { id: userId, email: normalized.email, name: normalized.name };
  });
}
