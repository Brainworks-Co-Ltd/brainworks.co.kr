import Router from "next/router";
import { MAX_VITAL_MS, VITAL_NAMES } from "@/lib/performance-dashboard";

/*
 * 방문자 브라우저의 성능 지표를 모았다가 페이지를 떠날 때 /api/vitals/로 보낸다.
 * 쿠키, 저장소, 방문자 식별자는 쓰지 않는다. 실제 주소 대신 페이지 파일 경로만 보낸다.
 */

type ReportedMetric = {
  name: string;
  value: number;
  id?: string;
  rating?: string;
  navigationType?: string;
};

type Connection = { effectiveType?: string };

// trailingSlash 설정 때문에 끝 슬래시가 없으면 308을 한 번 더 거친다.
const ENDPOINT = "/api/vitals/";
const queue: object[] = [];
let listening = false;

function flush() {
  if (!queue.length) return;
  const body = JSON.stringify(queue.splice(0));
  if (navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, body);
  } else {
    fetch(ENDPOINT, { method: "POST", body, keepalive: true }).catch(
      () => undefined,
    );
  }
}

function enqueue(
  metric: ReportedMetric,
  route: string,
  locale: string | undefined,
) {
  if (process.env.NODE_ENV !== "production" || route.startsWith("/admin"))
    return;
  // FID처럼 받지 않는 지표와 서버가 거절할 값은 묶음 전체가 400이 되지 않게 여기서 버린다.
  if (!(VITAL_NAMES as readonly string[]).includes(metric.name)) return;
  if (!(metric.value >= 0 && metric.value <= MAX_VITAL_MS)) return;
  queue.push({
    name: metric.name,
    value: metric.value,
    rating: metric.rating ?? null,
    navigationType: metric.navigationType ?? null,
    route,
    locale,
    buildId: window.__NEXT_DATA__.buildId,
    device: matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
    connection:
      (navigator as Navigator & { connection?: Connection }).connection
        ?.effectiveType ?? null,
    metricId: metric.id ?? null,
  });
  if (!listening) {
    listening = true;
    // web-vitals는 document에서 숨김을 듣고 CLS, INP, LCP를 확정한다. window에서 들어야
    // 거품 단계라 그 뒤에 실행되어 방금 확정된 값까지 함께 보낸다.
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
    window.addEventListener("pagehide", flush);
  }
  if (queue.length > 20) flush();
}

/**
 * useReportWebVitals 콜백. 렌더마다 다시 등록되지 않게 모듈 최상위에 둔다.
 * LCP, CLS 같은 값은 문서를 처음 연 페이지의 것이라, 숨김 때 보고되어도
 * 그사이 옮겨 간 페이지가 아니라 처음 페이지 경로를 붙인다.
 * 뒤로 가기 캐시(bfcache)에서 복원되면 web-vitals가 복원된 화면 기준으로 새로 재므로,
 * 처음 연 페이지(__NEXT_DATA__는 바뀌지 않는다) 대신 지금 라우터 경로를 붙인다.
 */
export function reportWebVital(metric: ReportedMetric) {
  if (metric.navigationType === "back-forward-cache") {
    enqueue(metric, Router.pathname, Router.locale);
    return;
  }
  const { page, locale } = window.__NEXT_DATA__;
  enqueue(metric, page, locale);
}

/**
 * _app의 reportWebVitals. Next 전용 지표(hydration, render, route-change-to-render)만 온다.
 * 라우터는 상태를 도착 페이지로 바꾼 뒤 렌더하므로(router.set) 이 시점의 pathname이 도착 경로다.
 */
export function reportNextMetric(metric: { name: string; value: number }) {
  enqueue(
    { name: metric.name, value: metric.value },
    Router.pathname,
    Router.locale,
  );
}
