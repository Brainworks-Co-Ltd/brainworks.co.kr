import { useEffect, useRef } from "react";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 선언 구간. 처음에는 문장 전체가 흰색이다. 구간이 화면에 들어오면 잠시 뒤
 * 핵심 구절(emphasis)을 뺀 어절이 앞에서부터 하나씩 30%로 흐려져 핵심 구절만
 * 남는다. 한 번 흐려지면 그대로 둔다.
 *
 * 타이밍은 레퍼런스를 실측한 값이다. 화면 진입 후 약 0.75초 뒤 시작하고,
 * 어절 사이 간격은 0.15초, 어절 하나가 흐려지는 데 0.5초가 걸린다.
 * 동작 줄이기에서는 애니메이션 없이 흐려진 상태로 바로 둔다.
 */
const START_DELAY_MS = 750;
const STAGGER_MS = 150;

/*
 * 문장을 어절로 나누고, 핵심 구절의 글자 범위에 걸치는 어절을 lit으로 표시한다.
 * 구절이 어절 중간에서 끝나도 그 어절 전체가 남는다.
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
  let dimOrder = 0;
  for (const word of text.split(" ")) {
    const start = offset;
    const end = offset + word.length;
    const lit = ranges.some(([from, to]) => start < to && end > from);
    words.push({ word, lit, order: lit ? null : dimOrder++ });
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
    if (!root || !emphasis.length) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      root.classList.add("is-dimmed");
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      root.classList.add("is-dimmed");
      observer.disconnect();
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [emphasis]);

  return (
    <section
      className="bw-statement"
      aria-label={eyebrow || (language === "ko" ? "선언" : "Statement")}
    >
      <div className="bw-statement__inner">
        {eyebrow ? <p className="bw-statement__eyebrow">{eyebrow}</p> : null}
        <p ref={ref} className="bw-statement__text">
          {words.map(({ word, lit, order }, index) => (
            <span
              key={`${word}-${index}`}
              className={`bw-statement__word ${lit ? "bw-statement__lit" : "bw-statement__dim"}`}
              style={
                lit
                  ? undefined
                  : {
                      transitionDelay: `${START_DELAY_MS + order * STAGGER_MS}ms`,
                    }
              }
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
