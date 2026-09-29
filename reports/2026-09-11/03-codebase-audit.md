# 코드베이스 감사 — brainworks.co.kr (redesign/industrial)

감사 범위: 아키텍처, 계층 경계, 코드 위생, 테스트 건강도, 설정과 DB 위생, 문서 드리프트.
관리자 기능 완성도와 공개 페이지 UX/SEO/a11y는 다른 감사자가 맡으므로 제외했다.

기준 커밋 `9bff514`, 미커밋 3파일(`AGENTS.md`, `src/components/industrial/IndustrialHero.jsx`, `src/styles/industrial.css`) 포함 상태.

---

## 1. 코드베이스 건강도 점수

# **58 / 100**

1. 뼈대는 건강하다. `tsc --noEmit` 0 에러에 `strict: true`, `src` 전체에 `as any`/`: any` 0건, Drizzle 스키마와 마이그레이션 스냅샷이 테이블 27개, enum 10개까지 정확히 일치하며(`npx drizzle-kit check` → `Everything's fine`), 서버 모듈이 `modules`/`ports`/`infrastructure`로 실제로 갈라져 있다.
2. 그런데 품질 게이트가 전부 장식이다. ESLint는 규칙이 **0개**라 `npm run lint` 통과가 아무 의미가 없고, `tests/e2e` 디렉터리가 아예 없어 `npm run test:e2e`는 실행 불가, `tests/db/**` 4개 파일은 DB를 한 번도 건드리지 않으며, `.github/workflows/pages.yml`은 `output: "standalone"` 설정과 모순되는 `out/index.html`을 요구해 main 푸시마다 실패한다.
3. 정리되지 않은 무게가 실물로 남아 있다. 임포터 0인 파일 약 1,200줄(322줄짜리 `HomeHero.jsx`와 그것만 검사하는 테스트 파일 포함), 내용이 빈 채 트래킹되는 API 라우트 `src/pages/api/news/[id].js`, 미사용 의존성 4개, prettier 위반 약 60개 파일. 프로덕션 품질이라 부르기 전에 게이트부터 되살려야 한다.

---

## 2. 실패 테스트 3건 — 원인과 최소 수정

### 2-1. `tests/components/design-interactions.test.tsx` 2건 — **미커밋 편집이 원인. HEAD에서는 통과했다**

근거:

```
$ git log --oneline -3 -- src/components/industrial/IndustrialHero.jsx
4795795 revert: 히어로 골드 강조와 타이핑 복원 및 재생 버튼 제거
$ git log --oneline -3 -- tests/components/design-interactions.test.tsx
4795795 revert: 히어로 골드 강조와 타이핑 복원 및 재생 버튼 제거
```

컴포넌트와 테스트가 **같은 커밋 `4795795`에서 마지막으로 함께 바뀌었다.** 즉 HEAD 시점에는 짝이 맞았다.

미커밋 diff가 `SLOTS`의 표시 이름을 바꿨다 (`git diff src/components/industrial/IndustrialHero.jsx`):

| id | HEAD | 작업 트리 |
|---|---|---|
| `manufacturing` | `제조 현장` | `제조 AI` |
| `healthcare` | `진료 현장` | `헬스케어 AI` |
| `smartcity` | `도시 관제` | `스마트시티 AI` |
| `agent` | `고객 응대` | `에이전트 AI` |

실제 실패 출력도 정확히 이 치환이다.

```
FAIL tests/components/design-interactions.test.tsx:54
  Expected element to have text content: 제조 현장
  Received: 제조 AI
FAIL tests/components/design-interactions.test.tsx:82  (동일)
```

**수정 위치: 테스트.** 이름 변경은 의도된 카피 작업이고(`IndustrialHero.jsx` 주석에 사업 영역 카드와 이름을 맞추려는 근거가 길게 적혀 있다) 동작은 그대로다. 테스트는 화면 문구를 하드코딩한 대가를 치르고 있다.

최소 수정 — `tests/components/design-interactions.test.tsx` 한 파일, 문자열 4곳:

- 54행 `"제조 현장"` → `"제조 AI"`
- 57행 `"제조 현"` → `"제조 A"` (첫 글자 하나 지운 중간 상태)
- 58행 `"제조 현장"` → `"제조 AI"`
- 60행 `"진료 현장"` → `"헬스케어 AI"`
- 64, 65, 67행 `/도시 관제/` → `/스마트시티 AI/`
- 82행 `"제조 현장"` → `"제조 AI"`

다만 57행은 주의가 필요하다. 지우기 애니메이션이 한 글자씩 지운다는 전제로 `2400+40ms` 뒤 `제조 현`을 기대하는데, 새 문자열은 `제조 AI`라 한 글자 지우면 `제조 A`가 된다. 타이핑 간격을 코드에서 확인한 뒤 맞춰야 한다.

> 더 나은 수정(선택): 테스트가 `SLOTS`를 컴포넌트에서 import하거나, `IndustrialHero.jsx`가 `SLOTS`를 named export해서 테스트가 `SLOTS[0].site.ko`를 참조하게 하면 카피를 고칠 때마다 테스트가 깨지지 않는다. 지금 방식은 카피 변경마다 반드시 테스트를 동반 수정해야 하는 구조다.

### 2-2. `tests/unit/catalog/published-business-areas.test.ts` 1건 — **HEAD에서 이미 실패 중. 코드가 테스트 계약을 깼다**

근거:

```
$ git log --oneline -- src/server/modules/catalog/queries.ts
23b6ffb feat: 관리자 콘텐츠 운영 흐름 완성      <- 나중
4ed001b fix: 사업 영역 공개 분류 고정            <- 테스트가 태어난 커밋
aecf8f0 feat: 사업 영역 및 솔루션 DB 공개 연결
$ git log --oneline -- tests/unit/catalog/published-business-areas.test.ts
4ed001b fix: 사업 영역 공개 분류 고정
```

테스트는 `4ed001b`에서 "DB 연결 여부와 관계없이 고정 분류를 쓰고 `getDb`를 호출하지 않는다"를 고정했는데, 이후 `23b6ffb`이 `queries.ts`에 솔루션 조회를 다시 넣으면서 계약이 깨졌고 테스트는 갱신되지 않았다.

```
$ npx vitest run tests/unit/catalog/published-business-areas.test.ts
AssertionError: promise rejected "TypeError: Cannot read properties of unde…" instead of resolving
Caused by: TypeError: Cannot read properties of undefined (reading 'select')
 ❯ Module.getPublishedBusinessAreas src/server/modules/catalog/queries.ts:20:29
```

실제 원인은 `vi.mock`의 `getDbMock`이 구현 없는 `vi.fn()`이라 `undefined`를 반환하고, `queries.ts:20`의 `getDb().select(...)`가 터지는 것이다. 증상은 mock 문제지만 **근본 원인은 코드의 계약 변경**이다. `queries.ts:12-15` 주석이 현재 의도를 명확히 적어 놓았다.

> 사업 영역 자체는 고정 공개 분류이며, 각 영역의 솔루션만 관리자 게시 상태를 반영한다.

즉 "영역은 고정, 솔루션은 DB"가 맞는 현재 설계다. 테스트 제목만 맞고 단언이 낡았다.

**수정 위치: 테스트.**

최소 수정 — `tests/unit/catalog/published-business-areas.test.ts` 한 파일. 테스트를 두 개로 쪼갠다.

1. `DATABASE_URL` 없을 때: `getDbMock`이 호출되지 않고 `getLocalizedBusinessAreas("ko")`와 동일 — 기존 단언에서 21행의 `process.env.DATABASE_URL = ...` 줄만 제거하면 그대로 통과한다.
2. `DATABASE_URL` 있을 때: `getDbMock`이 빈 결과를 반환하는 체이닝 스텁을 돌려주도록 하고, 영역 목록은 그대로고 각 영역의 `solutions`가 `[]`인지 확인.

2번 스텁이 부담스러우면 1번만 남기고 제목을 "DATABASE_URL이 없으면 고정 분류를 쓴다"로 바꾸는 것이 가장 짧은 초록 경로다. 다만 그러면 DB 경로가 무검증으로 남는다.

---

## 3. 구조와 계층 위반 목록

기준은 `docs/planning/05-technical-design/05-02-target-system-architecture.md`의 고정 문장이다.

```
pages/API → application → domain·ports ← infrastructure
```

### 3-1. ESLint import 경계 규칙이 문서에만 있고 코드에 없다 (치명)

