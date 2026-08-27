---
wiki_type: plan
status: approved
updated: 2026-08-27
sources:
  - ../specs/2026-08-27-notice-public-number-design.md
---

# 공지사항 숫자형 공개 번호 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자 슬러그 입력을 제거하고 DB가 자동 발급한 공지 번호를 `/notices/{publicNumber}` 공개 주소로 사용합니다.

**Architecture:** 내부 UUID는 관계와 관리자 명령에 유지하고 `notices.public_number` identity를 외부 식별자로 추가합니다. 새 조회는 공개 번호를 사용하며 기존 `notice_slugs`는 과거 주소를 숫자 주소로 영구 이동시키는 호환 조회에만 남깁니다.

**Tech Stack:** Next.js Pages Router, TypeScript, Drizzle ORM, PostgreSQL 17, Vitest

---

### Task 1: 공개 번호와 입력 계약

**Files:**
- Create: `tests/unit/notices/public-number.test.ts`
- Modify: `tests/unit/notices/publication-policy.test.ts`
- Modify: `src/server/modules/notices/contracts.ts`
- Modify: `src/server/modules/notices/domain.ts`

- [ ] **Step 1: 실패하는 공개 번호·입력 테스트를 작성합니다.**

```ts
import { describe, expect, it } from "vitest";
import { isNoticeCommandInput, parseNoticePublicNumber } from "@/server/modules/notices/contracts";

describe("공지 공개 번호 계약", () => {
  it("양의 안전 정수만 공개 번호로 받는다", () => {
    expect(parseNoticePublicNumber("123")).toBe(123);
    for (const value of ["0", "-1", "1.2", "01", "9007199254740992", "notice"]) {
      expect(parseNoticePublicNumber(value)).toBeNull();
    }
  });

  it("슬러그 없이 국문·영문 입력을 받는다", () => {
    expect(isNoticeCommandInput({
      displayDate: "2026-08-27",
      locales: {
        ko: { title: "공지", bodyMarkdown: "본문" },
        en: { title: "Notice", bodyMarkdown: "Body" },
      },
    })).toBe(true);
  });
});
```

`publication-policy.test.ts`의 팝업 링크 기대값은 `noticePublicNumber: 123`과 `/notices/123`으로 변경합니다.

- [ ] **Step 2: 테스트가 export 부재와 기존 슬러그 계약 때문에 실패하는지 확인합니다.**

Run: `npm test -- tests/unit/notices/public-number.test.ts tests/unit/notices/publication-policy.test.ts`

Expected: `parseNoticePublicNumber` 또는 `isNoticeCommandInput` export 부재로 FAIL

- [ ] **Step 3: 최소 계약과 순수 정책을 구현합니다.**

```ts
export type NoticeCommandInput = {
  categoryId?: string | null;
  displayDate: string;
  isPinned?: boolean;
  pinOrder?: number | null;
  locales: Record<NoticeLocale, NoticeLocaleInput>;
};

export function parseNoticePublicNumber(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const publicNumber = Number(value);
  return Number.isSafeInteger(publicNumber) ? publicNumber : null;
}

export function isNoticeCommandInput(value: unknown): value is NoticeCommandInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  const locales = input.locales as Record<string, unknown> | undefined;
  return typeof input.displayDate === "string" && Boolean(locales?.ko && locales.en);
}
```

`resolvePopupDetailUrl`은 `noticePublicNumber?: number | null`을 받고 공개 중일 때만 `/notices/${noticePublicNumber}`를 반환합니다.

- [ ] **Step 4: 두 단위 테스트가 통과하는지 확인합니다.**

Run: `npm test -- tests/unit/notices/public-number.test.ts tests/unit/notices/publication-policy.test.ts`

Expected: 두 파일 PASS

### Task 2: DB identity와 안전한 마이그레이션

**Files:**
- Modify: `tests/db/notices-repository.test.ts`
- Modify: `src/server/db/schema/notices.ts`
- Create: `src/server/db/migrations/0003_notice_public_number.sql`
- Modify: `src/server/db/migrations/meta/0003_snapshot.json`
- Modify: `src/server/db/migrations/meta/_journal.json`

- [ ] **Step 1: 실패하는 스키마 계약 테스트를 작성합니다.**

```ts
const config = getTableConfig(notices);
const publicNumber = config.columns.find((column) => column.name === "public_number");
expect(publicNumber?.notNull).toBe(true);
expect(publicNumber?.generatedIdentity?.type).toBe("always");
expect(config.indexes.some((index) => index.config.name === "notices_public_number_uk")).toBe(true);
```

- [ ] **Step 2: 공개 번호 열 부재로 실패하는지 확인합니다.**

Run: `npm run test:db -- tests/db/notices-repository.test.ts`

Expected: `public_number`를 찾지 못해 FAIL

