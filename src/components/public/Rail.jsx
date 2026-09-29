import { useEffect, useRef, useState } from "react";

function ArrowIcon({ dir }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={dir === "prev" ? "M10 2 4 8l6 6" : "M6 2l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 카드가 실제로 멈출 수 있는 scroll-snap 위치와 마지막 도달 위치를 계산합니다.
function computeStops(ul) {
  const padLeft = parseFloat(getComputedStyle(ul).paddingLeft) || 0;
  const maxScroll = Math.max(0, ul.scrollWidth - ul.clientWidth);
  const cardStops = Array.from(ul.children).map(
    (card) => card.offsetLeft - ul.offsetLeft - padLeft,
  );
  const reachable = cardStops.filter((stop) => stop < maxScroll - 1);
  const merged = [...reachable, maxScroll].map((stop) =>
    Math.max(0, Math.round(stop)),
  );
  return Array.from(new Set(merged)).sort((a, b) => a - b);
}

function nearestIndex(stops, scrollLeft) {
  let best = 0;
  let bestDiff = Infinity;
  stops.forEach((stop, index) => {
    const diff = Math.abs(stop - scrollLeft);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = index;
    }
  });
  return best;
}

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

export default function Rail({ children }) {
  const ulRef = useRef(null);
  const stopsRef = useRef([]);
  const [stops, setStops] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ul = ulRef.current;
    if (!ul) return undefined;

    const onScroll = () => {
      setActive(nearestIndex(stopsRef.current, ul.scrollLeft));
    };

    const measure = () => {
      const next = computeStops(ul);
      stopsRef.current = next;
      setStops(next);
      onScroll();
    };

    measure();
    ul.addEventListener("scroll", onScroll, { passive: true });
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    resizeObserver?.observe(ul);

    return () => {
      ul.removeEventListener("scroll", onScroll);
      resizeObserver?.disconnect();
    };
  }, []);

  const goTo = (index) => {
    const ul = ulRef.current;
    const currentStops = stopsRef.current;
    if (!ul || !currentStops.length) return;
    const nextIndex = Math.max(0, Math.min(currentStops.length - 1, index));
    ul.scrollTo({ left: currentStops[nextIndex], behavior: "smooth" });
  };

  return (
    <>
      <ul ref={ulRef} className="rail">
        {children}
      </ul>
      <div className="flex min-h-[44px] items-center justify-center gap-6 pt-10 lg:pt-12">
        {stops.length > 1 && (
          <>
            <button
              type="button"
              aria-label="이전"
              disabled={active === 0}
              onClick={() => goTo(active - 1)}
              className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-strong transition-colors hover:bg-ink-strong hover:text-white disabled:cursor-default disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink lg:flex ${FOCUS_RING}`}
            >
              <ArrowIcon dir="prev" />
            </button>
            <div className="flex items-center gap-2">
              {stops.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`${index + 1}번째로 이동`}
                  aria-current={index === active ? "true" : undefined}
                  onClick={() => goTo(index)}
                  className={`h-[6px] rounded-full transition-all duration-300 ${FOCUS_RING} ${index === active ? "w-[100px] bg-gradient-to-r from-accent-strong to-accent" : "w-[6px] bg-muted/40"}`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="다음"
              disabled={active === stops.length - 1}
              onClick={() => goTo(active + 1)}
              className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-strong transition-colors hover:bg-ink-strong hover:text-white disabled:cursor-default disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink lg:flex ${FOCUS_RING}`}
            >
              <ArrowIcon dir="next" />
            </button>
          </>
        )}
      </div>
    </>
  );
}
