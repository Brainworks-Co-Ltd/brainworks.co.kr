# 최종 브랜치 리뷰 — fix/completeness-audit (9bff514..2bba941)

리뷰 범위: 40 커밋, 130 파일. 계획 `docs/superpowers/plans/2026-09-11-completeness-audit-fixes.md` 29개 과제 전부,
구속력 있는 명세 `docs/superpowers/specs/2026-09-07-admin-operations-completion-design.md`(워크트리에서는 `/docs/**`가
gitignore라 원본 체크아웃에서 읽음), 원장 `progress.md` 전체.
diff는 `package-lock.json`, `meta/0004_snapshot.json`, 바이너리 이미지 델타를 제외하고 전부 읽었다. 한 패스로 끝냈다.

---

## Strengths

- **근본 원인 수정이 일관된다.** 대체 설명 유실은 폼의 `|| undefined` → `|| null` 한 줄로 5개 폼에서 동일하게 고쳤고,
  서버는 `...input.locales[locale]` 스프레드라 `null`이 실제로 컬럼에 써진다(`src/server/modules/honors/repository.ts:190`).
  증상이 아니라 스프레드가 `undefined` 키를 버린다는 원인을 짚었다.
- **시간대 왕복이 실제로 항등이다.** `src/lib/datetime-local.ts`의 오프셋 역보정과 폼의 `toIso`(`new Date(local).toISOString()`)가
  정확히 역함수이고, `tests/unit/datetime-local.test.ts`가 왕복 항등을 단언한다. 두 페이지에 복사돼 있던 로컬 헬퍼를
  공용 모듈 하나로 합친 것도 맞다.
- **업로드 무한 대기 수정이 정확하다.** `assertImageUploadMetadata`가 busboy `finish` 콜백 안에서 던지면 Promise가
  영영 settle되지 않던 것을 try/catch로 감싸 `reject`로 돌렸다(`src/server/modules/assets/upload-service.ts:33-45`).
  회귀 테스트가 `Promise.race`로 2초 타임아웃을 걸어 "무한 대기"를 실제로 검증한다.
- **HTTP 메서드 가드 커버리지가 빈틈없다.** `withApiErrorBoundary(handler, methods)`를 적용한 11개 라우트 외에,
  나머지 31개 라우트도 전부 인라인 `request.method` 검사를 갖고 있음을 확인했다(`src/pages/api/**`에서 가드 없는 파일 0건).
  계획이 누락했던 `popup-notices/[id]/unpublish.ts`를 원장 ruling으로 잡아낸 것도 좋다.
- **ESLint 경계가 죽은 설정이 아니다.** `src/components/__probe.tsx`로 stdin 린트를 돌려 `no-restricted-imports`가
  실제로 error를 낸다는 것을 확인했다. Task 20이 예고한 `react-hooks/refs` 경고 5건은 Task 26의 `useState` 기준선
  전환으로 전부 사라졌다(현재 0건). Task 27의 `eslint-disable-next-line react-hooks/rules-of-hooks`도
  unused-directive 경고가 없다 = 규칙이 실제로 켜져 있다.
- **마이그레이션 0004가 안전하다.** 전 구문이 `INSERT ... SELECT ... WHERE NOT EXISTS`라 멱등이고,
  `UPDATE`/`DELETE`/`DROP`/`ALTER`가 하나도 없다. NOT NULL 컬럼(`created_by_actor_id`, `updated_by_actor_id`,
  `name`/`subtitle`/`description`)이 전부 채워져 있고 나머지는 스키마 default가 있다. `audit_actors`의
  `audit_actors_owner_ck` 체크 제약(SYSTEM이면 admin_account_id IS NULL AND system_key IS NOT NULL)도 만족한다.
  drizzle 표준 마이그레이터(`scripts/migrate.cjs`)가 `--> statement-breakpoint`를 트랜잭션 안에서 순서대로 돌린다.
- **삭제가 정말 깨끗하다.** 삭제된 컴포넌트/데이터/스타일(`HomeHero`, `Honors`, `Awards`, `BidNoticePopup`,
  `bidNotices.js`, `models/News.js`, `ui-variants.css`, 미리보기 페이지 3종) 참조 0건, 제거된 의존성 4개
  (`motion`, `@mdxeditor/editor`, `react-hook-form`, `@hookform/resolvers`) 임포트 0건,
  재인코딩된 이미지의 구 경로 참조 0건(`public/` 아래 실제 파일 존재 여부까지 전수 대조).
