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

export default function App({ Component, pageProps }) {
  useUiVariant();

  return (
    <>
      <SkipLink />
      <SeoMetadata title="Brainworks" />
      <Component {...pageProps} />
    </>
  );
}