- [ ] **Step 3: Drizzle 스키마를 최소 변경합니다.**

```ts
publicNumber: integer("public_number").notNull().generatedAlwaysAsIdentity(),
```

`notices`의 추가 설정에 `uniqueIndex("notices_public_number_uk").on(table.publicNumber)`를 둡니다.

- [ ] **Step 4: Drizzle migration과 snapshot을 생성합니다.**

Run: `npm run db:generate -- --name notice_public_number`

Expected: 새 `0003_notice_public_number.sql`, snapshot과 journal 생성

- [ ] **Step 5: 생성 SQL을 기존 행 안전 순서로 조정합니다.**

```sql
ALTER TABLE "notices" ADD COLUMN "public_number" integer;
WITH "numbered_notices" AS (
  SELECT "id", row_number() OVER (ORDER BY "created_at", "id")::integer AS "public_number"
  FROM "notices"
)
UPDATE "notices"
SET "public_number" = "numbered_notices"."public_number"
FROM "numbered_notices"
WHERE "notices"."id" = "numbered_notices"."id";
ALTER TABLE "notices" ALTER COLUMN "public_number" SET NOT NULL;
ALTER TABLE "notices" ALTER COLUMN "public_number" ADD GENERATED ALWAYS AS IDENTITY;
SELECT setval(
  pg_get_serial_sequence('notices', 'public_number'),
  COALESCE((SELECT MAX("public_number") FROM "notices"), 0) + 1,
  false
);
CREATE UNIQUE INDEX "notices_public_number_uk" ON "notices" USING btree ("public_number");
```

- [ ] **Step 6: 테스트 DB와 개발 DB에 migration을 적용합니다.**

Run: `$env:DATABASE_URL='postgresql://brainworks:brainworks_test@localhost:5434/brainworks_test'; npm run db:migrate`

Run: `npm run db:migrate`

Expected: 두 명령 종료 코드 0

- [ ] **Step 7: 스키마 테스트가 통과하는지 확인합니다.**

Run: `npm run test:db -- tests/db/notices-repository.test.ts`

Expected: PASS

### Task 3: 관리자 생성·조회에서 슬러그 제거

**Files:**
- Modify: `src/server/modules/notices/repository.ts`
- Modify: `src/server/modules/notices/services.ts`
- Modify: `src/pages/api/admin/notices/index.ts`
- Delete: `src/pages/api/admin/notices/[id]/slug.ts`
- Modify: `src/pages/admin/notices/new.tsx`
- Modify: `src/pages/admin/notices/[noticeId].tsx`
- Modify: `src/pages/admin/notices.jsx`
- Create: `tests/unit/notices/admin-notice-form.test.ts`

- [ ] **Step 1: 실패하는 관리자 폼 계약 테스트를 작성합니다.**

```ts
const source = readFileSync(resolve(root, "src/pages/admin/notices/new.tsx"), "utf8");
expect(source).not.toContain("슬러그");
expect(source).not.toContain("form.slug");
expect(source).not.toContain("slug:");
```

- [ ] **Step 2: 현재 슬러그 입력 때문에 실패하는지 확인합니다.**

Run: `npm test -- tests/unit/notices/admin-notice-form.test.ts`

Expected: `슬러그` 또는 `form.slug`가 남아 FAIL

- [ ] **Step 3: repository와 API를 공개 번호 계약으로 바꿉니다.**

`createNotice`는 슬러그 행을 삽입하지 않고 `returning({ id, version, publicNumber })`를 반환합니다. `getAdminNotice`는 부모 행의 `publicNumber`를 그대로 반환합니다. `changeNoticeSlug`와 service export를 제거하고 API 입력 검사는 `isNoticeCommandInput`을 사용합니다.

- [ ] **Step 4: 관리자 화면의 슬러그 입력과 문구를 제거합니다.**

새 공지 폼 요청에는 `displayDate`, `categoryId`, `locales`만 전송합니다. 목록과 편집 화면의 공개 링크는 `/notices/${item.publicNumber}`를 사용하고 편집 설명은 `공지 번호 ${notice.publicNumber}`로 표시합니다.

- [ ] **Step 5: 관리자 폼 계약과 타입 검사를 통과시킵니다.**

Run: `npm test -- tests/unit/notices/admin-notice-form.test.ts tests/unit/notices/public-number.test.ts`

Run: `npm run typecheck`

Expected: 모두 종료 코드 0

### Task 4: 공개 조회·팝업·첨부 주소 전환

**Files:**
- Modify: `src/server/modules/notices/queries.ts`
- Modify: `src/server/modules/popup-notices/queries.ts`
- Modify: `src/pages/api/notices/[slug]/attachments/[attachmentId]/download.ts`
- Modify: `src/pages/notices/index.tsx`
- Modify: `src/components/notices/NoticeList.jsx`
- Modify: `src/pages/notices/[slug].tsx`
- Create: `tests/unit/notices/public-notice-route.test.ts`

