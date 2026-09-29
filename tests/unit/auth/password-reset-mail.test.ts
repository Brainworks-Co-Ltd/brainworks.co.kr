import { afterEach, describe, expect, it, vi } from "vitest";
import { createPasswordResetMailPort } from "@/server/infrastructure/password-reset-mail";

describe("비밀번호 재설정 메일 포트", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("운영 환경에서 메일 설정이 없어도 만들어지고 보낼 때만 실패한다", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("SMTP_FROM", "");

    const port = createPasswordResetMailPort();

    await expect(
      port.sendPasswordReset({ to: "admin@example.com", url: "https://example.com/reset" }),
    ).rejects.toMatchObject({ code: "DEPENDENCY_UNAVAILABLE" });
  });
});
