export function CarouselControls({
  isPlaying,
  onPrevious,
  onNext,
  onTogglePlay,
  className = "",
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        aria-label="이전"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"
        onClick={onPrevious}
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        aria-label={isPlaying ? "일시정지" : "재생"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"
        onClick={onTogglePlay}
      >
        <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
      </button>
      <button
        type="button"
        aria-label="다음"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"
        onClick={onNext}
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