`05-02` 6.2절: "ESLint의 import 제한으로 컴포넌트에서 `@/server/*`를 가져오는 실수를 차단합니다."

실제:

```
$ npx eslint --print-config src/pages/index.jsx
"rules": {}
"plugins": ["@"]
```

`eslint.config.mjs`는 `ignores`와 `languageOptions`만 있고 **규칙을 하나도 등록하지 않는다.** `eslint-config-next`와 `typescript-eslint`가 devDependency에 설치돼 있지만 `extends`되지 않았다. 결과적으로 `npm run lint`는 파서만 돌리고 항상 초록이며, `baseline-lint.log`의 `lint exit 0`은 품질 신호가 아니다. CI(`ci.yml:33`)와 deploy(`deploy.yml:19`)가 둘 다 이 무의미한 게이트에 의존한다.

### 3-2. 도메인 정책이 `src/server/db/` 아래에 있다

`src/server/db/integrity.ts`는 파일명과 위치가 DB인데 내용은 순수 도메인 규칙이다(`assertCompleteLocales`, `assertDraftLocales`, `assertContinuousOrder`, `assertExpectedVersion`, `isPublicContent`, `isPublicSolution`). Drizzle을 import하지 않는다. 대신 표현 계층 관심사인 `HttpError`(`@/server/http/errors`)를 import한다 — 의존 방향이 `domain → http`로 역류한다. 임포터 8곳.

`05-02` 5.3절이 요구하는 위치는 각 모듈의 도메인 계층이다. `notices`와 `popup-notices`는 실제로 `domain.ts`를 갖고 있으므로 규칙이 두 곳에 흩어져 있는 상태다.

### 3-3. `composition.ts`가 문서가 말한 조립 루트가 아니다 (임포터 0)

```
$ cat src/server/composition.ts
export { getDb, closeDb } from "@/server/db/client";
export { withApiErrorBoundary } from "@/server/http/api-handler";
export { assertSameOrigin } from "@/server/http/origin-guard";
```

3줄짜리 재수출 배럴이고 **임포터가 0개다.** `05-02` 5.5절은 "서버 전용 조립 함수가 DB client, repository, 서비스와 외부 어댑터를 명시적으로 연결한다"고 했으나 구현되지 않았다. 조립은 각 모듈이 `getDb()`를 직접 부르는 방식으로 흩어져 있다.

### 3-4. `DATABASE_URL` 분기가 조회 계층 19곳에 흩어져 있다

```
$ grep -rn "DATABASE_URL" src/server | wc -l
19
```

`catalog/queries.ts:18`, `catalog/repository.ts:69,82`, `honors/queries.ts:15`, `honors/repository.ts:71`, `news/admin-queries.ts:15`, `news/query-service.js:22,40`, `notices/category-repository.ts:22`, `notices/queries.ts:49,71,98,135,181`, `popup-notices/queries.ts:18,52`, `admin/dashboard.ts:151`.

"DB 없이도 정적으로 뜬다"는 배포 모드 결정인데, 조립 루트가 아니라 개별 쿼리 함수마다 인라인 if로 반복된다. 새 조회 함수를 추가하면 가드를 빼먹기 쉽고(실제로 `contact/service.ts`에는 없다 — 의도적일 수 있으나 문서화되지 않음), 정적 분기와 DB 분기가 서로 다른 모양을 반환할 수 있다(3-5 참고).

### 3-5. 정적 경로와 DB 경로가 서로 다른 계약을 반환한다 (버그 위험)

`src/server/modules/honors/queries.ts`:

- 정적 경로(15행): `awardsData`를 그대로 spread → `title`, `org`, `description`이 `{ko, en}` 양쪽 객체이고 `image`에 실제 경로가 들어 있다.
- DB 경로(23-24행): `title: { [locale]: row.title }`로 **현재 로케일 키 하나만** 만들고, `image: ""`를 **무조건 하드코딩**한다.

DB 경로는 17행에서 `imageAssetId`를 select해 놓고 쓰지 않는다. 같은 파일 안에 `resolvePublicAssetUrl`을 쓰는 형제 모듈(`catalog/queries.ts:56`)이 있는데 여기엔 없다. 즉 `.env`의 `DATABASE_URL`을 켜는 순간 수상, 인증 이미지가 전부 사라진다. 진짜 두 개의 진실이다.

### 3-6. `src/shared`에 문서가 금지한 종류가 들어 있다

`05-02` 6.2절: "브라우저와 서버가 함께 쓰는 Zod 입력 스키마와 직렬화 가능한 표시 모델만 `src/shared/**`에 둔다."

실제 `src/shared`:

| 파일 | 문서 기준 |
|---|---|
| `schemas/contact.ts` | 부합 |
| `routing/routes.ts`, `routing/metadata.ts` | 경계상 허용 |
| `navigation/publicNavigation.ts`, `navigation/businessMegaMenu.ts` | 표시 모델로 볼 수 있음 |
| `routing/useLocale.jsx` | **React 훅. 부합하지 않음** |

문서의 목표 구조에 있는 `src/shared/view-models/`, `src/shared/formatting/`은 만들어지지 않았다.

### 3-7. `useLocale.jsx`가 Next.js 비공개 내부 경로를 import한다 (깨지기 쉬움)

```js
// src/shared/routing/useLocale.jsx
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
```

`next/dist/**`는 공개 API가 아니다. Next 16 마이너 업그레이드 한 번에 조용히 깨질 수 있고, `AGENTS.md`에 Next가 스스로 주입한 경고 블록("This version has breaking changes — APIs, conventions, and file structure may all differ")이 정확히 이 위험을 말한다. 공개 `useRouter()`로 대체 가능하며 실제로 코드베이스 다른 곳은 `next/router`를 쓴다.

부수 효과: `tests/components/design-interactions.test.tsx:14`가 이 모듈 전체를 mock하므로 이 훅은 테스트로 보호되지도 않는다.

### 3-8. `src/pages` → server 모듈 직접 import는 위반이 아니다

`getServerSideProps`에서 쿼리 서비스를 직접 부르는 것은 `05-02` 2절 결정표가 명시적으로 채택한 방식이다("공개 데이터 호출: 서버 페이지가 애플리케이션 쿼리 서비스를 직접 호출, 자기 앱의 HTTP API를 호출하지 않음"). 전수 확인 결과 `src/pages` 어디에서도 Drizzle 테이블이나 `getDb`를 직접 다루지 않는다. **이 축은 지켜지고 있다.**

### 3-9. 라우트 구조의 역전과 죽은 라우트

| 파일 | 문제 |
|---|---|
| `src/pages/Home.jsx` | 1줄 재수출인데 `next.config.js`가 `/Home` → `/`를 영구 리다이렉트한다. 절대 렌더되지 않는다 |
| `src/pages/outbound.jsx` (476줄) | `/outbound` → `/global-programs` 영구 리다이렉트. 실제 구현이 폐기된 이름 아래 있고, `src/pages/global-programs.tsx`는 3줄 재수출이다. 이름이 뒤집혀 있다 |
| `src/pages/services/` | 빈 디렉터리 |
| `src/contexts/` | 빈 디렉터리인데 `README.md` 파일 구조 표에 "React Context"로 적혀 있다 |
| `src/pages/api/news/[id].js` | **내용이 공백 한 칸인 빈 파일.** default export가 없는 API 라우트라 요청 시 런타임 오류 |

파일과 디렉터리가 같은 이름으로 공존하는 네 쌍(`admin/honors.tsx` + `admin/honors/`, `admin/notices.jsx` + `admin/notices/`, `admin/popup-notices.jsx` + `admin/popup-notices/`, `news.jsx` + `news/`)은 **Next pages-router에서 정상이며 섀도잉이 아니다.** `X.tsx`가 `/X`를, `X/[id].tsx`가 `/X/:id`를 맡는다. 다만 `admin/ai-solutions`만 `index.tsx` 방식을 써서 관례가 갈리고, `admin/notices.jsx`와 `admin/popup-notices.jsx`만 형제들과 달리 `.jsx`다.

---

## 4. 죽은 코드, 중복, 정리 대상

### 4-1. 임포터 0인 파일 (약 1,200줄)

검증 명령: `grep -rn "components/<이름>\"" src tests scripts` 및 `grep -rn "@/<경로>" src tests scripts`

