import { describe, expect, it } from "vitest";
import {
  canAttach,
  canIssueDownloadUrl,
  scanDocument,
  validateDocumentUpload,
} from "@/server/modules/assets/document-policy";

const policy = {
  allowedTypes: ["PDF", "DOCX"] as const,
  maxBytes: 5_000_000,
  productionApproved: true,
};

describe("공지 첨부 문서 정책", () => {
  it("PDF 매직 바이트를 확인하고 허용된 문서 형식만 통과시킨다", () => {
    expect(validateDocumentUpload({ buffer: Buffer.from("%PDF-1.7"), declaredMime: "application/pdf" }, policy)).toMatchObject({ detectedType: "PDF" });
    expect(() => validateDocumentUpload({ buffer: Buffer.from("PK\\x03\\x04"), declaredMime: "application/zip" }, policy)).toThrow("DOCUMENT_TYPE_NOT_ALLOWED");
  });

  it("검사 중 자산은 연결하지 않고 공개 상태와 READY를 함께 확인한다", () => {
    expect(canAttach({ status: "SCANNING" })).toBe(false);
    expect(canAttach({ status: "READY" })).toBe(true);
    expect(canIssueDownloadUrl({ noticePublished: false, assetReady: true })).toBe(false);
    expect(canIssueDownloadUrl({ noticePublished: true, assetReady: true })).toBe(true);
  });

  it("정상·악성·검사 실패를 각각 승격·거부·격리한다", async () => {
    const scanner = { scan: async () => ({ status: "CLEAN" as const }) };
    expect(await scanDocument({ objectKey: "key", checksumSha256: "hash", detectedMimeType: "application/pdf", timeoutMs: 1000 }, scanner)).toMatchObject({ status: "READY" });
    expect(await scanDocument({ objectKey: "key", checksumSha256: "hash", detectedMimeType: "application/pdf", timeoutMs: 1000 }, { scan: async () => ({ status: "REJECTED" as const, reasonCode: "MALWARE" }) })).toMatchObject({ status: "REJECTED" });
    expect(await scanDocument({ objectKey: "key", checksumSha256: "hash", detectedMimeType: "application/pdf", timeoutMs: 1000 }, { scan: async () => { throw new Error("SCAN_TIMEOUT"); } })).toMatchObject({ status: "QUARANTINED" });
  });
});
