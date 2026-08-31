import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 히어로에서 사진을 걷어낸다.
 *
 * 실측 다섯 곳 중 첫 화면에 스톡 사진을 쓰는 곳이 없었다. 국내는 영상,
 * 해외는 canvas와 이미지였다. 영상은 자산 부담이 크므로 배경은 CSS로
 * 그리고, 화면 오른쪽에는 우리가 실제로 만든 솔루션 UI를 세운다.
 *
 * 구조는 MakinaRocks의 좌우 분할을 따르되 그쪽처럼 영상 안에 오브젝트를
 * 넣지 않고 진짜 2단으로 만든다.
 */

const SCENES = [
  {
    id: "manufacturing",
    accent: "var(--ind-manufacturing)",
    eyebrow: "Manufacturing AI",
    title: { ko: "공정은 멈추지 않습니다", en: "The line never stops" },
    lead: {
      ko: "진동, 불량, 수율, 환경. 네 가지 신호를 함께 읽어 설비가 멈추기 전에 알립니다.",
      en: "Vibration, defects, yield, environment. Four signals read together, before the line halts.",
    },
    shot: "/images/services/hero/manufacturing.webp",
    shotAlt: { ko: "AI 수율 예측 솔루션 화면", en: "AI yield prediction screen" },
  },
  {
    id: "healthcare",
    accent: "var(--ind-healthcare)",
    eyebrow: "Healthcare & Bio AI",
    title: { ko: "판독은 사람의 일로 남깁니다", en: "Reading stays human work" },
    lead: {
      ko: "심전도와 치과 영상에서 기계가 먼저 훑고, 판단이 필요한 것만 사람에게 올립니다.",
      en: "Machines sweep ECG and dental imaging first, escalating only what needs judgement.",
    },
    shot: "/images/services/hero/healthcare.webp",
    shotAlt: { ko: "AI 심전도 분석 화면", en: "AI ECG analysis screen" },
  },
  {
    id: "smartcity",
    accent: "var(--ind-smartcity)",
    eyebrow: "SmartCity & Safety AI",
    title: { ko: "도시는 데이터를 남깁니다", en: "The city leaves data behind" },
    lead: {
      ko: "위치, 이륜차, 드론에서 나오는 기록을 관제 화면 하나로 모읍니다.",
      en: "Location, micromobility, and drone records converge into one control view.",
    },
    shot: "/images/services/hero/smartcity.webp",
    shotAlt: { ko: "AI 위치정보 분석 화면", en: "AI location analytics screen" },
  },
];

const ADVANCE_MS = 7000;

export default function IndustrialHero() {
  const { language } = useLocale();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % SCENES.length),
      ADVANCE_MS,
    );
    return () => clearTimeout(timer);
  }, [index, playing]);

  const scene = SCENES[index];

  return (
    <section
      className="ind-hero"
      role="region"
      aria-label={language === "ko" ? "브레인웍스 사업 영역" : "Brainworks domains"}
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      onFocusCapture={() => setPlaying(false)}
    >
      <div className="ind-grid-bg" aria-hidden="true" />
      <div className="ind-scan" aria-hidden="true" />

      <div className="ind-hero__inner">
        <div className="ind-hero__copy" key={scene.id}>
          <p className="ind-eyebrow" style={{ color: scene.accent }}>
            {scene.eyebrow}
          </p>
          <h1 className="ind-display ind-hero__title">
            {scene.title[language]}
          </h1>
          <p className="ind-lead ind-hero__lead">{scene.lead[language]}</p>

          <div className="ind-hero__actions">
            <Link href="/services" className="ind-btn ind-btn--solid">
              {language === "ko" ? "솔루션 보기" : "View solutions"}
            </Link>
            <Link href="/contact" className="ind-btn ind-btn--ghost">
              {language === "ko" ? "상담 신청" : "Talk to us"}
            </Link>
          </div>
        </div>

        <div className="ind-hero__shot" aria-hidden="true">
          <img key={scene.id} src={scene.shot} alt="" />
        </div>
      </div>

      <div className="ind-hero__rail">
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="ind-hero__tab"
            data-active={i === index}
            style={{ "--tab-accent": s.accent }}
            aria-current={i === index}
            onClick={() => {
              setIndex(i);
              setPlaying(false);
            }}
          >
            <span className="ind-hero__tab-index">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="ind-hero__tab-label">{s.eyebrow}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
