import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// 공식 Pretendard v1.3.9 variable 동적 서브셋은 92개 파일로 배포된다(브리프의
// "약 120개"는 추정치였다 — public/fonts/README.md 참고).
const SUBSET_DIR = join(process.cwd(), "public/fonts/pretendard");
const CSS_PATH = join(process.cwd(), "src/styles/pretendard.css");
const OLD_FONT_PATH = join(process.cwd(), "public/fonts/PretendardVariable.woff2");

describe("Pretendard 동적 서브셋 자체 호스팅", () => {
  it("서브셋 디렉터리에 woff2 파일이 80개 이상 있다", () => {
    const files = readdirSync(SUBSET_DIR).filter((f) => f.endsWith(".woff2"));
    expect(files.length).toBeGreaterThanOrEqual(80);
  });

  it("CSS에 unicode-range 선언이 80개 이상 있다", () => {
    const css = readFileSync(CSS_PATH, "utf-8");
    const matches = css.match(/unicode-range:/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(80);
  });

  it("CSS가 옛 단일 PretendardVariable.woff2 파일을 더 이상 참조하지 않는다", () => {
    const css = readFileSync(CSS_PATH, "utf-8");
    expect(css).not.toMatch(/src:[^;]*PretendardVariable\.woff2\)/);
  });

  it("옛 단일 woff2 파일이 삭제되어 있다", () => {
    expect(() => readFileSync(OLD_FONT_PATH)).toThrow();
  });
});
