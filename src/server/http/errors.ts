export const errorCodes = [
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VERSION_CONFLICT",
  "PUBLICATION_INVALID",
  "POPUP_OVERLAP_LIMIT",
  "POPUP_TITLE_REQUIRED",
  "POPUP_IMAGE_ALT_REQUIRED",
  "NOTICE_CATEGORY_LOCALE_REQUIRED",
  "DOCUMENT_TYPE_NOT_ALLOWED",
  "RATE_LIMITED",
  "DEPENDENCY_UNAVAILABLE",
  "INTERNAL_ERROR",
] as const;

export type ErrorCode = (typeof errorCodes)[number];

const statusByCode: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VERSION_CONFLICT: 409,
  PUBLICATION_INVALID: 422,
  POPUP_OVERLAP_LIMIT: 409,
  POPUP_TITLE_REQUIRED: 422,
  POPUP_IMAGE_ALT_REQUIRED: 422,
  NOTICE_CATEGORY_LOCALE_REQUIRED: 422,
  DOCUMENT_TYPE_NOT_ALLOWED: 422,
  RATE_LIMITED: 429,
  DEPENDENCY_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export class HttpError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, message = code) {
    super(message);
    this.name = "HttpError";
    this.code = code;
    this.status = statusByCode[code];
  }
}

export function toPublicError(error: unknown) {
  if (error instanceof HttpError) {
    return { code: error.code, message: error.message };
  }

  return {
    code: "INTERNAL_ERROR" as const,
    message: "요청을 처리하지 못했습니다.",
  };
}
