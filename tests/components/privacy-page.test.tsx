import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

vi.mock("next/router", () => ({
  useRouter: () => ({ asPath: "/privacy", locale: "ko", push: vi.fn() }),
}));

vi.mock("next/head", () => ({
  default: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

import PrivacyPolicy from "@/pages/privacy";

const sectionHeadings = [
  "1. 개인정보의 처리 목적",
  "2. 처리하는 개인정보 항목",
  "3. 개인정보의 보유 및 이용 기간",
  "4. 개인정보의 제3자 제공",
  "5. 개인정보 처리의 위탁",
  "6. 정보주체의 권리와 행사 방법",
  "7. 개인정보의 파기 절차 및 방법",
  "8. 개인정보의 안전성 확보 조치",
  "9. 개인정보 보호책임자",
  "10. 시행일",
];

describe("개인정보 처리방침 페이지", () => {
  it("초안 배너를 노출한다", () => {
    render(<PrivacyPolicy />);
    expect(
      screen.getByText(
        "이 문서는 회사 검토 전 초안입니다. 시행일과 책임자 정보는 확인 후 확정합니다.",
      ),
    ).toBeVisible();
  });

  it("h1은 하나만 렌더한다", () => {
    render(<PrivacyPolicy />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("개인정보 보호법 제30조 필수 절 제목을 모두 포함한다", () => {
    render(<PrivacyPolicy />);
    for (const heading of sectionHeadings) {
      expect(
        screen.getByRole("heading", { level: 2, name: heading }),
      ).toBeVisible();
    }
  });
});
