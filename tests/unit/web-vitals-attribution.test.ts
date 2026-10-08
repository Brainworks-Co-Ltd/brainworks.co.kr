import { describe, expect, it } from "vitest";
import { classifyCause, ROUTE_CHANGE } from "@/lib/performance-dashboard";
import {
  elementName,
  type NavEntry,
  type PageTiming,
  type ResourceEntry,
  resourceName,
  vitalAttribution,
} from "@/lib/web-vitals-attribution";
import { webVitalSchema } from "@/shared/schemas/web-vitals";

const origin = "https://www.brainworks.co.kr";
// trailingSlash: true인 이 사이트의 실제 next/image 주소 형태(이미지 경로 앞 슬래시)
const heroUrl = `${origin}/_next/image/?url=%2Fimages%2Fabout%2Fhero.webp&w=828&q=75`;

const nav: NavEntry = {
  redirectStart: 0,
  redirectEnd: 0,
  redirectCount: 0,
  fetchStart: 5,
  domainLookupStart: 10,
  domainLookupEnd: 40,
  connectStart: 40,
  connectEnd: 120,
  secureConnectionStart: 70,
  requestStart: 121,
  responseStart: 400,
  transferSize: 15 * 1024,
  serverTiming: [],
};

function resource(
  name: string,
  startTime: number,
  responseEnd: number,
  transferSize = 0,
  requestStart = startTime,
): ResourceEntry {
  return {
    name: name.startsWith("http") ? name : `${origin}${name}`,
    startTime,
    requestStart,
    responseEnd,
    duration: responseEnd - startTime,
    transferSize,
  };
}

function page(overrides: Partial<PageTiming> = {}): PageTiming {
  return {
    navigation: nav,
    resources: [],
    origin,
    viewport: 390,
    dpr: 2.625,
    ...overrides,
  };
}

function element(tag: string, props: Record<string, string> = {}) {
  return Object.assign(document.createElement(tag), props);
}

/** 계산 결과가 API 스키마를 그대로 통과하는지 함께 본다. */
function attribute(
  metric: Parameters<typeof vitalAttribution>[0],
  timing = page(),
) {
  const attribution = vitalAttribution(metric, timing);
  const parsed = webVitalSchema.safeParse({
    name: metric.name,
    value: metric.value,
    rating: null,
    navigationType: null,
    route: "/about",
    locale: "ko",
    buildId: "build-1",
    device: "mobile",
    connection: "3g",
    metricId: null,
    attribution,
  });
  expect(parsed.error).toBeUndefined();
  return attribution;
}