| 파일 | 줄 | grep 결과 |
|---|---|---|
| `src/components/HomeHero.jsx` | 322 | 프로덕션 임포터 0. `tests/components/home-hero.test.tsx`만 import. `src/pages/index.jsx:3`은 `@/components/industrial/IndustrialHero`를 쓴다 |
| `src/components/Hero.jsx` | — | 0건 |
| `src/components/HomePage.jsx` | — | 0건 |
| `src/components/About.jsx` | — | 0건 (`AboutLocalNav`는 `@/components/public/`에 따로 있고 그쪽이 쓰인다) |
| `src/components/AboutSidebar.jsx` | — | 0건 |
| `src/components/Awards.jsx` | — | 0건 |
| `src/components/Honors.jsx` | — | 0건 (`src/pages/about/honors.jsx`가 `awardsData`를 직접 쓴다) |
| `src/components/News.jsx` | — | 0건 |
| `src/components/Services.jsx` | — | 0건 |
| `src/components/Portfolio.jsx` | — | 0건 |
| `src/components/BidNoticePopup.jsx` | — | 0건 (입찰공고는 410으로 종료됨) |
| `src/components/notices/NoticeAttachments.jsx` | — | 0건 |
| `src/components/public/ActionLink.jsx` | — | 0건 |
| `src/components/ui/card.jsx` | — | 0건 |
| `src/data/bidNotices.js` | — | 0건 |
| `src/data/popups.js` | — | 0건 |
| `src/models/News.js` | — | 0건. `src/models/` 디렉터리 전체가 이 파일 하나 |
| `src/server/composition.ts` | 3 | 0건 |
| `src/server/infrastructure/document-scanner.ts` | 7 | 0건. `document-scanner-port`만 참조됨 |
| `src/server/modules/assets/document-service.ts` | 18 | 0건 |
| `src/pages/Home.jsx` | 1 | 라우트 자체가 리다이렉트로 도달 불가 |
| `src/pages/api/news/[id].js` | 0 | 빈 파일 |

`src/components/BidNoticePopup.jsx`와 `src/data/bidNotices.js`가 특히 명확하다. `src/pages/bid-notice/[[...slug]].tsx`가 이미 HTTP 410 + "서비스를 종료했습니다"를 반환한다.

### 4-2. 목적이 겹치는 디렉터리

| 디렉터리 | 내용 | 판단 |
|---|---|---|
| `src/data/` | `businessAreas.js`, `companyHistory.js`, `translations.js` + 죽은 2개 | 정적 콘텐츠 |
| `src/utils/` | `awardsData.js`, `certificationsData.js` | **똑같이 정적 콘텐츠.** 이름만 utils |
| `src/content/` | 뉴스 Markdown과 PDF 원문 | 정적 콘텐츠 (다른 형식) |
| `src/lib/` | `admin-api.ts`, `markdown.js`, `news.js`, `utils.js` | 유틸리티 혼합. `utils.js`는 shadcn `cn()` |
| `src/models/` | `News.js` 하나, 임포터 0 | 삭제 대상 |

`05-02` 목표 구조는 정적 콘텐츠를 `src/content/static/{ko,en}.ts` 한 곳에 두기로 했는데, 실제로는 `src/data`, `src/utils`, `src/content` 세 군데로 흩어졌다. 특히 `src/utils/awardsData.js`가 `src/server/modules/honors/queries.ts`에서 정적 폴백으로 쓰이는데, 이름만 보면 서버가 UI 유틸을 import하는 것처럼 보인다.

`src/lib/utils.js`(shadcn `cn`)와 `src/utils/`는 이름이 정면으로 충돌한다. 새로 합류하는 사람이 "유틸을 어디에 두나"에서 반드시 한 번 멈춘다.

### 4-3. 중복된 개념

| 중복 | 위치 |
|---|---|
| `MailPort` 인터페이스 2개 | `src/server/ports/mail.ts` (`sendPasswordReset`)와 `src/server/modules/contact/mail-port.ts` (`send`). `05-02` 5.4절 포트 표에는 `MailPort` 하나뿐 |
| `TestMailPort` 클래스 2개 | `src/server/infrastructure/test-mail.ts`와 `src/server/infrastructure/ses-mail.ts` 안. 이름이 같고 인터페이스가 다르다 |
| 마이그레이션 러너 2개 | `scripts/migrate.ts` (npm script용, `@/server/env` 사용)와 `scripts/migrate.cjs` (릴리스 아티팩트용, `MIGRATIONS_DIR` env 사용). 둘 다 살아 있다 — `deploy.yml:32`와 `scripts/deploy.sh:12`가 `.cjs`를 쓴다. 중복이지만 **의도된 것**으로 보이며, 로직이 갈라지지 않게 주석이 필요하다 |
| `SesMailPort` 이름 | 파일명과 클래스명이 SES인데 실제 구현은 nodemailer SMTP다. AWS SES SDK를 쓰지 않는다 |

### 4-4. 미사용 의존성

검증: `grep -rl "from \"<패키지>" src scripts tests`

| 패키지 | 버전 | 임포트 |
|---|---|---|
| `@mdxeditor/editor` | 4.2.1 | **0건** (`MDXEditor` 식별자 검색도 0건) |
| `motion` | 13.1.1 | **0건** (`framer-motion`, `motion/react` 검색도 0건). 모션은 전부 CSS `.bw-reveal` + IntersectionObserver로 구현됨 |
| `react-hook-form` | 7.86.0 | **0건** (`useForm` 검색도 0건) |
| `@hookform/resolvers` | 5.9.1 | **0건** |
| `@playwright/test` (dev) | 1.62.1 | `playwright.config.ts`만 참조. `tests/e2e` 디렉터리 부재 |

`@mdxeditor/editor`는 무거운 에디터 번들이라 제거 효과가 크다. 관리자 본문 편집은 `src/components/admin/NewsForm.tsx` 등이 자체 textarea + `@/lib/markdown` 미리보기로 처리한다.

살아 있는 것으로 확인된 의존성: `@aws-sdk/client-s3`(`s3-storage.ts`), `busboy`(`upload-service.ts:3`), `nodemailer`(2곳), `sharp`(`sharp-image.ts`), `tw-animate-css`(`src/styles/globals.css:2`의 `@import`).

### 4-5. 루트 잡동사니 — 유지/삭제/무시 권고

| 경로 | 트래킹 | 권고 |
|---|---|---|
| `test.html` (7.5KB) | 예 | **삭제.** 내용이 무엇이든 이름이 역할을 못 한다. prettier도 이 파일에 경고를 낸다 |
| `test.txt` (14B) | 예 | **삭제** |
| `bid-notice-console-errors.json` | 예 | **삭제.** 내용이 JSON이 아니라 브라우저 콘솔 덤프 텍스트라 `prettier --check`가 파싱 에러를 낸다. 입찰공고 기능은 410으로 종료됨 |
| `bid-notice-snapshot.md` | 예 | **삭제** (같은 이유) |
| `ko_escapes.json` | 예 | **삭제.** 역시 JSON이 아니고(`title_2025: ...` 형태) 한글이 `??`로 깨져 있다. `prettier --check` 파싱 에러 원인 |
| `tsconfig.tsbuildinfo` (599KB) | **아니오** | 현상 유지. `.gitignore`의 `*.tsbuildinfo`가 잡고 있다 |
| `out/` | **아니오** | 현상 유지. 다만 `pages.yml`이 이 디렉터리를 요구한다 (5-2 참고) |
| `graphify-out/` | **아니오** | 현상 유지 (`.gitignore`) |
| `docs/graphify-out/` | **아니오** | `docs/**` 전체가 무시됨 (4-6 참고) |
| `reports/2026-09-07-admin-audit.md` | **예** | 판단 필요. `.gitignore`는 `/reports/migration/`만 무시하고 이 파일은 트래킹된다. 감사 보고서를 리포지토리에 남길 정책이면 유지, 아니면 `/reports/`를 통째로 무시 |
| `.agents/` | 예 | 유지. 프로젝트 스킬 정의 |
| `.playwright-mcp/` | 아니오 | 현상 유지 |

`prettier --check .`의 마지막 줄 `Error occurred when checking code style in 2 files`는 전적으로 `bid-notice-console-errors.json`과 `ko_escapes.json` 때문이다. 이 둘만 지우면 `format:check`가 에러 없이 경고만 내게 된다.

### 4-6. `docs/**` 전체가 git에서 무시되고 있다 (심각)

```
$ git ls-files docs | wc -l
0
$ grep -n "docs" .gitignore
/docs/**
```

