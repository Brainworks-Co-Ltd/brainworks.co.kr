import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));
vi.mock("@/shared/routing/useLocale", () => ({
  useLocale: () => ({ language: "ko" }),
}));

import NewsRail from "@/components/home/NewsRail";

// NewsRail의 items 기본값이 [] 라서 props 타입이 never[]로 추론된다. 픽스처는 느슨한 타입으로 넘긴다.
const Rail = NewsRail as unknown as (props: { items: unknown[] }) => ReactNode;

describe("홈 뉴스 영역", () => {
  it("대표 이미지가 없는 기사는 빈 이미지 대신 자리표시를 보여 준다", () => {
    const { container } = render(
      <Rail
        items={[
          {
            slug: "no-cover",
            category: "COMPANY",
            title: "표지 없는 기사",
            date: "2026-10-01",
            thumbnail: "",
          },
          {
            slug: "with-cover",
            category: "COMPANY",
            title: "표지 있는 기사",
            date: "2026-09-30",
            thumbnail: "/media/cover.webp",
          },
        ]}
      />,
    );

    expect(screen.getByText("이미지 없음")).toBeInTheDocument();
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute("src", "/media/cover.webp");
  });
});