describe("LCP 원인 내역", () => {
  it("그림 LCP를 첫 바이트, 발견 지연, 받기, 그리기로 나누고 LCP 전에 받은 용량을 종류별로 센다", () => {
    const resources = [
      resource(heroUrl, 600, 1650, 120 * 1024, 650),
      resource("/_next/static/chunks/main.js", 410, 900, 50 * 1024),
      resource("/_next/static/css/app.css", 405, 500, 10 * 1024),
      resource("/_next/static/media/pretendard.woff2", 520, 1200, 280 * 1024),
      resource("/videos/hero.mp4", 700, 1500, 2 * 1024),
      // LCP 뒤에 끝난 것과 다른 출처는 세지 않는다.
      resource("/_next/static/chunks/late.js", 1800, 2500, 999_999),
      resource(
        "https://www.googletagmanager.com/gtag/js?id=x",
        450,
        800,
        99_999,
      ),
    ];
    const img = element("img", { className: "object-cover w-full h-full" });

    expect(
      attribute(
        { name: "LCP", value: 2100, entries: [{ url: heroUrl, element: img }] },
        page({ resources }),
      ),
    ).toEqual({
      viewport: 390,
      dpr: 2.63,
      ttfb: 400,
      loadDelay: 250,
      loadDuration: 1000,
      renderDelay: 450,
      element: "img.object-cover.w-full",
      resource: "/images/about/hero.webp w828",
      resourceKb: 120,
      transfer: { doc: 15, js: 50, css: 10, font: 280, image: 120, other: 2 },
      nav: {
        redirect: 5,
        redirectCount: 0,
        dns: 30,
        connect: 80,
        tls: 50,
        wait: 279,
        before: 5,
      },
    });
  });

  it("글자 LCP는 발견 지연과 받기가 0이고 글자 내용은 담지 않는다", () => {
    const heading = element("h1", {
      id: "title",
      className: "hero-title",
      textContent: "홍길동 010-1234-5678",
    });
    const attribution = attribute({
      name: "LCP",
      value: 1500,
      entries: [{ url: "", element: heading }],
    });
    expect(attribution).toMatchObject({
      ttfb: 400,
      loadDelay: 0,
      loadDuration: 0,
      renderDelay: 1100,
      element: "h1#title.hero-title",
      resource: null,
      resourceKb: null,
    });
    expect(JSON.stringify(attribution)).not.toContain("홍길동");
  });

  it("그림의 resource 기록이 없으면 발견 지연과 받기는 모르고 그리기는 첫 바이트부터 잰다", () => {
    expect(
      attribute({
        name: "LCP",
        value: 2100,
        entries: [{ url: heroUrl, element: element("img") }],
      }),
    ).toMatchObject({
      loadDelay: null,
      loadDuration: null,
      renderDelay: 1700,
      resource: "/images/about/hero.webp w828",
      resourceKb: null,
    });
  });

  it("마지막 LCP 기록을 쓰고, 미리 받은 그림이나 프리렌더처럼 앞서는 시각은 0으로 자른다", () => {
    const prerendered = { ...nav, activationStart: 1000 };
    const preloaded = resource(heroUrl, 300, 800, 1024);
    const attribution = attribute(
      {
        name: "LCP",
        value: 200,
        entries: [
          { url: "", element: element("p") },
          { url: heroUrl, element: element("img") },
        ],
      },
      page({ navigation: prerendered, resources: [preloaded] }),
    );
    expect(attribution).toMatchObject({
      ttfb: 0,
      loadDelay: 0,
      loadDuration: 0,
      renderDelay: 200,
      element: "img",
    });
  });

  it("기록이 없거나 뒤로 가기 캐시에서 복원된 값은 내역이 없다", () => {
    expect(attribute({ name: "LCP", value: 900, entries: [] })).toBeNull();
    expect(
      attribute(
        { name: "LCP", value: 900, entries: [{ url: "" }] },
        page({ navigation: undefined }),
      ),
    ).toBeNull();
  });
});

describe("TTFB 원인 내역", () => {
  it("리다이렉트, DNS, 연결, TLS, 서버 대기, 요청 전으로 나누고 Server-Timing은 이름과 시간만 담는다", () => {
    const redirected: NavEntry = {
      ...nav,
      redirectStart: 2,
      redirectEnd: 310,
      redirectCount: 1,
      fetchStart: 312,
      domainLookupStart: 312,
      domainLookupEnd: 312,
      connectStart: 312,
      connectEnd: 312,
      // 연결을 다시 쓰면 0이다.
      secureConnectionStart: 0,
      requestStart: 315,
      responseStart: 900,
      serverTiming: [{ name: "db", duration: 120.4 }],
    };
    expect(
      attribute(
        { name: "TTFB", value: 900, entries: [redirected] },
        page({ navigation: redirected }),
      ),
    ).toEqual({
      viewport: 390,
      dpr: 2.63,
      // 같은 출처 리다이렉트는 redirectEnd가 fetchStart와 같고, 내비게이션 시작부터 fetchStart까지를 센다.
      redirect: 312,
      redirectCount: 1,
      dns: 0,
      connect: 0,
      tls: 0,
      wait: 585,
      before: 0,
      serverTiming: [{ name: "db", duration: 120 }],
    });
  });

  it("출처가 바뀌는 리다이렉트는 redirectStart, redirectEnd가 0이어도 fetchStart까지를 리다이렉트로 센다", () => {
    // Chrome에서 600ms 뒤 302로 다른 출처에 보낸 기록
    const crossOrigin: NavEntry = {
      ...nav,
      redirectStart: 0,
      redirectEnd: 0,
      redirectCount: 0,
      fetchStart: 617.4,
      domainLookupStart: 618.4,
      domainLookupEnd: 618.4,
      connectStart: 618.4,
      connectEnd: 619,
      secureConnectionStart: 0,
      requestStart: 619,
      responseStart: 619.9,
      serverTiming: [],
    };
    const attribution = attribute(
      { name: "TTFB", value: 620, entries: [crossOrigin] },
      page({ navigation: crossOrigin }),
    );
    expect(attribution).toMatchObject({
      redirect: 617,
      redirectCount: 0,
      before: 1,
      wait: 1,
    });
    expect(classifyCause("TTFB", attribution)).toBe("redirect");
  });

  it("거꾸로 찍힌 시각은 0으로 자른다", () => {
    expect(
      attribute(
        { name: "TTFB", value: 400, entries: [nav] },
        page({ navigation: { ...nav, connectStart: 130 } }),
      ),
    ).toMatchObject({ connect: 0, tls: 50 });
  });
});