디스크에는 Markdown 73개가 있는데 **한 개도 버전 관리되지 않는다.** 그런데 `AGENTS.md` 기본 규칙 5번은 "코드 작업 전 `docs`의 모든 Markdown 문서를 읽고 규칙을 준수한다"이고, LLM Wiki 절은 "유일한 원본은 `docs/**/*.md`이다"라고 선언한다.

즉 이 프로젝트가 단일 진실 원천이라고 부르는 것이 클론한 사람에게는 존재하지 않는다. `docs/planning/05-*`의 아키텍처 결정, `docs/erd.md`, `docs/index.md`가 전부 한 사람의 로컬 디스크에만 있다. 협업이나 인수인계 관점에서 이 감사에서 가장 무거운 항목이다.

---

## 5. 설정, 보안, DB 위생 이슈

### 5-1. 비밀값

- `.env`는 **트래킹되지 않는다** (`git ls-files .env` → 빈 결과). `.gitignore`의 `.env`, `.env.*`, `!.env.example` 조합이 정확하다. 양호.
- `.env.example`에 실제 비밀값 없음. 다만 `CONTACT_RECIPIENT=austin@brainworks.co.kr`로 실제 업무 이메일이 들어 있다 — 공개 리포지토리라면 제거 권고.
- `drizzle.config.ts:8-10`이 기본값으로 로컬 DB URL과 비밀번호(`brainworks_dev`)를 하드코딩한다. 로컬 전용 값이므로 위험은 낮지만, `DATABASE_URL` 미설정 시 조용히 로컬 DB에 붙는 동작이라 운영 스크립트가 엉뚱한 곳을 건드릴 여지가 있다.
- `src` 전체에서 하드코딩된 토큰, 키 패턴 발견 없음.

### 5-2. `.github/workflows/pages.yml`은 구조적으로 항상 실패한다 (치명)

이 워크플로는 main 푸시마다 돌면서 다음을 요구한다.

```yaml
if [ ! -f out/index.html ]; then
  echo "::error::out/index.html 파일이 없습니다. next.config.js의 output: 'export' 적용 여부와 ..."
  exit 1
fi
```

그런데 `next.config.js`는 `output: "standalone"`이다. 게다가 이 앱은 거의 모든 공개 페이지가 `getServerSideProps`를 쓰고 API 라우트와 `i18n`을 쓰므로 **정적 export 자체가 불가능하다.** 결과적으로 main 브랜치 CI에 영구 빨간불이 하나 붙어 있고, 진짜 실패와 구분이 안 된다.

또한 이 워크플로만 `node-version: 22`를 쓴다 (다른 둘은 24, `.nvmrc`는 `24.19.0`).

**권고: `pages.yml` 삭제.** GitHub Pages 배포는 이 아키텍처에서 성립하지 않는다. 배포 경로는 `deploy.yml` + `scripts/deploy.sh` + `ops/pm2`다.

### 5-3. CI 게이트의 실효성

`ci.yml`:

| 단계 | 실효성 |
|---|---|
| `npm run typecheck` | 유효. 단 `.js`/`.jsx` 82개는 검사 대상이 아니다 (6-3 참고) |
| `npm run lint` | **무효. 규칙 0개** |
| `npx prettier --check package.json next.config.js .github/workflows/ci.yml` | **3개 파일만 검사.** 리포지토리 전체 `prettier --check .`는 약 60개 파일에서 경고를 낸다. `package.json`에 `format:check` 스크립트가 있는데 CI는 쓰지 않는다 |
| `npm test` | 유효. 현재 3개 실패 중이므로 CI가 빨간불이어야 정상 |
| `npm run test:db` | **DB를 쓰지 않는다** (6-2 참고). `services: postgres`와 `DATABASE_TEST_URL`이 무의미하게 떠 있다 |
| `npm run build` | 유효 |
| `npm audit --omit=dev --audit-level=high` | 유효 |

추가로 `on.push.branches: [main, feat/homepage-redesign]`이라 현재 작업 브랜치 `redesign/industrial`은 푸시 CI가 돌지 않는다. PR을 열어야만 검증된다.

`ci.yml`은 `npm run db:migrate`를 실행하지 않는다. 지금은 DB 테스트가 DB를 안 쓰니 문제가 드러나지 않지만, 진짜 DB 테스트를 추가하는 순간 빈 스키마를 만나게 된다.

### 5-4. 메일 어댑터 전환 로직이 비대칭이고 조용히 삼킨다

```ts
// src/server/infrastructure/ses-mail.ts:24
if (environment === "local" || environment === "test") return new TestMailPort();

// src/server/infrastructure/password-reset-mail.ts:45-47
if (["local", "test", "development"].includes(environment)) return testMailPort;
```

두 문제가 있다.

1. **비대칭.** `APP_ENV`가 없고 `NODE_ENV=development`인 `next dev` 상황에서, 비밀번호 재설정은 메모리 포트로 가지만 문의 메일은 SMTP를 시도하고 `SMTP_HOST`가 비어 있으므로 `DEPENDENCY_UNAVAILABLE`로 터진다. 같은 개발 환경에서 두 기능이 다르게 동작한다.
2. **조용한 삼킴.** 운영 배포에서 `.env`의 `APP_ENV=local`을 고치는 것을 잊으면, `submitContact`는 메일을 `TestMailPort.messages` 배열에 넣고 DB 영수증을 `COMPLETED`로 기록한 뒤 정상 응답을 돌려준다. 문의가 통째로 사라지는데 로그도 경고도 없다. `.env.example`의 기본값이 `APP_ENV=local`이라 실수 확률이 낮지 않다.

권고: 전환 기준을 한 곳(`createMailPort` 하나)으로 모으고, 메모리 포트를 선택했을 때 `console.warn`으로 명시하며, `APP_ENV`가 `production`이 아닌데 `NODE_ENV=production`이면 기동 시 실패하게 한다.

부수: `testMailPort`는 모듈 스코프 싱글턴이라 `messages` 배열이 프로세스 수명 내내 무한히 자란다. 개발 환경 전용이므로 우선순위는 낮다.

### 5-5. 문의 레이트 리밋 Map이 정리되지 않는다

`src/server/modules/contact/service.ts:9`의 `const attempts = new Map<string, {count, resetAt}>()`는 만료된 항목을 삭제하는 코드가 없다. `assertRateLimit`은 만료 시 같은 키를 덮어쓸 뿐이고, 한 번 방문한 IP 키는 프로세스가 살아 있는 한 영구히 남는다. `output: standalone` + pm2 `instances: 1`이라 프로세스가 오래 사는 구성이므로 느리지만 확실한 메모리 증가다. 또한 인스턴스를 늘리면 레이트 리밋이 무력화된다.

### 5-6. DB 스키마와 마이그레이션 — 드리프트 없음 (양호)

```
$ npx drizzle-kit check
Everything's fine 🐶🔥
```

저널은 `0000`~`0003` 4개가 `idx` 0,1,2,3 순서로 정렬돼 있고 타임스탬프도 증가한다. 스냅샷 `0003`과 `src/server/db/schema/*.ts`를 직접 대조한 결과 **테이블 27개 이름 전부 일치, enum 10개 전부 일치.** 드리프트 없음.

마이그레이션 SQL에 `IF NOT EXISTS` 가드가 없다(`0000`에 0건). 이는 drizzle 기본 동작이며 `__drizzle_migrations` 저널이 재실행을 막으므로 **문제가 아니다.** 다만 `0002_jazzy_silk_fever.sql`은 `ALTER TABLE` 한 줄에 개행이 없어 `wc -l`이 0이 나온다 — 도구 호환성상 개행 추가를 권한다.

`0003_notice_public_number.sql`만 무작위 이름이 아니라 수동 명명이다. 손으로 작성된 마이그레이션이면 스냅샷과의 정합성이 우연일 수 있으나, 위 대조로 일치가 확인되었다.

---

## 6. 테스트 건강도

### 6-1. 구성과 결과

```
Test Files  2 failed | 35 passed (37)
     Tests  3 failed | 118 passed (121)
```

| 분류 | 파일 | 비고 |
|---|---|---|
| `tests/unit/**` | 17 | 대부분 순수 함수 계약. 건강 |
| `tests/components/**` | 13 | Testing Library. 건강 |
| `tests/db/**` | 4 | **DB를 쓰지 않는다** |
| `tests/shared/**` | 1 | |
| `tests/migration/**` | 1 | |
| `tests/e2e/**` | **0 — 디렉터리 자체가 없다** | |

