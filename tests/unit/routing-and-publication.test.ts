import { describe, expect, it } from "vitest";
import {
  assertPublishableNews,
  isPublishedNews,
} from "@/server/modules/news/publication-policy";
import { markdownToHtml } from "@/lib/markdown";
import { assertImageUploadMetadata } from "@/server/modules/assets/upload-policy";

describe("뉴스 공개·라우팅 정책", () => {
  it("게시 가능한 뉴스는 두 로케일의 필수 본문을 가진다", () => {
    expect(() =>
      assertPublishableNews({
        locales: {
          ko: { title: "국문 제목", bodyMarkdown: "본문" },
          en: { title: "English title", bodyMarkdown: "Body" },
        },
      }),
    ).not.toThrow();
    expect(() =>
      assertPublishableNews({
        locales: { ko: { title: "제목", bodyMarkdown: "본문" } },
      }),
    ).toThrow("PUBLICATION_INVALID");
  });

  it("공개 조건은 활성 부모와 게시 로케일을 모두 확인한다", () => {
    expect(isPublishedNews("ACTIVE", "PUBLISHED")).toBe(true);
    expect(isPublishedNews("ARCHIVED", "PUBLISHED")).toBe(false);
    expect(isPublishedNews("ACTIVE", "HIDDEN")).toBe(false);
  });

  it("뉴스 Markdown은 원시 HTML과 스크립트 속성을 제거한다", () => {
    const html = markdownToHtml(
      "<img src=x onerror=alert(1)><script>alert(1)</script>**안전한 본문**",
    );
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("script");
    expect(html).toContain("안전한 본문");
  });

  it("이미지 업로드는 허용 MIME과 10MB 제한을 지킨다", () => {
    expect(() =>
      assertImageUploadMetadata({ mimeType: "image/webp", bytes: 1024 }),
    ).not.toThrow();
    expect(() =>
      assertImageUploadMetadata({ mimeType: "application/pdf", bytes: 1024 }),
    ).toThrow("IMAGE_TYPE_NOT_ALLOWED");
    expect(() =>
      assertImageUploadMetadata({
        mimeType: "image/png",
        bytes: 11 * 1024 * 1024,
      }),
    ).toThrow("IMAGE_TOO_LARGE");
    expect(() =>
      assertImageUploadMetadata({ mimeType: "image/png", bytes: 0 }),
    ).toThrow("BAD_REQUEST");
  });
});
