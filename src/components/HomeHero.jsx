import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { CarouselControls } from "@/components/ui/carousel-controls";
import { MediaFrame } from "@/components/ui/media-frame";
import { ProgressTrack } from "@/components/ui/progress-track";

const AUTO_ADVANCE_MS = 6000;

const defaultScenes = [
  {
    id: "brainworks-ai-ax",
    title: {
      ko: "AI와 AX의 시작, 브레인웍스에서",
      en: "AI & AX innovation starts here",
    },
    description: {
      ko: "당신의 비즈니스를 다음 단계로 이끄는 AI 딥테크 솔루션",
      en: "AI deep-tech solutions that move your business forward.",
    },
    src: "/images/hero-animation.gif",
    poster: "/images/대표사진.png",
    alt: {
      ko: "브레인웍스 AI 기술 소개 애니메이션",
      en: "Brainworks AI technology animation",
    },
  },
];

/** @typedef {string | { ko: string, en: string }} LocalizedText */

/**
 * @typedef {Object} HeroScene
 * @property {string} id
 * @property {LocalizedText} title
 * @property {LocalizedText} description
 * @property {string} src
 * @property {string} [poster]
 * @property {LocalizedText} [alt]
 */

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return reducedMotion;
}

/** @param {{ scenes?: HeroScene[] }} props */
export default function HomeHero({ scenes = defaultScenes }) {
  const { language } = useLocale();
  const reducedMotion = useReducedMotionPreference();
  const resolvedScenes = useMemo(() => scenes.filter(Boolean), [scenes]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setIsPlaying(!reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    setActiveIndex((index) =>
      Math.min(index, Math.max(0, resolvedScenes.length - 1)),
    );
  }, [resolvedScenes.length]);

  useEffect(() => {
    if (!isPlaying || reducedMotion || resolvedScenes.length < 2) {
      return undefined;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAt;
      setElapsed(Math.min(100, (nextElapsed / AUTO_ADVANCE_MS) * 100));
      if (nextElapsed >= AUTO_ADVANCE_MS) {
        setActiveIndex((index) => (index + 1) % resolvedScenes.length);
        setElapsed(0);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [activeIndex, isPlaying, reducedMotion, resolvedScenes.length]);

  if (resolvedScenes.length === 0) {
    return null;
  }

  const scene = resolvedScenes[activeIndex];
  const title =
    typeof scene.title === "string" ? scene.title : scene.title[language];
  const description =
    typeof scene.description === "string"
      ? scene.description
      : scene.description[language];
  const alt =
    typeof scene.alt === "string" ? scene.alt : scene.alt?.[language] || title;
  const multipleScenes = resolvedScenes.length > 1;

  const selectScene = (index) => {
    setActiveIndex(index);
    setElapsed(0);
  };

  return (
    <section
      aria-label={
        language === "ko" ? "브레인웍스 대표 메시지" : "Brainworks hero message"
      }
      className="relative isolate min-h-[680px] overflow-hidden bg-[var(--bw-color-ink)] text-white"
      onFocus={() => setIsPlaying(false)}
    >
      <div className="absolute inset-0 -z-10" aria-live="off">
        <MediaFrame
          src={scene.src}
          poster={scene.poster}
          alt={alt}
          className="h-full w-full object-cover opacity-75"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10"
          aria-hidden="true"
        />
      </div>

      <div className="mx-auto flex min-h-[680px] max-w-[1440px] items-end px-6 pb-14 pt-32 md:pb-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--bw-color-brand)]">
            {language === "ko" ? "Brainworks AI & AX" : "Brainworks AI & AX"}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.025em] md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-brand)] px-6 py-3 text-sm font-semibold text-[var(--bw-color-ink)] hover:brightness-95"
            >
              {language === "ko" ? "AI 솔루션 보기" : "Explore AI solutions"}
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              {language === "ko" ? "문의하기" : "Contact us"}
            </Link>
          </div>

          {multipleScenes ? (
            <div className="mt-12 max-w-xl">
              <div className="flex items-center justify-between gap-4 text-xs text-white/70">
                <span>
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(resolvedScenes.length).padStart(2, "0")}
                </span>
                <span>
                  {reducedMotion
                    ? language === "ko"
                      ? "정적 표시"
                      : "Static mode"
                    : isPlaying
                      ? language === "ko"
                        ? "자동 진행"
                        : "Auto play"
                      : language === "ko"
                        ? "일시정지"
                        : "Paused"}
                </span>
              </div>
              <ProgressTrack
                value={elapsed}
                max={100}
                label={`${title} ${language === "ko" ? "진행률" : "progress"}`}
                className="mt-3"
              />
              <div className="mt-4 flex items-center justify-between gap-4">
                <CarouselControls
                  isPlaying={isPlaying}
                  onPrevious={() =>
                    selectScene(
                      (activeIndex - 1 + resolvedScenes.length) %
                        resolvedScenes.length,
                    )
                  }
                  onNext={() =>
                    selectScene((activeIndex + 1) % resolvedScenes.length)
                  }
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
                  className="flex gap-2"
                  role="group"
                  aria-label={
                    language === "ko" ? "장면 선택" : "Scene selection"
                  }
                >
                  {resolvedScenes.map((item, index) => {
                    const itemTitle =
                      typeof item.title === "string"
                        ? item.title
                        : item.title[language];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-label={`${itemTitle} ${language === "ko" ? "선택" : "select"}`}
                        aria-current={
                          index === activeIndex ? "true" : undefined
                        }
                        className="h-2 w-8 rounded-full bg-white/35 aria-[current=true]:bg-[var(--bw-color-brand)]"
                        onClick={() => selectScene(index)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
          <p className="sr-only" aria-live="polite">
            {title}
          </p>
        </div>
      </div>
    </section>
  );
}
