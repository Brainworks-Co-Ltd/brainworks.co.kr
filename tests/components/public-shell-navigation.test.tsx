import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MobileNavigation } from "@/components/public/MobileNavigation";
import { buildPublicNavigation } from "@/shared/navigation/publicNavigation";

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
    expect(screen.queryByText("전략부터 구축·확산까지")).not.toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("link", { name: /AI 컨설팅/ }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("데스크톱 그룹 메뉴는 트리거에 호버하면 열린다", async () => {
    const user = userEvent.setup();

    render(<Header />);

    await user.hover(screen.getByRole("button", { name: "회사소개" }));
    expect(screen.getByRole("region", { name: "회사소개 하위 메뉴" })).toBeVisible();

    await user.hover(screen.getByRole("button", { name: "사업 영역" }));
    expect(screen.getByRole("region", { name: "사업 영역 하위 메뉴" })).toBeVisible();

    await user.hover(screen.getByRole("button", { name: "소식" }));
    expect(screen.getByRole("region", { name: "소식 하위 메뉴" })).toBeVisible();
  });

  it("사업 영역 메뉴가 네 서비스를 같은 높이로 제공한다", async () => {
    const user = userEvent.setup();

    render(<Header />);

    await user.click(screen.getByRole("button", { name: "사업 영역" }));

    expect(
      screen.getByRole("region", { name: "사업 영역 하위 메뉴" }),
    ).toBeVisible();
    /* 네 서비스가 모두 최상위 링크로 존재한다 */
    expect(screen.getByRole("link", { name: "AI 솔루션" })).toHaveAttribute(
      "href",
      "/services",
    );
    expect(screen.getByRole("link", { name: "AI 컨설팅" })).toHaveAttribute(
      "href",
      "/consulting",
    );
    expect(screen.getByRole("link", { name: "AI 전문교육" })).toHaveAttribute(
      "href",
      "/education",
    );
    expect(
      screen.getByRole("link", { name: "글로벌 프로그램" }),
    ).toHaveAttribute("href", "/global-programs");
  });

  it("사업 영역 넷은 AI 솔루션 아래에만 붙는다", async () => {
    const user = userEvent.setup();

    render(<Header />);
    await user.click(screen.getByRole("button", { name: "사업 영역" }));

    expect(
      screen.getByRole("link", { name: "sLLM base AI Agent" }),
    ).toHaveAttribute("href", "/services?area=agent#business-areas");
    expect(
      screen.getByRole("link", { name: "Manufacturing AI" }),
    ).toHaveAttribute("href", "/services?area=manufacturing#business-areas");
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

  it("모바일 메뉴 트리거는 초기 렌더에 존재한다 (SSR 등가)", () => {
    render(
      <MobileNavigation
        items={buildPublicNavigation("ko")}
        open={false}
        onOpenChange={vi.fn()}
        activeGroup="business"
        routeKey="consulting"
        menuLabel="메뉴 열기"
        navigationLabel="모바일 메뉴"
        languageLabel="English"
        onLanguageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "메뉴 열기" }),
    ).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("모바일 메뉴는 같은 계층을 이미지 없이 제공한다", async () => {
    const user = userEvent.setup();

    render(
      <MobileNavigation
        items={buildPublicNavigation("ko")}
        open
        onOpenChange={vi.fn()}
        activeGroup="business"
        routeKey="consulting"
        menuLabel="메뉴 열기"
        navigationLabel="모바일 메뉴"
        languageLabel="English"
        onLanguageChange={vi.fn()}
      />,
    );

    const businessToggle = await screen.findByRole("button", {
      name: "사업 영역",
    });
    expect(businessToggle).toHaveAttribute("aria-expanded", "false");

    await user.click(businessToggle);

    expect(screen.getByRole("link", { name: "AI 컨설팅" })).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
