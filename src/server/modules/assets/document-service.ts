import { createHash, randomUUID } from "node:crypto";
import type { DocumentScannerPort } from "@/server/modules/assets/document-scanner-port";
import { scanDocument, validateDocumentUpload, type DocumentUploadPolicy } from "@/server/modules/assets/document-policy";
import type { PrivateObjectStorage } from "@/server/modules/assets/storage-port";

export class DocumentService {
  constructor(private readonly dependencies: { storage: PrivateObjectStorage; scanner: DocumentScannerPort; policy: DocumentUploadPolicy; scanTimeoutMs?: number }) {}

  async upload(input: { buffer: Buffer; filename: string; declaredMime: string }, actorId: string) {
    const validated = validateDocumentUpload(input, this.dependencies.policy);
    const assetId = randomUUID();
    const checksumSha256 = createHash("sha256").update(input.buffer).digest("hex");
    const objectKey = `documents/quarantine/${assetId}`;
    await this.dependencies.storage.put(objectKey, input.buffer, input.declaredMime);
    const scan = await scanDocument({ objectKey, checksumSha256, detectedMimeType: input.declaredMime, timeoutMs: this.dependencies.scanTimeoutMs ?? 30_000 }, this.dependencies.scanner);
    return { id: assetId, assetType: "DOCUMENT" as const, status: scan.status, storageKey: objectKey, originalFilename: input.filename, declaredMime: input.declaredMime, detectedType: validated.detectedType, bytes: input.buffer.length, checksumSha256, scanErrorCode: scan.reasonCode, createdByActorId: actorId };
  }
}
