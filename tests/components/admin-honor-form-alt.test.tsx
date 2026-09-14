import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  HonorForm,
  createEmptyHonor,
  type HonorFormValue,
} from "@/components/admin/HonorForm";

vi.mock("next/router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => vi.unstubAllGlobals());

function editingHonor(): HonorFormValue {
  return {
    id: "h1",
    version: 2,
    itemStatus: "ACTIVE",
    honorType: "AWARD",
    occurredYear: 2024,
    occurredOn: "2024-01-01",
    displayOrder: 1,
    imageAssetId: "asset-1",
    locales: {
      ko: {
        title: "정보보호 우수기업 인증",
        organization: "한국인터넷진흥원",
        description: "정보보호 관리체계 인증을 획득했습니다.",
        imageAlt: "이전 설명",
        publicationStatus: "DRAFT",
      },
      en: {
        title: "",
        organization: "",
        description: "",
        imageAlt: "",
        publicationStatus: "DRAFT",
      },
    },
  };
}

describe("HonorForm 대체 설명 저장", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: { id: "h1", version: 3 } }),
      }),
    );
  });

  it("대체 설명을 비우면 요청 본문에 imageAlt가 null로 실린다", async () => {
    render(<HonorForm initial={editingHonor()} />);

    const [altInput] = screen.getAllByLabelText("이미지 대체 설명");
    fireEvent.change(altInput, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /저장/ }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.locales.ko).toHaveProperty("imageAlt", null);
  });
});

describe("HonorForm 저장 및 게시 검증", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ data: { id: "h1", version: 1 } }),
      }),
    );
  });

  it("국문 제목만 채우고 저장하면 한 언어 초안으로 저장된다", async () => {
    render(<HonorForm initial={createEmptyHonor()} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "정보보호 우수기업 인증" } });
    const saveButton = screen.getByRole("button", { name: "초안 저장" });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());
    expect(fetch).toHaveBeenCalledTimes(1);

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.locales.en.title).toBe("");
  });

  it("요청 본문의 최상위 키가 서버 입력 타입과 일치한다", async () => {
    render(<HonorForm initial={createEmptyHonor()} />);

    const [koTitle, enTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "정보보호 우수기업 인증" } });
    fireEvent.change(enTitle, { target: { value: "Information security certification" } });
    const saveButton = screen.getByRole("button", { name: "초안 저장" });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(Object.keys(body).sort()).toEqual(
      [
        "displayOrder",
        "honorType",
        "imageAssetId",
        "locales",
        "occurredOn",
        "occurredYear",
      ].sort(),
    );
  });

  it("필드를 바꾸면 저장 전에는 언어별 게시 버튼이 비활성화된다", () => {
    render(<HonorForm initial={editingHonor()} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "수정된 인증 제목" } });

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
    render(<HonorForm initial={editingHonor()} />);

    const [koTitle] = screen.getAllByLabelText("제목");
    fireEvent.change(koTitle, { target: { value: "충돌 테스트 제목" } });
    fireEvent.click(screen.getByRole("button", { name: "변경 저장" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("새로고침");
    expect(koTitle).toHaveValue("충돌 테스트 제목");
  });
});
