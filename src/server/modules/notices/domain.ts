import { HttpError } from "@/server/http/errors";
export function effectiveNoticeVisibility(
  input: { status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "UNPUBLISHED"; startsAt?: string | Date | null; endsAt?: string | Date | null },
  now = new Date(),
) {
  if (input.status !== "SCHEDULED" && input.status !== "PUBLISHED") return false;
  const startsAt = input.startsAt ? new Date(input.startsAt) : null;
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;
  return (!startsAt || startsAt <= now) && (!endsAt || endsAt > now);
}

export function resolvePopupDetailUrl(
  popup: { noticePublicNumber?: number | null },
  notice: { isPublished: boolean } | null,
) {
  if (!popup.noticePublicNumber || !notice?.isPublished) return null;
  return `/notices/${popup.noticePublicNumber}`;
}

export function validatePopupLocale(input: { title?: string; imageAssetId?: string | null; imageAlt?: string | null }) {
  if (!input.title?.trim()) return { valid: false, code: "POPUP_TITLE_REQUIRED" as const };
  if (input.imageAssetId && !input.imageAlt?.trim()) return { valid: false, code: "POPUP_IMAGE_ALT_REQUIRED" as const };
  return { valid: true as const };
}

export function renotify(input: { revision: number; expectedVersion: number }) {
  return { revision: input.revision + 1, version: input.expectedVersion + 1 };
}

/** 게시 종료는 시작보다 늦어야 한다. 시작이 비면 비교할 기준이 없으므로 통과시킨다. */
export function assertPublicationWindow(startsAt: Date | null, endsAt: Date | null) {
  if (startsAt && endsAt && endsAt.getTime() <= startsAt.getTime()) {
    throw new HttpError("PUBLICATION_WINDOW_INVALID");
  }
}
