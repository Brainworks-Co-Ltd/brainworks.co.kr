# 최종 전체 브랜치 리뷰 — fix/completeness-audit (81c907d..1e89b28)

**Branch: Mergeable**

범위: 10 커밋, 212 파일(폰트 바이너리 92개 포함). 계획 `docs/superpowers/plans/2026-09-14-deferred-items.md` 11개 과제(Task 8은 미추적 docs라 커밋 없음).

## Verification results

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | 종료 코드 0, 오류 0 |
| `npm run lint` | 종료 코드 0, 오류 0 / 경고 2 (아래 목록) |
| `npm test` | 65 파일 / 246 테스트 전부 통과 (기준선 60 / 199) |
| `npm run test:db` | 10 파일 / 27 테스트 전부 통과 (skip 0, 5434 실제 Postgres 접속) |
| `npm run build` | 성공(종료 코드 0). 이후 `git status --short` → ` M next-env.d.ts` (빌드 산출물, 커밋하지 않음) |
| `npx vitest run tests/components/public-shell-navigation.test.tsx` x3 | 3회 모두 8/8 통과, 실패 재현 없음 |

남은 lint 경고 2건 (둘 다 계획이 수정을 금지한 `src/components/industrial/IndustrialHero.jsx`):

- `src/components/industrial/IndustrialHero.jsx:104:5` — `react-hooks/set-state-in-effect`
- `src/components/industrial/IndustrialHero.jsx:221:11` — `@next/next/no-img-element`

## Bundle sanity (Task 7 next/image 전환 후)

| 경로 | First Load JS (raw) | 이전 기준선 | 증감 |
|---|---|---|---|
| `/` | 499.3kB | 499.1kB | +0.2kB |
| `/education` | 409.1kB | 408.9kB | +0.2kB |
| `/news` | 395.7kB | 395.1kB | +0.6kB |
| `/about` | 394.5kB | (기준선 없음) | — |

공유 청크 331.9kB raw / 103.7kB gz. 15kB 초과 증가한 공개 경로 없음. next/image 클라이언트 청크 비용은 사실상 측정되지 않는 수준.

## Cross-task findings

**(a) Task 1 zod + Task 5 중복 검사 + Task 6 previews 스키마 — 봉합 정상**

`src/pages/api/admin/**`의 라우트 38개 중 36개가 `parseBody`를 통과한다. 나머지 2개는 명시적 사유가 있다: `src/pages/api/admin/assets.ts`, `src/pages/api/admin/assets/documents.ts` 둘 다 `export const config = { api: { bodyParser: false } }`로 multipart 스트림을 직접 읽으므로 JSON 본문 스키마 대상이 아니다. `grep -rn "request.body" src/pages/api`는 `parseBody(...)` 인자로 쓰인 곳과 `src/pages/api/contact.ts`(기존 `src/shared/schemas/contact.ts` 검증 경로)만 잡힌다. 우회 경로 없음.

Task 6이 계획 결함을 메워 `src/pages/api/admin/previews/[contentType].ts`에도 `previewCommandSchema`(`src/server/modules/preview/schema.ts`)를 적용했다. Task 5의 중복 이름 검사(`src/server/modules/notices/category-repository.ts:31-35`)는 Task 1이 만든 `noticeCategoryCommandSchema` 통과 이후 저장 정책 단계에서 돈다 — 형태 검증과 정책 검증의 계층이 어긋나지 않는다.

**(b) Task 2 + Task 4 + Task 7 — `NoticeForm.tsx` 전 경로 정합**

`src/components/admin/NoticeForm.tsx`를 끝까지 읽고 확인했다.

- `inFlight`: 설정 지점 3곳(`save` 114, `localeCommand` 179, `itemCommand` 242) 전부 `finally`(165, 230, 274)에서 해제된다. `handleUnauthorized`가 true를 반환해 `catch` 안에서 `return`해도 `finally`는 실행되므로 `inFlight`가 남는 경로가 없다. 나머지 4개 폼도 `inFlight.current = true` 횟수와 `finally` 해제 횟수가 일치한다(News 5/5, Popup 5/5, Honor 4/4, AiSolution 4/4).
- 미인증 이동: `handleUnauthorized`(89-96)가 `saveSnapshot` → `flushSync(setBaseline)` → `router.push` 순서라 스냅숏 저장 없이 이동하는 경로가 없고, `useUnsavedChanges`의 `routeChangeStart` 핸들러가 보는 `dirtyRef`는 Task 7이 `useLayoutEffect`로 바꾼 뒤에도 `flushSync` 커밋 시점에 동기 반영되므로 경고창이 뜨지 않는다.
- 복원이 입력을 덮지 않음: `useSessionSnapshot`의 키(`snapshotKey("notice", initial.id)`)와 `restore`(`useCallback([])`)가 모두 안정적이라 effect가 마운트 시 1회만 돌고, `takeSnapshot`이 읽자마자 `removeItem`한다. `restore`는 `setForm`만 하고 `baseline`은 건드리지 않아 복원 후 `dirty=true`가 유지된다(계획 의도대로).
- 생성 경로 저장(136-149)은 `flushSync(setBaseline)` 후 `router.push`, 성공 시 `return` — Task 4가 추가한 회귀 테스트(`tests/components/admin-form-dirty.test.tsx`)가 이 경로를 4개 폼으로 확장해 덮는다.