### 6-2. `tests/db/**`는 이름이 거짓말이다

4개 파일 전부 인메모리 단언이다.

- `auth-schema.test.ts`: `getTableName(adminAccounts) === "admin_accounts"` — Drizzle 객체 검사
- `notices-repository.test.ts`: `getTableConfig(notices)`의 컬럼과 인덱스 검사
- `content-integrity.test.ts`: `@/server/db/integrity`의 순수 함수 검사
- `popup-notices-overlap.test.ts`: `assertPopupOverlapLimit` 순수 함수 검사

```
$ grep -rn "DATABASE_TEST_URL" src tests scripts ops .github compose.dev.yml
.github/workflows/ci.yml:24:      DATABASE_TEST_URL: postgresql://...
```

**`DATABASE_TEST_URL`을 읽는 코드가 리포지토리에 한 줄도 없다.** 그런데 `README.md`는 "`npm run test:db` | DB 테스트. `postgres-test` 필요"라고 적고, `compose.dev.yml`이 5434 포트로 `postgres-test` 컨테이너를 띄우며, `.env.example`이 `DATABASE_TEST_URL`을 문서화한다. 세 문서와 하나의 인프라가 존재하지 않는 요구사항을 가리킨다.

DB 없이 돌아가니 "DB 테스트가 없어서 실패하는" 문제는 없다. 대신 **레포지토리 계층(트랜잭션, 낙관적 잠금 `version`, 예약 게시 구간 계산)이 실제로 검증된 적이 없다.** `05-02`가 핵심 결정으로 내세운 부분이 통째로 미검증이다.

### 6-3. `.js`/`.jsx`는 타입 검사도 lint도 받지 않는다

```
$ find src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | sed 's/.*\.//' | sort | uniq -c
     14 js
     68 jsx
    114 ts
     36 tsx
```

`.js` + `.jsx` = 82개 (약 35%). `tsconfig.json`은 `allowJs: true, checkJs: false`이고 `include`는 `["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]`라 `.js`/`.jsx`가 프로그램에 직접 포함되지 않는다. ESLint 규칙은 0개. 즉 82개 파일이 **어떤 자동 검사도 받지 않는다.** `baseline-typecheck.log`의 0 에러는 그만큼 좁은 범위의 결과다.

전환 방향은 문서에 명시돼 있다 — `docs/planning/05-technical-design/05-01-tech-stack-and-rationale.md:32` "TypeScript 6.0.x, `strict`, 점진 도입", 143행 "5. TypeScript 전환 방식", `docs/planning/00-domain-language.md:143` "점진적 TypeScript 전환 … 동작 보존 파일을 타입 전환만 위해 일괄 수정하지 않음". **혼재 자체는 정책이지 드리프트가 아니다.**

다만 같은 문서 363행이 우선순위를 "서버, DB, API 계약 보호"로 정해 놓았는데, 그 경계에 아직 JS가 남아 있다.

TS가 JS를 import하는 지점(추론에만 의존하는 경계):

| JS 모듈 | 이를 import하는 TS 파일 |
|---|---|
| `@/data/businessAreas` | `src/server/modules/catalog/queries.ts`, `src/shared/navigation/businessMegaMenu.ts`, 관리자 페이지 3개 |
| `@/lib/markdown` | `src/server/modules/news/database-source.ts`, `src/server/modules/preview/preview-service.ts`, 페이지 2개 |
| `@/utils/awardsData`, `@/utils/certificationsData` | `src/server/modules/honors/queries.ts` |

여기에 서버 모듈 자체가 JS인 경우가 겹친다 — `src/server/modules/news/query-service.js`(공개 뉴스 조회 진입점), `src/server/modules/news/static-source.js`, `src/pages/api/news/[id].js`. 문서가 가장 먼저 보호하라고 한 계층이 가장 나중까지 JS로 남아 있는 역순이다.

### 6-4. 흔들림 패턴 — 양호

```
$ grep -rn "new Date()\|Date.now()\|setTimeout\|fetch(" tests | grep -v "useFakeTimers\|vi.mock"
(결과 없음)
```

테스트에 실제 시각, 실제 타이머, 네트워크 호출이 없다. `vi.useFakeTimers()`를 쓰는 4개 파일(`business-area`, `design-interactions`, `global-network`, `home-hero`)은 모두 `afterEach`에서 정리하거나 파일 단위로 격리돼 있다. 시간 의존 로직(`getPublishedPopupNotices(locale, now = new Date())`)은 `now`를 주입 가능하게 설계했다. 이 축은 잘 되어 있다.

### 6-5. 의미가 없는 테스트

`tests/unit/tooling-config.test.ts`(7개 케이스)와 `tests/components/shadcn-foundation.test.ts`(2개)는 설정 파일 내용을 문자열로 다시 적어 놓은 거울이다. 동작을 검증하지 않고, 설정을 고칠 때마다 반드시 두 곳을 고치게 만든다.

특히 나쁜 것들:

- `tests/unit/tooling-config.test.ts` — `expect(packageLock.packages["node_modules/mdast-util-to-hast"].version).toBe("13.2.1")`. 간접 의존성 패치 하나에 테스트가 깨진다. 보안 목적이라면 `npm audit`(이미 CI에 있음)이 맡을 일이다.
- 같은 파일 — `expect(packageJson.scripts).toMatchObject({ lint: "eslint ." })`. lint 스크립트의 **존재**를 고정하지만 그 lint가 규칙 0개라는 사실은 잡지 못한다. 게이트를 검사한다고 믿게 만드는 가짜 안전망이다.
- `tests/components/home-hero.test.tsx` — 프로덕션에서 아무도 쓰지 않는 `HomeHero.jsx`(322줄)를 검사한다. 죽은 코드를 살아 있게 보이게 하는 테스트다.

권고: `tooling-config.test.ts`에서 lock 버전 단언과 스크립트 문자열 단언을 제거하고, ESLint에 실제 규칙을 넣은 뒤 "컴포넌트가 `@/server/*`를 import하면 lint가 실패한다"를 검증하는 테스트로 대체한다.

### 6-6. e2e는 실행 자체가 불가능하다

```
$ ls tests/e2e
ls: cannot access 'tests/e2e': No such file or directory
```

`playwright.config.ts`는 `testDir: "./tests/e2e"`, `webServer.command: "npm run dev"`, `baseURL: "http://localhost:3000"`으로 설정만 갖춰져 있다. 설정 자체는 타당하다(`next.config.js`에 포트 지정이 없으니 3000이 맞고, `reuseExistingServer: !CI`도 적절). 단지 테스트가 없다. `npm run test:e2e`는 "no tests found"로 끝난다. CI도 이 단계를 부르지 않는다.

권고: 지금 e2e를 쓰지 않기로 했다면 `playwright.config.ts`, `test:e2e` 스크립트, `@playwright/test` 의존성을 함께 제거한다. 쓸 계획이라면 최소 1개(홈 200 + 관리자 로그인 리다이렉트)를 넣어 설정이 살아 있음을 증명한다. **지금 상태가 최악이다** — 있다고 믿게 하고 아무것도 지키지 않는다.

---

## 7. 문서와 코드 드리프트

### 7-1. `AGENTS.md` 규칙을 코드가 위반하는 항목

| 규칙 | 위반 |
|---|---|
| 기본 규칙 5: "코드 작업 전 `docs`의 모든 Markdown 문서를 읽는다" | `docs/**`가 `.gitignore`에 있어 클론에 존재하지 않는다. 규칙을 지킬 수 없다 |
| LLM Wiki: "유일한 원본은 `docs/**/*.md`이다" | 같음 |
| 커밋 메시지: "장문형은 내용이 있는 줄이 3줄 이내" | 미커밋 `AGENTS.md` diff가 "3줄 이상" → "3줄 이내"로 규칙 자체를 뒤집는다. 기존 커밋들이 어느 쪽 규칙으로 쓰였는지 기록이 없다 |

`AGENTS.md` 하단의 `<!-- BEGIN:nextjs-agent-rules -->` 블록은 `next dev`가 자동 주입하는 것이고 본문에 제거 금지가 명시돼 있으므로 그대로 두는 것이 맞다.

### 7-2. `docs/erd.md`와 `docs/index.md`의 enum 개수가 틀렸다

- `docs/erd.md:18` — "테이블 27개, enum 9개"
- `docs/erd.md:141` — "### 상태 enum 9개"
- `docs/index.md:22` — "테이블 27개와 enum 9개"

