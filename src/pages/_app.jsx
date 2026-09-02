import { useEffect } from "react";
import { useRouter } from "next/router";
import "@/styles/globals.css";
import "@/styles/ui-variants.css";
import "@/styles/industrial.css";
import { SkipLink } from "@/components/public/SkipLink";
import { SeoMetadata } from "@/components/public/SeoMetadata";

const UI_VARIANTS = new Set(["a", "b", "c"]);

/**
 * 발표용 UI 방향 비교. `?ui=a|b|c` 로 디자인 토큰 묶음을 바꾼다.
 * 파라미터가 없으면 아무 속성도 붙이지 않아 기존 화면 그대로 동작한다.
 */
function useUiVariant() {
  const router = useRouter();
  const requested = router.query.ui;

  useEffect(() => {
    const value = Array.isArray(requested) ? requested[0] : requested;
    const root = document.documentElement;
    if (value && UI_VARIANTS.has(value)) {
      root.dataset.ui = value;
    } else {
      delete root.dataset.ui;
    }
  }, [requested]);
}

/**
 * 스크롤 진입 드러남. 섹션과 사업 분야 타일이 화면에 들어오면 data-in을 한 번
 * 붙인다. 전후 상태와 전환은 industrial.css "스크롤 진입 시 드러남" 절이 맡는다.
 */
function useReveal() {
  const router = useRouter();

  useEffect(() => {
    let observer;
    const arm = () => {
      observer?.disconnect();
      const root = document.documentElement;
      // 숨김(data-reveal)을 먼저 적용해 두고 reflow 뒤에 전환을 켠다(ready).
      // 같은 프레임에 둘을 붙이면 숨김 상태가 계산되지 않아 전환이 생략된다.
      root.dataset.reveal = "";
      void root.offsetWidth;
      root.dataset.reveal = "ready";
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.dataset.in = "";
            observer.unobserve(entry.target);
          }
        },
        // 위쪽 여백을 크게 줘서 앵커 이동이나 스크롤 복원으로 이미 지나친 요소도
        // 교차 중으로 친다. 아래쪽 -10%는 살짝 들어온 뒤 시작하게 한다.
        { rootMargin: "10000px 0px -10% 0px" },
      );
      requestAnimationFrame(() => {
        document
          .querySelectorAll(
            "main > section:not([data-variant]), main > div > section:not([data-variant]), .bw-reveal, .ind-domain",
          )
          .forEach((el) => observer.observe(el));
      });
    };
    arm();
    router.events.on("routeChangeComplete", arm);
    return () => {
      router.events.off("routeChangeComplete", arm);
      observer?.disconnect();
    };
  }, [router.events]);
}

export default function App({ Component, pageProps }) {
  useUiVariant();
  useReveal();

  return (
    <>
      <SkipLink />
      <SeoMetadata title="Brainworks" />
      <Component {...pageProps} />
    </>
  );
}