describe("FCP, INP, CLS, 화면 전환 원인 내역", () => {
  it("FCP는 첫 바이트와 그 뒤로 나눈다", () => {
    expect(
      attribute({ name: "FCP", value: 1800, entries: [{}] }),
    ).toMatchObject({ ttfb: 400, afterTtfb: 1400, nav: { wait: 279 } });
  });

  it("INP는 가장 긴 이벤트를 입력 지연, 처리, 화면 반영으로 나누고 음수는 0으로 둔다", () => {
    const button = element("button", {
      className: "menu-toggle lg:hidden",
      textContent: "메뉴 열기",
    });
    const event = (
      name: string,
      startTime: number,
      duration: number,
      processingStart: number,
      processingEnd: number,
    ) => ({
      name,
      startTime,
      duration,
      processingStart,
      processingEnd,
      target: button,
    });
    expect(
      attribute({
        name: "INP",
        value: 312,
        entries: [
          event("pointerdown", 1000, 48, 1010, 1020),
          event("pointerup", 1100, 312, 1180, 1400),
        ],
      }),
    ).toEqual({
      viewport: 390,
      dpr: 2.63,
      event: "pointerup",
      target: "button.menu-toggle.lg:hidden",
      inputDelay: 80,
      processing: 220,
      presentation: 12,
    });
    // 탭 하나는 시작 시각과 길이가 같은 pointerup과 click으로 온다. React onClick은 click에서 돈다.
    const tap = attribute({
      name: "INP",
      value: 400,
      entries: [
        event("pointerup", 1000, 400, 1010, 1012),
        event("click", 1000, 400, 1012, 1312),
      ],
    });
    expect(tap).toMatchObject({
      event: "pointerup",
      inputDelay: 10,
      processing: 302,
      presentation: 88,
    });
    expect(classifyCause("INP", tap)).toBe("processing");
    // duration은 8ms 단위로 반올림되어 처리 끝보다 앞설 수 있다.
    expect(
      attribute({
        name: "INP",
        value: 296,
        entries: [event("click", 1100, 296, 1180, 1400)],
      }),
    ).toMatchObject({ presentation: 0 });
  });

  it("CLS는 가장 큰 밀림에서 가장 큰 요소를 적고 글자 노드는 건너뛴다", () => {
    const rect = (width: number, height: number) => ({ width, height });
    const section = element("section", {
      id: "news",
      className: "news-list grid gap-4",
    });
    expect(
      attribute({
        name: "CLS",
        value: 0.23,
        entries: [
          {
            value: 0.05,
            startTime: 500,
            sources: [
              {
                node: element("footer"),
                previousRect: rect(2000, 2000),
                currentRect: rect(2000, 2000),
              },
            ],
          },
          {
            value: 0.18,
            startTime: 1200,
            sources: [
              {
                node: document.createTextNode("긴 문구"),
                previousRect: rect(5000, 5000),
                currentRect: rect(5000, 5000),
              },
              {
                node: element("div"),
                previousRect: rect(100, 10),
                currentRect: rect(100, 10),
              },
              {
                node: section,
                previousRect: rect(0, 0),
                currentRect: rect(1000, 400),
              },
            ],
          },
        ],
      }),
    ).toEqual({
      viewport: 390,
      dpr: 2.63,
      element: "section#news.news-list.grid",
      largestShift: 0.18,
      time: 1200,
    });
  });

  it("화면 전환은 시작 뒤 받은 데이터와 청크, 나머지로 나눈다", () => {
    const resources = [
      // prefetch로 전환 전에 받은 데이터는 세지 않는다.
      resource("/_next/data/build-1/news.json", 4000, 4100),
      resource("/_next/data/build-1/news/a.json", 5010, 5410),
      resource("/_next/static/chunks/pages/news/[slug]-abc.js", 5005, 5120),
      resource("/images/news/a.webp", 5050, 5900),
    ];
    expect(
      attribute(
        { name: ROUTE_CHANGE, value: 600, startTime: 5000 },
        page({ resources }),
      ),
    ).toEqual({
      viewport: 390,
      dpr: 2.63,
      data: 400,
      chunks: 120,
      render: 190,
    });
    expect(
      attribute(
        { name: ROUTE_CHANGE, value: 300, startTime: 4000 },
        page({ resources: resources.slice(2) }),
      ),
    ).toEqual({ viewport: 390, dpr: 2.63, data: 0, chunks: 0, render: 300 });
  });

  it("hydration과 render는 내역이 없다", () => {
    expect(
      attribute({ name: "Next.js-hydration", value: 30, startTime: 10 }),
    ).toBeNull();
  });
});