실제는 **10개**다.

```
$ grep -rhoE "pgEnum\(" src/server/db/schema/*.ts | wc -l
10
```

목록: `item_status`, `locale`, `publication_status`, `notice_publication_status`, `actor_type`, `asset_type`, `asset_status`, `honor_type`, `contact_receipt_status`, `news_body_format`.

재미있게도 `docs/erd.md:143` 아래 표에는 **10행이 다 적혀 있다.** 숫자만 갱신되지 않았다. 테이블 27개는 정확하다.

### 7-3. `docs/erd.md`의 "모든 서버 모듈에 `DATABASE_URL` 가드가 있다"는 절반만 맞다

`docs/erd.md` 마지막 줄: "모든 서버 모듈에 `DATABASE_URL` 가드가 있어 시연이나 UI 확인에는 PostgreSQL이 필요 없습니다."

공개 조회 모듈은 전부 가드가 있다(19곳). 그러나 `src/server/modules/contact/service.ts`에는 없고 `getDb()`를 바로 부른다. `/contact` 페이지는 렌더되지만 제출은 `DEPENDENCY_UNAVAILABLE`로 실패한다. 문서가 "시연"의 범위를 명확히 하지 않는다.

### 7-4. `README.md` 파일 구조 표가 현실과 다르다

| README 기재 | 실제 |
|---|---|
| `src/contexts/ # React Context` | **빈 디렉터리** |
| `src/pages/services/ # 서비스 하위 페이지` | **빈 디렉터리** (`services.jsx` 한 장뿐) |
| `src/models/ # 데이터 모델` | `News.js` 하나, 임포터 0 |
| `src/pages/bid-notice/ # 입찰 공고 상세 페이지` | HTTP 410 종료 안내 페이지 |
| `tests/ # Node.js 테스트` | vitest + (없는) playwright |

`README.md`는 `scripts/migration/*`(6개), `scripts/auth/provision-admin.ts`를 제외한 `scripts/backup-postgres.sh`, `scripts/restore-postgres.sh`, `scripts/deploy.sh`, `ops/nginx/`, `ops/pm2/`, `ops/release-runbook.md`를 **전혀 언급하지 않는다.** `admin:provision`만 "자주 쓰는 명령" 표에 있다.

`scripts/migration/import-{assets,catalog,honors,news}.ts` 4개는 `package.json`에 npm script가 없고 `docs/planning/05-technical-design/05-04-*.md:626-629`에서 `npx tsx ...` 형태로만 호출된다. 일회성 이관 도구이므로 유지는 타당하나, 실행 기록(`reports/migration/`이 `.gitignore`됨)이 없어 이미 완료되었는지 판단할 근거가 리포지토리 안에 없다.

### 7-5. `05-02` 목표 구조 대비 미구현

| 문서가 명시한 것 | 상태 |
|---|---|
| `src/content/static/{ko,en}.ts`, `src/content/site-config.ts` | 없음. 정적 데이터가 `src/data`, `src/utils`로 흩어짐 |
| `src/shared/view-models/`, `src/shared/formatting/` | 없음 |
| `src/components/shared/` | 없음 (`src/components` 루트에 평평하게 있음, 그중 10개가 죽은 코드) |
| `src/server/composition.ts`의 조립 함수 | 3줄 재수출 배럴, 임포터 0 |
| ESLint import 제한 | 없음 |
| `Clock`, `IdGenerator` 포트 | 없음 (`now = new Date()` 기본 인자로 대체 — 실용적인 선택이며 문제 없음) |

### 7-6. 링크는 건강하다

`docs/index.md`의 모든 상대 Markdown 링크를 파일 존재 여부로 검증한 결과 **깨진 링크 0건.** `docs/index.md`(100행)가 `plan.md`, `erd.md`, `log.md`, `planning/**`를 정상적으로 가리킨다.

---

## 8. 권장 수정 순서 — 독립 실행 가능한 작업 단위

각 작업은 1~3개 파일만 건드리며 서로 의존하지 않는다. A 그룹부터 순서대로 착수하되, 같은 그룹 안에서는 병렬 배정 가능하다.

### A그룹 — 지금 빨간불을 끄는 작업 (병렬 가능, 각 10분 내외)

**A-1. `design-interactions` 테스트 문자열을 현재 카피에 맞춘다**
- 파일: `tests/components/design-interactions.test.tsx` (1개)
- 내용: 2-1절 표의 치환 7곳. 57행의 중간 타이핑 상태(`"제조 현"`)는 `src/components/industrial/IndustrialHero.jsx`의 타이핑 간격 상수를 읽고 `"제조 A"` 등 새 이름 기준으로 재계산한다.
- 검증: `npx vitest run tests/components/design-interactions.test.tsx` → 3 passed

**A-2. `published-business-areas` 테스트를 현재 계약으로 갱신한다**
- 파일: `tests/unit/catalog/published-business-areas.test.ts` (1개)
- 내용: 기존 케이스에서 21행 `process.env.DATABASE_URL = ...`을 제거하고 제목을 "DATABASE_URL이 없으면 고정 사업 영역 분류를 사용한다"로 바꾼다. 그다음 `DATABASE_URL`이 있을 때 영역 목록은 유지되고 각 영역 `solutions`가 빈 배열인지 확인하는 케이스를 추가한다(`getDbMock`이 `select().from().innerJoin()...orderBy()` 체인을 만족하고 `[]`를 resolve하는 스텁 반환).
- 검증: `npx vitest run tests/unit/catalog/published-business-areas.test.ts`

**A-3. 빈 API 라우트를 지운다**
- 파일: `src/pages/api/news/[id].js` (1개, 내용 없음)
- 내용: 삭제. 공개 뉴스 조회는 `src/pages/news.jsx`와 `src/pages/news/[slug].jsx`가 `getServerSideProps`로 직접 처리하므로 이 API는 아무 데서도 호출되지 않는다.
- 검증: `npm run build` (라우트 수집 오류 없음)

**A-4. 파싱 불가 루트 파일 4개를 지운다**
- 파일: `bid-notice-console-errors.json`, `bid-notice-snapshot.md`, `ko_escapes.json`, `test.txt`, `test.html` (5개, 전부 삭제)
- 검증: `npx prettier --check . 2>&1 | tail -3` → `Error occurred when checking code style in 2 files` 문구가 사라진다

### B그룹 — 게이트를 되살린다 (A와 독립, 각 30분~1시간)

**B-1. ESLint에 실제 규칙과 import 경계를 넣는다** ★최우선
- 파일: `eslint.config.mjs` (1개)
- 내용: `eslint-config-next`(이미 설치됨)와 `typescript-eslint` 권장 설정을 `extends`한다. 추가로 `05-02` 6.2절이 요구하는 경계를 `no-restricted-imports`로 구현 — `src/components/**`와 `src/pages/**` 중 `api`가 아닌 경로에서 `@/server/*` import 금지 (단, `getServerSideProps`용 페이지 import는 현행 설계상 허용이므로 `src/components/**`만 막는 것부터 시작). 새 규칙이 기존 코드에서 대량으로 터질 수 있으므로 먼저 `--max-warnings`로 경고 수준 도입 후 단계적으로 error 승격.
- 검증: `npx eslint --print-config src/pages/index.jsx` 로 `rules`가 비어 있지 않음을 확인하고, `npm run lint` 실행 후 남은 위반 수를 기록

**B-2. GitHub Pages 워크플로를 제거한다**
- 파일: `.github/workflows/pages.yml` (1개, 삭제)
- 내용: `output: "standalone"`과 `getServerSideProps` 전면 사용으로 정적 export가 불가능하므로 이 워크플로는 영구 실패한다. 배포 경로는 `deploy.yml` + `scripts/deploy.sh`다.
- 검증: `ls .github/workflows/` → `ci.yml`, `deploy.yml` 두 개만

**B-3. CI의 prettier 검사를 전체로 넓힌다**
- 파일: `.github/workflows/ci.yml` 1줄 + prettier 위반 파일들 (A-4 선행 권장)
- 내용: `npx prettier --check package.json next.config.js .github/workflows/ci.yml` → `npm run format:check`로 교체. 그 전에 `npx prettier --write .`를 한 번 돌려 약 60개 파일을 정렬하고 별도 `style:` 커밋으로 분리한다. 이 포맷 커밋은 `src/server/modules/notices/queries.ts`처럼 한 줄이 매우 긴 파일들의 diff를 크게 만들므로 반드시 기능 변경과 섞지 않는다.
- 검증: `npm run format:check` → exit 0

