import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  AdminImageField,
  type AdminImageValue,
} from "@/components/admin/AdminImageField";

afterEach(() => vi.unstubAllGlobals());

const empty: AdminImageValue = { assetId: null, url: null };

function Harness({
  initial = empty,
  onError,
  onBusyChange,
  onUnauthorized,
}: {
  initial?: AdminImageValue;
  onError?: (message: string) => void;
  onBusyChange?: (busy: boolean) => void;
  onUnauthorized?: (error: unknown) => boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <AdminImageField
      label="대표 이미지"
      value={value}
      onChange={setValue}
      onError={onError}
      onBusyChange={onBusyChange}
      onUnauthorized={onUnauthorized}
    />
  );
}

function pick(file: File) {
  fireEvent.change(screen.getByLabelText("대표 이미지"), {
    target: { files: [file] },
  });
}

function png(name = "photo.png") {
  return new File(["png"], name, { type: "image/png" });
}

describe("AdminImageField", () => {
  it("JPEG, PNG, WebP가 아니면 올리지 않고 이유를 알린다", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const onError = vi.fn();
    render(<Harness onError={onError} />);

    pick(new File(["gif"], "moving.gif", { type: "image/gif" }));

    expect(onError).toHaveBeenCalledWith("JPEG, PNG, WebP 이미지만 올릴 수 있습니다.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("10MB를 넘으면 올리지 않고 이유를 알린다", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const onError = vi.fn();
    render(<Harness onError={onError} />);
    const large = png("large.png");
    Object.defineProperty(large, "size", { value: 10 * 1024 * 1024 + 1 });

    pick(large);

    expect(onError).toHaveBeenCalledWith("이미지는 10MB 이하만 올릴 수 있습니다.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("올리는 동안 입력을 잠그고, 끝나면 썸네일을 보여 준다", async () => {
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
    const onBusyChange = vi.fn();
    const { container } = render(<Harness onBusyChange={onBusyChange} />);

    pick(png());

    expect(screen.getByLabelText("대표 이미지")).toBeDisabled();
    expect(screen.getByText("이미지를 올리는 중입니다.")).toBeInTheDocument();
    expect(onBusyChange).toHaveBeenLastCalledWith(true);

    resolveFetch({
      ok: true,
      status: 201,
      json: async () => ({
        data: { id: "asset-1", url: "/media/asset-1.webp" },
      }),
    });

    await waitFor(() =>
      expect(container.querySelector("img")).toHaveAttribute(
        "src",
        "/media/asset-1.webp",
      ),
    );
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByLabelText("대표 이미지")).not.toBeDisabled();
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/admin/assets");
    expect((init?.body as FormData).get("file")).toBeInstanceOf(File);
  });

  it("이미지 빼기는 저장 요청 없이 폼 값만 비운다", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(
      <Harness initial={{ assetId: "asset-1", url: "/media/asset-1.webp" }} />,
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/media/asset-1.webp",
    );

    fireEvent.click(screen.getByRole("button", { name: "이미지 빼기" }));

    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByRole("button", { name: "이미지 빼기" })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("세션이 끝났으면 폼의 로그인 처리에 넘기고 오류 문구를 띄우지 않는다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { code: "UNAUTHORIZED" } }),
      }),
    );
    const onError = vi.fn();
    const onUnauthorized = vi.fn(() => true);
    render(<Harness onError={onError} onUnauthorized={onUnauthorized} />);

    pick(png());

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledOnce());
    expect(onError.mock.calls.filter(([message]) => message)).toEqual([]);
  });
});
