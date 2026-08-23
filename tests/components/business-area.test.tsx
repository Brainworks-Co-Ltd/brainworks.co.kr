import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BusinessAreaCarousel from "@/components/home/BusinessAreaCarousel";

describe("홈 사업 영역", () => {
  it("사업 영역을 직접 선택하고 서비스 탐색 링크를 제공한다", () => {
    render(<BusinessAreaCarousel />);
    const tabs = screen.getAllByRole("button", { name: /사업 영역 보기|View/ });

    expect(tabs.length).toBeGreaterThanOrEqual(4);
    fireEvent.click(tabs[1]);
    expect(screen.getByRole("heading", { level: 3 })).toBeVisible();
    expect(
      screen.getByRole("link", { name: /전체 솔루션|View all solutions/ }),
    ).toHaveAttribute("href", expect.stringContaining("/services?area="));
  });
});