**B-4. e2e를 정리하거나 최소 1개를 넣는다**
- 파일(제거안): `playwright.config.ts`, `package.json`(`test:e2e` 스크립트와 `@playwright/test` devDependency) — 2개
- 파일(유지안): `tests/e2e/smoke.spec.ts` 신규 1개 — 홈 200 확인과 `/admin` 접근 시 `/auth/signin` 리다이렉트 확인
- 검증(제거안): `grep -rn "playwright" package.json` → 결과 없음 / (유지안): `npm run test:e2e`

### C그룹 — 두 개의 진실을 하나로 (B와 독립, 각 1시간 내외)

**C-1. `honors` DB 경로가 이미지와 양쪽 로케일을 잃지 않게 한다** ★버그
- 파일: `src/server/modules/honors/queries.ts` (1개)
- 내용: 23~24행에서 `image: ""` 하드코딩을 제거하고 `catalog/queries.ts:56`처럼 `assets`를 join해 `resolvePublicAssetUrl(storageKey)`를 쓴다. 이미 17행에서 `imageAssetId`를 select하지만 쓰지 않는다. `title`/`org`/`description`의 `{[locale]: ...}` 단일 키 형태가 정적 경로의 `{ko, en}`과 다르므로, 소비처(`src/pages/about/honors.jsx`)가 실제로 어떤 모양을 기대하는지 먼저 확인하고 두 경로의 반환 타입을 하나로 맞춘다.
- 검증: `DATABASE_URL=` 없이 `/about/honors` 렌더 결과와, `DATABASE_URL` 설정 후 같은 페이지의 이미지 유무를 비교. 단위 테스트 신규 1건 권장 (`tests/unit/honors/queries.test.ts`에서 두 경로 반환 shape 동일성 단언)

**C-2. 메일 포트 전환을 한 곳으로 모은다**
- 파일: `src/server/infrastructure/ses-mail.ts`, `src/server/infrastructure/password-reset-mail.ts`, `src/server/ports/mail.ts` (3개)
- 내용: `createContactMailPort`와 `createPasswordResetMailPort`의 환경 판정 목록을 하나의 공유 함수로 통일한다(현재 `development` 포함 여부가 다름). 메모리 포트를 고를 때 `console.warn`으로 명시한다. `SesMailPort`는 실제로 nodemailer SMTP이므로 `SmtpContactMailPort`로 개명한다. `src/server/modules/contact/mail-port.ts`의 `MailPort`와 `src/server/ports/mail.ts`의 `MailPort` 이름 충돌은 후자를 `PasswordResetMailPort`로 좁히거나 하나의 포트에 두 메서드를 두는 쪽으로 정리한다.
- 검증: `npm run typecheck` + `npx vitest run tests/unit/auth/`

**C-3. `useLocale`을 공개 API로 되돌린다**
- 파일: `src/shared/routing/useLocale.jsx` (1개)
- 내용: `next/dist/shared/lib/router-context.shared-runtime`를 `next/router`의 `useRouter()`로 교체한다. 라우터가 없는 렌더(테스트, `_document`)에서의 동작 차이를 확인해야 한다 — 현재 코드가 `router?.locale`로 옵셔널 체이닝을 쓰는 이유가 그것일 가능성이 있으므로 대체 시에도 `useRouter()?.locale` 방어를 유지한다. 파일을 `.ts`로 전환하기 좋은 후보(훅에 JSX가 없다).
- 검증: `npm run typecheck` + `npx vitest run tests/components/` (단, `design-interactions.test.tsx:14`가 이 모듈을 mock하므로 회귀를 잡지 못한다. `npm run dev` 후 `/en/about/`에서 영문 문구가 나오는지 수동 확인 필요)

### D그룹 — 무게를 덜어낸다 (전부 독립, 각 15~30분)

**D-1. 죽은 루트 컴포넌트 10개를 삭제한다**
- 파일: `src/components/{Hero,HomePage,About,AboutSidebar,Awards,Honors,News,Services,Portfolio,BidNoticePopup}.jsx` (10개 삭제)
- 검증: 각 파일마다 `grep -rn "components/<이름>\"" src tests scripts`가 0건임을 재확인한 뒤 삭제, 이어서 `npm run build` + `npm test`

**D-2. `HomeHero.jsx`와 그 테스트를 함께 삭제한다**
- 파일: `src/components/HomeHero.jsx`, `tests/components/home-hero.test.tsx` (2개)
- 내용: 프로덕션 임포터가 0이고 `src/pages/index.jsx:3`이 `IndustrialHero`를 쓴다. 테스트가 유일한 소비자다. 삭제 전에 `IndustrialHero`가 `HomeHero`의 어떤 동작을 이어받지 못했는지(`tests/components/home-hero.test.tsx`의 케이스 목록) 확인해 필요한 것만 `design-interactions.test.tsx`로 옮긴다.
- 검증: `npm test` → 테스트 파일 수 36, 실패 0

**D-3. 입찰공고 잔재를 제거한다**
- 파일: `src/data/bidNotices.js` (삭제), `src/components/BidNoticePopup.jsx`(D-1에 포함)
- 내용: `src/pages/bid-notice/[[...slug]].tsx`가 이미 410을 반환하는 종료 안내다. 데이터와 팝업 컴포넌트는 임포터 0.
- 검증: `grep -rn "bidNotices\|BidNoticePopup" src tests scripts` → 0건, `npm run build`

**D-4. 죽은 서버 파일 3개와 `src/models/`를 제거한다**
- 파일: `src/server/composition.ts`, `src/server/infrastructure/document-scanner.ts`, `src/server/modules/assets/document-service.ts`, `src/models/News.js` (4개 삭제)
- 주의: `document-scanner.ts`를 지우면 `@/server/modules/assets/document-scanner-port`의 유일한 실구현이 사라진다. 문서 업로드 검사 기능을 앞으로 붙일 계획이면 삭제 대신 "미배선" 주석을 남긴다. `tests/support/fake-document-scanner.ts`와 `tests/unit/assets/document-upload-policy.test.ts`는 port만 참조하므로 영향 없다.
- 검증: `npm run typecheck` + `npm test`

**D-5. 미사용 의존성 4개를 제거한다**
- 파일: `package.json`, `package-lock.json` (2개)
- 내용: `@mdxeditor/editor`, `motion`, `react-hook-form`, `@hookform/resolvers` 제거 후 `npm install`. `@mdxeditor/editor`가 번들 크기 기여가 크다.
- 주의: `tests/unit/tooling-config.test.ts`가 `package-lock.json`의 `mdast-util-to-hast` 버전을 하드코딩하므로 lock 갱신 시 깨질 수 있다. 그 단언은 이 기회에 제거한다(그러면 이 작업의 파일이 3개가 된다).
- 검증: `npm run build` + `npm test`

**D-6. 죽은 라우트 파일을 정리하고 `outbound`/`global-programs` 이름을 바로잡는다**
- 파일: `src/pages/Home.jsx`(삭제), `src/pages/outbound.jsx` → `src/pages/global-programs.jsx`로 이동, `src/pages/global-programs.tsx`(삭제) — 3개
- 내용: `/Home` 리다이렉트가 이미 `next.config.js`에 있으므로 `Home.jsx`는 도달 불가. `outbound.jsx`(476줄 실구현)와 `global-programs.tsx`(3줄 재수출)의 역할이 뒤집혀 있으니 실구현을 정식 이름으로 옮기고 재수출 파일을 없앤다. `/outbound` → `/global-programs` 리다이렉트는 `next.config.js`에 그대로 둔다.
- 주의: `outbound.jsx` 안의 `export default function Outbound()` 이름과 `SeoMetadata` 문구도 함께 정리한다. 빈 디렉터리 `src/pages/services/`, `src/contexts/`도 이때 같이 제거한다.
- 검증: `npm run build` 후 `.next/` 라우트 목록에 `/global-programs`가 있고 `/Home`, `/outbound`가 리다이렉트로만 존재하는지 확인

### E그룹 — 구조 부채 (일정 여유가 있을 때, 각 반나절)

