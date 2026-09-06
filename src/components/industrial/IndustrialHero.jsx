import { useState } from "react";
import Link from "next/link";
import {
  GraphicMotionControl,
  useGraphicMotion,
} from "@/components/public/GraphicMotionControl";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 히어로: 질문 하나와 현장별 답.
 *
 *   「제조 현장」의 문제를 AI로 풀 수 있을까요?
 *   진동 이상 탐지와 비전 불량 판별을 자동화했습니다.
 *
 * 슬롯이 바뀌면 답도 같이 바뀐다. 산업마다 해결책이 달라야 한다는
 * 대표 메시지를 화면이 그대로 증명하게 만드는 구조다.
 *
 * 슬롯을 산업명이 아니라 '현장'으로 잡은 이유: 사업 영역 넷 중 에이전트만
 * 기술 이름이라 산업으로 세우면 층위가 깨진다. 현장으로 잡으면 넷이
 * 같은 층위가 되고 "현장의 언어로 답한다"와도 맞는다.
 *
 * 답은 주장이 아니라 사실이어야 한다. '가능합니다'로 답하지 않는다.
 *
 * 답의 꼴도 넷이 같아야 한다. 대상을 적고 동사 하나로 닫는다.
 * 제조는 원래 "진동, 불량, 수율, 환경 네 가지로 풀었습니다"였다.
 * 나머지 셋은 무엇을 어떻게 했는지 말하는데 제조만 영역을 나열하고
 * 개수로 때웠고, 질문의 '풀 수 있을까요'를 '풀었습니다'로 되받아
 * 동어반복이었다. 06 감사표의 솔루션 이름에는 원래 탐지·판별·예측·분석
 * 동사가 붙어 있는데 문구가 명사만 남긴 것이 원인이었다.
 * 수율 예측과 환경 분석은 첫 화면에서 빼고 사업 영역 페이지에 남긴다.
 * 06-01 §73이 수율 예측을 멘토 승인 대기 표현으로 올려뒀다.
 */

const SLOTS = [
  {
    id: "manufacturing",
    site: { ko: "제조 현장", en: "the factory floor" },
    answer: {
      ko: "진동 이상 탐지와 비전 불량 판별을 자동화했습니다.",
      en: "We automated vibration anomaly detection and visual defect inspection.",
    },
    shot: "/images/services/hero/manufacturing.webp",
  },
  {
    id: "healthcare",
    site: { ko: "진료 현장", en: "the clinic" },
    answer: {
      ko: "심전도와 치과 영상 판독을 자동화했습니다.",
      en: "We automated ECG and dental imaging reads.",
    },
    shot: "/images/services/hero/healthcare.webp",
  },
  {
    id: "smartcity",
    site: { ko: "도시 관제", en: "city operations" },
    answer: {
      ko: "위치, 이륜차, 드론 기록을 한 화면에 모았습니다.",
      en: "We brought location, micromobility, and drone records into one view.",
    },
    shot: "/images/services/hero/smartcity.webp",
  },
  {
    id: "agent",
    site: { ko: "고객 응대", en: "customer support" },
    answer: {
      ko: "실시간 음성 통역과 교육 Q&A를 에이전트로 만들었습니다.",
      en: "We built agents for live interpretation and course Q&A.",
    },
    shot: "/images/services/hero/agent.webp",
  },
];

export default function IndustrialHero() {
  const { language } = useLocale();
  const [index, setIndex] = useState(0);
  const motion = useGraphicMotion();
  const slot = SLOTS[index];

  return (
    <section
      className="ind-hero ind-dark"
      data-variant="bleed"
      data-motion-paused={motion.paused}
      role="region"
      aria-label={
        language === "ko" ? "브레인웍스 사업 영역" : "Brainworks domains"
      }
    >
      {/* 배경을 미리 받아 직접 선택할 때 이미지가 빈 상태로 바뀌지 않게 한다. */}
      <div
        className="ind-hero__bg"
        aria-hidden="true"
        key={motion.run}
        onAnimationEnd={motion.finish}
      >
        {SLOTS.map((item, i) => (
          <img
            key={item.id}
            src={item.shot}
            alt=""
            data-active={i === index}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
          />
        ))}
        <div className="ind-hero__tint" />
        <div className="ind-hero__scrim" />
      </div>
      <div className="ind-hero__inner">
        <div className="ind-hero__copy">
          <p className="ind-eyebrow">
            {language === "ko" ? "브레인웍스 사업 분야" : "Brainworks domains"}
          </p>
          <div aria-live="polite" aria-atomic="true">
            <h1 className="ind-display ind-hero__title">
              {language === "ko" ? (
                <>
                  <span className="ind-hero__question">
                    <span className="ind-slot">{slot.site.ko}</span>의 문제를
                  </span>{" "}
                  <span className="ind-hero__question">
                    AI로 풀 수 있을까요?
                  </span>
                </>
              ) : (
                <>
                  Can AI solve what happens on{" "}
                  <span className="ind-slot">{slot.site.en}</span>?
                </>
              )}
            </h1>
            <p className="ind-lead ind-hero__answer">{slot.answer[language]}</p>
          </div>
          <div className="ind-hero__actions">
            <Link href="/services" className="ind-btn ind-btn--solid">
              {language === "ko" ? "솔루션 보기" : "View solutions"}
            </Link>
            <Link href="/contact" className="ind-btn ind-btn--ghost">
              {language === "ko" ? "상담 신청" : "Talk to us"}
            </Link>
          </div>
        </div>
      </div>
      <GraphicMotionControl motion={motion} />
      <div className="ind-hero__rail">
        {SLOTS.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className="ind-hero__tab"
            data-active={i === index}
            style={{ "--tab-accent": "var(--bw-graphic)" }}
            aria-pressed={i === index}
            onClick={() => {
              setIndex(i);
              motion.restart();
            }}
          >
            <span className="ind-hero__tab-index" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="ind-hero__tab-label">{item.site[language]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
