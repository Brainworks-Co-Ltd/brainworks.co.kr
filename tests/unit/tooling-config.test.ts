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

  it("Pages Router 정적 기준선과 검사 명령을 유지한다", () => {
    const nextConfig = read("next.config.js");
    const packageJson = JSON.parse(read("package.json"));

    expect(nextConfig).toContain('output: "export"');
    expect(nextConfig).toContain("trailingSlash: true");
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
});
