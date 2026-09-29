import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DetailSectionHead from "@/components/public/DetailSectionHead";
import ProcessSteps from "@/components/public/ProcessSteps";

describe("DetailSectionHead", () => {
  it("눈썹 없이도 제목을 그린다", () => {
    const { container } = render(<DetailSectionHead title="도입 절차" />);

    expect(screen.getByRole("heading", { name: "도입 절차" })).toBeVisible();
    expect(
      container.querySelector(".text-accent-text"),
    ).not.toBeInTheDocument();
  });

  it("눈썹이 있으면 제목 위에 그린다", () => {
    render(<DetailSectionHead eyebrow="PROCESS" title="도입 절차" />);

    expect(screen.getByText("PROCESS")).toBeVisible();
    expect(screen.getByRole("heading", { name: "도입 절차" })).toBeVisible();
  });
});

describe("ProcessSteps", () => {
  const steps = [
    { title: "상담 신청", desc: "요구 사항을 듣습니다" },
    { title: "진단", desc: "현황을 분석합니다" },
    { title: "제안", desc: "방안을 제시합니다" },
    { title: "실행", desc: "계획을 실행합니다" },
  ];

  it("단계 수만큼 STEP 라벨과 제목, 설명을 모두 그린다", () => {
    render(<ProcessSteps steps={steps} />);

    steps.forEach((step, index) => {
      const label = `STEP ${String(index + 1).padStart(2, "0")}`;
      expect(screen.getByText(label)).toBeVisible();
      expect(screen.getByText(step.title)).toBeVisible();
      expect(screen.getByText(step.desc)).toBeVisible();
    });
  });
});
