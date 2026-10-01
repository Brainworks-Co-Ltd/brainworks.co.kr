import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  PopupNoticeForm,
  createEmptyPopupNotice,
  type PopupNoticeFormValue,
  type PopupNoticeLinkOption,
} from "@/components/admin/PopupNoticeForm";

vi.mock("next/router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => vi.unstubAllGlobals());

const notices: PopupNoticeLinkOption[] = [];

function editingPopup(): PopupNoticeFormValue {
  return {
    id: "popup-1",
    version: 2,
    itemStatus: "ACTIVE",
    noticeId: "",
    dismissalRevision: 1,
    locales: {
      ko: {
        title: "국문 팝업 제목",
        bodyMarkdown: "국문 본문",
        imageAssetId: "",
        imageAlt: "",
        imageUrl: "",
        displayOrder: 0,
        publicationStatus: "DRAFT",
        publishStartsAt: "",
        publishEndsAt: "",
      },
      en: {
        title: "English popup title",
        bodyMarkdown: "English body",
        imageAssetId: "",
        imageAlt: "",
        imageUrl: "",
        displayOrder: 0,
        publicationStatus: "DRAFT",
        publishStartsAt: "",
        publishEndsAt: "",
      },
    },
  };
}

describe("PopupNoticeForm 저장 및 게시 검증", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ data: { id: "popup-1", version: 1 } }),
      }),
    );
  });

  it("국문 제목만 채우고 저장하면 한 언어 초안으로 저장된다", async () => {
    render(<PopupNoticeForm initial={createEmptyPopupNotice()} notices={notices} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "팝업 안내 제목" } });
    const saveButton = screen.getByRole("button", { name: "초안 저장" });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());
    expect(fetch).toHaveBeenCalledTimes(1);

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.locales.en.title).toBe("");
  });

  it("요청 본문의 최상위 키가 서버 입력 타입과 일치한다", async () => {
    render(<PopupNoticeForm initial={createEmptyPopupNotice()} notices={notices} />);

    const [koTitle, enTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "팝업 안내 제목" } });
    fireEvent.change(enTitle, { target: { value: "Popup notice title" } });
    const saveButton = screen.getByRole("button", { name: "초안 저장" });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(Object.keys(body).sort()).toEqual(["locales", "noticeId"].sort());
  });

  it("필드를 바꾸면 저장 전에는 언어별 게시 버튼이 비활성화된다", () => {
    render(<PopupNoticeForm initial={editingPopup()} notices={notices} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "수정된 팝업 제목" } });

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
    render(<PopupNoticeForm initial={editingPopup()} notices={notices} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "충돌 테스트 제목" } });
    fireEvent.click(screen.getByRole("button", { name: "변경 저장" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("새로고침");
    expect(koTitle).toHaveValue("충돌 테스트 제목");
  });

  it("변경 저장 요청에 언어별 노출 기간이 실리고 게시 요청에는 기간이 없다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: { version: 3 } }),
      }),
    );
    const initial = editingPopup();
    initial.locales.ko.publishStartsAt = "2026-10-02T09:00";
    initial.locales.ko.publishEndsAt = "2026-10-09T18:00";
    render(<PopupNoticeForm initial={initial} notices={notices} />);

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
    expect(publishUrl).toBe("/api/admin/popup-notices/popup-1/publish");
    expect(Object.keys(JSON.parse(publishInit?.body as string)).sort()).toEqual([
      "expectedVersion",
      "locale",
    ]);
  });

  it("언어별 상태는 게시 기간을 반영해 보여 준다", () => {
    const initial = editingPopup();
    initial.locales.ko.publicationStatus = "SCHEDULED";
    initial.locales.ko.publishStartsAt = "2020-01-01T09:00";
    initial.locales.en.publicationStatus = "PUBLISHED";
    initial.locales.en.publishEndsAt = "2020-01-02T09:00";
    render(<PopupNoticeForm initial={initial} notices={notices} />);

    expect(
      within(screen.getByRole("group", { name: "국문 게시 관리" })).getByText("게시 중"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "영문 게시 관리" })).getByText("게시 종료"),
    ).toBeInTheDocument();
  });

  it("언어별로 올린 이미지가 썸네일로 보이고 저장 요청에 실린다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          data: { id: "asset-9", url: "/media/asset-9.webp", version: 3 },
        }),
      }),
    );
    const { container } = render(
      <PopupNoticeForm initial={editingPopup()} notices={notices} />,
    );

    const [koImage] = screen.getAllByLabelText("이미지");
    fireEvent.change(koImage, {
      target: { files: [new File(["png"], "popup.png", { type: "image/png" })] },
    });
    await waitFor(() =>
      expect(container.querySelector('img[src="/media/asset-9.webp"]')).not.toBeNull(),
    );

    fireEvent.click(await screen.findByRole("button", { name: "변경 저장" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const body = JSON.parse(vi.mocked(fetch).mock.calls[1][1]?.body as string);
    expect(body.locales.ko.imageAssetId).toBe("asset-9");
    expect(body.locales.en.imageAssetId).toBeNull();
  });

  it("이미지를 올리는 동안에는 변경 저장과 게시 버튼이 잠긴다", async () => {
    let finishUpload: (response: unknown) => void = () => undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise((resolve) => {
          finishUpload = resolve;
        }),
      ),
    );
    render(<PopupNoticeForm initial={editingPopup()} notices={notices} />);

    const [koImage] = screen.getAllByLabelText("이미지");
    fireEvent.change(koImage, {
      target: { files: [new File(["png"], "popup.png", { type: "image/png" })] },
    });

    await waitFor(() => expect(screen.getByText("이미지를 올리는 중입니다.")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "처리 중…" })).toBeDisabled();
    const koGroup = within(screen.getByRole("group", { name: "국문 게시 관리" }));
    expect(koGroup.getByRole("button", { name: "국문 게시" })).toBeDisabled();

    finishUpload({
      ok: true,
      status: 201,
      json: async () => ({ data: { id: "asset-9", url: "/media/asset-9.webp" } }),
    });
    expect(await screen.findByRole("button", { name: "변경 저장" })).not.toBeDisabled();
  });
});
