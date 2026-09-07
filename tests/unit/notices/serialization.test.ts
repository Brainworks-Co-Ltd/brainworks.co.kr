import { describe, expect, it } from "vitest";
import {
  toPublishedNoticeDetail,
  toPublishedNoticeListItem,
} from "@/server/modules/notices/queries";

describe("공개 공지 화면 데이터 직렬화", () => {
  it("목록에서 게시 기간 Date 객체와 내부 필드를 제거한다", () => {
    const item = toPublishedNoticeListItem({
      id: "notice-1",
      publicNumber: 1,
      title: "공지",
      displayDate: "2026-09-07",
      categoryId: "category-1",
      isPinned: true,
      pinOrder: 1,
      status: "PUBLISHED",
      startsAt: new Date("2026-09-07T00:00:00Z"),
      endsAt: new Date("2026-09-08T00:00:00Z"),
    });

    expect(item).toEqual({
      publicNumber: 1,
      title: "공지",
      date: "2026-09-07",
      isPinned: true,
    });
  });

  it("상세에서 게시 기간 Date 객체와 내부 필드를 제거한다", () => {
    const notice = toPublishedNoticeDetail(
      {
        id: "notice-1",
        localeId: "locale-1",
        publicNumber: 1,
        title: "공지",
        bodyMarkdown: "본문",
        displayDate: "2026-09-07",
        categoryId: "category-1",
        status: "PUBLISHED",
        startsAt: new Date("2026-09-07T00:00:00Z"),
        endsAt: new Date("2026-09-08T00:00:00Z"),
      },
      [
        {
          id: "attachment-1",
          displayName: "안내.pdf",
          downloadUrl: "/download",
        },
      ],
    );

    expect(notice).toEqual({
      title: "공지",
      bodyMarkdown: "본문",
      date: "2026-09-07",
      attachments: [
        {
          id: "attachment-1",
          displayName: "안내.pdf",
          downloadUrl: "/download",
        },
      ],
    });
  });
});
