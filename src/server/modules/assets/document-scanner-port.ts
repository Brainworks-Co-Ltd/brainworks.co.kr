export type DocumentScanResult =
  | { status: "CLEAN" }
  | { status: "REJECTED"; reasonCode: string };

export interface DocumentScannerPort {
  scan(input: {
    objectKey: string;
    checksumSha256: string;
    detectedMimeType: string;
    timeoutMs: number;
  }): Promise<DocumentScanResult>;
}
