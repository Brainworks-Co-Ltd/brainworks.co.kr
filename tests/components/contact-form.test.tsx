import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: { topic: "solution", area: "manufacturing" },
    locale: "ko",
    pathname: "/contact",
    asPath: "/contact",
    isReady: true,
  }),
}));

import ContactPage from "@/pages/contact";
import { getLocalizedBusinessAreas } from "@/data/businessAreas";

describe("문의 폼", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("필수 입력이 비면 서버로 보내지 않고 필드 오류를 보여준다", async () => {
    render(<ContactPage />);

    // 문의 목적은 쿼리로 채워지므로 개인정보 동의만 마저 채우고
    // 이름/이메일/문의 내용을 비운 채 제출한다.
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /보내기|문의/ }));

    await waitFor(() =>
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0),
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("사업 영역 식별자 대신 표시 이름을 보여준다", () => {
    render(<ContactPage />);

    const manufacturing = getLocalizedBusinessAreas("ko").find(
      (area) => area.id === "manufacturing",
    );

    expect(screen.queryByText("manufacturing")).toBeNull();
    expect(screen.getByText(manufacturing!.title)).toBeInTheDocument();
  });

  it("서버 4xx는 입력 확인 안내, 5xx는 재시도 안내를 낸다", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: "BAD_REQUEST" } }),
    } as unknown as Response);
    render(<ContactPage />);

    fireEvent.change(screen.getByRole("textbox", { name: "이름" }), {
      target: { value: "홍길동" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "이메일" }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "문의 내용" }), {
      target: { value: "테스트 문의 내용입니다." },
    });
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: /보내기|문의/ }));

    await screen.findByText(/입력 내용을 확인/);

    vi.mocked(fetch).mockRejectedValueOnce(new Error("network down"));
    fireEvent.click(screen.getByRole("button", { name: /보내기|문의/ }));

    await screen.findByText(/잠시 후 다시 시도/);
  });
});
