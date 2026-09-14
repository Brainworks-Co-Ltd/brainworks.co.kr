import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 히어로: 질문 하나와 사업 영역별 답.
 *
 *   「제조 AI」는 어떤 문제를 풀었을까요?
 *   진동 이상 탐지와 비전 불량 판별을 자동화했습니다.
 *
 * 슬롯이 바뀌면 답도 같이 바뀐다. 산업마다 해결책이 달라야 한다는
 * 대표 메시지를 화면이 그대로 증명하게 만드는 구조다.
 *
 * 슬롯은 바로 아래 사업 영역 카드와 같은 넷을 가리키므로 같은 이름을 쓴다.
 * 원래 '제조 현장'처럼 일반명사로 잡았는데 어느 회사나 쓸 수 있는 말이라
 * 우리가 실제로 무엇을 파는지가 첫 화면에서 드러나지 않았고, 카드가 쓰는
 * Manufacturing AI 계열 이름과도 어긋났다. 한글은 뒤에 AI를 붙여 넷을
 * 같은 꼴로 맞춘다. 조사도 넷 다 '는'으로 떨어진다.
 *
 * 질문에서 'AI로'를 뺀 이유: 슬롯 이름에 이미 AI가 들어가 한 문장에 두 번 나온다.
 *
 * 질문에 '문제'를 남긴 이유: '무엇을 풀었을까요'만으로는 아래 답을 읽기 전까지
 * 무엇을 묻는지 알 수 없다. 첫 화면은 스치듯 읽히므로 묻는 대상을 문장 안에
 * 적어 둔다. 답의 '자동화했습니다'와 동어반복도 아니다.
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
    site: { ko: "제조 AI", en: "Manufacturing AI" },
    answer: {
      ko: "진동 이상 탐지와 비전 불량 판별을 자동화했습니다.",
      en: "We automated vibration anomaly detection and visual defect inspection.",
    },
    shot: "/images/services/hero/manufacturing.webp",
  },
  {
    id: "healthcare",
    site: { ko: "헬스케어 AI", en: "Healthcare AI" },
    answer: {
      ko: "심전도와 치과 영상 판독을 자동화했습니다.",
      en: "We automated ECG and dental imaging reads.",
    },
    shot: "/images/services/hero/healthcare.webp",
  },
  {
    id: "smartcity",
    site: { ko: "스마트시티 AI", en: "SmartCity AI" },
    answer: {
      ko: "위치, 이륜차, 드론 기록을 한 화면에 모았습니다.",
      en: "We brought location, micromobility, and drone records into one view.",
    },
    shot: "/images/services/hero/smartcity.webp",
  },
  {
    id: "agent",
    site: { ko: "에이전트 AI", en: "sLLM Agent" },
    answer: {
      ko: "실시간 음성 통역과 교육 Q&A를 에이전트로 만들었습니다.",
      en: "We built agents for live interpretation and course Q&A.",
    },
    shot: "/images/services/hero/agent.webp",
  },
];

const TYPE_MS = 80;
const ERASE_MS = 40;
const HOLD_MS = 2400;

/*
 * 승인 명세 7.2: 일시 정지를 단일 불리언으로 관리하지 않는다.
 * 원인을 구분해 하나가 풀려도 다른 원인이 남아 있으면 재생하지 않는다.
 * 여기서 다루는 원인은 포인터, 키보드 초점, 문서 숨김, 동작 줄이기다.
 */
function usePauseCauses() {
  const [causes, setCauses] = useState({
    pointer: false,
    focus: false,
    hidden: false,
    reduced: false,
  });

  const set = (key, value) =>
    setCauses((prev) =>
      prev[key] === value ? prev : { ...prev, [key]: value },
    );

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = (e) => set("reduced", e.matches);
    const onVisibility = () => set("hidden", document.hidden);

    set("reduced", motion.matches);
    set("hidden", document.hidden);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return {
    paused: Object.values(causes).some(Boolean),
    reduced: causes.reduced,
    set,
  };
}

/*
 * 한 슬롯에서 치고 지운다. 동작 줄이기가 켜져 있으면 첫 항목을 고정한다.
 *
 * phase를 ref가 아니라 state로 둔다. ref로 두면 hold 단계에서 타이머가
 * 아무 상태도 바꾸지 않아 효과가 다시 돌지 않고 그대로 멈춘다.
 * 모든 단계가 반드시 상태를 하나 바꾸도록 만든다.
 */
function useTypedSlot(words, paused) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(words[0]);
  const [phase, setPhase] = useState("hold");
  const key = words.join("|");

  useEffect(() => {
    if (paused) return undefined;

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
  }, [phase, typed, index, paused, key, words]);

  /* 7.3 직접 선택. 다시 타이핑하지 않고 완성된 상태로 바로 보여준다.
     수동 일시 정지 상태를 해제하지 않는다. */
  const goTo = (next) => {
    setIndex(next);
    setTyped(words[next]);
    setPhase("hold");
  };

  return { index, typed, goTo };
}

