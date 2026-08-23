import { describe, expect, it } from "vitest";
import { assertPopupOverlapLimit } from "@/server/modules/popup-notices/domain";

describe("팝업 동시 노출 계약", () => {
  it("같은 로케일의 겹치는 공개 구간은 최대 3건이다", () => {
    const interval = { startsAt: "2026-08-24T00:00:00Z", endsAt: "2026-08-25T00:00:00Z" };
    expect(() => assertPopupOverlapLimit([interval, interval, interval])).not.toThrow();
    expect(() => assertPopupOverlapLimit([interval, interval, interval, interval])).toThrow("POPUP_OVERLAP_LIMIT");
  });
});