- **테스트가 목이 아니라 동작을 본다.** 특히 `tests/components/admin-form-dirty.test.tsx`의 연타 테스트는
  세 클릭을 한 `act()`에 묶어 리렌더 전 연타를 재현한다 — `busy` state만으로는 못 막고 `inFlight` ref가 있어야
  통과하는, 진짜 회귀 테스트다.
- **Task 24의 계획 뒤집기가 옳았다.** 계획이 `mdast-util-to-hast` 보안 패치 단언 삭제를 지시했지만
  버전이 변하지 않았으므로 가드를 복구한 ruling은 "근거 없이 보안 가드를 약화하지 않는다"는 원칙에 맞다.
- **명세 준수.** 영구 삭제 경로 없음(§2.1), 무검사 업로드 경로 없음(§2.3, §6), 모든 관리자 API가
  `requireAdmin`/`assertSameOrigin`/`withApiErrorBoundary` 경계 유지(§3), 새 의존성 0개. 경계 완화는 한 건도 없다.

---

## Issues

### Critical (Must Fix)

없음. 데이터 손실, 보안 경계 약화, 빌드/타입/테스트 실패에 해당하는 결함을 찾지 못했다.

### Important (Should Fix)

**I-1. CI의 마지막 스텝 `npm audit`이 exit 1이라 이 브랜치의 PR은 초록이 될 수 없다 (선행 문제, 이 브랜치 원인 아님)**

- 위치: `.github/workflows/ci.yml:35` (`npm audit --omit=dev --audit-level=high`), `package.json:15,17,26`
- 무엇이 문제인가: 지금 실행하면 exit 1이다. 7건 중 critical 1 / high 2가 프로덕션 의존성에 있다.
  - `next` 16.3.2 — **critical**, GHSA-p293-qw3h-jr36 (Windows 호스팅 서버 무인증 RCE), GHSA-2xp9-vwfh-vxw4 (이미지 최적화 API AVIF RCE)
  - `nodemailer` 9.0.5 — high 4건 (수신 도메인 allow-list 우회 2건 포함)
  - `sharp` 0.35.3 — high, libheif
- 왜 중요한가: `ci.yml`은 `pull_request`마다 돌고 audit이 마지막 스텝이다. 앞의 7스텝을 다 통과해도 잡은 실패한다.
  base `9bff514`의 `package.json`도 같은 버전이라 **이 브랜치가 만든 회귀는 아니지만**, 이 브랜치를 머지하려면
  지금 막힌다. 배포 대상이 리눅스이고 `images.unoptimized: true`라 두 Next RCE의 실제 노출면은 좁지만
  critical 등급을 그대로 두고 갈 이유는 없다.
- 어떻게 고치나: 이 브랜치와 별개의 커밋 하나로 `next` 16.3.4, `nodemailer` 9.1.1, `sharp` 0.35.4로 올리고
  `npm run build` + `npm test`로 확인한다. 전부 패치 릴리스라 위험이 낮다. 지금 올리지 않기로 한다면
  머지 전에 사용자에게 "CI는 audit 스텝에서 빨갛게 뜬다"를 명시적으로 알려야 한다.

**I-2. 예약 게시 시각 보정이 "서버 TZ == 관리자 브라우저 TZ"를 암묵 전제로 한다**

- 위치: `src/lib/datetime-local.ts:5`, 호출부 `src/pages/admin/notices/[noticeId].tsx:48-49`,
  `src/pages/admin/popup-notices/[popupNoticeId].tsx:57-58` (둘 다 `getServerSideProps` 안)
- 무엇이 문제인가: `toDateTimeLocal`은 `date.getTimezoneOffset()`으로 벽시계를 만드는데 **서버 프로세스**에서 돈다.
  반대 방향 변환인 `toIso`(`NoticeForm.tsx:54`, `PopupNoticeForm.tsx:63`)는 **브라우저**에서 돈다.
  두 TZ가 같을 때만 항등이다. 서버가 UTC면 `getTimezoneOffset()`이 0이라 수정 전 코드
  (`date.toISOString().slice(0,16)`)와 결과가 완전히 동일해지고, 원래의 9시간 밀림이 그대로 재현된다.
