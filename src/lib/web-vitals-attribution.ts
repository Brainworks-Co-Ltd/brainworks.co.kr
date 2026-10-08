import { MAX_VITAL_MS, ROUTE_CHANGE } from "@/lib/performance-dashboard";
import type { NavTiming, VitalAttribution } from "@/shared/schemas/web-vitals";

/*
 * 성능 지표의 원인 내역(attribution) 계산. performance, window를 직접 읽지 않고 넘겨받은 기록만 써서
 * 가짜 기록으로 시험한다. 시간은 내비게이션 시작 기준 ms이고 음수는 0, 10분이 넘으면 10분으로 자른다.
 * 요소는 태그, id, 클래스만 적고 글자 내용은 읽지 않는다. 주소는 우리 사이트 파일 경로만 남긴다.
 */

type ElementLike = { tagName: string; id: string; classList: Iterable<string> };
type Rect = { width: number; height: number };

export type NavEntry = {
  activationStart?: number;
  redirectStart: number;
  redirectEnd: number;
  redirectCount: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  secureConnectionStart: number;
  requestStart: number;
  responseStart: number;
  transferSize: number;
  serverTiming?: readonly { name: string; duration: number }[];
};

export type ResourceEntry = {
  name: string;
  startTime: number;
  requestStart: number;
  responseEnd: number;
  duration: number;
  transferSize: number;
};

type LcpEntry = { url?: string; element?: ElementLike | null };
type EventEntry = {
  name: string;
  startTime: number;
  duration: number;
  processingStart: number;
  processingEnd: number;
  target?: ElementLike | null;
};
type ShiftEntry = {
  value: number;
  startTime: number;
  sources?: readonly {
    node?: ElementLike | null;
    previousRect: Rect;
    currentRect: Rect;
  }[];
};

/** 지표를 잰 페이지의 기록. 브라우저에서는 performance.getEntriesByType과 window 값을 넘긴다. */
export type PageTiming = {
  navigation?: NavEntry;
  resources: readonly ResourceEntry[];
  origin: string;
  viewport: number;
  dpr: number;
};

const clampMs = (value: number) =>
  Math.round(Math.min(Math.max(value, 0), MAX_VITAL_MS));
const toKb = (bytes: number) =>
  Math.min(Math.round(bytes / 102.4) / 10, 100_000);

/** 태그#id.클래스.클래스 꼴. 클래스는 앞 2개까지다. 글자 노드처럼 태그가 없으면 null이다. */
export function elementName(el: ElementLike | null | undefined) {
  if (!el?.tagName) return null;
  const id = el.id ? `#${el.id}` : "";
  const classes = Array.from(el.classList)
    .slice(0, 2)
    .map((name) => `.${name}`)
    .join("");
  // 자르다 반쪽 난 서로게이트와 NUL은 jsonb가 거절해 스키마가 묶음째 막으므로 뺀다.
  return `${el.tagName.toLowerCase()}${id}${classes}`
    .slice(0, 80)
    .replace(/[\0\p{Cs}]/gu, "");
}

/**
 * 같은 출처면 경로만, 다른 출처면 호스트만 남기고 query는 버린다.
 * next/image 주소는 안쪽 그림 경로와 받은 너비만 남긴다(`/images/a.webp w828`).
 */
export function resourceName(url: string, origin: string): string {
  const parsed = new URL(url, origin);
  // data: 주소는 출처가 "null"이고 호스트가 없다.
  if (parsed.origin !== origin)
    return (parsed.host || parsed.protocol).slice(0, 120);
  if (!isNextImage(parsed.pathname)) return parsed.pathname.slice(0, 120);
  const inner = parsed.searchParams.get("url");
  const width = parsed.searchParams.get("w");
  const name = inner ? resourceName(inner, origin) : parsed.pathname;
  return (width ? `${name} w${width}` : name).slice(0, 120);
}

// trailingSlash: true라서 실제 주소는 `/_next/image/?url=...`이다.
function isNextImage(path: string) {
  return path === "/_next/image" || path === "/_next/image/";
}

function resourceKind(path: string) {
  if (/\.m?js$/.test(path)) return "js";
  if (/\.css$/.test(path)) return "css";
  if (/\.(woff2?|ttf|otf)$/.test(path)) return "font";
  if (isNextImage(path) || /\.(avif|webp|png|jpe?g|gif|svg|ico)$/i.test(path))
    return "image";
  return "other";
}

// web.dev "LCP 하위 부분": 첫 바이트(TTFB) = 문서 응답 시작. 프리렌더된 페이지는 활성화 시각부터 잰다.
const firstByte = (nav: NavEntry) =>
  Math.max(0, nav.responseStart - (nav.activationStart ?? 0));

