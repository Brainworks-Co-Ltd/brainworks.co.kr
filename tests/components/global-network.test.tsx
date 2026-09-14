import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GlobalNetwork } from "@/components/public/GlobalNetwork";

describe("글로벌 국가 네트워크", () => {
  it.each([
    ["ko", "Korea 10개사"],
    ["en", "Korea 10 company"],
  ])("원본 지도 국내 10개사 정보를 %s 화면에 유지한다", (language, text) => {
    render(<GlobalNetwork language={language} />);
    const domesticNetwork = screen.getByText(text);
    expect(domesticNetwork).toBeVisible();
    expect(domesticNetwork.closest('[aria-hidden="true"]')).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(8);
  });

  it("기존 여덟 국가와 개수를 보존하고 선택한 국가를 강조한다", async () => {
    const user = userEvent.setup();
    render(<GlobalNetwork language="ko" />);
    const labels = [
      "U.S.A. 1",
      "Qatar 1",
      "Vietnam 4",
      "Poland 1",
      "Indonesia 3",
      "Australia 1",
      "Uzbekistan 8",
      "Singapore 1",
    ];
    expect(screen.getAllByRole("button")).toHaveLength(labels.length);
    for (const name of labels)
      expect(screen.getByRole("button", { name })).toBeVisible();
    const first = screen.getByRole("button", { name: "U.S.A. 1" });
    const target = screen.getByRole("button", { name: "Uzbekistan 8" });
    expect(first).toHaveAttribute("aria-pressed", "true");
    await user.click(target);
    expect(first).toHaveAttribute("aria-pressed", "false");
    expect(target).toHaveAttribute("aria-pressed", "true");
  });

  it("키보드로 국가를 선택할 수 있다", async () => {
    const user = userEvent.setup();
    render(<GlobalNetwork language="en" />);
    await user.tab();
    await user.tab();
    const target = screen.getByRole("button", { name: "Qatar 1" });
    expect(target).toHaveFocus();
    await user.keyboard(" ");
    expect(target).toHaveAttribute("aria-pressed", "true");
  });

  it("시간이 지나도 국가를 자동 전환하지 않는다", () => {
    vi.useFakeTimers();
    try {
      render(<GlobalNetwork language="ko" />);
      act(() => vi.advanceTimersByTime(30000));
      expect(screen.getByRole("button", { name: "U.S.A. 1" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