**(c) Task 3 + Task 7 + Task 9 — 잔여물 없음**

`grep -rn "PretendardVariable.woff2\|unoptimized" src public next.config.js` 0건. `src/pages/_document.tsx`에 폰트 preload 링크 없음. `src/styles/globals.css`는 `@import "./pretendard.css"`만 남고 옛 `@font-face` 제거됨. `public/fonts/PretendardVariable.woff2` 삭제 확인, `public/fonts/pretendard/` 92개 woff2 = `src/styles/pretendard.css`의 `unicode-range` 92개로 1:1 대응. `next.config.js`에 `images.unoptimized` 잔재 없음.

`next/image` `fill` 전환 지점은 모두 위치 지정 조상이 있다: `PageHero.jsx:114`(`absolute inset-0`), `PageHero.jsx:136`(이번에 `relative` 추가), `DomainGrid.jsx`(새 `.ind-domain__shot-frame`이 `position: relative` + `aspect-ratio`). `PageHeroMedia`는 `PageHero` 두 곳에서만 쓰이고 `media.src`/`media.poster`는 전부 `/images/**` 정적 자산이라 `remotePatterns` 밖 호스트를 타지 않는다.

**(d) Task 6 reorder 삭제 — 완결**

`grep -rn reorder src tests` 0건. 라우트, `src/server/modules/popup-notices/repository.ts`의 함수, `schema.ts`의 스키마, `services.ts` 호출부 모두 제거됐고 typecheck/build가 통과하므로 dangling export 없음. 빌드가 `.next/types`를 재생성해 진행 중 보고됐던 stale validator 문제도 해소됐다.

**(e) Task 10 DB 테스트 + Task 1 repository 23505 — 공존 정상**

`src/server/modules/news/repository.ts:18-24`가 `error`와 `error.cause` 양쪽에서 `23505`를 찾는다(drizzle의 `DrizzleQueryError` 래핑 대응). Task 1이 같은 파일에서 입력 타입을 zod 파생으로 바꿨지만 두 변경이 서로 다른 지점이고, `tests/db/news-slug.db.test.ts`가 실제 Postgres에서 이 매핑을 통과시킨다.

DB 테스트 인프라는 안전하다: `tests/db/setup.ts:8-12`가 `DATABASE_TEST_URL`이 없으면 `DATABASE_URL`을 아예 지워 개발 DB(5433) 오폭을 막고, `vitest.db.config.ts`의 `fileParallelism: false`가 TRUNCATE 경합을 막는다. `.env`의 `DATABASE_TEST_URL`은 5434를 가리킨다.

## Plan drift

계획이 요구했는데 빠진 것은 없다. 계획 밖으로 나간 것(대장에 기록된 판정 포함):

| 과제 | 계획 밖 변경 | 판단 |
|---|---|---|
| Task 1 | `src/pages/api/admin/popup-notices/[id]/reorder.ts`에도 스키마 적용 | Task 6에서 파일째 삭제 — 낭비지만 대장에 사전 기록된 순서 문제 |
| Task 1 | `tests/unit/notices/public-number.test.ts` 수정 | 타입 파생 변경에 따른 테스트 적응 |
| Task 5 | `src/lib/admin-api.ts` `adminApiErrorMessage` 수정 | 대장 판정: BAD_REQUEST 서버 메시지 폐기 버그의 근본 원인 수정으로 인정 |
| Task 6 | `src/pages/api/admin/previews/[contentType].ts`, `src/server/modules/preview/schema.ts` 추가 | 대장 판정: Task 1 브리프 누락 보완 |
| Task 7 | `postcss.config.mjs`, `scripts/migration/extract-current-content.ts`, `src/server/infrastructure/document-scanner.ts`, `src/server/modules/notices/category-repository.ts` | 전부 경고가 발생한 파일 — "경고가 난 파일들" 범위 안 |
| Task 9 | 서브셋 파일 92개(계획 추정 "약 120개"), `tests/unit/font-assets.test.ts` 임계값 80 | 공식 v1.3.9 배포본이 92개. 임계값만 계획(100)보다 낮음 → Minor |
| Task 10 | `vitest.config.ts`, `tests/unit/tooling-config.test.ts`, `src/server/modules/news/repository.ts` | `npm test`에서 `*.db.test.ts` 제외 + 23505 실버그 수정(대장 기록) |
| Task 5 | 테스트를 `tests/unit/notices/category-duplicate.test.ts` 대신 `tests/db/notice-category-duplicate.db.test.ts`로 | 계획이 "Task 10의 DB 테스트가 있으면 거기에"를 허용 |