- 왜 중요한가: 저장소 어디에도 TZ가 고정돼 있지 않다(`scripts/deploy.sh`, `.github/workflows/deploy.yml`,
  `ops/pm2`, `compose.dev.yml` 전수 확인 — `TZ` 설정 0건). pm2로 한국 호스트에 올리면 우연히 맞겠지만,
  컨테이너화하거나 호스트를 옮기면 **조용히** 데이터가 틀어진다. 단위 테스트는 같은 프로세스에서 양방향을
  돌리므로 이 경우를 절대 잡지 못한다.
- 어떻게 고치나: 둘 중 하나.
  (a) 가장 싸게 — 배포 env(`ops/pm2`, `scripts/deploy.sh`)에 `TZ=Asia/Seoul`을 못박고
      `ops/release-runbook.md`에 한 줄 적는다.
  (b) 더 옳게 — `getServerSideProps`는 ISO 문자열을 그대로 넘기고 폼이 마운트 후 `toDateTimeLocal`로
      브라우저 TZ에서 변환한다(입력 필드 초기값만 바뀌므로 폼당 몇 줄).
  (a)로 가더라도 `src/lib/datetime-local.ts`에 "서버에서 호출하므로 서버 TZ에 의존한다"는 주석은 남겨야 한다.

**I-3. 생성 직후 이동이 Next 내부 await 순서에 의존한다 (원장 parked 항목 — 하드닝이 한 줄이다)**

- 위치: `src/components/admin/NewsForm.tsx:129-133`, 그리고 `NoticeForm.tsx:120-124`,
  `PopupNoticeForm.tsx:139-143`, `HonorForm.tsx:114-118`, `AiSolutionForm.tsx:126-130` 동일 패턴
- 무엇이 문제인가: `setBaseline(JSON.stringify(form))` 직후 `await router.push(...)`를 부른다. `setBaseline`은
  React가 다음 마이크로태스크에 flush하므로 `router.push` 진입 시점에는 아직 `dirty === true`이고
  `useUnsavedChanges`의 `routeChangeStart` 리스너가 구독된 상태다. 지금 동작하는 이유는 Next 16 pages router가
  `routeChangeStart`를 emit하기 전에 내부 `await`(_bfl)를 하나 갖고 있어 React가 먼저 flush되기 때문이다
  (리뷰어가 `router.js`에서 확인해 코드 주석으로 남겨 둠).
- 왜 중요한가: Next 마이너 업그레이드가 그 await를 없애면 **조용히** 회귀한다. 증상은 데이터 손실이 아니라
  "저장했는데 미저장 경고가 뜨고, 취소를 누르면 생성 화면에 남는다"인데, 운영자가 저장 실패로 오해해
  중복 생성할 여지가 있다. 게다가 회귀 테스트는 `NoticeForm` 하나뿐이고 그마저 `next/router`를 목으로 대체해
  실제 `routeChangeStart`를 태우지 않는다 — 이 경로를 잡아줄 안전망이 없다.
- 어떻게 고치나: 이미 있는 스킵 플래그를 재사용하면 Next 내부 의존이 통째로 사라진다.
  `useUnsavedChanges`가 `confirmNavigation` 외에 `armSkip()`(= `skipArmedAt.current = Date.now()`)을
  함께 반환하게 하고, 5개 폼의 생성 경로에서 `router.push` 직전에 부른다. TTL 1초가 이미 있으므로
  새 만료 로직도 필요 없다. 폼당 1줄 + 훅 2줄.

### Minor (Nice to Have)

**M-1. `useRouter()` try/catch는 사실상 죽은 코드다** — `src/hooks/useUnsavedChanges.ts:10-19`.
`next/router`의 `useRouter`는 `useContext(RouterContext)`라 프로바이더가 없으면 던지지 않고 `null`을 반환한다.
바로 아래 `if (!dirty || !router?.events) return;` 가드가 이미 그 경우를 처리한다. try/catch와
`eslint-disable-next-line react-hooks/rules-of-hooks`를 같이 지우면 훅 규칙 예외가 코드베이스에서 사라진다.
(지금 형태가 틀린 것은 아니다 — 호출 위치가 고정이라 훅 순서는 안전하다.)