function navParts(nav: NavEntry): NavTiming {
  return {
    // 내비게이션 시작부터 fetchStart까지(web-vitals TTFB 내역의 waitingDuration). 출처가 바뀌는
    // 리다이렉트(http → https, www → apex)는 redirectStart, redirectEnd를 0으로 주고 이 구간에만 남는다.
    redirect: clampMs(nav.fetchStart - (nav.activationStart ?? 0)),
    // 출처가 바뀌는 리다이렉트가 끼면 0이다.
    redirectCount: Math.min(nav.redirectCount, 100),
    // Navigation Timing: domainLookupEnd - domainLookupStart
    dns: clampMs(nav.domainLookupEnd - nav.domainLookupStart),
    // Navigation Timing: connectEnd - connectStart. TLS 협상이 이 안에 들어 있다.
    connect: clampMs(nav.connectEnd - nav.connectStart),
    // Navigation Timing: connectEnd - secureConnectionStart. 0이면 HTTPS가 아니거나 연결을 다시 썼다.
    tls:
      nav.secureConnectionStart > 0
        ? clampMs(nav.connectEnd - nav.secureConnectionStart)
        : 0,
    // Navigation Timing: responseStart - requestStart. 서버 처리와 왕복 한 번이다.
    wait: clampMs(nav.responseStart - nav.requestStart),
    // Navigation Timing: domainLookupStart - fetchStart. 브라우저 캐시 확인과 서비스 워커 구간이다.
    before: clampMs(nav.domainLookupStart - nav.fetchStart),
    ...(nav.serverTiming?.length
      ? {
          serverTiming: nav.serverTiming
            .slice(0, 3)
            .map(({ name, duration }) => ({
              name: name.slice(0, 40),
              duration: clampMs(duration),
            })),
        }
      : {}),
  };
}

function lcpParts(
  lcp: number,
  entry: LcpEntry,
  nav: NavEntry,
  page: PageTiming,
) {
  const activation = nav.activationStart ?? 0;
  const ttfb = firstByte(nav);
  const resource = entry.url
    ? page.resources.find((res) => res.name === entry.url)
    : undefined;
  // 글자 LCP는 받을 그림이 없어 발견 지연과 받기가 0이다. 그림인데 resource 기록이 없으면(캐시 등) 모른다.
  let loadDelay: number | null = entry.url ? null : 0;
  let loadDuration: number | null = loadDelay;
  let responseEnd = ttfb;
  if (resource) {
    // web.dev "LCP 하위 부분": 요청 시작. 교차 출처라 requestStart가 0이면 startTime을 쓴다.
    const requestStart = Math.max(
      ttfb,
      (resource.requestStart || resource.startTime) - activation,
    );
    responseEnd = Math.max(requestStart, resource.responseEnd - activation);
    // web.dev "LCP 하위 부분": 로드 지연 = 요청 시작 - 첫 바이트
    loadDelay = clampMs(requestStart - ttfb);
    // web.dev "LCP 하위 부분": 로드 시간 = 응답 끝 - 요청 시작
    loadDuration = clampMs(responseEnd - requestStart);
  }

  const bytes = { js: 0, css: 0, font: 0, image: 0, other: 0 };
  for (const res of page.resources) {
    if (res.responseEnd - activation > lcp) continue;
    const url = new URL(res.name, page.origin);
    if (url.origin === page.origin)
      bytes[resourceKind(url.pathname)] += res.transferSize;
  }

  return {
    ttfb: clampMs(ttfb),
    loadDelay,
    loadDuration,
    // web.dev "LCP 하위 부분": 렌더 지연 = LCP - 응답 끝. 글자나 기록 없는 그림은 LCP - 첫 바이트다.
    renderDelay: clampMs(lcp - responseEnd),
    element: elementName(entry.element),
    resource: entry.url ? resourceName(entry.url, page.origin) : null,
    resourceKb: resource ? toKb(resource.transferSize) : null,
    transfer: {
      doc: toKb(nav.transferSize),
      js: toKb(bytes.js),
      css: toKb(bytes.css),
      font: toKb(bytes.font),
      image: toKb(bytes.image),
      other: toKb(bytes.other),
    },
    nav: navParts(nav),
  };
}

