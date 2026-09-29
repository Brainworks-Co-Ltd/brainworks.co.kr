import { useEffect, useState } from "react";
import { CarouselControls } from "@/components/ui/carousel-controls";

/*
 * 협력사가 있는 나라를 점 지도 위에서 차례로 짚어 준다. 지도는 등장방형 투영의
 * 점 SVG(public/images/outbound/world-dots.svg)이고, 표시점은 같은 투영으로
 * 퍼센트 위치를 계산해 그 위에 얹는다. 나라 목록은 항상 보이고, 목록을
 * 누르거나 이전/다음을 누르면 그 나라로 간다. 마우스, 키보드 초점, 사용자
 * 일시정지, 동작 줄이기에서는 자동 순회를 멈춘다.
 */
const CYCLE_MS = 4000;
const LON = [-170, 190];
const LAT = [-56, 78];

export function projectToPercent(lon, lat) {
  return {
    left: ((lon - LON[0]) / (LON[1] - LON[0])) * 100,
    top: ((LAT[1] - lat) / (LAT[1] - LAT[0])) * 100,
  };
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function countLabel(count, language) {
  if (language === "ko") return `협력사 ${count}곳`;
  return `${count} partner ${count === 1 ? "company" : "companies"}`;
}

export default function GlobalNetworkMap({ countries, language }) {
  const [current, setCurrent] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [announced, setAnnounced] = useState("");
  const reduced = useReducedMotion();
  const playing = !userPaused && !hovered && !focused && !reduced;
  const active = countries[current];

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(
      () => setCurrent((i) => (i + 1) % countries.length),
      CYCLE_MS,
    );
    return () => clearTimeout(timer);
  }, [current, playing, countries.length]);

  const go = (index) => {
    const next = (index + countries.length) % countries.length;
    setCurrent(next);
    setAnnounced(
      `${countries[next].label[language]}, ${countLabel(countries[next].count, language)}`,
    );
  };

  const labels =
    language === "ko"
      ? {
          previous: "이전 나라",
          next: "다음 나라",
          pause: "자동 넘김 멈춤",
          play: "자동 넘김 재생",
        }
      : {
          previous: "Previous country",
          next: "Next country",
          pause: "Pause",
          play: "Play",
        };
  const activePos = projectToPercent(active.lon, active.lat);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="bw-netmap relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- 색을 구운 정적 SVG라 최적화 대상이 아니다. */}
        <img
          src="/images/outbound/world-dots.svg"
          alt=""
          width={1200}
          height={560}
          className="block h-auto w-full"
        />
        {countries.map((country, index) => {
          const pos = projectToPercent(country.lon, country.lat);
          return (
            <span
              key={country.key}
              aria-hidden="true"
              data-active={index === current || undefined}
              className="bw-netmap__marker"
              style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
            />
          );
        })}
        <div
          aria-hidden="true"
          className="bw-netmap__card"
          style={{ left: `${activePos.left}%`, top: `${activePos.top}%` }}
        >
          <strong className="block text-[18px] leading-tight lg:text-[20px]">
            {active.label[language]}
          </strong>
          <span className="text-[14px] text-muted">
            {countLabel(active.count, language)}
          </span>
        </div>
      </div>

      <ul className="mt-10 flex flex-wrap items-baseline justify-center gap-x-8 gap-y-4 lg:mt-14 lg:gap-x-12">
        {countries.map((country, index) => (
          <li key={country.key}>
            <button
              type="button"
              aria-pressed={index === current}
              onClick={() => go(index)}
              className="bw-netmap__country flex items-baseline gap-2 border-b-2 border-transparent pb-1 aria-pressed:border-accent-strong aria-pressed:text-white"
            >
              <span className="text-[24px] font-semibold leading-none lg:text-[34px]">
                {country.label[language]}
              </span>
              <span className="text-[15px] font-semibold text-accent-strong lg:text-[17px]">
                {country.count}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <CarouselControls
        className="mt-8 justify-center"
        isPlaying={!userPaused}
        onPrevious={() => go(current - 1)}
        onNext={() => go(current + 1)}
        onTogglePlay={() => setUserPaused((value) => !value)}
        labels={labels}
      />
      <span className="sr-only" aria-live="polite">
        {announced}
      </span>
    </div>
  );
}