**M-2. `routeChangeError`를 인자 없이 emit한다** — `src/hooks/useUnsavedChanges.ts:47`.
Next 자신은 `(err, url, options)`로 emit한다. 지금은 같은 훅의 `resetSkip`만 듣고 있어 무해하지만,
나중에 전역 로딩 인디케이터 같은 리스너가 붙으면 `err.cancelled` 접근에서 터진다.

**M-3. `resetSkip` 리스너 2개가 잉여다** — `src/hooks/useUnsavedChanges.ts:50-52`.
`handleRouteChangeStart`가 맨 앞에서 무조건 `skipArmedAt.current = null`을 하고 TTL 1초가 상한을 잡는다.
원장도 "사실상 무해한 잉여"로 기록했다. 지워도 동작이 같다 — 훅이 6줄 짧아진다.

**M-4. 0004 마이그레이션의 멱등 가드가 `public_key`만 본다** — `src/server/db/migrations/0004_seed_business_areas.sql:11-28`.
`business_areas`에는 `business_areas_order_uk`(display_order 유니크)도 걸려 있다. 운영 DB에 다른
`public_key`로 display_order 1~4를 쓰는 행이 이미 있으면 `WHERE NOT EXISTS`를 통과한 뒤 유니크 위반으로
마이그레이션이 터지고 `scripts/deploy.sh`의 배포가 중단된다. 현실적으로 이 테이블은 비어 있을 가능성이
매우 높고(명세 §2.5가 사업 영역 생성 기능 자체를 금지) 트랜잭션이라 부분 적용은 없지만,
`AND NOT EXISTS (SELECT 1 FROM "business_areas" WHERE "display_order" = N)` 한 줄이면 완전히 닫힌다.

**M-5. 메서드 가드가 두 가지 형태로 공존한다** — `withApiErrorBoundary(handler, [...])` 11개 vs
인라인 `if (request.method !== "POST") { ... .end(); }` 31개. 커버리지는 완전하지만 인라인 쪽은 본문 없이
`.end()`만 보내므로 `adminApiErrorMessage`가 `METHOD_NOT_ALLOWED` 한국어 문구로 매핑하지 못한다.
계획이 딱 그 범위만 지정했으니 이번 브랜치로는 맞고, 후속에서 나머지도 래퍼 인자로 옮기면 형태가 하나가 된다.

**M-6. 소스 텍스트를 단언하는 테스트 2건** — `tests/components/seo-metadata.test.tsx:30-35`(JSX를 정규식으로 읽어
`key=` 존재 확인), `tests/unit/catalog/business-area-seed.test.ts`(SQL 파일을 문자열로 읽어 `toContain`).
동작이 아니라 텍스트를 보므로 주석 안의 `key=`에도 통과한다. 가드로서는 값이 있고 같은 파일의 첫 케이스가
실제 렌더를 검증하므로 유지해도 되지만, 문자열 비교라는 점은 알고 있어야 한다.
seed 테스트는 `display_order` 순서를 검증하지 않아 고정 분류의 순서가 바뀌면 못 잡는다.

**M-7. `tests/unit/honors/queries.test.ts:36`의 `afterEach`가 복원이 아니라 고정값 설정이다.**
`ASSET_PUBLIC_BASE_URL`을 원래 값으로 되돌리지 않고 `"https://cdn.example.com"`을 넣는다.
바로 아래 `restoreDatabaseUrl()`이 올바른 패턴을 보여주고 있으니 같은 모양으로 맞추면 된다.
vitest 기본 `isolate: true`라 지금은 파일 밖으로 새지 않는다.

**M-8. 한국어 가운뎃점 2군데.** `src/styles/industrial.css:1496` 주석의 "푸터·CTA"는 계획의 Global Constraint
("한국어 문구에 가운뎃점을 쓰지 않는다") 위반이다. `0004_seed_business_areas.sql:53,72`의
"음성·텍스트", "의료·치과"는 `src/data/businessAreas.js:80,120`에서 그대로 옮긴 기존 사이트 카피라
이 브랜치가 새로 만든 것은 아니지만, 마이그레이션에 박히면 나중에 고치기 번거롭다.
(반대로 이 브랜치는 `src/pages/news/[slug].jsx:44`에서 구분자 `·`를 `,`로 바꿔 한 건 제거했다.)

