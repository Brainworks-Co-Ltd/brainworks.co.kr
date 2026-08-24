import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CarouselControls({
  isPlaying,
  onPrevious,
  onNext,
  onTogglePlay,
  labels = { previous: "이전", next: "다음", pause: "일시정지", play: "재생" },
  tone = "dark",
  className,
}) {
  const controlClassName =
    tone === "light"
      ? "border-[var(--bw-color-line)] text-[var(--bw-color-ink)] hover:bg-white"
      : "border-white/30 text-white hover:bg-white/10";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={labels.previous}
        className={cn("rounded-full border", controlClassName)}
        onClick={onPrevious}
      >
        <ArrowLeftIcon aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={isPlaying ? labels.pause : labels.play}
        className={cn("rounded-full border", controlClassName)}
        onClick={onTogglePlay}
      >
        {isPlaying ? (
          <PauseIcon aria-hidden="true" />
        ) : (
          <PlayIcon aria-hidden="true" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={labels.next}
        className={cn("rounded-full border", controlClassName)}
        onClick={onNext}
      >
        <ArrowRightIcon aria-hidden="true" />
      </Button>
    </div>
  );
}
