import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/router", () => ({
  useRouter: () => ({ asPath: "/about/honors", locale: "ko", push: vi.fn(), query: {} }),
}));
vi.mock("next/head", () => ({
  default: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: unknown; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : ""} alt={alt} />
  ),
}));
vi.mock("@/server/modules/honors/queries", () => ({
  getPublishedHonors: vi.fn(),
}));

import HonorsPage from "@/pages/about/honors";

// 페이지 props 타입은 정적 데이터(awardsData)에서 추론되므로 테스트 픽스처는 느슨한 타입으로 넘긴다.
const Page = HonorsPage as unknown as (props: {
  awards: unknown[];
  certifications: unknown[];
}) => ReactNode;

function renderHonors(awards: unknown[], certifications: unknown[]) {
  return render(<Page awards={awards} certifications={certifications} />);
}

const award = {
  slug: "award-1",
  year: 2026,
  date: "2026-06-24",
  title: { ko: "AI 공정 이상 탐지 대상" },
  org: { ko: "주최 기관" },
  description: { ko: "설명" },
  image: "/media/award.webp",
  imageAlt: { ko: "대상 상장 사진" },
  displayOrder: 1,
};

const certification = {
  slug: "cert-1",
  year: 2025,
  title: { ko: "기업부설연구소 인정" },
  org: { ko: "인정 기관" },
  description: { ko: "연구소 인정" },
  image: "",
  displayOrder: 1,
};

describe("수상 및 인증 공개 화면", () => {
  it("관리자가 입력한 대체 설명을 이미지 대체 텍스트로 쓴다", () => {
    renderHonors([award], []);
    expect(screen.getByAltText("대상 상장 사진")).toHaveAttribute(
      "src",
      "/media/award.webp",
    );
  });

  it("대체 설명이 비면 지금의 자동 문구를 쓴다", () => {
    renderHonors([{ ...award, imageAlt: { ko: "" } }], []);
    expect(
      screen.getByAltText("AI 공정 이상 탐지 대상 수상 이미지"),
    ).toBeInTheDocument();
  });

  it("이미지가 없는 인증은 빈 이미지 대신 연도 자리표시를 보여 준다", () => {
    renderHonors([], [certification]);
    const article = screen
      .getByRole("heading", { name: "기업부설연구소 인정" })
      .closest("article");
    expect(article?.querySelector("img")).toBeNull();
    expect(article?.firstElementChild).toHaveTextContent("2025");
  });
});
