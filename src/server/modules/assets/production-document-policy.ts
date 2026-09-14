import type { DocumentUploadPolicy } from "@/server/modules/assets/document-policy";

// 회사가 허용 형식·크기·검사 제공자를 확정하기 전에는 운영 업로드를 열지 않습니다.
export const productionDocumentPolicy: DocumentUploadPolicy = {
  allowedTypes: [],
  maxBytes: 0,
  productionApproved: false,
};