- [ ] **Step 1: 실패하는 공개 페이지 번호·레거시 이동 테스트를 작성합니다.**

DB 조회를 주입할 수 있는 `resolvePublishedNoticeRoute(identifier, locale, queries)` 순수 오케스트레이터를 대상으로 다음을 검증합니다.

```ts
expect(await resolvePublishedNoticeRoute("123", "ko", queries)).toEqual({ kind: "notice", notice });
expect(await resolvePublishedNoticeRoute("old-slug", "en", legacyQueries)).toEqual({
  kind: "redirect",
  destination: "/en/notices/123",
});
expect(await resolvePublishedNoticeRoute("missing", "ko", emptyQueries)).toEqual({ kind: "notFound" });
```

- [ ] **Step 2: 오케스트레이터 부재로 실패하는지 확인합니다.**

Run: `npm test -- tests/unit/notices/public-notice-route.test.ts`

Expected: `resolvePublishedNoticeRoute` export 부재로 FAIL

- [ ] **Step 3: 공개 쿼리를 번호 중심으로 전환합니다.**

목록·상세·관리자 목록은 `notices.publicNumber`를 선택하고 현재 슬러그 내부 조인을 제거합니다. 상세은 `eq(notices.publicNumber, publicNumber)`로 조회합니다. 레거시 쿼리는 `notice_slugs.slug`로 현재 공개 가능한 공지를 찾고 `publicNumber`만 반환합니다.

- [ ] **Step 4: 공개 라우트 오케스트레이터와 308 이동을 구현합니다.**

숫자 상세 조회가 성공하면 공지를 반환하고, 실패하거나 비숫자이면 레거시 슬러그를 조회합니다. 레거시 일치 시 로케일을 보존한 숫자 주소로 `permanent: true` redirect를 반환합니다.

- [ ] **Step 5: 팝업 링크와 첨부 다운로드를 번호로 전환합니다.**

팝업 쿼리는 `linkedNotices.publicNumber`를 선택해 `/notices/{publicNumber}`를 만듭니다. 첨부 다운로드 쿼리는 경로 값을 `parseNoticePublicNumber`로 검증한 뒤 `notices.publicNumber`로 권한을 확인합니다.

- [ ] **Step 6: 목록 컴포넌트와 타입을 공개 번호로 전환합니다.**

`NoticeList`의 항목 키와 링크, `notices/index.tsx` 타입을 `publicNumber: number`로 바꿉니다.

- [ ] **Step 7: 관련 단위 테스트와 타입 검사를 통과시킵니다.**

Run: `npm test -- tests/unit/notices/public-number.test.ts tests/unit/notices/publication-policy.test.ts tests/unit/notices/public-notice-route.test.ts tests/unit/notices/admin-notice-form.test.ts`

Run: `npm run typecheck`

Expected: 모두 종료 코드 0

### Task 5: 전체 검증과 운영 확인

**Files:**
- Modify: `docs/superpowers/evidence/2026-08-25-task-9a-notices-popup.md`

- [ ] **Step 1: 남은 공지 슬러그 의존성을 검사합니다.**

Run: `rg -n 'changeNoticeSlug|input\.slug|form\.slug|item\.slug|noticeSlug' src tests`

Expected: 레거시 호환용 `notice_slugs` 조회 외 신규 생성·표시 의존성 없음

- [ ] **Step 2: 전체 정적·자동 검증을 실행합니다.**

Run: `npm run test:db -- tests/db/notices-repository.test.ts`

Run: `npm test`

Run: `npm run typecheck`

Run: `npm run lint`

Run: `npm run build`

Expected: 모든 명령 종료 코드 0

- [ ] **Step 3: 개발 DB에서 identity와 생성 번호를 확인합니다.**

관리자 화면에서 슬러그 입력이 사라졌는지 확인하고 공지 초안을 한 건 저장합니다. 저장 결과의 공개 번호가 양의 정수인지, 관리자 목록·편집 링크가 `/notices/{publicNumber}`인지 확인합니다.

- [ ] **Step 4: 검증 증빙을 갱신합니다.**

숫자형 주소, 기존 슬러그 호환, 실행한 명령과 브라우저 확인 결과를 증빙 문서에 기록합니다. Wiki lint의 기존 범위 밖 오류는 별도로 구분합니다.

## 자체 검토

- 설계의 DB identity, 관리자 입력 제거, 숫자형 공개 조회, 팝업·첨부 링크, 레거시 영구 이동 요구가 Task 1~5에 연결됩니다.
- `publicNumber` 이름과 `number` 타입을 API·쿼리·화면에서 동일하게 사용합니다.
- 뉴스 슬러그와 공지 카테고리는 변경하지 않습니다.
- 미정 값과 후속 구현 자리표시자는 없습니다.
