import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Education from "@/pages/education";

vi.mock("next/router", () => ({
  useRouter: () => ({
    asPath: "/education",
    locale: "ko",
    push: vi.fn(),
    query: {},
  }),
}));

describe("AI 전문교육 FAQ", () => {
  it("FAQ를 가운데 정렬된 네이티브 details/summary 아코디언으로 제공한다", () => {
    render(<Education />);

    const question = screen.getByText("교육은 어떤 방식으로 진행되나요?");
    const faqPanel = question.closest("div");
    const faqItem = question.closest("details");

    expect(faqPanel).toHaveClass("mx-auto", "max-w-[860px]");
    expect(faqItem).toHaveClass("group", "border-b", "border-line");
  });
});
