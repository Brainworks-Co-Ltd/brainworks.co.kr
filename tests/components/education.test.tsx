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
  it("FAQ를 모달형 컨테이너와 일관된 내부 여백으로 제공한다", () => {
    render(<Education />);

    const question = screen.getByText("교육은 어떤 방식으로 진행되나요?");
    const faqPanel = question.closest("div");
    const faqItem = question.closest("details");

    expect(faqPanel).toHaveClass(
      "mt-6",
      "rounded-[var(--bw-radius-feature)]",
      "shadow-[var(--bw-shadow-soft)]",
    );
    expect(faqItem).toHaveClass("px-6", "md:px-8");
  });
});
