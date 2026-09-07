import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { getDb } from "@/server/db/client";
import {
  adminAccounts,
  adminSessions,
  authAccounts,
  authVerifications,
} from "@/server/db/schema/auth";
import { createPasswordResetMailPort } from "@/server/infrastructure/password-reset-mail";

const DEFAULT_APP_ORIGIN = "http://localhost:3000";

export function getAppOrigin(appOrigin = process.env.APP_ORIGIN) {
  return (appOrigin || DEFAULT_APP_ORIGIN).replace(/\/+$/, "");
}

export function getAuthBaseURL(appOrigin = process.env.APP_ORIGIN) {
  return `${getAppOrigin(appOrigin)}/api/auth`;
}

export function getAuthAdvancedOptions() {
  return { skipTrailingSlashes: true } as const;
}

function createAuth() {
  const passwordResetMailPort = createPasswordResetMailPort();
  return betterAuth({
    baseURL: getAuthBaseURL(),
    trustedOrigins: [getAppOrigin()],
    advanced: getAuthAdvancedOptions(),
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        user: adminAccounts,
        session: adminSessions,
        account: authAccounts,
        verification: authVerifications,
      },
      transaction: true,
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await passwordResetMailPort.sendPasswordReset({ to: user.email, url });
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "ADMIN",
          input: false,
        },
        accountStatus: {
          type: "string",
          required: true,
          defaultValue: "ACTIVE",
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({
            data: {
              ...user,
              role: "ADMIN",
              accountStatus: "ACTIVE",
            },
          }),
        },
        delete: {
          before: async () => false,
        },
      },
    },
  });
}

type AuthInstance = ReturnType<typeof createAuth>;
let authInstance: AuthInstance | undefined;

export function getAuth(): AuthInstance {
  if (!authInstance) {
    authInstance = createAuth();
  }
  return authInstance;
}
