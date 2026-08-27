import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../../..");

describe("관리자 공지 작성 폼", () => {
  it("관리자에게 슬러그 입력을 요구하거나 전송하지 않는다", () => {
    const source = readFileSync(
      resolve(repositoryRoot, "src/pages/admin/notices/new.tsx"),
      "utf8",
    );

    expect(source).not.toContain("슬러그");
    expect(source).not.toContain("form.slug");
    expect(source).not.toContain('slug: ""');
  });
});
