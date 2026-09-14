import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();

describe("shadcn 기반 설정", () => {
  it("Base UI·JSX·Tailwind 4·Lucide 설정을 사용한다", () => {
    const config = JSON.parse(
      readFileSync(join(repositoryRoot, "components.json"), "utf8"),
    );

    expect(config).toMatchObject({
      style: "base-nova",
      rsc: false,
      tsx: false,
      iconLibrary: "lucide",
      tailwind: {
        config: "",
        css: "src/styles/globals.css",
        cssVariables: true,
        prefix: "",
      },
      aliases: {
        components: "@/components",
        ui: "@/components/ui",
        lib: "@/lib",
        utils: "@/lib/utils",
        hooks: "@/hooks",
      },
    });
  });

  it("shadcn 의미 토큰은 브레인웍스 토큰을 참조한다", () => {
    const css = readFileSync(
      join(repositoryRoot, "src/styles/globals.css"),
      "utf8",
    );

    expect(css).toContain("--background: var(--bw-color-surface);");
    expect(css).toContain("--foreground: var(--bw-color-ink);");
    expect(css).toContain("--primary: var(--bw-color-ink);");
    expect(css).toContain("--border: var(--bw-color-line);");
    expect(css).toContain("--ring: var(--bw-color-focus);");
  });
});