Task 8은 원본 체크아웃의 미추적 `docs/`만 고쳤으므로 이 범위에서 검증 대상이 아니다.

## Leftovers

- 미추적/스트레이 파일 없음(`git status --short`는 빌드 후 `next-env.d.ts` 한 건만).
- `.claude/launch.json` 등 도구 설정 변경 없음.
- 이 범위에서 추가된 TODO/FIXME/HACK 0건, `console.log`/`console.debug` 0건. `console.warn`은 `tests/db/global-setup.ts:8` 한 건으로 계획이 명시한 skip 안내다.
- `.only` / `describe.skip` 없음. `describe.skipIf(!hasTestDatabase)` 6건은 계획이 요구한 skip 규칙.
- `eslint-disable` 7건 전부 한국어 사유 주석이 붙어 있다.
- 커밋 메시지 10건 모두 `<type>: <명사형>` 한 줄 + 빈 줄 + `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. 괄호 범위, 마침표, 본문 없음. 형식 위반 0.
- 가운뎃점: 이 범위가 **새로 도입한** `·`는 `tests/db/fixtures/notices.json` 한 파일뿐이다(`차량·운전자·운행`, `입찰·계약방식` 등). 배포 사이트 공지 원문을 그대로 옮긴 픽스처라 사용자 노출 문구가 아니다. `src/pages/admin/notices.jsx`의 `·`는 81c907d 시점에 이미 있던 것이고(그 줄 전체가 한 줄이라 diff에 +로 잡힐 뿐), `NoticeForm.tsx:434`의 `미리보기 ·`도 기존 문자열이다. Task 7이 `src/pages/contact.jsx:120`의 `수집·이용`을 `수집과 이용`으로 정리했다.

## Issues

### Critical

없음.

### Important

없음.

### Minor

1. `tests/unit/font-assets.test.ts:14,20` — 임계값이 80이라 실제(92)에서 11개가 사라져도 테스트가 통과한다. 계획은 100을 요구했다. 정확한 개수(92)로 고정하는 편이 회귀를 실제로 잡는다.
2. `src/server/modules/notices/category-repository.ts:33` — 이름 비교가 대소문자를 구분하고 DB에 unique 제약이 없어 동시 생성 경합에서 중복이 통과할 수 있다(대장에 기록된 기존 Minor). 추가로 `CategoryRow.save`(편집 경로)에는 빈 이름 가드가 없어 두 카테고리를 같은 로케일에서 `""`로 만들면 이후 저장이 서로를 막는다.
3. `next.config.js:54` — `images.domains: []`는 Next 16에서 폐기된 키다(동작에는 영향 없음). `next.config.js:2,58`에서 `new URL(process.env.ASSET_PUBLIC_BASE_URL)`을 두 번 만든다(T3 리뷰에서 이미 지적된 스타일 건).
4. `tests/db/fixtures/notices.json` — 배포 사이트 공지 본문을 그대로 담고 있어 원문이 바뀌면 픽스처가 낡는다. 출처 URL이 들어 있으니 갱신 경로는 있다. 개인정보로 볼 문장은 없다.
5. `src/components/public/PageHeroMedia.jsx` — `priority`가 모든 사용처에 무조건 붙는다(대장 기록). 현재 사용처 2곳이 전부 상단 히어로라 지금은 맞지만, 하단에서 쓰이는 순간 LCP 우선순위가 잘못 잡힌다.
6. `npm run build` 후 `next-env.d.ts`가 수정 상태로 남는다(빌드 산출물). 커밋하지 않았다.

## Assessment

**Branch:** Mergeable

**Reasoning:** 5종 검증이 전부 통과했고(typecheck 0, lint 0 오류, 단위 246/246, DB 27/27, build 성공), 간헐 실패가 보고됐던 `public-shell-navigation.test.tsx`는 3회 연속 통과해 단독 실행에서는 재현되지 않는다. 과제 사이 봉합 다섯 지점(zod 일원화, 세션 스냅숏과 `inFlight`와 `useLayoutEffect`, 이미지·폰트 잔여물, reorder 삭제, 23505 매핑)이 모두 의도대로 맞물리고 계획 밖 변경은 전부 대장에 판정이 남아 있다. 남은 Minor 6건은 전부 후속으로 미룰 수 있는 수준이며 병합을 막을 근거가 없다.
