import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import type { ReactNode } from "react";

vi.mock("next/router", () => ({
  useRouter: () => ({ asPath: "/404", locale: "ko", push: vi.fn() }),
}));

vi.mock("@/shared/routing/useLocale", () => ({
  useLocale: () => ({ language: "ko" }),
}));

vi.mock("next/head", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));

import NotFoundPage from "@/pages/404";
import ServerErrorPage from "@/pages/500";

describe("오류 페이지", () => {
  it("404는 안내 문구와 홈 링크를 가진 main 랜드마크를 렌더한다", () => {
    render(<NotFoundPage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "요청하신 페이지를 찾을 수 없습니다",
    );
    expect(screen.getByRole("link", { name: /홈으로/ })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      document.querySelector('link[rel="canonical"]'),
    ).not.toBeInTheDocument();
  });

  it("500은 일시 오류 안내를 렌더한다", () => {
    render(<ServerErrorPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "일시적인 오류가 발생했습니다",
    );
    expect(
      document.querySelector('link[rel="canonical"]'),
    ).not.toBeInTheDocument();
  });
});
