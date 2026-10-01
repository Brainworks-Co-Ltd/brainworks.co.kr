import { describe, expect, it } from "vitest";
import {
  displayPublicationLabel,
  displayPublicationState,
  type StoredPublicationStatus,
} from "@/lib/publication-state";
import { effectiveNoticeVisibility } from "@/server/modules/notices/domain";

const now = new Date("2026-10-01T03:00:00.000Z");
const past = "2026-09-30T03:00:00.000Z";
const future = "2026-10-02T03:00:00.000Z";

describe("게시 표시 상태", () => {
  it.each([
    ["SCHEDULED", future, null, "SCHEDULED"],
    ["SCHEDULED", past, null, "LIVE"],
    ["SCHEDULED", null, null, "LIVE"],
    ["PUBLISHED", past, future, "LIVE"],
    ["PUBLISHED", null, null, "LIVE"],
    ["SCHEDULED", past, past, "ENDED"],
    ["PUBLISHED", past, past, "ENDED"],
    ["DRAFT", past, future, "DRAFT"],
    ["UNPUBLISHED", past, future, "UNPUBLISHED"],
  ] as const)("%s, 시작 %s, 종료 %s이면 %s", (status, startsAt, endsAt, expected) => {
    expect(displayPublicationState(status, startsAt, endsAt, now)).toBe(expected);
  });

  it("모든 조합에서 공개 노출 판정과 어긋나지 않는다", () => {
    const statuses: StoredPublicationStatus[] = [
      "DRAFT",
      "SCHEDULED",
      "PUBLISHED",
      "UNPUBLISHED",
    ];
    const times = [null, past, now.toISOString(), future];
    for (const status of statuses) {
      for (const startsAt of times) {
        for (const endsAt of times) {
          expect(
            displayPublicationState(status, startsAt, endsAt, now) === "LIVE",
            `${status} ${startsAt} ${endsAt}`,
          ).toBe(effectiveNoticeVisibility({ status, startsAt, endsAt }, now));
        }
      }
    }
  });

  it("표시 이름은 명세의 관리자 문구를 쓴다", () => {
    expect(displayPublicationLabel).toEqual({
      DRAFT: "초안",
      SCHEDULED: "게시 예약",
      LIVE: "게시 중",
      ENDED: "게시 종료",
      UNPUBLISHED: "게시 중단",
    });
  });
});
