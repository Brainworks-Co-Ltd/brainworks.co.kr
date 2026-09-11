import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("기반 도구 설정", () => {
  it("Node 런타임과 TypeScript strict 설정을 고정한다", () => {
    expect(read(".nvmrc").trim()).toBe("24.19.0");
    const tsconfig = JSON.parse(read("tsconfig.json"));

    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.allowJs).toBe(true);
    expect(tsconfig.compilerOptions.checkJs).toBe(false);
    expect(tsconfig.compilerOptions.noEmit).toBe(true);
  });

  it("Pages Router 서버 실행 기준과 검사 명령을 유지한다", () => {
    const nextConfig = read("next.config.js");
    const packageJson = JSON.parse(read("package.json"));

    expect(nextConfig).toContain('output: "standalone"');
    expect(nextConfig).toContain("trailingSlash: true");
    expect(nextConfig).toContain('locales: ["ko", "en"]');
    expect(packageJson.scripts).toMatchObject({
      typecheck: "tsc --noEmit",
      lint: "eslint .",
      "format:check": "prettier --check .",
    });
    expect(packageJson.scripts.test).toContain("vitest run");
  });

  it("Tailwind 4 PostCSS 플러그인과 고정 버전을 사용한다", () => {
    expect(read("postcss.config.mjs")).toContain('"@tailwindcss/postcss"');
    const packageJson = JSON.parse(read("package.json"));

    expect(packageJson.devDependencies.tailwindcss).toBe("4.3.3");
    expect(packageJson.devDependencies["@tailwindcss/postcss"]).toBe("4.3.3");
    expect(read("src/styles/globals.css")).toContain('@import "tailwindcss";');
  });

  it("DB 테스트 명령은 Node 환경에서 DB 테스트만 실행한다", () => {
    const dbConfig = read("vitest.db.config.ts");

    expect(dbConfig).toContain('environment: "node"');
    expect(dbConfig).toContain('include: ["tests/db/**/*.test.ts"]');
    expect(dbConfig).toContain("setupFiles: []");
    expect(dbConfig).not.toContain("mergeConfig");
  });

  it("교체된 인증 의존성을 제거하고 보안 패치 버전을 고정한다", () => {
    const packageJson = JSON.parse(read("package.json"));
    const packageLock = JSON.parse(read("package-lock.json"));

    expect(packageJson.dependencies).not.toHaveProperty("next-auth");
    expect(packageJson.dependencies.nodemailer).toBe("9.0.5");
    expect(
      packageLock.packages["node_modules/mdast-util-to-hast"].version,
    ).toBe("13.2.1");
  });

  it("CI에서 운영 의존성의 High 이상 취약점을 차단한다", () => {
    const ciWorkflow = read(".github/workflows/ci.yml");

    expect(ciWorkflow).toContain(
      "npm audit --omit=dev --audit-level=high",
    );
  });
});
