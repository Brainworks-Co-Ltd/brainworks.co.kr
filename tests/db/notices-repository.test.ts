import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { noticeCategories, notices, noticeLocales, noticeSlugs, noticeAttachments } from "@/server/db/schema/notices";

describe("공지 관계형 저장 계약", () => {
  it("공지와 카테고리·로케일·슬러그·첨부를 뉴스와 분리한다", () => {
    expect(getTableName(noticeCategories)).toBe("notice_categories");
    expect(getTableName(notices)).toBe("notices");
    expect(getTableName(noticeLocales)).toBe("notice_locales");
    expect(getTableName(noticeSlugs)).toBe("notice_slugs");
    expect(getTableName(noticeAttachments)).toBe("notice_attachments");
  });

  it("공개 번호를 DB가 발급하고 중복을 차단한다", () => {
    const config = getTableConfig(notices);
    const publicNumber = config.columns.find(
      (column) => column.name === "public_number",
    );

    expect(publicNumber?.notNull).toBe(true);
    expect(publicNumber?.generatedIdentity?.type).toBe("always");
    expect(
      config.indexes.some(
        (index) => index.config.name === "notices_public_number_uk",
      ),
    ).toBe(true);
  });
});
