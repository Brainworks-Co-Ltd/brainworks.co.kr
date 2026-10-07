/**
 * 실험실 성능 측정. 같은 조건에서 고치기 전과 뒤를 비교하려고 만든다.
 * 실제 사용자 수치는 관리자 > 성능 화면이 맡고, 이 스크립트는 통제된 환경에서
 * 원인을 가려 보는 용도다.
 *
 * 재는 것
 * - 첫 진입: TTFB, FCP, LCP, 전송량. 매번 새 브라우저 문맥이라 캐시가 없다.
 * - 화면 전환: 페이지에 들어와 대상 경로를 prefetch한 뒤 router.push부터
 *   routeChangeComplete 다음 프레임까지. Link가 화면에 보이거나 hover되어
 *   prefetch가 끝난 상태에서 누른 경우와 같다. 누른 뒤 생긴 /_next/data 요청
 *   수도 센다(0이면 서버 왕복 없이 바뀐 것).
 * - 조건은 제한 없음과 모바일(왕복 150ms, 1.6Mbps, CPU 4배 느림, Lighthouse 기본값) 두 가지.
 *   모바일 조건의 TTFB는 믿지 않는다. CDP 지연은 응답 전달을 늦출 뿐 Navigation Timing의
 *   responseStart에는 반영되지 않는다(2026-10-07 확인: 화면 표시는 4초 늦어도 responseStart는 같음).
 *
 * 사용법 (운영 빌드를 띄운 뒤)
 *   node scripts/perf/lab-bench.mjs --base http://127.0.0.1:3400 --runs 10 --out before.json
 *   (Windows에서 localhost는 IPv6를 먼저 시도해 요청마다 약 200ms가 붙으므로 127.0.0.1을 쓴다)
 *   node scripts/perf/lab-bench.mjs --compare before.json after.json
 */
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { chromium } from "@playwright/test";

const { values: args, positionals } = parseArgs({
  options: {
    base: { type: "string" },
    runs: { type: "string" },
    out: { type: "string" },
    compare: { type: "boolean" },
  },
  allowPositionals: true,
});

const PROFILES = {
  unthrottled: null,
  // 화면도 폰 크기로 둬야 next/image가 폰에 맞는 크기를 고른다
  mobile: {
    latency: 150,
    down: (1.6 * 1024 * 1024) / 8,
    up: (750 * 1024) / 8,
    cpu: 4,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  },
};

const COLD_ROUTES = [
  "/",
  "/news/",
  "/notices/",
  "/services/",
  "/about/honors/",
  "/about/",
];

// [출발, 도착]. 도착이 함수면 출발 페이지의 링크에서 첫 상세 주소를 고른다.
const NAV_PAIRS = [
  ["/", "/news/"],
  ["/", "/services/"],
  ["/", "/notices/"],
  ["/", "/about/honors/"],
  ["/", "/about/"],
  ["/news/", (hrefs) => hrefs.find((h) => /^\/news\/[^/]+\/$/.test(h))],
  ["/notices/", (hrefs) => hrefs.find((h) => /^\/notices\/[^/]+\/$/.test(h))],
  ["/services/", (hrefs) => hrefs.find((h) => /^\/services\/[^/]+\/$/.test(h))],
];

function summarize(values) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return { n: 0 };
  const at = (q) =>
    sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  return {
    n: sorted.length,
    median: at(0.5),
    p75: at(0.75),
    min: sorted[0],
    max: sorted.at(-1),
  };
}

async function openPage(browser, profile) {
  const context = await browser.newContext(
    profile?.viewport
      ? {
          viewport: profile.viewport,
          deviceScaleFactor: profile.deviceScaleFactor,
          isMobile: true,
          hasTouch: true,
        }
      : { viewport: { width: 1366, height: 900 } },
  );
  const page = await context.newPage();
  if (profile) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: profile.latency,
      downloadThroughput: profile.down,
      uploadThroughput: profile.up,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });
  }
  return { context, page };
}

async function coldLoad(browser, profile, url) {
  const { context, page } = await openPage(browser, profile);
  try {
    await page.goto(url, { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(2500);
    return await page.evaluate(
      () =>
        new Promise((resolve) => {
          let lcp = NaN;
          let lcpElement = "";
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              lcp = entry.startTime;
              const el = entry.element;
              lcpElement = el
                ? `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ").slice(0, 2).join(".") : ""}${entry.url ? " " + entry.url.split("/").pop().slice(0, 40) : ""}`
                : "";
            }
          }).observe({ type: "largest-contentful-paint", buffered: true });
          setTimeout(() => {
            const nav = performance.getEntriesByType("navigation")[0];
            const resources = performance.getEntriesByType("resource");
            const fcp = performance.getEntriesByName(
              "first-contentful-paint",
            )[0];
            const bytes = resources.reduce(
              (sum, r) => sum + (r.transferSize || 0),
              nav.transferSize || 0,
            );
            const jsBytes = resources
              .filter((r) => r.name.endsWith(".js"))
              .reduce((sum, r) => sum + (r.transferSize || 0), 0);
            resolve({
              ttfb: nav.responseStart,
              fcp: fcp?.startTime ?? NaN,
              lcp,
              lcpElement,
              kb: bytes / 1024,
              jsKb: jsBytes / 1024,
            });
          }, 0);
        }),
    );
  } finally {
    await context.close();
  }
}

async function resolveTarget(browser, base, from, target) {
  if (typeof target === "string") return target;
  const { context, page } = await openPage(browser, null);
  try {
    await page.goto(base + from, { waitUntil: "load" });
    const hrefs = await page.$$eval("a[href]", (as) =>
      as.map((a) => a.getAttribute("href")),
    );
    return target(hrefs) ?? null;
  } finally {
    await context.close();
  }
}

