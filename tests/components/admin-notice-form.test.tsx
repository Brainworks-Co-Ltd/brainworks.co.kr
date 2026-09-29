import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  NoticeForm,
  createEmptyNotice,
  type NoticeFormValue,
} from "@/components/admin/NoticeForm";
import type { AdminNoticeCategory } from "@/components/admin/NoticeCategoryForm";

vi.mock("next/router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => vi.unstubAllGlobals());

const categories: AdminNoticeCategory[] = [];

function editingNotice(): NoticeFormValue {
  return {
    id: "notice-1",
    version: 2,
    publicNumber: 1,
    itemStatus: "ACTIVE",
    categoryId: "",
    displayDate: "2024-01-01",
    isPinned: false,
    pinOrder: 1,
    locales: {
      ko: {
        title: "국문 공지 제목",
        bodyMarkdown: "국문 본문",
        publicationStatus: "DRAFT",
        publishStartsAt: "",
        publishEndsAt: "",
      },
      en: {
        title: "English notice title",
        bodyMarkdown: "English body",
        publicationStatus: "DRAFT",
        publishStartsAt: "",
        publishEndsAt: "",
      },
    },
  };
}

describe("NoticeForm 저장 및 게시 검증", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ data: { id: "notice-1", version: 1 } }),
      }),
    );
  });

  it("국문 제목만 채우고 저장하면 한 언어 초안으로 저장된다", async () => {
    render(<NoticeForm initial={createEmptyNotice()} categories={categories} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "공지사항 제목" } });
    const saveButton = screen.getByRole("button", { name: "초안 저장" });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());
    expect(fetch).toHaveBeenCalledTimes(1);

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.locales.en.title).toBe("");
  });

  it("요청 본문의 최상위 키가 서버 입력 타입과 일치한다", async () => {
    render(<NoticeForm initial={createEmptyNotice()} categories={categories} />);

    const [koTitle, enTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "공지사항 제목" } });
    fireEvent.change(enTitle, { target: { value: "Notice title" } });
    const saveButton = screen.getByRole("button", { name: "초안 저장" });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(Object.keys(body).sort()).toEqual(
      ["categoryId", "displayDate", "isPinned", "locales", "pinOrder"].sort(),
    );
  });

  it("필드를 바꾸면 저장 전에는 언어별 게시 버튼이 비활성화된다", () => {
    render(<NoticeForm initial={editingNotice()} categories={categories} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "수정된 공지 제목" } });

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
    render(<NoticeForm initial={editingNotice()} categories={categories} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "충돌 테스트 제목" } });
    fireEvent.click(screen.getByRole("button", { name: "변경 저장" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("새로고침");
    expect(koTitle).toHaveValue("충돌 테스트 제목");
  });
});
