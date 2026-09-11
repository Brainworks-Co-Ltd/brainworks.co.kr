import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  NoticeForm,
  createEmptyNotice,
  type NoticeFormValue,
} from "@/components/admin/NoticeForm";
import type { AdminNoticeCategory } from "@/components/admin/NoticeCategoryForm";

const routerMock = {
  push: vi.fn(),
  asPath: "/admin/notices/new",
  events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
};

vi.mock("next/router", () => ({
  useRouter: () => routerMock,
}));

afterEach(() => {
  vi.unstubAllGlobals();
  routerMock.push.mockClear();
  routerMock.events.on.mockClear();
  routerMock.events.off.mockClear();
  routerMock.events.emit.mockClear();
});

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

describe("NoticeForm 저장 후 상태 갱신", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: { version: 3 } }),
      }),
    );
  });

  it("저장에 성공하면 게시 버튼이 다시 활성화된다", async () => {
    render(<NoticeForm initial={editingNotice()} categories={categories} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "바뀐 제목" } });

    const koGroup = within(screen.getByRole("group", { name: "국문 게시 관리" }));
    const publish = koGroup.getByRole("button", { name: "국문 게시" });
    expect(publish).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "변경 저장" }));

    await waitFor(() => expect(publish).not.toBeDisabled());
  });

  it("저장 버튼을 연타해도 요청은 한 번만 나간다", async () => {
    let resolveFetch!: (value: unknown) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );
    render(<NoticeForm initial={createEmptyNotice()} categories={categories} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "제목" } });

    const save = screen.getByRole("button", { name: "초안 저장" });
    // 세 클릭을 하나의 act 안에 묶어 리렌더(disabled 반영) 전에 연속 클릭되는
    // 실제 연타 상황을 재현한다. ref 가드가 없으면 세 번 모두 fetch가 나간다.
    act(() => {
      fireEvent.click(save);
      fireEvent.click(save);
      fireEvent.click(save);
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    resolveFetch({
      ok: true,
      status: 201,
      json: async () => ({ data: { id: "n1", version: 1 } }),
    });
  });

  it("생성 직후에는 미저장 변경 경고 없이 편집 화면으로 이동한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ data: { id: "n1", version: 1 } }),
      }),
    );
    const confirmSpy = vi.spyOn(window, "confirm");

    render(<NoticeForm initial={createEmptyNotice()} categories={categories} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "후속 검증 공지" } });

    fireEvent.click(screen.getByRole("button", { name: "초안 저장" }));

    await waitFor(() =>
      expect(routerMock.push).toHaveBeenCalledWith("/admin/notices/n1"),
    );
    expect(confirmSpy).not.toHaveBeenCalled();
  });
});
