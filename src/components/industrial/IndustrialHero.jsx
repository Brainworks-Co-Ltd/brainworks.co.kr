import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 히어로: 질문 하나와 현장별 답.
 *
 *   「제조 현장」의 문제를 AI로 풀 수 있을까요?
 *   진동, 불량, 수율, 환경 네 가지로 풀었습니다.
 *
 * 슬롯이 바뀌면 답도 같이 바뀐다. 산업마다 해결책이 달라야 한다는
 * 대표 메시지를 화면이 그대로 증명하게 만드는 구조다.
 *
 * 슬롯을 산업명이 아니라 '현장'으로 잡은 이유: 사업 영역 넷 중 에이전트만
 * 기술 이름이라 산업으로 세우면 층위가 깨진다. 현장으로 잡으면 넷이
 * 같은 층위가 되고 "현장의 언어로 답한다"와도 맞는다.
 *
 * 답은 주장이 아니라 사실이어야 한다. '가능합니다'로 답하지 않는다.
 */

const SLOTS = [
  {
    id: "manufacturing",
    accent: "var(--ind-manufacturing)",
    site: { ko: "제조 현장", en: "the factory floor" },
    answer: {
      ko: "진동, 불량, 수율, 환경 네 가지로 풀었습니다.",
      en: "We solved it four ways: vibration, defects, yield, environment.",
    },
    shot: "/images/services/hero/manufacturing.webp",
  },
  {
    id: "healthcare",
    accent: "var(--ind-healthcare)",
    site: { ko: "진료 현장", en: "the clinic" },
    answer: {
      ko: "심전도와 치과 영상 판독을 자동화했습니다.",
      en: "We automated ECG and dental imaging reads.",
    },
    shot: "/images/services/hero/healthcare.webp",
  },
  {
    id: "smartcity",
    accent: "var(--ind-smartcity)",
    site: { ko: "도시 관제", en: "city operations" },
    answer: {
      ko: "위치, 이륜차, 드론 기록을 한 화면에 모았습니다.",
      en: "We brought location, micromobility, and drone records into one view.",
    },
    shot: "/images/services/hero/smartcity.webp",
  },
  {
    id: "agent",
    accent: "var(--ind-agent)",
    site: { ko: "고객 응대", en: "customer support" },
    answer: {
      ko: "상담과 교육 문의를 sLLM 에이전트가 받습니다.",
      en: "An sLLM agent handles support and course enquiries.",
    },
    shot: "/images/services/hero/agent.webp",
  },
];

const TYPE_MS = 80;
const ERASE_MS = 40;
const HOLD_MS = 2400;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(q.matches);
    const on = (e) => setReduced(e.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduced;
}

/*
 * 한 슬롯에서 치고 지운다. 동작 줄이기가 켜져 있으면 첫 항목을 고정한다.
 *
 * phase를 ref가 아니라 state로 둔다. ref로 두면 hold 단계에서 타이머가
 * 아무 상태도 바꾸지 않아 효과가 다시 돌지 않고 그대로 멈춘다.
 * 모든 단계가 반드시 상태를 하나 바꾸도록 만든다.
 */
function useTypedSlot(words, reduced) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(words[0]);
  const [phase, setPhase] = useState("hold");
  const key = words.join("|");

  useEffect(() => {
    if (reduced) return undefined;

    const word = words[index];
    let delay;
    let step;

    if (phase === "hold") {
      delay = HOLD_MS;
      step = () => setPhase("erasing");
    } else if (phase === "erasing") {
      if (typed.length > 0) {
        delay = ERASE_MS;
        step = () => setTyped(word.slice(0, typed.length - 1));
      } else {
        delay = TYPE_MS;
        step = () => {
          setIndex((i) => (i + 1) % words.length);
          setPhase("typing");
        };
      }
    } else if (typed.length < word.length) {
      delay = TYPE_MS;
      step = () => setTyped(word.slice(0, typed.length + 1));
    } else {
      delay = 0;
      step = () => setPhase("hold");
    }

    const timer = setTimeout(step, delay);
    return () => clearTimeout(timer);
  }, [phase, typed, index, reduced, key, words]);

  return { index, typed };
}

export default function IndustrialHero() {
  const { language } = useLocale();
  const reduced = usePrefersReducedMotion();
  const words = useMemo(() => SLOTS.map((s) => s.site[language]), [language]);
  const { index, typed } = useTypedSlot(words, reduced);
  const slot = SLOTS[index];

  const question =
    language === "ko"
      ? { before: "", after: "의 문제를 AI로 풀 수 있을까요?" }
      : { before: "Can AI solve what happens on ", after: "?" };

  /* 스크린리더에는 애니메이션 대신 완성된 문장 하나를 준다 */
  const spoken =
    language === "ko"
      ? `${SLOTS.map((s) => s.site.ko).join(", ")}의 문제를 AI로 풀 수 있을까요? ${SLOTS.map((s) => s.answer.ko).join(" ")}`
      : `${question.before}${SLOTS.map((s) => s.site.en).join(", ")}${question.after} ${SLOTS.map((s) => s.answer.en).join(" ")}`;

  return (
    <section
      className="ind-hero"
      role="region"
      aria-label={language === "ko" ? "브레인웍스 사업 영역" : "Brainworks domains"}
    >
      <div className="ind-grid-bg" aria-hidden="true" />
      <div className="ind-scan" aria-hidden="true" />

      <div className="ind-hero__inner">
        <div className="ind-hero__copy">
          <h1 className="ind-display ind-hero__title">
            <span className="sr-only">{spoken}</span>

            <span aria-hidden="true">
              {question.before}
              {/*
                폭을 미리 잡지 않는다. 한글 네 단어가 모두 같은 길이라
                단어가 바뀔 때 문장이 튀지 않고, 고정하면 타이핑 중에
                빈 공간만 벌어진다. 뒤 문장이 커서를 따라오게 둔다.
              */}
              <span className="ind-slot" style={{ "--slot-accent": slot.accent }}>
                {typed}
                {reduced ? null : <i className="ind-slot__caret" />}
              </span>
              {question.after}
            </span>
          </h1>

          <p className="ind-lead ind-hero__answer" aria-hidden="true" key={slot.id}>
            {slot.answer[language]}
          </p>

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
          <img key={slot.id} src={slot.shot} alt="" />
        </div>
      </div>

      <div className="ind-hero__rail">
        {SLOTS.map((s, i) => (
          <span
            key={s.id}
            className="ind-hero__tab"
            data-active={i === index}
            style={{ "--tab-accent": s.accent }}
            aria-hidden="true"
          >
            <span className="ind-hero__tab-index">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="ind-hero__tab-label">{s.site[language]}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
