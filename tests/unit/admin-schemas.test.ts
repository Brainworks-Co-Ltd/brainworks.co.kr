import { describe, expect, it } from "vitest";
import { HttpError } from "@/server/http/errors";
import {
  localeCommandSchema,
  parseBody,
  publishCommandSchema,
  versionCommandSchema,
} from "@/server/http/validate";
import { newsCommandSchema, newsSaveSchema } from "@/server/modules/news/schema";
import {
  noticeCategoryActiveSchema,
  noticeCategoryCommandSchema,
  noticeCommandSchema,
} from "@/server/modules/notices/schema";
import {
  popupCommandSchema,
  popupReorderCommandSchema,
} from "@/server/modules/popup-notices/schema";
import { honorCommandSchema } from "@/server/modules/honors/schema";
import { aiSolutionCommandSchema } from "@/server/modules/catalog/schema";

/** 관리자 폼이 실제로 보내는 본문. tests/components/admin-*-form*.test.tsx가 키 집합을 단언한다. */
const bodies = {
  news: {
    slug: "ai-news",
    category: "COMPANY",
    displayDate: "2026-09-14",
    locales: {
      ko: { title: "제목", summary: "요약", bodyMarkdown: "본문", coverAlt: null },
      en: { title: "Title", summary: "Summary", bodyMarkdown: "Body", coverAlt: null },
    },
  },
  notice: {
    categoryId: null,
    displayDate: "2026-09-14",
    isPinned: false,
    pinOrder: null,
    locales: {
      ko: { title: "공지", bodyMarkdown: "본문" },
      en: { title: "Notice", bodyMarkdown: "Body" },
    },
  },
  noticeCategory: {
    displayOrder: 1,
    locales: { ko: { name: "일반" }, en: { name: "General" } },
  },
  popup: {
    noticeId: null,
    locales: {
      ko: {
        title: "팝업",
        bodyMarkdown: null,
        imageAssetId: null,
        imageAlt: null,
        displayOrder: 0,
      },
      en: {
        title: "Popup",
        bodyMarkdown: null,
        imageAssetId: null,
        imageAlt: null,
        displayOrder: 0,
      },
    },
  },
  honor: {
    honorType: "AWARD",
    occurredYear: 2026,
    occurredOn: null,
    displayOrder: 1,
    imageAssetId: null,
    locales: {
      ko: { title: "인증", organization: "기관", description: "설명", imageAlt: null },
      en: { title: "Award", organization: "Org", description: "Description", imageAlt: null },
    },
  },
  aiSolution: {
    businessAreaId: "area-1",
    displayOrder: 1,
    imageAssetId: null,
    locales: {
      ko: { name: "솔루션", summary: "요약", description: "설명", imageAlt: null },
      en: { name: "Solution", summary: "Summary", description: "Description", imageAlt: null },
    },
  },
} as const;

const commandSchemas = [
  ["news", newsCommandSchema, bodies.news],
  ["notice", noticeCommandSchema, bodies.notice],
  ["noticeCategory", noticeCategoryCommandSchema, bodies.noticeCategory],
  ["popup", popupCommandSchema, bodies.popup],
  ["honor", honorCommandSchema, bodies.honor],
  ["aiSolution", aiSolutionCommandSchema, bodies.aiSolution],
] as const;

