import { describe, expect, it } from "vitest";
import {
  getLocaleFromPath,
  getLocaleSwitchPath,
  getLocalizedPath,
  getRouteKey,
  isSupportedLocale,
} from "@/shared/routing/routes";
import {
  getCanonicalUrl,
  getLocaleAlternates,
} from "@/shared/routing/metadata";

describe("국영문 라우팅 계약", () => {
  it("URL 접두사로 언어를 판정한다", () => {
    expect(getLocaleFromPath("/about/history")).toBe("ko");
    expect(getLocaleFromPath("/en/about/history")).toBe("en");
    expect(getLocaleFromPath("/en")).toBe("en");
  });

  it("라우트 키를 국문·영문 경로로 변환한다", () => {
    expect(getLocalizedPath("about.history", "ko")).toBe("/about/history");
    expect(getLocalizedPath("about.history", "en")).toBe("/en/about/history");
    expect(getLocalizedPath("news.detail", "en", { slug: "sample-news" })).toBe(
      "/en/news/sample-news",
    );
  });

  it("현재 경로의 언어 전환 대상을 만든다", () => {
    expect(getLocaleSwitchPath("/about/history", "en")).toBe(
      "/en/about/history",
    );
    expect(getLocaleSwitchPath("/en/contact", "ko")).toBe("/contact");
    expect(getLocaleSwitchPath("/news/sample-news", "en")).toBe(
      "/en/news/sample-news",
    );
  });

  it("지원 언어와 라우트 키를 검증한다", () => {
    expect(isSupportedLocale("ko")).toBe(true);
    expect(isSupportedLocale("ja")).toBe(false);
    expect(getRouteKey("/en/services")).toBe("solutions.list");
    expect(getRouteKey("/unknown")).toBeNull();
  });

  it("언어별 canonical과 대체 URL을 만든다", () => {
    expect(getCanonicalUrl("/about", "ko")).toBe(
      "https://brainworks.co.kr/about/",
    );
    expect(getCanonicalUrl("/about", "en")).toBe(
      "https://brainworks.co.kr/en/about/",
    );
    expect(getLocaleAlternates("/contact")).toEqual({
      ko: "https://brainworks.co.kr/contact/",
      en: "https://brainworks.co.kr/en/contact/",
      "x-default": "https://brainworks.co.kr/contact/",
    });
  });
});