**M-9. `src/pages/index.jsx:16` `areas` prop이 여전히 미사용이다** (lint warning).
선행 문제이고 원장이 "홈 DomainGrid의 DB 연결"을 사용자 결정으로 보류했지만, Task 29가 `business_areas`를
채운 지금은 홈 요청마다 쓰이지 않는 DB 조회가 한 번씩 나간다. 결정이 날 때까지는 그대로 두더라도
사용자에게 같이 올려야 할 항목이다.

**M-10. `src/pages/auth/signin.tsx`에 `noindex` 메타가 없다.** `robots.txt`의 `Disallow: /auth/`만으로는
외부 링크가 걸린 경우 색인을 막지 못한다. 이 페이지는 `/admin/auth/sign-in`으로 리다이렉트하는 얇은 stub이라
실질 위험은 낮다. `<Head><meta name="robots" content="noindex,nofollow" /></Head>` 한 줄.

**M-11. `readMultipartImage`가 테스트 때문에 export됐다** — `src/server/modules/assets/upload-service.ts:13`.
모듈 공개면이 넓어졌다. 회귀 테스트의 가치가 그보다 크므로 유지가 맞지만, 다른 곳에서 import하지 않도록
주석 한 줄(`// 테스트 전용 export`)을 붙이면 의도가 남는다.

---

## 계획 결함 vs 구현 결함

구현이 아니라 **계획**이 틀렸고 원장 ruling으로 올바르게 뒤집힌 건들 — 판단 전부 타당하다고 본다.

| 건 | 계획이 말한 것 | 실제로 한 것 | 평가 |
|---|---|---|---|
| Task 8 라우트 목록 | `popup-notices/[id]/unpublish.ts` 누락 | 범위에 포함 | 타당. 같은 유형 1줄 |
| Task 11 SEO | 홈(`index.jsx`)이 전역 `SeoMetadata`에만 의존한다는 사실 누락 | `index.jsx`에 `SeoMetadata` 추가 | 타당. 안 했으면 홈에 title/canonical이 통째로 사라졌다 |
| Task 15 날짜 포맷 | 브리프 예시 "2025년 6월 16일" | 목록 페이지와 같은 기존 포맷터 재사용 | 타당. 사이트 내 일관성이 예시보다 우선 |
| Task 24 lock 단언 | `mdast-util-to-hast` 단언 **삭제** 지시 | 단언 복구 | 타당. 근거 없는 보안 가드 약화 거부 |
| Task 25 e2e | "/en/* 라우트가 없다"는 잘못된 전제 | en 200 검증 추가 | 타당. `next.config.js` i18n이 en을 실제로 서빙한다 |
| Task 27 훅 | 생성 경로 기준선 갱신 누락 | 5개 폼 생성 경로 함께 수정 | 타당. 훅 수정이 드러낸 인접 버그 |
| Task 29 산출물 | `meta/0004_snapshot.json` 범위 밖 | 포함 | 타당. drizzle-kit 필수 산출물 |
| Task 15 빌드 게이트 | typecheck+vitest만 완료 조건 | 이후 과제에 `npm run build` 추가 | 타당. fs 의존 모듈이 클라이언트 번들에 새는 건 이 게이트로만 잡힌다 |

Task 21이 `HomeHero` 테스트 94줄을 지우면서 `IndustrialHero`에 대응 테스트를 만들지 않은 것은
**계획 결함 겸 실제 커버리지 손실**이다(아래 triage 참조). 사용자 WIP 파일이라 이번 브랜치에서 손댈 수
없었던 것은 맞지만, 자동 전환 / 수동 이전, 다음 / 정지 / `aria-current` / 미디어 오류 대체 6가지 동작이
지금 무방비다.

---

## Cross-task Integration

과제별 리뷰가 볼 수 없었던 조합을 직접 확인했다.

