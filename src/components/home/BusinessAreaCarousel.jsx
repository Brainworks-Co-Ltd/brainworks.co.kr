import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedBusinessAreas } from "@/data/businessAreas";
import { CarouselControls } from "@/components/ui/carousel-controls";
import { MediaFrame } from "@/components/ui/media-frame";
import { ProgressTrack } from "@/components/ui/progress-track";

const ROTATION_MS = 6000;

export default function BusinessAreaCarousel({ areas: providedAreas = null }) {
  const { language } = useLocale();
  const areas = useMemo(() => providedAreas || getLocalizedBusinessAreas(language), [language, providedAreas]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    setElapsed(0);
  }, [language]);

  useEffect(() => {
    if (!isPlaying || areas.length < 2) {
      return undefined;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAt;
      setElapsed(Math.min(100, (nextElapsed / ROTATION_MS) * 100));
      if (nextElapsed >= ROTATION_MS) {
        setActiveIndex((index) => (index + 1) % areas.length);
        setElapsed(0);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [activeIndex, areas.length, isPlaying]);

  if (areas.length === 0) {
    return null;
  }

  const activeArea = areas[activeIndex % areas.length];
  const selectArea = (index) => {
    setActiveIndex(index);
    setElapsed(0);
  };

  return (
    <section
      id="services"
      className="bg-[var(--bw-color-surface-muted)] py-20 md:py-28"
      aria-label={language === "ko" ? "홈 사업 영역" : "Home business areas"}
      onFocus={() => setIsPlaying(false)}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
            {language === "ko"
              ? "브레인웍스 사업 분야"
              : "Brainworks business domains"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.025em] text-[var(--bw-color-ink)] md:text-5xl">
            {language === "ko"
              ? "핵심 AI 사업 분야"
              : "Core AI business domains"}
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--bw-color-muted)]">
            {activeArea.subtitle}
          </p>
        </div>

        <div
          className="mt-10 overflow-hidden rounded-[var(--bw-radius-feature)] bg-[var(--bw-color-ink)] shadow-[var(--bw-shadow-soft)]"
          aria-live="off"
        >
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative min-h-[320px] bg-black lg:min-h-[460px]">
              <MediaFrame
                src={activeArea.heroImage}
                alt={activeArea.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between p-7 text-white md:p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--bw-color-brand)]">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(areas.length).padStart(2, "0")}
                </p>
                <h3 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
                  {activeArea.title}
                </h3>
                <p className="mt-5 text-base leading-8 text-white/75">
                  {activeArea.description}
                </p>
              </div>
              <div className="mt-10">
                <ProgressTrack
                  value={areas.length > 1 ? elapsed : 100}
                  max={100}
                  label={`${activeArea.title} ${language === "ko" ? "진행률" : "progress"}`}
                />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <CarouselControls
                    isPlaying={isPlaying}
                    onPrevious={() =>
                      selectArea(
                        (activeIndex - 1 + areas.length) % areas.length,
                      )
                    }
                    onNext={() => selectArea((activeIndex + 1) % areas.length)}
                    onTogglePlay={() => setIsPlaying((playing) => !playing)}
                    labels={
                      language === "ko"
                        ? undefined
                        : {
                            previous: "Previous",
                            next: "Next",
                            pause: "Pause",
                            play: "Play",
                          }
                    }
                  />
                  <Link
                    href={`/services?area=${encodeURIComponent(activeArea.id)}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    {language === "ko"
                      ? "전체 솔루션 보기"
                      : "View all solutions"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div
            className="flex flex-wrap gap-2 border-t border-white/10 px-7 py-5 md:px-10"
            role="group"
            aria-label={
              language === "ko" ? "사업 영역 선택" : "Business area selection"
            }
          >
            {areas.map((area, index) => (
              <button
                key={area.id}
                type="button"
                aria-label={`${area.title} ${language === "ko" ? "사업 영역 보기" : "View"}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className="rounded-full border border-white/20 px-3 py-2 text-xs font-medium text-white/70 transition hover:border-white/60 hover:text-white aria-[current=true]:border-[var(--bw-color-brand)] aria-[current=true]:text-[var(--bw-color-brand)]"
                onClick={() => selectArea(index)}
              >
                {area.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
