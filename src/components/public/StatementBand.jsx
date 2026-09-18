import { useEffect, useRef } from "react";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 선언 구간. 핵심 구절(emphasis)은 늘 흰색으로 서 있고, 나머지 어절은 옅게
 * 깔려 있다가 포인터가 가까워지면 밝아진다. 핵심 구절이 없으면 문장 전체가
 * 옅은 상태에서 포인터만 따라간다.
 *
 * 예전에는 모든 어절을 65%로 깔고 포인터 주변만 밝혔다. 켜진 곳과 꺼진 곳의
 * 차이가 작아 효과의 이유가 읽히지 않았고, 어디에 눈을 둬야 하는지도 말해 주지
 * 못했다. 옅은 쪽을 34%까지 내리고 핵심 구절은 고정으로 세운다.
 *
 * 정밀 포인터가 없거나 동작 줄이기를 사용하면 서버 렌더 상태(핵심 구절만
 * 흰색)를 유지한다.
 */

// 핵심 구절 밖의 어절이 깔리는 밝기. 어두운 면 위 대비는 6:1 남짓이라 문장 전체도 읽힌다.
const DIM = 0.34;
// 인접 어절까지 함께 밝아지는 포인터 주변 반경이다.
const SPOTLIGHT_RADIUS = 280;

function distanceToRect(x, y, rect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

/*
 * 문장을 어절로 나누고, 핵심 구절의 글자 범위에 걸치는 어절을 lit으로 표시한다.
 * 구절이 어절 중간에서 끝나도("믿지 않습니다"와 "않습니다.") 그 어절 전체가 선다.
 */
function splitWords(text, emphasis) {
  const ranges = emphasis
    .map((phrase) => {
      const start = text.indexOf(phrase);
      return start < 0 ? null : [start, start + phrase.length];
    })
    .filter(Boolean);
  const words = [];
  let offset = 0;
  for (const word of text.split(" ")) {
    const start = offset;
    const end = offset + word.length;
    words.push({
      word,
      lit: ranges.some(([from, to]) => start < to && end > from),
    });
    offset = end + 1;
  }
  return words;
}

/** @param {{ eyebrow?: string | null, text: string, emphasis?: string[] }} props */
export function StatementBand({ eyebrow, text, emphasis = [] }) {
  const { language } = useLocale();
  const ref = useRef(null);
  const words = splitWords(text, emphasis);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    // 핵심 구절은 늘 흰색이므로 옅은 어절만 포인터를 따른다.
    const dimWords = Array.from(root.querySelectorAll(".bw-statement__dim"));
    if (!dimWords.length) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const paint = () => {
      frame = 0;
      const rectangles = dimWords.map((word) => word.getBoundingClientRect());
      for (let index = 0; index < dimWords.length; index += 1) {
        const distance = distanceToRect(pointerX, pointerY, rectangles[index]);
        const lit = Math.max(0, 1 - distance / SPOTLIGHT_RADIUS);
        dimWords[index].style.opacity = String(DIM + (1 - DIM) * lit);
      }
    };

    const onPointerMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(paint);
    };

    const restore = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      for (const word of dimWords) word.style.opacity = "";
    };

    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", restore);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", restore);
    };
  }, [text, emphasis]);

  return (
    <section
      className="bw-statement"
      aria-label={eyebrow || (language === "ko" ? "선언" : "Statement")}
    >
      <div className="bw-statement__inner" ref={ref}>
        {eyebrow ? <p className="bw-statement__eyebrow">{eyebrow}</p> : null}
        <p className="bw-statement__text">
          {words.map(({ word, lit }, index) => (
            <span
              key={`${word}-${index}`}
              className={`bw-statement__word ${lit ? "bw-statement__lit" : "bw-statement__dim"}`}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

export default StatementBand;
