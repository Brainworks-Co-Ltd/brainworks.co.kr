import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, renderHook, screen, within } from "@testing-library/react";
import { AdminFormFeedback } from "@/components/admin/AdminFormFeedback";
import { LocalePublicationPanel } from "@/components/admin/LocalePublicationPanel";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

afterEach(() => vi.restoreAllMocks());

describe("관리자 공통 편집 기반", () => {
  it("저장 결과와 오류를 보조 기술에 알린다", () => {
    render(<AdminFormFeedback message="저장했습니다." error="필수 내용을 확인해 주세요." />);
    expect(screen.getByRole("status")).toHaveTextContent("저장했습니다.");
    expect(screen.getByRole("alert")).toHaveTextContent("필수 내용을 확인해 주세요.");
  });

  it("언어별 상태와 게시·중단 동작을 각각 제공한다", () => {
    const publishKo = vi.fn();
    const stopEn = vi.fn();
    render(<><LocalePublicationPanel locale="ko" status="DRAFT" onPublish={publishKo} onUnpublish={vi.fn()} /><LocalePublicationPanel locale="en" status="PUBLISHED" onPublish={vi.fn()} onUnpublish={stopEn} /></>);
    const ko = within(screen.getByRole("group", { name: "국문 게시 관리" }));
    const en = within(screen.getByRole("group", { name: "영문 게시 관리" }));
    expect(ko.getByText("초안")).toBeInTheDocument();
    expect(en.getByText("게시 중")).toBeInTheDocument();
    fireEvent.click(ko.getByRole("button", { name: "국문 게시" }));
    fireEvent.click(en.getByRole("button", { name: "영문 게시 중단" }));
    expect(publishKo).toHaveBeenCalledOnce();
    expect(stopEn).toHaveBeenCalledOnce();
  });

  it("처리 중에는 언어별 게시 요청을 다시 보낼 수 없다", () => {
    render(<LocalePublicationPanel locale="ko" status="PUBLISHED" busy onPublish={vi.fn()} onUnpublish={vi.fn()} />);
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });

  it("변경이 있을 때만 창 닫기 보호를 등록하고 정리한다", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const { rerender, unmount } = renderHook(({ dirty }) => useUnsavedChanges(dirty), { initialProps: { dirty: false } });
    expect(add.mock.calls.filter(([type]) => type === "beforeunload")).toHaveLength(0);
    rerender({ dirty: true });
    const registration = add.mock.calls.find(([type]) => type === "beforeunload");
    expect(registration).toBeDefined();
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    rerender({ dirty: false });
    expect(remove).toHaveBeenCalledWith("beforeunload", registration?.[1]);
    unmount();
  });

  it("화면 내 이동은 미저장 변경이 있을 때만 확인한다", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { result, rerender } = renderHook(({ dirty }) => useUnsavedChanges(dirty), { initialProps: { dirty: false } });
    expect(result.current()).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    rerender({ dirty: true });
    expect(result.current()).toBe(false);
    expect(confirm).toHaveBeenCalledOnce();
  });
});