function inpParts(entries: readonly EventEntry[]) {
  const entry = entries.reduce((a, b) => (b.duration > a.duration ? b : a));
  // web-vitals는 한 상호작용에서 시작 시각이 같은 기록을 모두 준다. 탭이면 pointerup이 앞이고
  // React onClick은 뒤의 click에서 돌아서, 처리는 그 기록들의 처리 시작부터 마지막 처리 끝까지다.
  const group = entries.filter((e) => e.startTime === entry.startTime);
  const processingStart = Math.min(...group.map((e) => e.processingStart));
  const processingEnd = Math.max(...group.map((e) => e.processingEnd));
  return {
    event: entry.name.slice(0, 40),
    target: elementName(entry.target),
    // web.dev "INP 하위 부분": 입력 지연 = processingStart - startTime
    inputDelay: clampMs(processingStart - entry.startTime),
    // web.dev "INP 하위 부분": 처리 시간 = processingEnd - processingStart
    processing: clampMs(processingEnd - processingStart),
    // web.dev "INP 하위 부분": 표시 지연 = startTime + duration - processingEnd. duration이 8ms 단위로 반올림돼 음수가 될 수 있다.
    presentation: clampMs(entry.startTime + entry.duration - processingEnd),
  };
}

function clsParts(entries: readonly ShiftEntry[]) {
  const shift = entries.reduce((a, b) => (b.value > a.value ? b : a));
  const area = (rect: Rect) => rect.width * rect.height;
  let node: ElementLike | null | undefined;
  let largest = -1;
  for (const source of shift.sources ?? []) {
    // 글자 노드나 이미 지워진 요소는 이름을 적을 수 없어 건너뛴다.
    if (!source.node?.tagName) continue;
    const size = Math.max(area(source.previousRect), area(source.currentRect));
    if (size > largest) [node, largest] = [source.node, size];
  }
  return {
    element: elementName(node),
    largestShift: Math.min(Math.round(shift.value * 10_000) / 10_000, 100),
    time: clampMs(shift.startTime),
  };
}

function routeChangeParts(start: number, value: number, page: PageTiming) {
  let data = 0;
  let dataEnd = 0;
  let chunks = 0;
  for (const res of page.resources) {
    if (res.startTime < start || res.startTime > start + value) continue;
    if (res.name.includes("/_next/data/")) {
      data = Math.max(data, res.duration);
      dataEnd = Math.max(dataEnd, res.responseEnd - start);
    } else if (new URL(res.name, page.origin).pathname.endsWith(".js")) {
      chunks = Math.max(chunks, res.responseEnd - start);
    }
  }
  return {
    // 다음 화면 데이터(/_next/data) 왕복 중 가장 긴 것. 0이면 정적 페이지거나 prefetch로 이미 받았다.
    data: clampMs(data),
    // 청크 받기 = 가장 늦게 끝난 .js 응답 끝 - 전환 시작
    chunks: clampMs(chunks),
    // 나머지 = 값 - 데이터와 청크 중 늦게 끝난 쪽
    render: clampMs(value - Math.max(dataEnd, chunks)),
  };
}

/**
 * 지표 하나의 원인 내역. 계산할 기록이 없으면 null이다.
 * 뒤로 가기 캐시에서 복원된 LCP, FCP, TTFB는 entries가 비어 있어 처음 문서의 기록을 잘못 붙이지 않는다.
 * hydration, render 같은 나머지 Next 지표는 내역이 없다.
 */
export function vitalAttribution(
  metric: {
    name: string;
    value: number;
    startTime?: number;
    entries?: readonly object[];
  },
  page: PageTiming,
): VitalAttribution | null {
  const nav = page.navigation;
  const entries = metric.entries ?? [];
  const env = {
    viewport: Math.round(page.viewport),
    dpr: Math.round(page.dpr * 100) / 100,
  };
  if (!entries.length && metric.name !== ROUTE_CHANGE) return null;
  switch (metric.name) {
    case "LCP":
      return nav
        ? {
            ...env,
            ...lcpParts(metric.value, entries.at(-1) as LcpEntry, nav, page),
          }
        : null;
    case "TTFB":
      return nav ? { ...env, ...navParts(nav) } : null;
    case "FCP":
      return nav
        ? {
            ...env,
            ttfb: clampMs(firstByte(nav)),
            // web-vitals FCP 내역(firstByteToFCP): 첫 바이트 뒤 = FCP - 첫 바이트
            afterTtfb: clampMs(metric.value - firstByte(nav)),
            nav: navParts(nav),
          }
        : null;
    case "INP":
      return { ...env, ...inpParts(entries as EventEntry[]) };
    case "CLS":
      return { ...env, ...clsParts(entries as ShiftEntry[]) };
    case ROUTE_CHANGE:
      return metric.startTime === undefined
        ? null
        : { ...env, ...routeChangeParts(metric.startTime, metric.value, page) };
    default:
      return null;
  }
}
