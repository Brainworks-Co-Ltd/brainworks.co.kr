import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { CarouselControls } from "@/components/ui/carousel-controls";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MediaFrame } from "@/components/ui/media-frame";
import { ProgressTrack } from "@/components/ui/progress-track";
import { StatePanel } from "@/components/ui/state-panel";

function DialogHarness() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        공지 열기
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>공지</DialogTitle>
        </DialogHeader>
        <Button>확인</Button>
      </DialogContent>
    </Dialog>
  );
}

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

  it("Button은 shadcn 슬롯과 호출자 클래스 우선순위를 제공한다", () => {
    render(
      <Button variant="outline" className="rounded-full">
        문의하기
      </Button>,
    );

    const button = screen.getByRole("button", { name: "문의하기" });
    expect(button).toHaveAttribute("data-slot", "button");
    expect(button).toHaveAttribute("data-variant", "outline");
    expect(button).toHaveClass("rounded-full");
    expect(button).not.toHaveClass("rounded-[var(--bw-radius-control)]");
  });

  it("Dialog는 초점을 가두고 Escape로 닫은 뒤 실행 버튼으로 복귀한다", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    const trigger = screen.getByRole("button", { name: "공지 열기" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "공지" })).toBeVisible();

    const confirm = screen.getByRole("button", { name: "확인" });
    const close = screen.getByRole("button", { name: "닫기" });
    await waitFor(() => expect(confirm).toHaveFocus());
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(confirm).toHaveFocus();
    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", { name: "공지" }),
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
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