describe("관리자 저장 스키마", () => {
  it.each(commandSchemas)("%s: 관리자 폼이 보내는 본문을 통과시킨다", (_name, schema, body) => {
    expect(schema.safeParse(body).success).toBe(true);
  });

  it.each(commandSchemas.filter(([name]) => name !== "noticeCategory"))(
    "%s: 로케일 값이 객체가 아니면 거절한다",
    (_name, schema) => {
      expect(schema.safeParse({ locales: { ko: 1, en: 1 } }).success).toBe(false);
    },
  );

  it("대체 설명이 null이어도 통과한다", () => {
    expect(honorCommandSchema.parse(bodies.honor).locales.ko.imageAlt).toBeNull();
    expect(newsCommandSchema.parse(bodies.news).locales.en.coverAlt).toBeNull();
    expect(popupCommandSchema.parse(bodies.popup).locales.ko.imageAlt).toBeNull();
    expect(
      aiSolutionCommandSchema.parse(bodies.aiSolution).locales.ko.imageAlt,
    ).toBeNull();
  });

  it("표시 날짜는 YYYY-MM-DD 형태만 받는다", () => {
    expect(
      noticeCommandSchema.safeParse({ ...bodies.notice, displayDate: "" }).success,
    ).toBe(false);
  });

  it("서버가 쓰지 않는 키는 버린다", () => {
    const parsed = noticeCommandSchema.parse({ ...bodies.notice, version: 3 });
    expect(parsed).not.toHaveProperty("version");
  });
});

describe("관리자 명령 스키마", () => {
  it("expectedVersion이 문자열이면 거절한다", () => {
    expect(versionCommandSchema.safeParse({ expectedVersion: "1" }).success).toBe(false);
    expect(versionCommandSchema.safeParse({ expectedVersion: 1 }).success).toBe(true);
  });

  it("로케일 명령은 ko와 en만 받는다", () => {
    expect(
      localeCommandSchema.safeParse({ locale: "ko", expectedVersion: 1 }).success,
    ).toBe(true);
    expect(
      localeCommandSchema.safeParse({ locale: "jp", expectedVersion: 1 }).success,
    ).toBe(false);
    expect(localeCommandSchema.safeParse({ expectedVersion: 1 }).success).toBe(false);
  });

  it("게시 명령은 ISO 시각 또는 null을 받는다", () => {
    expect(
      publishCommandSchema.safeParse({
        locale: "ko",
        expectedVersion: 1,
        startsAt: "2026-09-14T00:00:00.000Z",
        endsAt: null,
      }).success,
    ).toBe(true);
    expect(
      publishCommandSchema.safeParse({
        locale: "ko",
        expectedVersion: 1,
        startsAt: "2026-09-14",
      }).success,
    ).toBe(false);
  });

  it("뉴스 저장은 expectedVersion과 input을 함께 받는다", () => {
    expect(
      newsSaveSchema.safeParse({ expectedVersion: 2, input: bodies.news }).success,
    ).toBe(true);
    expect(newsSaveSchema.safeParse({ expectedVersion: 2 }).success).toBe(false);
  });

  it("카테고리 노출 전환은 불리언을 요구한다", () => {
    expect(
      noticeCategoryActiveSchema.safeParse({ expectedVersion: 1, isActive: "true" })
        .success,
    ).toBe(false);
  });

  it("팝업 순서 변경은 정수 순서를 요구한다", () => {
    expect(
      popupReorderCommandSchema.safeParse({
        locale: "ko",
        expectedVersion: 1,
        displayOrder: 1.5,
      }).success,
    ).toBe(false);
  });
});

describe("parseBody", () => {
  it("통과한 본문을 그대로 돌려준다", () => {
    expect(parseBody(versionCommandSchema, { expectedVersion: 4 })).toEqual({
      expectedVersion: 4,
    });
  });

  it("실패하면 경로를 담은 400 HttpError를 던진다", () => {
    try {
      parseBody(noticeCommandSchema, { locales: { ko: 1, en: 1 } });
      throw new Error("던지지 않았다");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      const httpError = error as HttpError;
      expect(httpError.status).toBe(400);
      expect(httpError.code).toBe("BAD_REQUEST");
      expect(httpError.message).toMatch(/^입력값을 확인해 주세요\./);
      expect(httpError.message).toContain("displayDate");
    }
  });

  it("본문 자체가 객체가 아니면 본문 경로로 안내한다", () => {
    expect(() => parseBody(versionCommandSchema, null)).toThrowError(
      "입력값을 확인해 주세요. (본문)",
    );
  });
});