| 조합 | 결과 |
|---|---|
| T26 `setBaseline` + T27 라우트 가드 + T23 테스트 | 공존한다. `useState` 기준선 → `dirty` 변경 시 훅이 재구독/해제한다. 편집 경로 정상, 생성 경로만 I-3 |
| T11 `SeoMetadata` key + T10 404/500 | 충돌 없음. `_app.jsx`의 전역 `SeoMetadata` 제거로 T10의 parked 항목이 실제로 해소됐다 — 빌드 산출물 `ko/404.html`에 `canonical`/`hreflang` 없고 `robots=noindex`만 있음을 확인 |
| T20 ESLint + T27 `eslint-disable` | 규칙이 켜져 있고 directive가 사용된다(unused-directive 경고 0). T20이 예고한 `react-hooks/refs` 5건은 T26이 전부 해소 |
| T8 `withApiErrorBoundary(handler, methods)` 전 라우트 | 42개 라우트 전수 확인 — 가드 없는 파일 0건 (래퍼 인자 11 + 인라인 31) |
| T15/T18 `src/lib/news.js` vs `format-date.js` | 분리가 유지된다. fs 의존 `news.js`는 `src/server/modules/news/static-source.js`만 import, `format-date.js`는 클라이언트 2곳. `npm run build` 성공이 증거 |
| T21 삭제 vs T22 이미지 참조 | 삭제 컴포넌트 참조 0건. `src/**`의 모든 `/images/...` 리터럴을 `public/` 실제 파일과 대조 — 누락 0건 |
| T24 의존성 제거 vs `motion` import | `motion`/`@mdxeditor`/`react-hook-form`/`@hookform` import 0건 |
| T7 미리보기 페이지 삭제 vs 미리보기 API | 삭제된 `/admin/preview/*` 참조 0건. `/api/admin/previews/news`는 `NewsForm.tsx:284`가 계속 쓴다(명세 §2.2 미리보기 요건 충족) |
| T28 `isOriginMismatch` vs 실제 서버 응답 | better-auth `@better-auth/core/dist/error/codes.mjs`에 `"Invalid origin"` 문자열 확인 — 4개 호출부가 전부 better-auth 엔드포인트라 매칭된다. 우리 `assertSameOrigin`은 `FORBIDDEN`(origin 문자열 없음)을 던지지만 브라우저가 항상 `sec-fetch-site: same-origin`을 보내므로 APP_ORIGIN 불일치로 우리 API가 깨지지 않는다 — 범위 설정이 맞다 |

---

## Deferred/Parked Triage

