import { describe, expect, it } from "vitest";

import { TRIGGER_BUTTON_CLASSNAME } from "@/components/public/MobileNavigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

describe("모바일 메뉴 트리거 클래스 상수", () => {
  it("ui/button의 outline/icon 변형과 동일하게 유지된다", () => {
    expect(TRIGGER_BUTTON_CLASSNAME).toBe(
      cn(buttonVariants({ variant: "outline", size: "icon" })),
    );
  });
});
