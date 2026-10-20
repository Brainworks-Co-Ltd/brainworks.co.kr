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

// 첫 컷 그림이 이 페이지의 LCP다. 그 크기를 화면 폭에 맞춰 받도록 next/image로 그린다.
const posterSizes = "(min-width: 1344px) 1296px, 100vw";

// 영상은 페이지가 다 뜬(load) 뒤에 받기 시작한다. 그 전에 받으면 휴대폰 회선에서
// 첫 컷 그림, 폰트, 스크립트와 대역폭을 다퉈 첫 화면이 늦어진다.
function usePageLoaded() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const onLoad = () => setLoaded(true);
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return loaded;
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
  const loaded = usePageLoaded();
  // 페이지가 다 뜨기 전에는 첫 컷 그림만 보여 주고 넘기지도 않는다.
  const playing = loaded && !userPaused && !focused && !hidden;

  // 첫 컷 영상이 받아지기 시작한 뒤에 나머지 컷의 포스터와 영상 파일을 미리 받아 둔다.
  // 이전/다음을 눌렀을 때 그제야 받기 시작하면 2~3초 멈춘 것처럼 보인다. 그 전에는
  // 받지 않는다. 첫 화면에서 첫 컷 그림과 대역폭을 다투지 않게 한다.
  const [warm, setWarm] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!loaded) return undefined;
    const warmTimer = setTimeout(() => setWarm(true), 1500);
    return () => clearTimeout(warmTimer);
  }, [loaded]);

  // 안 보이는 컷의 video에 데이터를 채우면 크롬이 그 첫 프레임을 LCP로 다시 잰다
  // (투명도 0이어도 잰다. 2026-10-20 확인). 그래서 video는 비워 두고 파일만
  // HTTP 캐시(/videos 7일)에 받아 둔다. 차례가 오면 캐시에서 바로 읽는다.
  useEffect(() => {
    if (!warm) return;
    clips.slice(1).forEach((clip) => {
      fetch(clip.src).catch(() => {});
    });
  }, [warm]);

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
      {/* 첫 컷 영상의 포스터 대신 이 그림을 깐다. 영상 포스터는 크기를 고를 수 없어
          휴대폰에도 1920px 원본이 가고, 우선순위도 낮다. 영상이 재생되면 위를 덮는다. */}
      <Image
        src={clips[0].poster}
        alt=""
        fill
        preload
        sizes={posterSizes}
        className={`object-cover transition-opacity duration-700 ${current === 0 ? "opacity-100" : "opacity-0"}`}
      />
      {clips.map((clip, index) => (
        <video
          key={clip.id}
          ref={(node) => {
            videos.current[index] = node;
          }}
          src={clip.src}
          poster={
            index > 0 && (warm || index === current) ? clip.poster : undefined
          }
          muted
          playsInline
          preload={loaded && index === current ? "auto" : "none"}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <MediaOverlay>
        <div className="mb-4 flex items-center gap-3 text-[14px] font-semibold text-white lg:mb-6 lg:gap-4 lg:text-[15px]">
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
      {/* 첫 화면 미디어라 등장 효과(.bw-reveal)를 걸지 않는다. 숨김 상태는
          하이드레이션 뒤에야 풀려 LCP가 자바스크립트 실행까지 밀린다. */}
      <div className="inner">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] bg-ink-strong lg:aspect-[1296/560]">
          {reduced ? (
            <>
              <Image
                src={clips[0].poster}
                alt=""
                fill
                preload
                sizes={posterSizes}
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
