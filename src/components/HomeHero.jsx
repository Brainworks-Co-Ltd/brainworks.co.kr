import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { CarouselControls } from "@/components/ui/carousel-controls";
import { MediaFrame } from "@/components/ui/media-frame";
import { ProgressTrack } from "@/components/ui/progress-track";

const AUTO_ADVANCE_MS = 6000;

// 히어로는 회사 소개가 아니라 실제로 만든 것을 보여준다.
// shot은 우리가 이미 가진 솔루션 화면이고, src는 기존 배경 미디어다.
const HERO_MEDIA = "/images/hero-animation.gif";
const HERO_POSTER = "/images/대표사진.png";

const defaultScenes = [
  {
    id: "manufacturing-yield",
    title: {
      ko: "불량을 만들기 전에\n예측합니다",
      en: "Predict defects\nbefore they happen",
    },
    description: {
      ko: "제조 공정 데이터로 수율을 실시간 예측하는 AI",
      en: "AI that predicts yield in real time from process data.",
    },
    src: HERO_MEDIA,
    poster: HERO_POSTER,
    alt: {
      ko: "브레인웍스 AI 기술 소개 애니메이션",
      en: "Brainworks AI technology animation",
    },
  },
  {
    id: "healthcare-ecg",
    title: {
      ko: "심전도 판독을\n자동화합니다",
      en: "Automate\nECG reading",
    },
    description: {
      ko: "웨어러블 심전도 데이터를 분석하는 헬스케어 AI",
      en: "Healthcare AI that analyses wearable ECG data.",
    },
    src: HERO_MEDIA,
    poster: HERO_POSTER,
    alt: {
      ko: "브레인웍스 AI 기술 소개 애니메이션",
      en: "Brainworks AI technology animation",
    },
  },
  {
    id: "agent-translate",
    title: {
      ko: "말하는 즉시\n번역됩니다",
      en: "Translated\nas you speak",
    },
    description: {
      ko: "강의와 회의를 실시간 통역하는 sLLM 기반 AI 에이전트",
      en: "An sLLM-based AI agent that interprets lectures in real time.",
    },
    src: HERO_MEDIA,
    poster: HERO_POSTER,
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
 * @property {string} [shot]
 * @property {LocalizedText} [shotAlt]
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
  const elapsedRef = useRef(0);

  const updateElapsed = (value) => {
    elapsedRef.current = value;
    setElapsed(value);
  };

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

    const startedAt =
      Date.now() - (elapsedRef.current / 100) * AUTO_ADVANCE_MS;
    const timer = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAt;
      if (nextElapsed >= AUTO_ADVANCE_MS) {
        setActiveIndex((index) => (index + 1) % resolvedScenes.length);
        updateElapsed(0);
      } else {
        updateElapsed((nextElapsed / AUTO_ADVANCE_MS) * 100);
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
  const shotAlt =
    typeof scene.shotAlt === "string"
      ? scene.shotAlt
      : scene.shotAlt?.[language] || "";
  const multipleScenes = resolvedScenes.length > 1;

  const selectScene = (index) => {
    setActiveIndex(index);
    updateElapsed(0);
  };

  return (
    <section
      aria-label={
        language === "ko" ? "브레인웍스 대표 메시지" : "Brainworks hero message"
      }
      className="bw-home-hero relative isolate min-h-[680px] overflow-hidden bg-[var(--bw-color-ink)] text-white"
      onFocus={() => setIsPlaying(false)}
    >
      <div className="bw-home-hero__media absolute inset-0 -z-10" aria-live="off">
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

      {/* 솔루션 화면. 기본과 C안에서는 숨기고 A안에서만 우측에 세운다. */}
      {scene.shot ? (
        <div
          className="bw-home-hero__shot absolute right-[4%] top-1/2 hidden w-[44%] max-w-[660px] -translate-y-1/2"
          aria-hidden="true"
        >
          <img
            key={scene.id}
            src={scene.shot}
            alt={shotAlt}
            className="bw-hero-fade w-full rounded-[var(--bw-radius-feature)] shadow-[0_30px_80px_rgb(0_0_0/35%)]"
          />
        </div>
      ) : null}

      <div className="bw-home-hero__inner mx-auto flex min-h-[680px] max-w-[1440px] items-end px-6 pb-14 pt-32 md:pb-20">
        <div className="bw-home-hero__copy max-w-3xl">
          {/* 장면이 바뀔 때만 다시 붙어 서서히 나타난다 */}
          <div key={scene.id} className="bw-hero-fade">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--bw-color-brand)]">
              {language === "ko" ? "Brainworks AI & AX" : "Brainworks AI & AX"}
            </p>
            <h1 className="mt-5 whitespace-pre-line text-4xl font-semibold leading-tight tracking-[-0.025em] md:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
              {description}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-brand)] px-6 py-3 text-sm font-semibold text-[var(--bw-color-surface)] hover:brightness-95"
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
