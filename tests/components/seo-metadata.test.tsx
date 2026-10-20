import { readFileSync } from "node:fs";
import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// next/head를 자식 그대로 렌더하도록 mock
vi.mock("next/head", () => ({
  default: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ asPath: "/about", locale: "ko" }),
}));

import { SeoMetadata } from "@/components/public/SeoMetadata";

describe("SeoMetadata", () => {
  it("canonical과 hreflang link에 고유 key가 있다", () => {
    render(<SeoMetadata title="t" description="d" />);
    const links = Array.from(document.querySelectorAll("link"));
    const rels = links.map((l) => `${l.getAttribute("rel")}:${l.getAttribute("hreflang") ?? ""}`);
    expect(new Set(rels).size).toBe(rels.length);
    expect(rels).toContain("canonical:");
  });

  it("공유 카드 태그가 대표 주소와 절대 경로 그림을 가리킨다", () => {
    render(<SeoMetadata title="t" description="d" />);
    const og = (p: string) =>
      document.querySelector(`meta[property="${p}"]`)?.getAttribute("content");
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    expect(og("og:url")).toBe(canonical);
    expect(og("og:title")).toBe("t");
    expect(og("og:description")).toBe("d");
    expect(og("og:image")).toMatch(/^https:\/\/brainworks\.co\.kr\/.+\.png$/);
  });

  it("소스의 link 태그마다 key가 있다", () => {
    const source = readFileSync("src/components/public/SeoMetadata.jsx", "utf8");
    const linkTags = source.match(/<link[^>]*>/g) ?? [];
    expect(linkTags.length).toBeGreaterThan(0);
    for (const tag of linkTags) expect(tag).toMatch(/\bkey=/);
  });
});
