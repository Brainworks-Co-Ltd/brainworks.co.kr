import { useEffect, useState } from "react";

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

export default function HeroSlot({ slots, question = undefined, as = "h2" }) {
  const { typed, showCaret } = useHeroTyping(slots);
  const longest = slots.reduce((a, b) => (b.length > a.length ? b : a), "");

  const Heading = as;
  const [questionBefore, questionAfter = ""] = (
    question || "{slot}의 일은 AI로 어떻게 달라질 수 있을까요?"
  ).split("{slot}");

  return (
    <Heading className="text-[32px] font-semibold leading-[1.3] text-ink lg:text-[45px]">
      {questionBefore}
      <span className="relative inline-block">
        <span aria-hidden="true" className="invisible whitespace-nowrap">
          {longest}
        </span>
        <span className="bw-hero-live absolute left-0 top-0 whitespace-nowrap text-ink">
          {typed}
          {showCaret && <span aria-hidden="true" className="bw-hero-caret" />}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-[-0.15em] h-[3px] bg-[var(--color-accent-strong)]"
        />
      </span>
      {questionAfter}
    </Heading>
  );
}
