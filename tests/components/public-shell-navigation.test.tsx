import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const push = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({ asPath: "/consulting", locale: "ko", push }),
}));

vi.mock("@/shared/routing/useLocale", () => ({
  useLocale: () => ({ language: "ko" }),
}));

describe("공개 셸 내비게이션", () => {
  beforeEach(() => push.mockReset());

  it("사업 영역을 열고 Escape로 닫은 뒤 초점을 복귀한다", async () => {
    const user = userEvent.setup();

    render(<Header />);

    const trigger = screen.getByRole("button", { name: "사업 영역" });
    await user.click(trigger);
    expect(screen.getByRole("link", { name: /AI 컨설팅/ })).toBeVisible();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("link", { name: /AI 컨설팅/ }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("Footer가 Header와 같은 세 그룹을 제공한다", () => {
    render(<Footer />);

    expect(screen.getByRole("heading", { name: "회사소개" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "사업 영역" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "소식" })).toBeVisible();
    expect(screen.getByRole("link", { name: "문의하기" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });
});
