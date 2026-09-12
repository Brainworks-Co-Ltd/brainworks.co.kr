import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const MAX_BYTES = 20 * 1024;

describe("파비콘 자산", () => {
  it.each([
    "public/favicon.ico",
    "public/favicon-32.png",
    "public/apple-touch-icon.png",
  ])("%s 파일이 존재하고 20KB 이하다", (relativePath) => {
    const size = statSync(resolve(root, relativePath)).size;

    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThanOrEqual(MAX_BYTES);
  });

  it("favicon.ico는 ICO 헤더로 시작한다", () => {
    const bytes = readFileSync(resolve(root, "public/favicon.ico"));

    expect(bytes.subarray(0, 6).toString("hex")).toBe("000001000100");
  });

  it("_document.tsx에 파비콘 link 태그 3개를 선언한다", () => {
    const source = readFileSync(
      resolve(root, "src/pages/_document.tsx"),
      "utf8",
    );

    expect(source).toContain('<link rel="icon" href="/favicon.ico" sizes="32x32" />');
    expect(source).toContain(
      '<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />',
    );
    expect(source).toContain(
      '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
    );
  });
});
