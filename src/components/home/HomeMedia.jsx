import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/shared/routing/useLocale";
import client1 from "@/assets/clients/client1.png";
import client2 from "@/assets/clients/client2.jpg";
import client3 from "@/assets/clients/client3.png";
import client4 from "@/assets/clients/client4.png";
import client5 from "@/assets/clients/client5.jpg";
import client6 from "@/assets/clients/client6.jpg";
import client7 from "@/assets/clients/client7.png";
import client8 from "@/assets/clients/client8.png";
import { businessAreas } from "@/data/businessAreas";
import { homeCopy } from "@/data/homeCopy";
import { CarouselControls } from "@/components/ui/carousel-controls";

const clients = [
  client1,
  client2,
  client3,
  client4,
  client5,
  client6,
  client7,
  client8,
];

/*
 * 네 사업 영역을 무료 스톡 영상(Pexels 라이선스, 상업 사용 가능)으로 차례로 보여준다.
 * 영상은 겹쳐 두고 지금 컷만 재생하며 투명도로 넘긴다. 컷마다 CLIP_MS만 보여주고
 * 다음 컷으로 간다. 동작 줄이기에서는 첫 영역 사진만 보여준다.
 */
const CLIP_MS = 6000;
const clips = businessAreas.map((area) => ({
  id: area.id,
  name: area.name,
  src: `/videos/home/${area.id}.mp4`,
  poster: area.heroImage,
}));

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

function MediaOverlay({ children }) {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12">
        {children}
      </div>
    </>
  );
}

function ClipReel({ language, children }) {
  const [current, setCurrent] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [announced, setAnnounced] = useState("");
  const videos = useRef([]);
  // 남은 시간을 들고 있다가 다시 재생할 때 이어 간다. 컷이 바뀌면 처음부터.
  const remaining = useRef(CLIP_MS);
  const playing = !userPaused && !focused && !hidden;

  // 첫 컷이 뜬 뒤에 나머지 컷을 미리 받아 둔다. 이전/다음을 눌렀을 때
  // 그제야 받기 시작하면 2~3초 멈춘 것처럼 보인다.
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    const warmTimer = setTimeout(() => setWarm(true), 1500);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(warmTimer);
    };
  }, []);

  useEffect(() => {
    remaining.current = CLIP_MS;
    const video = videos.current[current];
    if (video) video.currentTime = 0;
  }, [current]);

  useEffect(() => {
    const video = videos.current[current];
    if (!playing) {
      video?.pause();
      return undefined;
    }
    video?.play()?.catch?.(() => {});
    const startedAt = Date.now();
    const timer = setTimeout(
      () => setCurrent((i) => (i + 1) % clips.length),
      remaining.current,
    );
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - startedAt),
      );
      video?.pause();
    };
  }, [current, playing]);

  const go = (step) => {
    const index = (current + step + clips.length) % clips.length;
    setCurrent(index);
    setAnnounced(clips[index].name[language]);
  };

  const next = (current + 1) % clips.length;
  const labels =
    language === "en"
      ? { previous: "Previous", next: "Next", pause: "Pause", play: "Play" }
      : { previous: "이전", next: "다음", pause: "일시정지", play: "재생" };
  return (
    <div
      className="absolute inset-0"
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      {clips.map((clip, index) => (
        <video
          key={clip.id}
          ref={(node) => {
            videos.current[index] = node;
          }}
          src={clip.src}
          poster={clip.poster}
          muted
          playsInline
          preload={
            warm || index === current || index === next ? "auto" : "none"
          }
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <MediaOverlay>
        <div className="mb-4 flex items-center gap-3 text-[13px] font-semibold text-white lg:mb-6 lg:gap-4 lg:text-[14px]">
          <span>{String(current + 1).padStart(2, "0")}</span>
          <span className="relative h-[2px] w-16 overflow-hidden bg-white/35 lg:w-[150px]">
            <span
              key={current}
              className="bw-reel-fill absolute inset-0 origin-left bg-[var(--color-accent)]"
              style={{
                animationDuration: `${CLIP_MS}ms`,
                animationPlayState: playing ? "running" : "paused",
              }}
            />
          </span>
          <span className="text-white/60">
            {String(next + 1).padStart(2, "0")}
          </span>
          <span className="ml-2 lg:ml-4">{clips[current].name[language]}</span>
        </div>
        {children}
      </MediaOverlay>
      <CarouselControls
        className="absolute bottom-8 right-8 lg:bottom-12 lg:right-12"
        isPlaying={!userPaused}
        onPrevious={() => go(-1)}
        onNext={() => go(1)}
        onTogglePlay={() => setUserPaused((value) => !value)}
        labels={labels}
      />
      <span className="sr-only" aria-live="polite">
        {announced}
      </span>
    </div>
  );
}

export default function HomeMedia() {
  const { language } = useLocale();
  const copy = homeCopy.media;
  const reduced = useReducedMotion();
  const caption = (
    <p className="text-[26px] font-semibold leading-[1.25] text-white lg:text-[44px]">
      {copy.eyebrow[language]}
      <br />
      {copy.title[language]}
    </p>
  );

  return (
    <section>
      <div className="bw-reveal inner">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] bg-ink-strong lg:aspect-[1296/560]">
          {reduced ? (
            <>
              <Image
                src={clips[0].poster}
                alt=""
                fill
                priority
                loading="eager"
                fetchPriority="high"
                sizes="1296px"
                className="object-cover"
              />
              <MediaOverlay>{caption}</MediaOverlay>
            </>
          ) : (
            <ClipReel language={language}>{caption}</ClipReel>
          )}
        </div>
      </div>
      <div className="mt-16 overflow-hidden" aria-hidden="true">
        <div className="marquee items-center">
          {[...clients, ...clients].map((client, index) => (
            <span key={index} className="mx-12 shrink-0">
              <Image
                src={client}
                alt=""
                width={120}
                height={52}
                className="object-contain"
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