| 원장 항목 | 판정 | 이유 |
|---|---|---|
| T3 minor: README 44-46행 문장 중복, `src/hooks/`가 파일 구조 표에 없음 | SHIP | 문서 미세 결함. 동작 영향 0 |
| T4 minor: `HonorInput`/`LocalizedSolution`/`NewsCommandInput`의 `imageAlt`가 `string\|null` 미반영 | SHIP | `request.body`가 `any`라 런타임 무해하고 동작은 테스트로 검증됨. 관리자 API zod 검증 부재라는 더 큰 건과 묶어 후속 |
| T8 minor: `popup-notices/[id]/reorder.ts`가 UI 호출자 없는 죽은 API | SHIP | 이번에 `["POST"]` 가드까지 붙어 노출면이 오히려 줄었다. 삭제는 별건 |
| T9 minor: 23505→BAD_REQUEST 매핑 단위 테스트 없음 | SHIP | DB 테스트 기반 자체가 없다. 매핑 코드는 6줄이고 읽어서 확인 가능 |
| T9 minor: `NewsForm.tsx:420` 기존 가운뎃점 | SHIP | 소스 전역 20곳 이상의 선행 관행. 이 브랜치 범위 아님 (M-8) |
| T14 minor: 클라이언트 이메일 정규식이 서버 zod보다 느슨 | SHIP | 서버 400이 최종 방어선이고 클라이언트는 UX 보조. 검증 약화가 아니다 |
| T14 minor: 500 응답 케이스 테스트 없음 | SHIP | 4xx/5xx 분기 로직이 5줄 |
| T15 minor: 비활성 span에서 `pointer-events-none` 제외 | SHIP | 브리프 문구보다 구현이 더 정확하다. `<span>`은 애초에 클릭 대상이 아니다 |
| T18 minor: DB 상세 응답에 `slug` 없음 / 커버 없음 케이스 테스트 없음 | SHIP | 정적 소스와의 기존 차이. 상세 페이지가 `slug`를 쓰지 않는다 |
| T19 minor: `afterEach`가 `ASSET_PUBLIC_BASE_URL`을 복원 안 함 | SHIP | vitest 기본 격리로 파일 밖 누출 없음 (M-7) |
| T20 note: `react-hooks/refs` 경고 5건 | SHIP (해소됨) | 현재 0건. 예고대로 T26이 없앴다 |
| T20 note: `BidNoticePopup.jsx` 경고 | SHIP (해소됨) | T21에서 파일 삭제됨 |
| T21 note: `HomeHero` 테스트 6가지 동작이 `IndustrialHero`에 대응 없음 | SHIP, 단 후속 필수 | 사용자 WIP 파일이라 이번에 손댈 수 없었던 것은 맞다. 다만 홈 히어로의 자동 전환, 정지, `aria-current`, 미디어 대체가 지금 무방비다. 사용자가 WIP를 랜딩한 직후 최우선 후속 |
| T23 minor: 계약 키 비교가 POST 본문만, PUT 미검증 | SHIP | 두 본문이 같은 `payload()`에서 나온다 |
| T26 minor: `uploadImage`(3개 폼), `showPreview`(NewsForm)에 `inFlight` 가드 없음 | SHIP | 비파괴적 연산이라 중복 요청이 손실을 만들지 않는다 |
| T27 parked: 생성 경로 `setBaseline`→`push`가 Next 내부 await 순서에 의존 | **FIX BEFORE MERGE** | I-3. 지금 동작하는 것은 맞지만 Next 업그레이드 시 조용히 회귀하고 테스트가 못 잡는다. 이미 있는 스킵 플래그 재사용으로 폼당 1줄이면 의존이 사라진다 |
| T27 minor: 생성 경로 회귀 테스트가 `NoticeForm`만 / 후속 커밋 RED 증거 없음 | SHIP | I-3을 고치면 의존 자체가 사라져 테스트 부담도 줄어든다 |
| T27 minor: `resetSkip` 리스너가 잉여 | SHIP | M-3. 무해 |
| T28 parked: `forgot-password`의 출처 불일치 분기가 도달 불가일 가능성 | SHIP | better-auth가 `/request-password-reset`에 origin 검사를 안 걸어도 4줄짜리 무해한 방어 코드다. 다른 3개 호출부에서는 실제로 동작한다 |
| T10 parked: 404/500의 canonical/hreflang | SHIP (해소됨) | T11이 근본 수정. 빌드 산출물로 확인 완료 |
| Ruling: 워크트리 격리 / node_modules 정션 제거 / compose 실행 금지 / snapshot 범위 포함 | SHIP | 전부 절차 판단이고 결과가 깨끗하다(워킹 트리 clean) |
| Ruling: 사용자 결정 보류 8건(개인정보처리방침 링크, 푸터 본사 표기, 홈 DomainGrid DB 연결, `images.unoptimized`, `docs/**` 추적, `DATABASE_TEST_URL` 존폐, 문서 2종 갱신) | SHIP | 전부 사용자 판단 사항. 다만 이 목록을 최종 보고 말미에 같이 올려야 결정이 난다 (M-9 포함) |
| Ruling: QA #7, #9, #10, #11, #12 보류 | SHIP, 단 #9는 명세 결손으로 기록 | 명세 §4 "세션 만료 응답은 로그인 화면으로 이동하기 전에 현재 입력을 브라우저 세션 저장소에 임시 보존한다"는 승인된 요구인데 미구현이다. 이번 계획 범위 밖인 것은 맞으나 "명세 미충족"으로 남겨야 한다 |

---

## Verification Run

전부 워크트리에서 실행. 쓰기는 `git checkout -- next-env.d.ts` 하나뿐.

