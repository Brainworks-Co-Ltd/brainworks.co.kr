import { HttpError } from "@/server/http/errors";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function assertImageUploadMetadata(input: {
  mimeType: string;
  bytes: number;
}) {
  if (
    !allowedImageTypes.has(input.mimeType) ||
    !Number.isInteger(input.bytes) ||
    input.bytes <= 0 ||
    input.bytes > MAX_IMAGE_BYTES
  ) {
    throw new HttpError("BAD_REQUEST");
  }
}

export function isAllowedImageMimeType(mimeType: string) {
  return allowedImageTypes.has(mimeType);
}

export const imageUploadLimits = { maxBytes: MAX_IMAGE_BYTES };