describe("요소와 파일 표기", () => {
  it("태그, id, 앞 클래스 2개만 적고 80자에서 자른다", () => {
    expect(
      elementName(
        element("a", {
          className: "btn primary large",
          textContent: "비밀번호 재설정",
        }),
      ),
    ).toBe("a.btn.primary");
    expect(elementName(element("div", { id: "x".repeat(100) }))).toHaveLength(
      80,
    );
    expect(
      elementName(
        document.createElementNS("http://www.w3.org/2000/svg", "svg"),
      ),
    ).toBe("svg");
    expect(elementName(null)).toBeNull();
    // 80자에서 자르다 반쪽 난 서로게이트와 NUL은 jsonb가 거절해 뺀다.
    expect(
      elementName(element("div", { id: `${"x".repeat(75)}\u{1F600}` })),
    ).toBe(`div#${"x".repeat(75)}`);
    expect(elementName(element("p", { id: "a\0b" }))).toBe("p#ab");
  });

  it("같은 출처는 경로만, next/image는 안쪽 경로와 너비만, 다른 출처는 호스트만 남긴다", () => {
    expect(resourceName(heroUrl, origin)).toBe("/images/about/hero.webp w828");
    // 끝 슬래시 없는 next/image 주소도 같게 본다
    expect(
      resourceName(
        `${origin}/_next/image?url=%2Fimages%2Fnews%2F250807.webp&w=828&q=75`,
        origin,
      ),
    ).toBe("/images/news/250807.webp w828");
    expect(
      resourceName(`${origin}/images/a.webp?token=secret#top`, origin),
    ).toBe("/images/a.webp");
    expect(
      resourceName(
        `${origin}/_next/image?url=${encodeURIComponent("https://images.example.com/p.jpg?sig=1")}&w=640`,
        origin,
      ),
    ).toBe("images.example.com w640");
    expect(resourceName("https://cdn.example.com/a/b.png?x=1", origin)).toBe(
      "cdn.example.com",
    );
    expect(resourceName("data:image/svg+xml;base64,AAAA", origin)).toBe(
      "data:",
    );
    expect(
      resourceName(`${origin}/${"a".repeat(200)}.webp`, origin),
    ).toHaveLength(120);
  });
});
