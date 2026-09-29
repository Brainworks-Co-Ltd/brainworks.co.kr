import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const MAX_BYTES = 20 * 1024;

// 2026-09-16: 탭 아이콘을 로고 심벌만 담은 PNG 두 장으로 바꿨다. 워드마크가
// 들어간 favicon.ico는 32px에서 글자가 뭉개져 파일과 link를 함께 지웠다.
describe("파비콘 자산", () => {
  it.each(["public/favicon-32.png", "public/apple-touch-icon.png"])(
    "%s 파일이 존재하고 20KB 이하다",
    (relativePath) => {
      const size = statSync(resolve(root, relativePath)).size;

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThanOrEqual(MAX_BYTES);
    },
  );

  it.each(["public/favicon-32.png", "public/apple-touch-icon.png"])(
    "%s는 PNG 헤더로 시작한다",
    (relativePath) => {
      const bytes = readFileSync(resolve(root, relativePath));

      expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    },
  );

  it("_document.tsx에 파비콘 link 태그 두 개를 선언한다", () => {
    const source = readFileSync(
      resolve(root, "src/pages/_document.tsx"),
      "utf8",
    );

    expect(source).toContain('href="/favicon-32.png"');
    expect(source).toContain(
      '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
    );
    expect(source).not.toContain("favicon.ico");
  });
});
