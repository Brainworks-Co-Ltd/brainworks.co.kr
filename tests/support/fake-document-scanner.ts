import type { DocumentScannerPort } from "@/server/modules/assets/document-scanner-port";

export function fakeCleanScanner(): DocumentScannerPort {
  return { scan: async () => ({ status: "CLEAN" }) };
}

export function fakeRejectedScanner(reasonCode = "MALWARE"): DocumentScannerPort {
  return { scan: async () => ({ status: "REJECTED", reasonCode }) };
}

export function fakeTimeoutScanner(): DocumentScannerPort {
  return { scan: async () => { throw new Error("SCAN_TIMEOUT"); } };
}
