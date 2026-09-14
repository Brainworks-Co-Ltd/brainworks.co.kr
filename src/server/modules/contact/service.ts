import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { contactSubmissionReceipts } from "@/server/db/schema/contact";
import { HttpError } from "@/server/http/errors";
import { contactInputSchema, type ContactInput } from "@/shared/schemas/contact";
import type { MailPort } from "@/server/modules/contact/mail-port";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function assertOrigin(origin: string | undefined) {
  const expected = process.env.APP_ORIGIN;
  if (!expected || !origin || origin !== expected) throw new HttpError("FORBIDDEN");
}

function assertRateLimit(ipAddress: string) {
  const now = Date.now();
  const current = attempts.get(ipAddress);
  if (!current || current.resetAt <= now) { attempts.set(ipAddress, { count: 1, resetAt: now + WINDOW_MS }); return; }
  if (current.count >= MAX_ATTEMPTS) throw new HttpError("RATE_LIMITED");
  current.count += 1;
}

function hashRequestId(requestId: string) { return createHash("sha256").update(requestId).digest("hex"); }

function mailMessage(input: ContactInput, recipient: string): { to: string; subject: string; text: string; replyTo: string } {
  const topicLabels = { solution: "AI 솔루션", consulting: "AI 컨설팅", education: "AI 전문교육", global: "글로벌 프로그램", other: "기타" };
  return { to: recipient, subject: `[브레인웍스 문의] ${topicLabels[input.topic]}`, replyTo: input.email, text: [`문의 목적: ${topicLabels[input.topic]}`, `사업 영역: ${input.area || "없음"}`, `이름: ${input.name}`, `이메일: ${input.email}`, `회사명: ${input.company || "없음"}`, "", input.message].join("\n") };
}

export async function submitContact(input: ContactInput, options: { origin?: string; ipAddress: string; mail: MailPort; recipient: string }) {
  const parsed = contactInputSchema.safeParse(input);
  if (!parsed.success) throw new HttpError("BAD_REQUEST");
  assertOrigin(options.origin);
  assertRateLimit(options.ipAddress);
  if (parsed.data.website) return { accepted: true };
  const requestIdHash = hashRequestId(parsed.data.requestId);
  const db = getDb();
  const existing = await db.select({ id: contactSubmissionReceipts.id, status: contactSubmissionReceipts.processingStatus }).from(contactSubmissionReceipts).where(eq(contactSubmissionReceipts.requestIdHash, requestIdHash)).limit(1);
  if (existing[0]) return { accepted: true, duplicate: true };
  const [receipt] = await db.insert(contactSubmissionReceipts).values({ requestIdHash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }).returning({ id: contactSubmissionReceipts.id });
  try {
    await options.mail.send(mailMessage(parsed.data, options.recipient));
    await db.update(contactSubmissionReceipts).set({ processingStatus: "COMPLETED" }).where(eq(contactSubmissionReceipts.id, receipt.id));
    return { accepted: true, duplicate: false };
  } catch {
    await db.update(contactSubmissionReceipts).set({ processingStatus: "FAILED" }).where(eq(contactSubmissionReceipts.id, receipt.id));
    throw new HttpError("DEPENDENCY_UNAVAILABLE");
  }
}
