export type StoredPublicationStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHED"
  | "UNPUBLISHED";

export type DisplayPublicationState =
  | "DRAFT"
  | "SCHEDULED"
  | "LIVE"
  | "ENDED"
  | "UNPUBLISHED";

export const displayPublicationLabel: Record<DisplayPublicationState, string> = {
  DRAFT: "초안",
  SCHEDULED: "게시 예약",
  LIVE: "게시 중",
  ENDED: "게시 종료",
  UNPUBLISHED: "게시 중단",
};

/**
 * 공지와 팝업의 관리자 표시 상태. 저장값은 그대로 두고 지금 시각과 게시 기간으로 정한다.
 * LIVE는 공개 노출 판정(effectiveNoticeVisibility)과 항상 같아야 한다.
 */
export function displayPublicationState(
  status: StoredPublicationStatus,
  startsAt: string | Date | null | undefined,
  endsAt: string | Date | null | undefined,
  now: Date = new Date(),
): DisplayPublicationState {
  if (status !== "SCHEDULED" && status !== "PUBLISHED") return status;
  if (endsAt && new Date(endsAt) <= now) return "ENDED";
  if (startsAt && new Date(startsAt) > now) return "SCHEDULED";
  return "LIVE";
}