```
$ npm run typecheck
> tsc --noEmit
(출력 없음, exit 0)

$ npm run lint
✖ 22 problems (0 errors, 22 warnings)
  내역: @next/next/no-img-element 11, @typescript-eslint/no-unused-vars 5,
        react-hooks/set-state-in-effect 5, import/no-anonymous-default-export 1
  react-hooks/refs: 0건 (T20 note대로 T26이 해소)
  no-restricted-imports 위반: 0건

$ echo 'import { getDb } from "@/server/db/client"; export const x = getDb;' \
    | npx eslint --stdin --stdin-filename src/components/__probe.tsx
  1:1  error  '@/server/db/client' import is restricted from being used by a pattern.  no-restricted-imports
  ✖ 1 problem (1 error, 0 warnings)          # 규칙이 죽은 설정이 아님을 확인

$ npm test
 Test Files  53 passed (53)
      Tests  169 passed (169)
   Duration  25.43s
  실패 0. 출력은 선행 Vite configLoader 경고 1건 외에 깨끗하다.
  (계획 시작 시점 기준: 121개 중 1 실패 → 169개 전부 통과)

$ npm run build
  성공. 라우트 표 정상 출력.
  .next/server/pages/{ko,en}/404.html, {ko,en}/500.html 프리렌더 확인.
  ko/404.html: <title>요청하신 페이지를 찾을 수 없습니다</title>, robots=noindex,
               canonical/hreflang 없음  ← T10 parked 항목 해소 확인
  en/404.html: <title>Page not found</title>

$ git checkout -- next-env.d.ts && git status --porcelain
(출력 없음 — 워킹 트리 깨끗. .superpowers/는 gitignore)

$ npx prettier --check package.json next.config.js .github/workflows/ci.yml
  exit 1 — 단, 원인은 `core.autocrlf=true`로 인한 CRLF다(파일 전체가 1,75c1,75로 차이).
  리눅스 CI 체크아웃에서는 LF라 통과한다. 실제 포맷 결함 아님.

$ npm audit --omit=dev --audit-level=high
  exit 1 — 7 vulnerabilities (4 moderate, 2 high, 1 critical)
  next 16.3.2 critical / nodemailer 9.0.5 high / sharp 0.35.3 high  ← I-1
  base 9bff514의 package.json도 동일 버전 = 이 브랜치가 만든 회귀 아님

$ npm run test:e2e
  실행하지 않음 (지시대로).
```

---

## Recommendations

1. **머지 전 (2건, 합쳐 30분 이내)**
   - I-3: `useUnsavedChanges`가 `armSkip()`을 반환하게 하고 5개 폼의 `router.push` 직전에 호출. Next 내부 의존 제거.
   - I-1: `next` 16.3.4 / `nodemailer` 9.1.1 / `sharp` 0.35.4 패치 커밋으로 CI를 초록으로 만든다.
     지금 올리지 않기로 한다면 "이 PR의 CI는 audit 스텝에서 빨갛다"를 사용자에게 명시할 것.

2. **배포 전 (1건)**
   - I-2: `TZ=Asia/Seoul`을 배포 env에 못박고 `ops/release-runbook.md`에 적는다.
     안 하면 호스트를 옮기는 순간 예약 게시 시각이 조용히 틀어진다.

3. **머지 직후 후속 과제로 등록**
   - `IndustrialHero` 테스트 6종 (사용자 WIP 랜딩 직후, T21 note)
   - 관리자 API zod 검증 도입 (T4 minor의 근본 원인, 관리자 보고서 §4 #2)
   - 명세 §4 "세션 만료 시 입력 세션 저장소 보존" — 승인된 명세인데 미구현 (QA #9)
   - M-4(마이그레이션 order 가드), M-5(메서드 가드 형태 통일), M-1~M-3(훅 정리 8줄 삭제)

4. **사용자 결정이 필요해 계획에서 빠진 8건**을 원장에서 그대로 뽑아 최종 보고 말미에 목록으로 올릴 것.
   특히 M-9(홈 `areas` 미사용)는 Task 29로 DB가 채워진 지금 결정 시점이 왔다.

---

## Assessment

**Ready to merge?** With fixes

**Reasoning:** 29개 과제 전부 산출물이 존재하고 검증(typecheck 0, lint 0 error, vitest 169/169, build 성공,
워킹 트리 깨끗)을 통과했으며, 계획 밖으로 샌 변경도 경계를 약화한 곳도 없다. 원장의 deferred/parked 항목 중
실제 수정이 필요한 것은 T27 parked 하나뿐이고 그마저 이미 존재하는 스킵 플래그를 재사용하는 폼당 1줄짜리
하드닝이다. 오히려 막는 것은 브랜치 밖 두 가지 — CI 마지막 스텝의 `npm audit`이 선행 critical 취약점으로
exit 1이라 이 브랜치의 머지 경로가 막혀 있고, 시간대 보정이 서버 TZ에 암묵 의존해 UTC 호스트에서는
원래 버그를 그대로 재현한다. 이 세 건을 처리하면 바로 머지 가능하다.
