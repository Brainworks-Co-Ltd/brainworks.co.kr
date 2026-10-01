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
    coverAssetId: "",
    coverUrl: "",
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
      ["category", "coverAssetId", "displayDate", "locales", "slug"].sort(),
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

  it("대표 이미지와 언어별 대체 설명을 저장 요청에 싣는다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          data: { id: "cover-1", url: "/media/cover-1.webp", version: 3 },
        }),
      }),
    );
    const { container } = render(<NewsForm initial={editingNews()} />);

    fireEvent.change(screen.getByLabelText("대표 이미지"), {
      target: { files: [new File(["png"], "cover.png", { type: "image/png" })] },
    });
    await waitFor(() =>
      expect(container.querySelector('img[src="/media/cover-1.webp"]')).not.toBeNull(),
    );
    const [koAlt] = screen.getAllByLabelText("대표 이미지 대체 설명");
    fireEvent.change(koAlt, { target: { value: "협약식 사진" } });

    fireEvent.click(await screen.findByRole("button", { name: "변경 저장" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const body = JSON.parse(vi.mocked(fetch).mock.calls[1][1]?.body as string);
    expect(body.input.coverAssetId).toBe("cover-1");
    expect(body.input.locales.ko.coverAlt).toBe("협약식 사진");
  });

  it("새 뉴스 표시일 기본값은 서울 날짜다", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-30T15:30:00.000Z"));
    try {
      expect(createEmptyNews().displayDate).toBe("2026-10-01");
    } finally {
      vi.useRealTimers();
    }
  });

  it("대표 이미지를 올리는 동안에는 변경 저장과 게시 버튼이 잠긴다", async () => {
    let finishUpload: (response: unknown) => void = () => undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          finishUpload = resolve;
        }),
      ),
    );
    render(<NewsForm initial={editingNews()} />);

    fireEvent.change(screen.getByLabelText("공개 주소 이름"), {
      target: { value: "ai-news-2" },
    });
    expect(screen.getByRole("button", { name: "주소 변경" })).not.toBeDisabled();
    fireEvent.change(screen.getByLabelText("대표 이미지"), {
      target: { files: [new File(["png"], "cover.png", { type: "image/png" })] },
    });

    await waitFor(() =>
      expect(screen.getByText("이미지를 올리는 중입니다.")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "처리 중…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "주소 변경" })).toBeDisabled();
    const koGroup = within(screen.getByRole("group", { name: "국문 게시 관리" }));
    expect(koGroup.getByRole("button", { name: "국문 게시" })).toBeDisabled();

    finishUpload({
      ok: true,
      status: 201,
      json: async () => ({ data: { id: "cover-9", url: "/media/cover-9.webp" } }),
    });
    expect(await screen.findByRole("button", { name: "변경 저장" })).not.toBeDisabled();
  });
});
