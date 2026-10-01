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

  it("변경 저장 요청에 언어별 게시 기간이 실리고 게시 요청에는 기간이 없다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: { version: 3 } }),
      }),
    );
    const initial = editingNotice();
    initial.locales.ko.publishStartsAt = "2026-10-02T09:00";
    initial.locales.ko.publishEndsAt = "2026-10-09T18:00";
    render(<NoticeForm initial={initial} categories={categories} />);

    fireEvent.click(screen.getByRole("button", { name: "변경 저장" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const saveBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(saveBody.locales.ko.publishStartsAt).toBe(
      new Date("2026-10-02T09:00").toISOString(),
    );
    expect(saveBody.locales.ko.publishEndsAt).toBe(
      new Date("2026-10-09T18:00").toISOString(),
    );
    expect(saveBody.locales.en.publishStartsAt).toBeNull();

    const koGroup = within(screen.getByRole("group", { name: "국문 게시 관리" }));
    const publish = koGroup.getByRole("button", { name: "국문 게시" });
    await waitFor(() => expect(publish).not.toBeDisabled());
    fireEvent.click(publish);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const [publishUrl, publishInit] = vi.mocked(fetch).mock.calls[1];
    expect(publishUrl).toBe("/api/admin/notices/notice-1/publish");
    expect(Object.keys(JSON.parse(publishInit?.body as string)).sort()).toEqual([
      "expectedVersion",
      "locale",
    ]);
  });

  it("언어별 상태는 게시 기간을 반영해 보여 준다", () => {
    const initial = editingNotice();
    initial.locales.ko.publicationStatus = "SCHEDULED";
    initial.locales.ko.publishStartsAt = "2020-01-01T09:00";
    initial.locales.en.publicationStatus = "PUBLISHED";
    initial.locales.en.publishEndsAt = "2020-01-02T09:00";
    render(<NoticeForm initial={initial} categories={categories} />);

    expect(
      within(screen.getByRole("group", { name: "국문 게시 관리" })).getByText("게시 중"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "영문 게시 관리" })).getByText("게시 종료", {
        selector: "span",
      }),
    ).toBeInTheDocument();
  });

  it("새 공지 표시일 기본값은 서울 날짜다", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-30T15:30:00.000Z"));
    try {
      expect(createEmptyNotice().displayDate).toBe("2026-10-01");
    } finally {
      vi.useRealTimers();
    }
  });
});
