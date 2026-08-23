import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { CarouselControls } from "@/components/ui/carousel-controls";
import { Dialog } from "@/components/ui/dialog";
import { MediaFrame } from "@/components/ui/media-frame";
import { ProgressTrack } from "@/components/ui/progress-track";
import { StatePanel } from "@/components/ui/state-panel";

describe("공유 UI 상호작용", () => {
  it("Button은 기본 type과 disabled 상태를 제공한다", () => {
    const onClick = vi.fn();
    render(
      <Button type="button" onClick={onClick} disabled>
        저장
      </Button>,
    );

    const button = screen.getByRole("button", { name: "저장" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("Dialog는 닫기 버튼과 Escape로 닫힌다", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} title="공지">
        내용
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "공지" })).toBeVisible();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it("ProgressTrack은 진행률을 접근성 값으로 노출한다", () => {
    render(<ProgressTrack value={2} max={4} label="2 / 4" />);
    expect(screen.getByRole("progressbar", { name: "2 / 4" })).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  });

  it("CarouselControls는 이전·다음·재생 제어를 전달한다", () => {
    const callbacks = {
      onPrevious: vi.fn(),
      onNext: vi.fn(),
      onTogglePlay: vi.fn(),
    };
    render(<CarouselControls isPlaying {...callbacks} />);

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "일시정지" }));
    expect(callbacks.onPrevious).toHaveBeenCalledOnce();
    expect(callbacks.onNext).toHaveBeenCalledOnce();
    expect(callbacks.onTogglePlay).toHaveBeenCalledOnce();
  });

  it("MediaFrame은 이미지 실패 시 대체 상태를 보여준다", () => {
    render(
      <MediaFrame
        src="/missing.gif"
        alt="대표 이미지"
        fallback="이미지를 불러오지 못했습니다."
      />,
    );
    fireEvent.error(screen.getByRole("img", { name: "대표 이미지" }));
    expect(screen.getByText("이미지를 불러오지 못했습니다.")).toBeVisible();
  });

  it("StatePanel은 재시도 행동을 제공한다", () => {
    const onRetry = vi.fn();
    render(
      <StatePanel
        status="error"
        title="오류"
        actionLabel="다시 시도"
        onAction={onRetry}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
