import type { DocumentScannerPort } from "@/server/modules/assets/document-scanner-port";

export class UnconfiguredDocumentScanner implements DocumentScannerPort {
  async scan(): Promise<never> {
    throw new Error("DOCUMENT_SCANNER_UNCONFIGURED");
  }
}
