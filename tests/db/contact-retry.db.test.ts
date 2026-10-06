import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { contactSubmissionReceipts } from "@/server/db/schema/contact";
import { submitContact } from "@/server/modules/contact/service";
import type { MailPort } from "@/server/modules/contact/mail-port";
import { hasTestDatabase } from "./setup";

const origin = "http://localhost:3000";

function contactInput(requestId: string) {
  return {
    requestId,
    locale: "ko" as const,
    topic: "solution" as const,
    area: null,
    name: "재시도 테스트",
    email: "retry@example.com",
    company: "",
    message: "메일 발송 실패 뒤 다시 보내는 문의입니다.",
    privacyAccepted: true as const,
    website: "",
  };
}

async function receiptStatuses() {
  return getDb()
    .select({ status: contactSubmissionReceipts.processingStatus })
    .from(contactSubmissionReceipts);
}

describe.skipIf(!hasTestDatabase)("문의 메일 발송 실패 뒤 재시도", () => {
  beforeAll(() => {
    process.env.APP_ORIGIN = origin;
  });

  it("같은 요청 번호로 다시 보내면 메일을 실제로 다시 보내고 완료로 바꾼다", async () => {
    const send = vi
      .fn<MailPort["send"]>()
      .mockRejectedValueOnce(new Error("SMTP down"))
      .mockResolvedValueOnce(undefined);
    const mail: MailPort = { send };
    const requestId = randomUUID();
    const options = { origin, ipAddress: "10.0.0.1", mail, recipient: "to@example.com" };

    await expect(submitContact(contactInput(requestId), options)).rejects.toMatchObject({
      code: "DEPENDENCY_UNAVAILABLE",
    });
    const retried = await submitContact(contactInput(requestId), options);

    expect(retried).toEqual({ accepted: true, duplicate: false });
    expect(send).toHaveBeenCalledTimes(2);
    const statuses = (await receiptStatuses()).map((row) => row.status);
    expect(statuses).toContain("COMPLETED");
    expect(statuses).not.toContain("FAILED");
  });

  it("이미 보낸 문의를 다시 보내면 메일을 또 보내지 않는다", async () => {
    const send = vi.fn<MailPort["send"]>().mockResolvedValue(undefined);
    const mail: MailPort = { send };
    const requestId = randomUUID();
    const options = { origin, ipAddress: "10.0.0.2", mail, recipient: "to@example.com" };

    await submitContact(contactInput(requestId), options);
    const second = await submitContact(contactInput(requestId), options);

    expect(second).toEqual({ accepted: true, duplicate: true });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("재시도도 실패하면 다시 실패로 남아 운영 현황에서 셀 수 있다", async () => {
    const send = vi.fn<MailPort["send"]>().mockRejectedValue(new Error("SMTP down"));
    const mail: MailPort = { send };
    const requestId = randomUUID();
    const options = { origin, ipAddress: "10.0.0.3", mail, recipient: "to@example.com" };

    await expect(submitContact(contactInput(requestId), options)).rejects.toThrow();
    await expect(submitContact(contactInput(requestId), options)).rejects.toThrow();

    expect(send).toHaveBeenCalledTimes(2);
    const [row] = await getDb()
      .select({ status: contactSubmissionReceipts.processingStatus })
      .from(contactSubmissionReceipts)
      .where(eq(contactSubmissionReceipts.processingStatus, "FAILED"));
    expect(row?.status).toBe("FAILED");
  });
});
