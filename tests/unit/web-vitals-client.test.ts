import { beforeAll, describe, expect, it, vi } from "vitest";

// 화면 전환 지표가 올 때 라우터는 이미 도착 페이지 상태다.
vi.mock("next/router", () => ({
  default: { pathname: "/news/[slug]", locale: "en" },
}));

import { reportNextMetric, reportWebVital } from "@/lib/web-vitals-reporter";

const sendBeacon = vi.fn<(url: string, body: string) => boolean>(() => true);
const nextData = window as unknown as {
  __NEXT_DATA__: { page: string; locale: string; buildId: string };
};

function hide() {
  Object.defineProperty(document, "visibilityState", {
    value: "hidden",
    configurable: true,
  });
  document.dispatchEvent(new Event("visibilitychange", { bubbles: true }));
}

// 성능 버퍼(250개)가 차도 받도록 수집 쪽은 resource 관찰자에서 기록을 꺼낸다.
const observedResources: object[] = [];
class FakeObserver {
  observe() {}
  takeRecords() {
    return observedResources.splice(0);
  }
}

const sentBatches = () =>
  sendBeacon.mock.calls.map(([url, body]) => ({
    url,
    metrics: JSON.parse(body),
  }));

describe("성능 지표 수집 큐", () => {
  beforeAll(() => {
    vi.stubEnv("NODE_ENV", "production");
    Object.defineProperty(navigator, "sendBeacon", {
      value: sendBeacon,
      configurable: true,
    });
    window.matchMedia = vi.fn(() => ({
      matches: true,
    })) as unknown as typeof window.matchMedia;
    nextData.__NEXT_DATA__ = { page: "/", locale: "ko", buildId: "build-1" };
    vi.stubGlobal("PerformanceObserver", FakeObserver);
  });

  it("관리자 화면과 받지 않는 지표는 빼고 모았다가 숨김 때 한 번에 보낸다", () => {
    nextData.__NEXT_DATA__.page = "/admin/news";
    reportWebVital({ name: "LCP", value: 900 });
    nextData.__NEXT_DATA__.page = "/";
    reportWebVital({ name: "FID", value: 3 });
    reportWebVital({ name: "TTFB", value: -1 });
    reportWebVital({
      name: "LCP",
      value: 1200,
      id: "v4-1",
      rating: "good",
      navigationType: "navigate",
    });
    reportNextMetric({ name: "Next.js-route-change-to-render", value: 340 });
    expect(sendBeacon).not.toHaveBeenCalled();

    hide();

    expect(sentBatches()).toEqual([
      {
        url: "/api/vitals/",
        metrics: [
          {
            name: "LCP",
            value: 1200,
            rating: "good",
            navigationType: "navigate",
            route: "/",
            locale: "ko",
            buildId: "build-1",
            device: "mobile",
            connection: null,
            metricId: "v4-1",
            // 계산할 LCP 기록(entries)이 없으면 내역도 없다.
            attribution: null,
          },
          {
            name: "Next.js-route-change-to-render",
            value: 340,
            rating: null,
            navigationType: null,
            route: "/news/[slug]",
            locale: "en",
            buildId: "build-1",
            device: "mobile",
            connection: null,
            metricId: null,
            attribution: null,
          },
        ],
      },
    ]);
  });

  it("화면 전환은 시작 시각 뒤에 받은 데이터와 청크로 원인 내역을 붙인다", () => {
    sendBeacon.mockClear();
    const resource = (
      path: string,
      startTime: number,
      responseEnd: number,
    ) => ({
      name: `${location.origin}${path}`,
      startTime,
      requestStart: startTime,
      responseEnd,
      duration: responseEnd - startTime,
      transferSize: 0,
    });
    // 앞 호출에서 꺼낸 기록도 남아 있다가 함께 쓰인다.
    observedResources.push(
      resource("/_next/static/chunks/pages/news/[slug].js", 1005, 1100),
    );
    reportNextMetric({ name: "Next.js-hydration", value: 20, startTime: 900 });
    observedResources.push(
      resource("/_next/data/build-1/news/a.json", 1010, 1250),
    );
    reportNextMetric({
      name: "Next.js-route-change-to-render",
      value: 400,
      startTime: 1000,
    });
    hide();
    expect(sentBatches()[0].metrics[1].attribution).toEqual({
      viewport: innerWidth,
      dpr: devicePixelRatio,
      data: 240,
      chunks: 100,
      render: 150,
    });
  });

  it("bfcache에서 복원된 지표는 처음 연 페이지가 아니라 지금 보이는 페이지 경로를 붙인다", () => {
    sendBeacon.mockClear();
    reportWebVital({
      name: "FCP",
      value: 30,
      id: "v4-2",
      navigationType: "back-forward-cache",
    });
    hide();
    expect(sentBatches()[0].metrics[0]).toMatchObject({
      route: "/news/[slug]",
      locale: "en",
      metricId: "v4-2",
    });
  });

  it("사이트 안 이동(soft navigation) 지표는 화면 전환 지표가 맡으므로 보내지 않는다", () => {
    sendBeacon.mockClear();
    reportWebVital({
      name: "LCP",
      value: 900,
      id: "v6-3",
      navigationType: "soft-navigation",
    });
    reportWebVital({ name: "FCP", value: 30, id: "v6-4" });
    hide();
    const metrics = sentBatches()[0].metrics;
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({ name: "FCP", metricId: "v6-4" });
  });

  it("20개를 넘으면 숨김을 기다리지 않고 바로 보낸다", () => {
    sendBeacon.mockClear();
    for (let i = 0; i < 20; i += 1) reportWebVital({ name: "INP", value: 40 });
    expect(sendBeacon).not.toHaveBeenCalled();
    reportWebVital({ name: "INP", value: 40 });
    expect(sentBatches()[0].metrics).toHaveLength(21);
  });
});
