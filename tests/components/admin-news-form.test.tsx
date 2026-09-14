import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  NewsForm,
  createEmptyNews,
  type NewsFormValue,
} from "@/components/admin/NewsForm";

vi.mock("next/router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => vi.unstubAllGlobals());

function editingNews(): NewsFormValue {
  return {
    id: "news-1",
    version: 2,
    itemStatus: "ACTIVE",
    slug: "ai-news",
    category: "COMPANY",
    displayDate: "2024-01-01",
    locales: {
      ko: {
        title: "국문 제목",
        summary: "국문 요약",
        bodyMarkdown: "국문 본문",
        coverAlt: "",
        publicationStatus: "DRAFT",
      },
      en: {
        title: "English title",
        summary: "English summary",
        bodyMarkdown: "English body",
        coverAlt: "",
        publicationStatus: "DRAFT",
      },
    },
  };
}

describe("NewsForm 저장 및 게시 검증", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ data: { id: "news-1", version: 1 } }),
      }),
    );
  });

  it("국문 제목만 채우고 저장하면 한 언어 초안으로 저장된다", async () => {
    render(<NewsForm initial={createEmptyNews()} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "인공지능 도입 성과" } });
    const saveButton = screen.getByRole("button", { name: "초안 저장" });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());
    expect(fetch).toHaveBeenCalledTimes(1);

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.locales.en.title).toBe("");
  });

  it("요청 본문의 최상위 키가 서버 입력 타입과 일치한다", async () => {
    render(<NewsForm initial={createEmptyNews()} />);

    const [koTitle, enTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "인공지능 도입 성과" } });
    fireEvent.change(enTitle, { target: { value: "AI adoption results" } });
    const saveButton = screen.getByRole("button", { name: "초안 저장" });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(Object.keys(body).sort()).toEqual(
      ["category", "displayDate", "locales", "slug"].sort(),
    );
  });

  it("필드를 바꾸면 저장 전에는 언어별 게시 버튼이 비활성화된다", () => {
    render(<NewsForm initial={editingNews()} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "수정된 국문 제목" } });

    const koGroup = within(screen.getByRole("group", { name: "국문 게시 관리" }));
    expect(koGroup.getByRole("button", { name: "국문 게시" })).toBeDisabled();
  });

  it("버전 충돌 응답을 받으면 안내가 뜨고 입력값이 유지된다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: { code: "VERSION_CONFLICT" } }),
      }),
    );
    render(<NewsForm initial={editingNews()} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "충돌 테스트 제목" } });
    fireEvent.click(screen.getByRole("button", { name: "변경 저장" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("새로고침");
    expect(koTitle).toHaveValue("충돌 테스트 제목");
  });
});
