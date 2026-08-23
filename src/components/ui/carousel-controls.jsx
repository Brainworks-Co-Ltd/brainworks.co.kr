export function CarouselControls({
  isPlaying,
  onPrevious,
  onNext,
  onTogglePlay,
  labels = { previous: "이전", next: "다음", pause: "일시정지", play: "재생" },
  className = "",
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        aria-label={labels.previous}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"
        onClick={onPrevious}
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        aria-label={isPlaying ? labels.pause : labels.play}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"
        onClick={onTogglePlay}
      >
        <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
      </button>
      <button
        type="button"
        aria-label={labels.next}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"
        onClick={onNext}
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
