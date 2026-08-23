import { getTableName } from "drizzle-orm";
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
});