export default function IndustrialHero() {
  const { language } = useLocale();
  const { paused, reduced, set: setPause } = usePauseCauses();
  const words = useMemo(() => SLOTS.map((s) => s.site[language]), [language]);
  const { index, typed, goTo } = useTypedSlot(words, paused);
  const slot = SLOTS[index];

  const question =
    language === "ko"
      ? { before: "", after: "는 어떤 문제를 풀었을까요?" }
      : { before: "What problem has ", after: " solved?" };

  /* 스크린리더에는 애니메이션 대신 완성된 문장 하나를 준다.
     보이는 문장과 같은 틀에서 만든다. 로케일별로 따로 쓰면 질문을 고칠 때
     한쪽만 고쳐져 읽어주는 문장이 화면과 어긋난다. */
  const spoken = `${question.before}${SLOTS.map((s) => s.site[language]).join(", ")}${question.after} ${SLOTS.map((s) => s.answer[language]).join(" ")}`;

  return (
    <section
      className="ind-hero ind-dark"
      /*
       * 상세 페이지 공통 규칙이 main > section에 위아래 96px을 넣는데,
       * 자체 여백을 쓰는 히어로는 data-variant로 빠지게 되어 있다.
       * 이 히어로만 그 표시가 없어서 레일 밑에 96px이 붙어 있었다.
       * 단색일 때는 안 보이다가 전면 배경이 들어오자 그림으로 드러났다.
       * 같은 표시가 첫 화면에는 필요 없는 스크롤 등장 애니메이션도 함께 끈다.
       */
      data-variant="bleed"
      role="region"
      aria-label={
        language === "ko" ? "브레인웍스 사업 영역" : "Brainworks domains"
      }
      onFocusCapture={() => setPause("focus", true)}
      onBlurCapture={() => setPause("focus", false)}
    >
      {/*
        배경은 넷을 모두 깔아두고 투명도로 바꾼다. 한 장만 갈아끼우면 슬롯이
        돌 때마다 그 자리에서 새로 받아야 해서 배경이 잠깐 비고, 전면 배경은
        썸네일과 달리 그 빈 화면이 그대로 보인다. 미리 받아두면 교차 전환도
        공짜로 따라온다. 넷 합쳐 1MB라 미리 받는 편이 싸다.
      */}
      <div className="ind-hero__bg" aria-hidden="true">
        {SLOTS.map((s, i) => (
          <img
            key={s.id}
            src={s.shot}
            alt=""
            data-active={i === index}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
          />
        ))}
        <div className="ind-hero__scrim" />
      </div>

      <div className="ind-grid-bg" aria-hidden="true" />

      <div className="ind-hero__inner">
        <div className="ind-hero__copy">
          <h1 className="ind-display ind-hero__title">
            <span className="sr-only">{spoken}</span>

            <span aria-hidden="true">
              {question.before}
              {/*
                폭을 미리 잡지 않는다. 고정하면 타이핑 중에 빈 공간만 벌어진다.
                뒤 문장이 커서를 따라오게 둔다.

                슬롯 이름이 5~9글자로 길이가 제각각인데도 이대로 두는 이유:
                1440px과 390px에서 넷 다 두 줄로 떨어지고 줄바꿈 지점도 같다.
                첫 줄 길이만 달라진다. 질문에서 '현장의'를 뺀 것이 여기에
                필요했다. 그 단어가 있으면 390px에서 스마트시티 AI만 세 줄이
                되어 아래 답과 버튼이 52px씩 오르내렸다.
              */}
              <span
                className="ind-slot"
                style={{ "--slot-accent": `var(--bw-slot-${slot.id})` }}
              >
                {typed}
                {reduced ? null : <i className="ind-slot__caret" />}
              </span>
              {question.after}
            </span>
          </h1>

          <p
            className="ind-lead ind-hero__answer"
            aria-hidden="true"
            key={slot.id}
          >
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
      </div>

      {/*
        7.3 직접 선택. 자동 재생만으로는 원하는 현장을 볼 수 없다.

        7.2의 "포인터가 Hero 위에 있음"은 레일에만 적용한다. 히어로가 첫 화면
        전체를 차지해 마우스가 거의 항상 그 위에 있고, 그대로 걸면 자동 재생이
        사실상 동작하지 않는다. 고르는 중일 때만 멈추는 것이 의도에 맞다.
      */}
      <div
        className="ind-hero__rail"
        onPointerEnter={() => setPause("pointer", true)}
        onPointerLeave={() => setPause("pointer", false)}
      >
        {SLOTS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="ind-hero__tab"
            data-active={i === index}
            style={{ "--tab-accent": `var(--bw-slot-${s.id})` }}
            aria-current={i === index ? "true" : undefined}
            onClick={() => goTo(i)}
          >
            <span className="ind-hero__tab-index" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="ind-hero__tab-label">{s.site[language]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
