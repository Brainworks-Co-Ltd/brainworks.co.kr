import { useEffect, useRef } from "react";

/*
 * 스크롤에 맞춰 밝은 어절 무리가 문장을 훑고 지나가는 선언 구간.
 *
 * faculty.ai/en-gb/ai-strategy-and-solution-development 실측 (2026-09-01):
 *   h4        display:flex; flex-wrap:wrap; gap:16px; font-size:84px
 *   어절 span opacity 0.3 또는 1, transition: all
 *             animation-timeline: auto, animation-name: none
 *
 * CSS 스크롤 타임라인이 아니다. JS가 opacity를 바꾸고 transition이
 * 페이드를 만든다. 왼쪽부터 차례로 켜지고 마는 것이 아니라, 밝은
 * 구간이 문장을 지나간다.
 *
 * 어절 간격은 flex gap이다. 마진으로 주면 줄이 바뀔 때 둘째 줄 첫
 * 어절이 밀린다. gap은 줄 시작에 적용되지 않는다.
 *
 * 서버 렌더 결과는 모든 어절이 불투명하다. 자바스크립트가 꺼져 있거나
 * prefers-reduced-motion이면 그 상태 그대로 읽힌다.
 */

// 강조 밖의 문장도 충분한 대비로 읽히게 유지한다.
const DIM = 0.65;
// 한 번에 밝게 둘 어절 수. 좁으면 깜빡이고 넓으면 전부 밝아 보인다.
const WINDOW = 2.6;

export function StatementBand({ eyebrow, text }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = Array.from(root.querySelectorAll("[data-word]"));
    if (!words.length) return;

    let frame = 0;

    const paint = () => {
      frame = 0;
      const box = root.getBoundingClientRect();
      const vh = window.innerHeight;

      // 구간이 화면을 지나가는 동안 0에서 1로 간다
      const travel = vh + box.height;
      const progress = Math.min(1, Math.max(0, (vh - box.top) / travel));

      // 머리가 첫 어절 앞에서 시작해 마지막 어절 뒤에서 끝나게 여유를 준다
      const head = progress * (words.length + WINDOW * 2) - WINDOW;

      for (let i = 0; i < words.length; i += 1) {
        const distance = Math.abs(i - head);
        const lit = Math.max(0, 1 - distance / WINDOW);
        words[i].style.opacity = String(DIM + (1 - DIM) * lit);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [text]);

  return (
    <section className="bw-statement" aria-label={eyebrow || "선언"}>
      <div className="bw-statement__inner" ref={ref}>
        {eyebrow ? <p className="bw-statement__eyebrow">{eyebrow}</p> : null}
        <p className="bw-statement__text">
          {text.split(" ").map((word, i) => (
            <span data-word key={`${word}-${i}`} className="bw-statement__word">
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

export default StatementBand;
