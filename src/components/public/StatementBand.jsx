import { useEffect, useRef } from "react";
import { useLocale } from "@/shared/routing/useLocale";

/*
 * 포인터와 가까운 어절을 밝히는 선언 구간이다. 어절의 실제 사각형까지
 * 거리를 계산하므로 여러 줄로 바뀌어도 포인터 주변 문구가 자연스럽게
 * 이어진다. 정밀 포인터가 없거나 동작 줄이기를 사용하면 서버 렌더
 * 상태인 완전한 불투명도를 유지한다.
 */

// 강조 밖의 문장도 충분한 대비로 읽히게 유지한다.
const DIM = 0.65;
// 인접 어절까지 함께 밝아지는 포인터 주변 반경이다.
const SPOTLIGHT_RADIUS = 280;

function distanceToRect(x, y, rect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

export function StatementBand({ eyebrow, text }) {
  const { language } = useLocale();
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const words = Array.from(root.querySelectorAll("[data-word]"));
    if (!words.length) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const paint = () => {
      frame = 0;
      const rectangles = words.map((word) => word.getBoundingClientRect());

      for (let index = 0; index < words.length; index += 1) {
        const distance = distanceToRect(
          pointerX,
          pointerY,
          rectangles[index],
        );
        const lit = Math.max(0, 1 - distance / SPOTLIGHT_RADIUS);
        words[index].style.opacity = String(DIM + (1 - DIM) * lit);
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
      for (const word of words) word.style.opacity = "1";
    };

    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", restore);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", restore);
    };
  }, [text]);

  return (
    <section
      className="bw-statement"
      aria-label={eyebrow || (language === "ko" ? "선언" : "Statement")}
    >
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
