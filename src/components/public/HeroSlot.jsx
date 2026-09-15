import { useEffect, useState } from "react";

export default function HeroSlot({ slots }) {
  const [typed, setTyped] = useState(slots[0] ?? "");

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motion.matches;
    let elapsed = 0;
    let current = 0;
    let started = false;
    let interval = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        elapsed += 60;
        if (elapsed >= 3000) {
          elapsed = 0;
          current = (current + 1) % slots.length;
          started = true;
          setTyped(reduceMotion ? (slots[current] ?? "") : "");
          return;
        }
        if (!reduceMotion && started) {
          const target = slots[current] ?? "";
          const position = Math.min(Math.floor(elapsed / 60), target.length);
          setTyped(target.slice(0, position));
        }
      }, 60);
    };

    const stop = () => {
      if (!interval) return;
      clearInterval(interval);
      interval = null;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const onMotionChange = (event) => {
      reduceMotion = event.matches;
    };

    if (!document.hidden && slots.length > 1) start();
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotionChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [slots]);

  return (
    <h2 className="text-[32px] font-semibold leading-[1.3] text-ink lg:text-[45px]">
      <span className="text-ink shadow-[inset_0_-0.35em_0_var(--color-accent-strong)]">
        {typed}
      </span>
      의 일은 AI로 어떻게 달라질 수 있을까요?
    </h2>
  );
}
