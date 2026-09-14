import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  NoticeForm,
  type NoticeFormValue,
} from "@/components/admin/NoticeForm";
import type { AdminNoticeCategory } from "@/components/admin/NoticeCategoryForm";
import { snapshotKey } from "@/hooks/useSessionSnapshot";

const routerMock = {
  push: vi.fn(),
  asPath: "/admin/notices/notice-1",
  events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
};

vi.mock("next/router", () => ({
  useRouter: () => routerMock,
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  sessionStorage.clear();
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

describe("세션 만료 시 입력 보존", () => {
  it("저장 중 401(UNAUTHORIZED)이면 스냅숏을 저장하고 확인창 없이 로그인 화면으로 이동한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { code: "UNAUTHORIZED" } }),
      }),
    );
    const confirmSpy = vi.spyOn(window, "confirm");

    render(<NoticeForm initial={editingNotice()} categories={categories} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "세션 만료 직전 수정" } });
    fireEvent.click(screen.getByRole("button", { name: "변경 저장" }));

    await waitFor(() =>
      expect(routerMock.push).toHaveBeenCalledWith(
        "/admin/auth/sign-in?returnTo=%2Fadmin%2Fnotices%2Fnotice-1",
      ),
    );

    const saved = JSON.parse(
      sessionStorage.getItem(snapshotKey("notice", "notice-1")) || "null",
    );
    expect(saved?.locales.ko.title).toBe("세션 만료 직전 수정");
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("스냅숏이 있는 상태로 다시 열리면 입력값이 복원되고 게시 버튼이 비활성(dirty)이다", () => {
    sessionStorage.setItem(
      snapshotKey("notice", "notice-1"),
      JSON.stringify({
        ...editingNotice(),
        locales: {
          ...editingNotice().locales,
          ko: { ...editingNotice().locales.ko, title: "복원된 국문 제목" },
        },
      }),
    );

    render(<NoticeForm initial={editingNotice()} categories={categories} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    expect(koTitle).toHaveValue("복원된 국문 제목");

    const koGroup = within(screen.getByRole("group", { name: "국문 게시 관리" }));
    expect(koGroup.getByRole("button", { name: "국문 게시" })).toBeDisabled();
  });
});
