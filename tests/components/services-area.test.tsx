import { describe, expect, it } from "vitest";
import { getRouteKey } from "@/shared/routing/routes";
import { getActiveNavigationGroup } from "@/shared/navigation/publicNavigation";

describe("사업 영역 상세 라우트", () => {
  it("국문과 영문 상세 경로 모두 solutions.detail로 판정한다", () => {
    expect(getRouteKey("/services/manufacturing")).toBe("solutions.detail");
    expect(getRouteKey("/en/services/manufacturing")).toBe("solutions.detail");
  });

  it("사업 영역 상세는 사업 영역 내비게이션 그룹을 활성 상태로 만든다", () => {
    expect(getActiveNavigationGroup("solutions.detail")).toBe("business");
  });
});
