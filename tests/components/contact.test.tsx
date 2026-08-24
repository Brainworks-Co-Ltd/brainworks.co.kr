import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/router", () => ({
  useRouter: () => ({
    asPath: "/contact",
    isReady: true,
    locale: "ko",
    push: vi.fn(),
    query: {},
  }),
}));

import Contact from "@/pages/contact";

describe("문의 페이지 폼", () => {
  it("대체 연락처 없이 문의 목적 선택과 단계별 폼 위계를 제공한다", () => {
    render(<Contact />);

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(screen.queryByText(/대체 연락처/)).not.toBeInTheDocument();
    expect(screen.queryByText(/대표 이메일/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "문의 내용을 남겨주세요." }),
    ).toBeVisible();
    expect(screen.getByRole("radio", { name: "AI 솔루션" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "AI 컨설팅" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "연락처 정보" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "문의 내용" })).toBeVisible();
  });
});
