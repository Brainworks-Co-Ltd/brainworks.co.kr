import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { PageHero } from "@/components/public/PageHero";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("PageHero", () => {
  it("미디어가 없으면 요청 변형과 무관하게 plain으로 대체한다", () => {
    render(<PageHero variant="media" title="AI 컨설팅" description="설명" />);

    expect(screen.getByRole("region", { name: "AI 컨설팅" })).toHaveAttribute(
      "data-variant",
      "plain",
    );
  });

  it("split 변형은 이미지와 본문을 함께 제공한다", () => {
    render(
      <PageHero
        variant="split"
        title="CEO 메시지"
        media={{ kind: "image", src: "/ceo.jpg", alt: "CEO 사진" }}
      />,
    );

    expect(screen.getByRole("region", { name: "CEO 메시지" })).toHaveAttribute(
      "data-variant",
      "split",
    );
    expect(screen.getByRole("img", { name: "CEO 사진" })).toHaveAttribute(
      "src",
      "/ceo.jpg",
    );
  });

  it("이미지 실패 시 텍스트를 유지하고 대체 표면을 표시한다", () => {
    render(
      <PageHero
        variant="media"
        title="AI 전문교육"
        media={{ kind: "image", src: "/missing.jpg", alt: "교육 현장" }}
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "교육 현장" }));

    expect(screen.getByRole("heading", { name: "AI 전문교육" })).toBeVisible();
    expect(screen.getByText("미디어를 표시할 수 없습니다.")).toBeVisible();
  });
});
