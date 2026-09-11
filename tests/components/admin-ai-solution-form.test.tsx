import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  AiSolutionForm,
  createEmptyAiSolution,
  type AiSolutionFormValue,
  type BusinessAreaOption,
} from "@/components/admin/AiSolutionForm";

vi.mock("next/router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => vi.unstubAllGlobals());

const areas: BusinessAreaOption[] = [
  { id: "area-1", publicKey: "ai", label: "AI 솔루션" },
];

function editingAiSolution(): AiSolutionFormValue {
  return {
    id: "solution-1",
    version: 2,
    itemStatus: "ACTIVE",
    businessAreaId: "area-1",
    displayOrder: 1,
    imageAssetId: "",
    locales: {
      ko: {
        name: "국문 솔루션 이름",
        summary: "국문 요약",
        description: "국문 상세 설명",
        imageAlt: "",
        publicationStatus: "DRAFT",
      },
      en: {
        name: "English solution name",
        summary: "English summary",
        description: "English description",
        imageAlt: "",
        publicationStatus: "DRAFT",
      },
    },
  };
}

describe("AiSolutionForm 저장 및 게시 검증", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ data: { id: "solution-1", version: 1 } }),
      }),
    );
  });

  it("국문 이름만 채우고 저장하면 한 언어 초안으로 저장된다", async () => {
    render(<AiSolutionForm initial={createEmptyAiSolution("area-1")} areas={areas} />);

    const [koName] = screen.getAllByLabelText("솔루션 이름");
    fireEvent.change(koName, { target: { value: "스마트 검수 솔루션" } });
    const saveButton = screen.getByRole("button", { name: "초안 저장" });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());
    expect(fetch).toHaveBeenCalledTimes(1);

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.locales.en.name).toBe("");
  });

  it("요청 본문의 최상위 키가 서버 입력 타입과 일치한다", async () => {
    render(<AiSolutionForm initial={createEmptyAiSolution("area-1")} areas={areas} />);

    const [koName, enName] = screen.getAllByLabelText("솔루션 이름");
    fireEvent.change(koName, { target: { value: "스마트 검수 솔루션" } });
    fireEvent.change(enName, { target: { value: "Smart inspection solution" } });
    const saveButton = screen.getByRole("button", { name: "초안 저장" });
    fireEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(Object.keys(body).sort()).toEqual(
      ["businessAreaId", "displayOrder", "imageAssetId", "locales"].sort(),
    );
  });

  it("필드를 바꾸면 저장 전에는 언어별 게시 버튼이 비활성화된다", () => {
    render(<AiSolutionForm initial={editingAiSolution()} areas={areas} />);

    const [koName] = screen.getAllByLabelText("솔루션 이름");
    fireEvent.change(koName, { target: { value: "수정된 솔루션 이름" } });

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
    render(<AiSolutionForm initial={editingAiSolution()} areas={areas} />);

    const [koName] = screen.getAllByLabelText("솔루션 이름");
    fireEvent.change(koName, { target: { value: "충돌 테스트 이름" } });
    fireEvent.click(screen.getByRole("button", { name: "변경 저장" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("새로고침");
    expect(koName).toHaveValue("충돌 테스트 이름");
  });
});
