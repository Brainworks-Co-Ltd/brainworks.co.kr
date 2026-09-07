type AdminErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class AdminApiError extends Error {
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message || code);
    this.name = "AdminApiError";
    this.code = code;
  }
}

const messageByCode: Record<string, string> = {
  VERSION_CONFLICT:
    "다른 관리자 작업으로 내용이 변경되었습니다. 페이지를 새로고침한 뒤 다시 저장해 주세요.",
  PUBLICATION_INVALID:
    "게시할 언어의 필수 내용을 확인한 뒤 다시 시도해 주세요.",
  POPUP_OVERLAP_LIMIT:
    "같은 언어로 노출되는 팝업이 이미 3개입니다. 게시 기간을 조정하거나 기존 팝업의 게시를 중단해 주세요.",
  UNAUTHORIZED:
    "관리자 세션이 만료되었습니다. 로그인한 뒤 다시 시도해 주세요.",
  FORBIDDEN: "이 작업을 수행할 권한이 없습니다.",
  NOT_FOUND: "대상을 찾을 수 없습니다. 목록을 새로고침해 주세요.",
  DEPENDENCY_UNAVAILABLE:
    "연결된 서비스가 준비되지 않았습니다. 잠시 뒤 다시 시도해 주세요.",
  RATE_LIMITED: "요청이 많습니다. 잠시 뒤 다시 시도해 주세요.",
};

export function adminApiErrorMessage(error: unknown) {
  const code =
    error instanceof AdminApiError
      ? error.code
      : typeof error === "string"
        ? error
        : "INTERNAL_ERROR";

  return (
    messageByCode[code] ||
    "요청을 처리하지 못했습니다. 입력 내용을 유지한 채 다시 시도해 주세요."
  );
}

export async function requestAdminApi<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("X-Brainworks-Request", "admin");

  const response = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers,
  });
  const payload = (await response
    .json()
    .catch(() => ({}))) as AdminErrorPayload & { data?: T };

  if (!response.ok) {
    throw new AdminApiError(
      payload.error?.code || "INTERNAL_ERROR",
      payload.error?.message,
    );
  }

  return payload.data as T;
}
