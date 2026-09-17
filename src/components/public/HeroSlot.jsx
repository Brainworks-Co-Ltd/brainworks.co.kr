import { useEffect, useState } from "react";
import { JetBrains_Mono } from "next/font/google";

/*
 * 슬롯 단어에만 고정폭 영문 글꼴을 입혀 '지금 입력되는 글자'로 읽히게 한다.
 * 슬롯이 전부 영문 솔루션 이름이라 라틴 글리프만 받는다.
 */
const slotFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

/*
 * 네 단계를 명시적으로 도는 타이핑 루프. 60ms 인터벌로 경과 시간을 누적하던
 * 예전 방식은 히어로를 1~2초만 보고 스크롤하는 방문자에게 사실상 정지 화면으로
 * 보였다. chainSetTimeout으로 단계마다 다음 지연을 스스로 예약해 타이핑,
 * 정지, 지움, 쉼이 눈에 보이는 리듬으로 이어지게 한다.
 */
const TYPE_MS = 110;
const HOLD_MS = 1500;
const ERASE_MS = 55;
const PAUSE_MS = 400;
const REDUCED_MS = 3000;

function useHeroTyping(slots) {
  const [motionQuery] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null,
  );
  const [reduced, setReduced] = useState(() => motionQuery?.matches ?? false);
  const [paused, setPaused] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    if (!motionQuery) return undefined;
    const onMotion = (event) => setReduced(event.matches);
    motionQuery.addEventListener("change", onMotion);
    return () => motionQuery.removeEventListener("change", onMotion);
  }, [motionQuery]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (paused || slots.length < 2) return undefined;
    const word = slots[index] ?? "";

    if (reduced) {
      const timer = setTimeout(() => {
        setIndex((i) => (i + 1) % slots.length);
      }, REDUCED_MS);
      return () => clearTimeout(timer);
    }

    let delay;
    let step;
    if (phase === "typing") {
      if (typed.length < word.length) {
        delay = TYPE_MS;
        step = () => setTyped(word.slice(0, typed.length + 1));
      } else {
        delay = 0;
        step = () => setPhase("holding");
      }
    } else if (phase === "holding") {
      delay = HOLD_MS;
      step = () => setPhase("deleting");
    } else if (phase === "deleting") {
      if (typed.length > 0) {
        delay = ERASE_MS;
        step = () => setTyped(word.slice(0, typed.length - 1));
      } else {
        delay = 0;
        step = () => setPhase("pausing");
      }
    } else {
      delay = PAUSE_MS;
      step = () => {
        setIndex((i) => (i + 1) % slots.length);
        setPhase("typing");
      };
    }

    const timer = setTimeout(step, delay);
    return () => clearTimeout(timer);
  }, [phase, typed, index, paused, reduced, slots]);

  let display = typed;
  if (slots.length < 2) display = slots[0] ?? "";
  else if (reduced) display = slots[index] ?? "";

  return { typed: display, showCaret: !reduced && slots.length >= 2 };
}

/*
 * 질문은 줄바꿈(
)으로 줄을 나눈다. 슬롯이 든 줄은 슬롯 바로 뒤에 붙은
 * 조사(를, 의 같은 공백 없는 꼬리)를 슬롯과 한 덩어리로 묶어 줄이 갈라지지
 * 않게 하고, 슬롯이 비었을 때는 조사를 감춰 "|를"처럼 보이지 않게 한다.
 * 슬롯 이름 길이가 16~21자로 달라 같은 줄에 뒤 문장을 두면 매 글자마다
 * 흔들리므로, 뒤 문장은 다음 줄로 보내는 것을 전제로 한다.
 */
export default function HeroSlot({ slots, question = undefined, as = "h2" }) {
  const { typed, showCaret } = useHeroTyping(slots);
  const Heading = as;
  const lines = (
    question || "{slot}의 일은 AI로 어떻게 달라질 수 있을까요?"
  ).split("\n");

  return (
    <Heading className="text-[28px] font-semibold leading-[1.35] text-ink lg:text-[45px] lg:leading-[1.3]">
      {lines.map((line, index) => {
        if (!line.includes("{slot}")) {
          return (
            <span key={index} className="block">
              {line}
            </span>
          );
        }
        const [before, after = ""] = line.split("{slot}");
        const attached = after.match(/^\S*/)[0];
        const rest = after.slice(attached.length);
        return (
          <span key={index} className="block">
            {before}
            <span className="whitespace-nowrap">
              <span
                className={`${slotFont.className} bw-hero-live relative inline-block text-[22px] font-semibold text-ink lg:text-[45px]`}
              >
                {typed}
                {showCaret && (
                  <span aria-hidden="true" className="bw-hero-caret" />
                )}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-[-0.12em] h-[3px] bg-[var(--color-accent-strong)]"
                />
              </span>
              {typed ? attached : null}
            </span>
            {rest}
          </span>
        );
      })}
    </Heading>
  );
}