async function clientNavigation(browser, profile, base, from, to) {
  const { context, page } = await openPage(browser, profile);
  try {
    await page.goto(base + from, { waitUntil: "load", timeout: 120_000 });
    await page.waitForFunction(() => window.next?.router?.isReady);
    // prefetch는 받기가 끝나면 resolve된다. 홈은 영상이 계속 받아져 networkidle을 기다릴 수 없다.
    await page.evaluate((target) => window.next.router.prefetch(target), to);
    await page.waitForTimeout(300);
    let dataRequests = 0;
    page.on("request", (req) => {
      if (req.url().includes("/_next/data/")) dataRequests += 1;
    });
    const ms = await page.evaluate(
      (target) =>
        new Promise((resolve) => {
          const router = window.next.router;
          const t0 = performance.now();
          const done = () => {
            router.events.off("routeChangeComplete", done);
            requestAnimationFrame(() =>
              requestAnimationFrame(() => resolve(performance.now() - t0)),
            );
          };
          router.events.on("routeChangeComplete", done);
          router.push(target);
        }),
      to,
    );
    return { ms, dataRequests };
  } finally {
    await context.close();
  }
}

async function bench() {
  const base = (args.base || "http://127.0.0.1:3400").replace(/\/$/, "");
  const runs = Number(args.runs || 10);
  // 설치된 Playwright 브라우저 버전이 패키지와 다르면 BENCH_CHROME에 chrome.exe 경로를 준다
  const browser = await chromium.launch({
    executablePath: process.env.BENCH_CHROME || undefined,
  });
  const result = { base, runs, cold: {}, nav: {} };
  try {
    const pairs = [];
    for (const [from, target] of NAV_PAIRS) {
      const to = await resolveTarget(browser, base, from, target);
      if (to) pairs.push([from, to]);
      else console.warn(`도착 주소를 찾지 못해 건너뜀: ${from}`);
    }
    for (const [name, profile] of Object.entries(PROFILES)) {
      result.cold[name] = {};
      result.nav[name] = {};
      for (const route of COLD_ROUTES) {
        const samples = [];
        for (let i = 0; i < runs; i += 1)
          samples.push(await coldLoad(browser, profile, base + route));
        result.cold[name][route] = Object.fromEntries(
          ["ttfb", "fcp", "lcp", "kb", "jsKb"].map((k) => [
            k,
            summarize(samples.map((s) => s[k])),
          ]),
        );
        // LCP가 무엇 때문에 늦는지 보려고 가장 자주 나온 LCP 요소를 남긴다
        const counts = samples.reduce(
          (m, s) => m.set(s.lcpElement, (m.get(s.lcpElement) || 0) + 1),
          new Map(),
        );
        result.cold[name][route].lcpElement =
          [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
        console.log(
          `[${name}] 첫 진입 ${route} LCP 중앙값 ${result.cold[name][route].lcp.median?.toFixed(0)}ms (${result.cold[name][route].lcpElement})`,
        );
      }
      for (const [from, to] of pairs) {
        const samples = [];
        for (let i = 0; i < runs; i += 1)
          samples.push(
            await clientNavigation(browser, profile, base, from, to),
          );
        result.nav[name][`${from} → ${to}`] = {
          ms: summarize(samples.map((s) => s.ms)),
          dataRequests: summarize(samples.map((s) => s.dataRequests)),
        };
        console.log(
          `[${name}] 전환 ${from} → ${to} 중앙값 ${result.nav[name][`${from} → ${to}`].ms.median?.toFixed(0)}ms`,
        );
      }
    }
  } finally {
    await browser.close();
  }
  if (args.out) await writeFile(args.out, JSON.stringify(result, null, 2));
  return result;
}

function fmt(v, digits = 0) {
  return Number.isFinite(v) ? v.toFixed(digits) : "-";
}

async function compare() {
  const [beforePath, afterPath] = positionals;
  const before = JSON.parse(await readFile(beforePath, "utf8"));
  const after = JSON.parse(await readFile(afterPath, "utf8"));
  const lines = [];
  for (const profile of Object.keys(before.nav)) {
    lines.push(
      `\n### 화면 전환 (${profile}, 중앙값 ms, 누른 뒤 data 요청 수)\n`,
    );
    lines.push(
      "| 경로 | 전 | 후 | 차이 | data 요청 전/후 |",
      "|---|---|---|---|---|",
    );
    for (const [key, b] of Object.entries(before.nav[profile])) {
      const a = after.nav[profile]?.[key];
      if (!a) continue;
      lines.push(
        `| ${key} | ${fmt(b.ms.median)} | ${fmt(a.ms.median)} | ${fmt(a.ms.median - b.ms.median)} | ${fmt(b.dataRequests.median)}/${fmt(a.dataRequests.median)} |`,
      );
    }
    lines.push(`\n### 첫 진입 (${profile}, 중앙값)\n`);
    lines.push(
      "| 경로 | TTFB 전/후 | FCP 전/후 | LCP 전/후 | KB 전/후 |",
      "|---|---|---|---|---|",
    );
    for (const [route, b] of Object.entries(before.cold[profile])) {
      const a = after.cold[profile]?.[route];
      if (!a) continue;
      const pair = (k, d = 0) =>
        `${fmt(b[k].median, d)} / ${fmt(a[k].median, d)}`;
      lines.push(
        `| ${route} | ${pair("ttfb")} | ${pair("fcp")} | ${pair("lcp")} | ${pair("kb")} |`,
      );
    }
  }
  console.log(lines.join("\n"));
}

if (args.compare) await compare();
else await bench();
