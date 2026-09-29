import { HttpError } from "@/server/http/errors";
import type { DocumentScanResult, DocumentScannerPort } from "@/server/modules/assets/document-scanner-port";

export type DocumentType = "PDF" | "DOCX";
export type DocumentUploadPolicy = {
  allowedTypes: readonly DocumentType[];
  maxBytes: number;
  productionApproved: boolean;
};

function detectDocumentType(buffer: Buffer, declaredMime: string): DocumentType | null {
  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") return "PDF";
  if (declaredMime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && buffer.subarray(0, 2).toString("ascii") === "PK") return "DOCX";
  return null;
}

export function validateDocumentUpload(input: { buffer: Buffer; declaredMime: string }, policy: DocumentUploadPolicy) {
  if (!policy.productionApproved || input.buffer.length <= 0 || input.buffer.length > policy.maxBytes) throw new HttpError("DOCUMENT_TYPE_NOT_ALLOWED");
  const detectedType = detectDocumentType(input.buffer, input.declaredMime);
  if (!detectedType || !policy.allowedTypes.includes(detectedType)) throw new HttpError("DOCUMENT_TYPE_NOT_ALLOWED");
  return { detectedType, bytes: input.buffer.length };
}

export function canAttach(asset: { status: string }) {
  return asset.status === "READY";
}

export function canIssueDownloadUrl(input: { noticePublished: boolean; assetReady: boolean }) {
  return input.noticePublished && input.assetReady;
}

export async function scanDocument(input: Parameters<DocumentScannerPort["scan"]>[0], scanner: DocumentScannerPort): Promise<{ status: "READY" | "REJECTED" | "QUARANTINED"; reasonCode?: string }> {
  let result: DocumentScanResult;
  try {
    result = await scanner.scan(input);
  } catch (error) {
    return { status: "QUARANTINED", reasonCode: error instanceof Error ? error.message : "SCAN_FAILED" };
  }
  return result.status === "CLEAN" ? { status: "READY" } : { status: "REJECTED", reasonCode: result.reasonCode };
}