**E-1. `docs/**`를 git에 넣는다** ★협업 관점 최우선
- 파일: `.gitignore` (1개) + `docs/**` 신규 트래킹
- 내용: `.gitignore`의 `/docs/**`를 제거하고, `docs/graphify-out/` 등 파생물만 개별 무시 규칙으로 남긴다. `AGENTS.md`가 docs를 단일 진실 원천으로 선언한 이상 버전 관리 밖에 두는 것은 모순이다. 커밋 크기가 크므로(73개 파일) 단독 `docs:` 커밋으로 분리한다.
- 검증: `git ls-files docs | wc -l` → 70 이상, `git ls-files docs/graphify-out | wc -l` → 0

**E-2. `docs/erd.md`와 `docs/index.md`의 enum 개수를 고친다**
- 파일: `docs/erd.md`(18행, 141행), `docs/index.md`(22행) — 2개
- 내용: "enum 9개" → "enum 10개". `docs/erd.md:143` 아래 표는 이미 10행으로 정확하다. 함께 `docs/erd.md` 마지막 줄의 "모든 서버 모듈에 `DATABASE_URL` 가드가 있다"를 "공개 조회 모듈에는 가드가 있고, 문의 제출은 DB가 필요하다"로 정정한다. `docs/erd.md:178` 마이그레이션 표의 `0001`, `0002` 칸이 비어 있으니 채운다.
- 검증: `grep -rn "enum 9개" docs/` → 0건

**E-3. `README.md`를 현실에 맞춘다**
- 파일: `README.md` (1개)
- 내용: (a) 파일 구조 표에서 `src/contexts/`, `src/pages/services/`, `src/models/` 삭제(D-4, D-6 선행 시), `src/server/`와 `src/shared/` 추가. (b) `npm run test:db`가 DB를 필요로 하지 않는다는 사실 반영, 또는 진짜 DB 테스트를 넣기 전까지 `postgres-test` 안내를 보류 표시. (c) `scripts/deploy.sh`, `scripts/backup-postgres.sh`, `scripts/restore-postgres.sh`, `ops/release-runbook.md` 링크 추가. (d) `bid-notice`가 410 종료 페이지임을 명시.
- 검증: 수동. `README.md`에 적힌 모든 경로가 `ls`로 존재하는지 확인

**E-4. `DATABASE_TEST_URL`을 쓰거나 없앤다**
- 파일: `.env.example`, `.github/workflows/ci.yml`, `README.md` (3개) — 없애는 경우
- 내용: 리포지토리에 읽는 코드가 0줄이다. 진짜 레포지토리 테스트를 쓸 계획이 없다면 `.env.example`의 `DATABASE_TEST_URL`, `ci.yml`의 `services: postgres`와 `DATABASE_TEST_URL` env, `compose.dev.yml`의 `postgres-test` 서비스, README의 관련 설명을 모두 제거한다. 쓸 계획이면 E-5로 간다.
- 검증: `grep -rn "DATABASE_TEST_URL" . --exclude-dir=node_modules --exclude-dir=.git` → 0건

**E-5. 진짜 레포지토리 테스트를 하나 넣는다** (E-4의 대안)
- 파일: `vitest.db.config.ts`(setupFiles 추가), `tests/db/setup.ts`(신규), `tests/db/notices-lifecycle.test.ts`(신규) — 3개
- 내용: `DATABASE_TEST_URL`이 없으면 `describe.skip`으로 건너뛰고, 있으면 마이그레이션 적용 후 공지 하나를 생성 → 예약 → 게시 → 낙관적 잠금 충돌까지 검증한다. `05-02`가 핵심 결정으로 내세운 트랜잭션과 `version` 잠금이 현재 전혀 검증되지 않는다. `ci.yml`에 `npm run db:migrate`를 `npm run test:db` 앞에 추가한다.
- 검증: `DATABASE_TEST_URL= npm run test:db` (전부 skip) 와 컨테이너 기동 후 `npm run test:db` (전부 통과) 둘 다

**E-6. `integrity.ts`를 도메인 계층으로 옮긴다**
- 파일: `src/server/db/integrity.ts` → `src/server/modules/shared/content-policy.ts` (이동), import 8곳 갱신
- 주의: 임포터가 8개라 "1~3 파일" 범위를 넘는다. `HttpError` 의존을 제거하고 도메인 전용 오류 타입을 던지게 바꾸면 파장이 더 커지므로, 우선은 **위치 이동과 파일명 변경만** 수행하고 `HttpError` 결합은 별도 작업으로 남긴다.
- 검증: `npm run typecheck` + `npx vitest run tests/db/content-integrity.test.ts tests/unit/admin-draft-publication-policy.test.ts`

**E-7. `DATABASE_URL` 분기를 조립 지점으로 모은다**
- 파일: 광범위 (19곳). 우선 설계 논의부터 필요하므로 즉시 착수 대상이 아니다.
- 내용: 정적 폴백 소스와 DB 소스를 같은 인터페이스로 맞추고(C-1이 선행 조건), 페이지가 어느 소스를 받는지는 한 군데에서 결정하게 한다. `src/server/composition.ts`가 원래 이 역할을 하기로 돼 있었다(D-4에서 삭제 대상으로 잡았으므로, 이 작업을 할 계획이면 D-4에서 `composition.ts`를 제외한다).
- 검증: `grep -rn "DATABASE_URL" src/server | wc -l` → 3 이하

---

## 부록 — 실행한 검증 명령

```
git log --oneline -15
git status --short
git ls-files | wc -l                                  → 480
git ls-files .env                                      → (없음)
git ls-files docs | wc -l                              → 0
git ls-files out graphify-out tsconfig.tsbuildinfo     → (없음)
git ls-files reports                                   → reports/2026-09-07-admin-audit.md
git log --oneline -- src/server/modules/catalog/queries.ts
git log --oneline -- tests/unit/catalog/published-business-areas.test.ts
git diff src/components/industrial/IndustrialHero.jsx
npx vitest run tests/components/design-interactions.test.tsx   → 2 failed, 1 passed
npx vitest run tests/unit/catalog/published-business-areas.test.ts → 1 failed
npx eslint --print-config src/pages/index.jsx          → "rules": {}
npx prettier --check .                                 → 약 60 warn, 2 error
npx drizzle-kit check                                  → Everything's fine
find src -type f -name "*.{js,jsx,ts,tsx}" 집계        → js 14, jsx 68, ts 114, tsx 36
grep -rhoE "pgTable\(" src/server/db/schema/*.ts | wc  → 27
grep -rhoE "pgEnum\("  src/server/db/schema/*.ts | wc  → 10
스냅샷 0003 대조                                        → 테이블 27개 전부 일치
grep -rn "DATABASE_TEST_URL" src tests scripts ops .github → ci.yml 1건뿐
ls tests/e2e                                           → No such file or directory
grep -rn ": any\|as any" src --include=*.ts --include=*.tsx | wc → 0
```

## 부록 — 이 보고서가 참조한 파일

**설정**: `package.json`, `next.config.js`, `tsconfig.json`, `jsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `vitest.db.config.ts`, `playwright.config.ts`, `drizzle.config.ts`, `.gitignore`, `.env.example`, `components.json`, `compose.dev.yml`

**CI와 운영**: `.github/workflows/{ci,deploy,pages}.yml`, `scripts/{migrate.ts,migrate.cjs,deploy.sh}`, `scripts/migration/*`, `ops/pm2/ecosystem.config.cjs`

**문서**: `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/index.md`, `docs/erd.md`, `docs/planning/05-technical-design/05-01-*.md`, `05-02-*.md`, `docs/planning/00-domain-language.md`

**실패 테스트 관련**: `tests/components/design-interactions.test.tsx`, `tests/unit/catalog/published-business-areas.test.ts`, `src/components/industrial/IndustrialHero.jsx`, `src/server/modules/catalog/queries.ts`

**계층 분석**: `src/server/composition.ts`, `src/server/env.ts`, `src/server/db/integrity.ts`, `src/server/ports/mail.ts`, `src/server/infrastructure/{ses-mail,test-mail,password-reset-mail}.ts`, `src/server/modules/honors/queries.ts`, `src/server/modules/news/{query-service.js,static-source.js}`, `src/server/modules/contact/service.ts`, `src/shared/routing/useLocale.jsx`, `src/pages/{index.jsx,Home.jsx,outbound.jsx,global-programs.tsx}`, `src/pages/api/news/[id].js`

**테스트 품질**: `tests/setup.ts`, `tests/unit/tooling-config.test.ts`, `tests/components/shadcn-foundation.test.ts`, `tests/db/*.test.ts`, `tests/components/home-hero.test.tsx`
