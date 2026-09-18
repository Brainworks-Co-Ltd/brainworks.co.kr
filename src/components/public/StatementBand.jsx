import { useEffect, useRef } from "react";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 선언 구간. 평소에는 문장 전체가 흰색이다. 마우스를 문장 위에 올리면 핵심
 * 구절(emphasis)만 흰색으로 남고 나머지 어절이 흐려져 핵심 구절이 떠오른다.
 * 흐려지는 동작은 industrial.css의 :hover 규칙이 맡는다.
 *
 * 마우스가 없는 기기에서는 문장이 화면 가운데쯤 들어올 때 같은 상태가 된다.
 * 동작 줄이기에서도 상태는 바뀌되 전환 애니메이션만 없앤다.
 */

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
    if (!root || !emphasis.length) return undefined;
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return undefined;
    }
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => root.classList.toggle("is-focused", entry.isIntersecting),
      { rootMargin: "-35% 0px -35% 0px" },
    );
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
        <p
          ref={ref}
          className={`bw-statement__text${emphasis.length ? " has-emphasis" : ""}`}
        >
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
