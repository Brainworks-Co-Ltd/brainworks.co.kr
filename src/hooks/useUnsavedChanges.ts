import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";

const CONFIRM_MESSAGE =
  "저장하지 않은 변경사항이 있습니다. 이 화면에서 나가시겠습니까?";

const SKIP_TTL_MS = 1000;

export function useUnsavedChanges(dirty: boolean) {
  // ponytail: 1초 TTL — Link 클릭 직후의 routeChangeStart만 건너뛴다. 수정키 클릭(새 탭)처럼 push가 없으면 만료된다.
  const skipArmedAt = useRef<number | null>(null);
  let router: ReturnType<typeof useRouter> | null;
  try {
    // useRouter는 항상 이 지점에서 정확히 한 번 호출된다. try/catch는 렌더마다
    // 조건부로 호출하기 위함이 아니라, NextRouter가 마운트되지 않은 렌더 트리
    // (일부 컴포넌트 테스트)에서 던지는 예외만 흡수하기 위함이다.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch {
    router = null;
  }

  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty || !router?.events) return;
    const activeRouter = router;

    // 생성 직후 폼이 setBaseline 뒤 router.push를 호출한다. Next 16 pages router는 routeChangeStart 전에 내부 await(_bfl)가 있어 React가 dirty=false로 재구독할 시간이 있다(리뷰에서 router.js 확인).
    const handleRouteChangeStart = (url: string) => {
      const armedAt = skipArmedAt.current;
      skipArmedAt.current = null;
      if (armedAt !== null && Date.now() - armedAt <= SKIP_TTL_MS) {
        return;
      }
      if (url === activeRouter.asPath) return;
      if (window.confirm(CONFIRM_MESSAGE)) return;
      activeRouter.events.emit("routeChangeError");
      throw "미저장 변경으로 이동을 취소했습니다."; // Next pages router가 이동을 중단시키는 공식 방법
    };
    const resetSkip = () => {
      skipArmedAt.current = null;
    };

    activeRouter.events.on("routeChangeStart", handleRouteChangeStart);
    activeRouter.events.on("routeChangeComplete", resetSkip);
    activeRouter.events.on("routeChangeError", resetSkip);
    return () => {
      activeRouter.events.off("routeChangeStart", handleRouteChangeStart);
      activeRouter.events.off("routeChangeComplete", resetSkip);
      activeRouter.events.off("routeChangeError", resetSkip);
    };
  }, [dirty, router]);

  return useCallback(() => {
    if (!dirty) return true;
    const confirmed = window.confirm(CONFIRM_MESSAGE);
    if (confirmed) skipArmedAt.current = Date.now();
    return confirmed;
  }, [dirty]);
}
