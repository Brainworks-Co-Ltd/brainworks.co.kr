import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedBusinessAreas } from "@/data/businessAreas";
import { SectionHeader } from "@/components/public/SectionHeader";
import { MediaStory } from "@/components/public/MediaStory";
import { CarouselControls } from "@/components/ui/carousel-controls";
import { MediaFrame } from "@/components/ui/media-frame";
import { ProgressTrack } from "@/components/ui/progress-track";

const ROTATION_MS = 6000;

export default function BusinessAreaCarousel({ areas: providedAreas = null }) {
  const { language } = useLocale();
  const areas = useMemo(
    () => providedAreas || getLocalizedBusinessAreas(language),
    [language, providedAreas],
  );
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
        <SectionHeader
          eyebrow={
            language === "ko"
              ? "브레인웍스 사업 분야"
              : "Brainworks business domains"
          }
          title={
            language === "ko" ? "핵심 AI 사업 분야" : "Core AI business domains"
          }
          description={activeArea.subtitle}
        />

        <div className="mt-10" aria-live="off">
          <MediaStory
            eyebrow={`${String(activeIndex + 1).padStart(2, "0")} / ${String(areas.length).padStart(2, "0")}`}
            title={activeArea.title}
            description={activeArea.description}
            media={
              <div className="aspect-[4/3] min-h-[320px] lg:min-h-[500px]">
                <MediaFrame
                  src={activeArea.heroImage}
                  alt={activeArea.title}
                  className="h-full w-full object-cover"
                />
              </div>
            }
            action={{
              href: `/services?area=${encodeURIComponent(activeArea.id)}`,
              label:
                language === "ko" ? "전체 솔루션 보기" : "View all solutions",
            }}
          />

          <div className="mt-10 border-t border-[var(--bw-color-line)] pt-6">
            <ProgressTrack
              value={areas.length > 1 ? elapsed : 100}
              max={100}
              tone="light"
              label={`${activeArea.title} ${language === "ko" ? "진행률" : "progress"}`}
            />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <CarouselControls
                isPlaying={isPlaying}
                tone="light"
                onPrevious={() =>
                  selectArea((activeIndex - 1 + areas.length) % areas.length)
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
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={
                  language === "ko"
                    ? "사업 영역 선택"
                    : "Business area selection"
                }
              >
                {areas.map((area, index) => (
                  <button
                    key={area.id}
                    type="button"
                    aria-label={`${area.title} ${language === "ko" ? "사업 영역 보기" : "View"}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                    className="border-b-2 border-transparent px-1 py-2 text-xs font-medium text-[var(--bw-color-muted)] transition hover:text-[var(--bw-color-ink)] aria-[current=true]:border-[var(--bw-color-brand)] aria-[current=true]:text-[var(--bw-color-ink)]"
                    onClick={() => selectArea(index)}
                  >
                    {area.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
