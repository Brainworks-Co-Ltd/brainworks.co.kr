import { describe, expect, it } from "vitest";
import { reconcileSources } from "@/../scripts/migration/reconcile";

describe("이전 대조", () => {
  it("sourceKey·체크섬 불일치를 미해결로 분리한다", () => {
    const result = reconcileSources([{ sourceKey: "a", sourceChecksum: "1" }, { sourceKey: "b", sourceChecksum: "2" }], [{ sourceKey: "a", sourceChecksum: "1" }]);
    expect(result).toMatchObject({ sourceCount: 2, importedCount: 1 });
    expect(result.unresolved).toEqual([{ sourceKey: "b", reason: "NOT_IMPORTED" }]);
  });
});
