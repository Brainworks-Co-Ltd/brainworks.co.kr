import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HonorForm, type HonorFormValue } from "@/components/admin/HonorForm";

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

    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.locales.ko).toHaveProperty("imageAlt", null);
  });
});
