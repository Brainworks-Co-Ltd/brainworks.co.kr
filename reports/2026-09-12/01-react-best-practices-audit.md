# react-best-practices 감사 보고서

대상: `C:\브레인웍스\brainworks.co.kr\.claude\worktrees\completeness-fixes` (`fix/completeness-audit`, e2526d9)
룰북: `vercel/0.45.1/skills/react-best-practices` (SKILL.md + AGENTS.md, 64개 규칙 8개 범주)
스택: Next.js 16.3.4 (Turbopack, **pages router**), React 19.2, Tailwind 4, i18n ko/en, `output: standalone`, `images.unoptimized`

---

## 1. 요약

### 점수: **78 / 100**

1. 재렌더링과 렌더링 범주는 거의 모범 사례다. JSX 조건부는 전부 삼항이라 `0`이 새어나올 곳이 없고, 컴포넌트 안에서 컴포넌트를 정의한 곳이 한 군데도 없으며, `useEffect` 안의 `fetch`도 없다. 관리자 폼 5종은 이미 `useState(() => ...)` 지연 초기화를 쓰고, 헤더 스크롤 리스너는 `{ passive: true }`이고, `_document.tsx`의 드러남 인라인 스크립트와 폰트 preload 태그는 문법과 대상 파일이 모두 정확하며 중복도 없다.
2. 치명 범주에서 두 건이 남아 있다. `src/pages/index.jsx`는 독립적인 서버 조회 3개를 순차로 await하고(관리자 명세 §3 위반), 모바일 메뉴가 쓰는 `@base-ui/react/dialog`가 정적 import라 **98.0kB raw / 31.6kB gz**짜리 청크가 410 스텁(`/bid-notice`)과 `/404`를 포함한 모든 공개 라우트에 실린다. 이 둘만 고치면 홈 TTFB와 전 라우트 First Load JS가 동시에 내려간다.
3. 다만 JS 수치보다 큰 문제가 따로 있다. `public/fonts/PretendardVariable.woff2`가 **1.96MB**인데 `_document.tsx`에서 preload로 승격돼 있다. 가장 무거운 라우트의 전체 JS(501.7kB raw)의 네 배다. 서브셋 결정은 글리프 범위 판단이 필요해 보류 항목으로 뺐지만, 실사용 체감에서는 아래 모든 JS 과제를 합친 것보다 크다.

### 빌드 라우트 표

Next 16 Turbopack 빌드는 Size / First Load JS 열을 더 이상 출력하지 않는다(`npm run build` 원문 확인). 아래 수치는 `.next/build-manifest.json`의 라우트별 JS 청크 목록을 디스크 실측 + gzip으로 집계한 값이다. 산출 스크립트는 `scratchpad/size.js`.

공유(`/_app`): **331.9kB raw / 103.8kB gz** (5개 파일)

| # | 라우트 | 자체 raw | 자체 gz | First Load raw | First Load gz |
|---|--------|---------|--------|---------------|--------------|
| 1 | `/education` | 196.3kB | 66.9kB | **501.7kB** | 160.3kB |
| 2 | `/` | 190.8kB | 65.2kB | **496.2kB** | 158.6kB |
| 3 | `/services` | 185.1kB | 62.8kB | **490.5kB** | 156.2kB |
| 4 | `/news` | 182.4kB | 61.4kB | **487.7kB** | 154.9kB |
| 5 | `/global-programs` | 181.1kB | 61.1kB | **486.5kB** | 154.5kB |
| 6 | `/outbound` | 181.0kB | 61.1kB | **486.4kB** | 154.5kB |
| 7 | `/about/honors` | 180.3kB | 60.8kB | **485.7kB** | 154.3kB |
| 8 | `/about/history` | 172.0kB | 58.8kB | **477.4kB** | 152.3kB |

참고로 `/404`는 162.2kB raw(467.5kB First Load), `/bid-notice/[[...slug]]`(410 응답 스텁)은 163.3kB raw(468.7kB First Load)다. 내용이 거의 없는 두 페이지가 이 무게인 이유는 둘 다 `Header`/`Footer`를 렌더하고, `Header` → `MobileNavigation` → `@/components/ui/dialog` → `@base-ui/react/dialog` 경로로 Base UI 전체가 끌려오기 때문이다.

**무게의 정체 (import 추적)**

- `static/chunks/40c35e3n6wo7z.js` = **98.0kB raw / 31.6kB gz**, 내용은 `@base-ui/react`(`TransitionStatusDataAttributes` 등 확인). 42개 라우트 **전부**에 실린다. 진입점은 `src/components/Header.jsx:5` → `src/components/public/MobileNavigation.jsx:6-12` → `src/components/ui/dialog.jsx:1`.
- `static/chunks/05r_k2yrkidui.js` = **47.0kB raw / 16.3kB gz**, `businessAreas` 식별자와 한글 문자열 포함. 역시 전 라우트. 진입점은 `Header` → `src/shared/navigation/publicNavigation.ts:3` → `src/shared/navigation/businessMegaMenu.ts:1` → `src/data/businessAreas.js`(8.3kB 원본, 양 로케일 전문).
- `lucide-react`는 barrel import(`{ ArrowRight }` 형태, 7곳)지만 Next.js 16의 기본 `optimizePackageImports` 목록에 포함된 패키지라 빌드 시 직접 import로 변환된다. 청크 안에 `lucide` 문자열이 1회만 등장하는 것으로 확인. **위반 아님**.
- `@base-ui/react`는 이미 서브패스 import(`@base-ui/react/dialog`, `@base-ui/react/button`)로 되어 있다. barrel 문제가 아니라 **정적 vs 동적** 문제다.
- 마크다운/rehype 파이프라인은 `src/lib/markdown.js`가 서버 모듈에서만 import되고 클라이언트 번들에 없다. 확인 완료.
- `motion` 계열 라이브러리 없음. 애널리틱스/로깅 서드파티 없음.

---

## 2. 규칙별 위반 목록

심각도는 룰북의 범주 우선순위(`async-` CRITICAL > `bundle-` CRITICAL > `server-` HIGH > `client-` MEDIUM-HIGH > `rerender-` MEDIUM > `rendering-` MEDIUM > `js-` LOW-MEDIUM > `advanced-` LOW)와 개별 규칙의 Impact 표기를 함께 따른다.

---

### V1. `async-parallel` — CRITICAL

**위치**: `src/pages/index.jsx:47-63`

**무엇이 잘못됐나**: 서로 의존하지 않는 서버 조회 3개를 순차로 await한다. 홈은 사이트에서 가장 많이 열리는 라우트다.

**근거**:
```js
const newsItems = (await getPublishedNewsList({ locale: currentLocale })).items;
const popupNotices = await getPublishedPopupNotices(currentLocale);
const areas = await getPublishedBusinessAreas(currentLocale);
```
세 함수 모두 `getDb()`로 독립 질의를 날린다(`src/server/modules/news/database-source.ts`, `.../popup-notices/queries.ts`, `.../catalog/queries.ts`). 관리자 명세 §3의 "독립적인 서버 조회는 병렬로 실행"에 정면으로 어긋난다. 다른 관리자 페이지 5곳(`admin/ai-solutions/index.tsx`, `admin/ai-solutions/new.tsx`, `admin/ai-solutions/[solutionId].tsx`, `admin/notices/[noticeId].tsx`, `admin/popup-notices/[popupNoticeId].tsx`)과 `pages/notices/index.tsx`는 이미 `Promise.all`을 쓰고 있어, 홈만 빠져 있다.

**최소 수정**: 세 호출을 `Promise.all`로 묶는다. (과제 T1)

---

### V2. `server-serialization` (pages router 대응: getServerSideProps props 최소화) — HIGH

**위치**: `src/pages/index.jsx:16, 55, 61`

**무엇이 잘못됐나**: `areas` prop을 서버에서 조회해 직렬화해 내려보내지만 `Home` 컴포넌트가 **전혀 쓰지 않는다**. `__NEXT_DATA__`에 통째로 실려 HTML에 박힌다.

**근거**: `export default function Home({ newsItems, popupNotices, areas })`에서 `areas`는 구조분해만 되고 JSX 어디에도 등장하지 않는다(파일 45줄 전체 확인). 홈이 렌더하는 사업영역 컴포넌트는 `DomainGrid`인데, `src/components/industrial/DomainGrid.jsx:2`에서 `businessAreas`를 **직접 import**해 쓰므로 prop이 필요 없다. 즉 DB 질의 1회 + 전체 사업영역 트리(솔루션 이미지 URL 포함) 직렬화가 순수한 낭비다. 관리자 명세 §3 "각 페이지가 실제로 쓰는 JSON 직렬화 가능 필드만 전달"에 어긋난다.

**최소 수정**: `getPublishedBusinessAreas` 호출과 `areas` prop, 구조분해를 함께 삭제한다. (과제 T1에 포함 — V1과 같은 파일 같은 블록)

---

### V3. `bundle-dynamic-imports` — CRITICAL

**위치**: `src/components/Header.jsx:5`, `src/components/public/MobileNavigation.jsx:6-12`

**무엇이 잘못됐나**: 모바일 메뉴 다이얼로그가 정적 import라, 초기 렌더에 전혀 필요 없는 Base UI 전체(98.0kB raw / 31.6kB gz)가 42개 라우트 전부의 First Load JS에 들어간다. 데스크톱 사용자는 이 코드를 **영원히** 실행하지 않는다(`Header.jsx:90`에서 `lg:hidden` 컨테이너 안에 있다).

**근거**: 빌드 매니페스트상 `static/chunks/40c35e3n6wo7z.js`가 `/404`, `/bid-notice/[[...slug]]`, `/sitemap.xml`을 제외한 전 페이지 목록에 존재. 청크 선두 바이트가 `@base-ui/react`의 transition status 상수임을 확인.

**최소 수정**: `Header.jsx`에서 `MobileNavigation`을 `next/dynamic`으로 `{ ssr: false }` 로드한다. 다이얼로그는 열리기 전엔 트리거 버튼만 보이면 되므로, 트리거를 `Header`에 남기고 패널만 분리하는 것이 이상적이지만, 최소 diff는 컴포넌트 전체를 동적 로드하고 `loading`으로 같은 크기의 버튼 자리를 채우는 것이다. (과제 T2)

---

### V4. `js-cache-function-results` — LOW-MEDIUM이나 클라이언트 핫 패스

**위치**: `src/data/businessAreas.js:214-225`, 호출부 `src/shared/navigation/businessMegaMenu.ts:32`, `src/components/Header.jsx:41`

**무엇이 잘못됐나**: `getLocalizedBusinessAreas(language)`는 정적 모듈 상수를 입력으로 받는 순수 함수이고 입력 경우의 수가 `"ko"`와 `"en"` 둘뿐인데, 호출할 때마다 사업영역 배열 전체를 중첩 `.map()`으로 새로 만든다. 그런데 이 함수가 **헤더가 리렌더될 때마다** 실행된다.

**근거**: `Header.jsx:22` `const [isHidden, setIsHidden] = useState(false)` → `Header.jsx:25-38`의 스크롤 핸들러가 `setIsHidden`을 호출 → 헤더 리렌더 → `Header.jsx:41` `buildPublicNavigation(language)` 실행 → `publicNavigation.ts:163` `buildBusinessMegaMenu(locale, ...)` → `businessMegaMenu.ts:32` `getLocalizedBusinessAreas(locale)`. 사용자가 스크롤 방향을 바꿀 때마다 8.3kB짜리 데이터 트리(영역 + 각 영역의 솔루션 배열)를 깊은 map으로 재생성한다. 서버에서도 `catalog/queries.ts:17`이 요청마다 같은 일을 한다.

룰북 7.4가 제시하는 "모듈 레벨 Map 캐시"가 정확히 이 사례다. 새 의존성 없이 2칸짜리 캐시로 끝난다.

**최소 수정**: `businessAreas.js`에 모듈 레벨 캐시 객체를 두고 로케일별로 1회만 계산한다. (과제 T3)

---

### V5. `js-cache-function-results` / `js-hoist-regexp` 계열 — LOW-MEDIUM

**위치**: `src/lib/format-date.js:7`, `src/components/notices/NoticeList.jsx:4-11`, `src/components/popup-notices/dismissal-store.ts:12`

**무엇이 잘못됐나**: 세 곳 모두 호출 시마다 `new Intl.DateTimeFormat(...)`을 생성한다. `Intl.DateTimeFormat` 생성 비용은 `.format()` 호출 비용의 수십 배다(로케일 데이터 해석). 룰북 7.9(RegExp 호이스트)와 7.4(함수 결과 캐시)가 같은 취지로 다루는 패턴이다.

**근거**:
- `format-date.js:7`은 `src/pages/news.jsx:34`의 `NewsMeta`에서 뉴스 항목마다 호출되고, 검색창(`news.jsx:265-274`)에 **글자를 칠 때마다** 전체 목록이 리렌더되므로 항목 수 x 타이핑 횟수만큼 포매터가 생성된다.
- `NoticeList.jsx:4-11`은 `src/lib/format-date.js`와 사실상 동일한 함수를 **중복 구현**한 것이다(옵션까지 같다). 공용 모듈이 이미 있는데 재구현했다.
- `dismissal-store.ts:12` `today()`는 `isDismissed`가 팝업 개수만큼 호출될 때마다(`PopupNoticeRegion.jsx:48`) `Intl.DateTimeFormat("sv-SE")`를 새로 만든다.

**최소 수정**: 포매터를 모듈 레벨 상수로 올리고(`ko`/`en` 2개), `NoticeList`는 중복 구현을 지우고 `@/lib/format-date`를 쓰게 한다. (과제 T4)

---

### V6. `server-cache-lru` (pages router 대응: 모듈 레벨 캐시) — HIGH

**위치**: `src/pages/notices/[slug].tsx:91`, `src/server/modules/news/database-source.ts:144`

**무엇이 잘못됐나**: 공지/뉴스 상세를 열 때마다 동일한 본문 마크다운에 대해 unified 파이프라인(remark-parse → gfm → breaks → rehype → sanitize → stringify)을 처음부터 다시 돌린다. 본문은 관리자가 저장할 때만 바뀌는데 요청마다 재컴파일한다.

**근거**: `src/lib/markdown.js:9-15`에서 processor 자체는 모듈 레벨에 올바르게 hoist돼 있다(`server-hoist-static-io` 준수). 하지만 `processSync` 결과는 캐시되지 않는다. `notices/[slug].tsx:91`은 `getServerSideProps` 안이므로 캐시 없이 매 요청 실행된다.

룰북 3.3은 `lru-cache` 패키지를 권하지만 **새 의존성 금지** 제약이 있으므로, 룰북 7.4가 제시하는 모듈 레벨 `Map` 패턴을 쓴다. 무한 증식을 막으려면 상한이 필요하다.

**최소 수정**: `markdown.js`에 마크다운 문자열을 키로 하는 상한 있는 `Map` 캐시를 붙인다. (과제 T5)

---

### V7. `server-cache-react` (pages router 대응: 세션 조회 중복 제거) — HIGH

**위치**: `src/pages/admin/account.tsx` (`getServerSideProps` 본문)

**무엇이 잘못됐나**: 같은 요청에서 세션을 **두 번** 가져온다.

**근거**:
```ts
const guard = await requireAdminPage(context);
if ("redirect" in guard) return guard;
const session = await requireAdmin(context.req);
```
`requireAdminPage`는 `src/server/auth/require-admin.ts:30-33`에서 내부적으로 `await requireAdmin(context.req)`를 호출한다. 그 안의 `getAuth().api.getSession(...)`은 better-auth 세션 조회(DB 왕복)다. 즉 계정 페이지 한 번 열 때 동일한 세션 질의가 2회 순차로 실행된다. 순수한 waterfall이다.

`React.cache()`는 pages router의 `getServerSideProps`에 React 요청 스코프가 없어 의미 있게 동작하지 않으므로 쓰지 않는다. 호출을 하나로 합치는 것이 정답이다.

**최소 수정**: `account.tsx`에서 `requireAdminPage` 대신 `requireAdmin`을 한 번만 호출하고 실패 시 같은 리다이렉트를 반환한다. (과제 T6)

---

### V8. `client-localstorage-schema` — MEDIUM-HIGH

**위치**: `src/components/popup-notices/dismissal-store.ts:17, 27, 31`

**무엇이 잘못됐나**: 룰북 4.4는 "`getItem()`과 `setItem()`은 시크릿 모드(Safari, Firefox), 할당량 초과, 스토리지 비활성 시 **던진다**. 항상 try-catch로 감싸라"고 명시한다. 이 파일은 `localStorage` **읽기**만 try-catch로 감쌌고, `sessionStorage` 읽기와 두 쓰기 함수는 무방비다.

**근거**:
```ts
// 17행: try 밖
if (window.sessionStorage.getItem(sessionKey(id, revision)) === "1") return true;
// 27행
if (typeof window !== "undefined") window.sessionStorage.setItem(sessionKey(id, revision), "1");
// 31행
if (typeof window !== "undefined") window.localStorage.setItem(dayKey(id), JSON.stringify(...));
```
17행이 던지면 `PopupNoticeRegion.jsx:44-52`의 effect 전체가 죽어 팝업 상태가 영영 `null`에 머문다(팝업이 안 뜬다). 27/31행이 던지면 "오늘 하루 보지 않기" 클릭 핸들러가 죽어 팝업이 닫히지 않는다. 후자가 더 나쁘다.

버전 관리(키에 `:${revision}` 포함)와 최소 필드 저장은 이미 규칙을 지키고 있다. 예외 처리만 빠졌다.

**최소 수정**: 세 지점을 try-catch로 감싼다(읽기는 `false` 반환, 쓰기는 무시). (과제 T7)

---

### V9. `rerender-derived-state-no-effect` — MEDIUM

**위치**: `src/components/services/BusinessAreaExplorer.jsx:18, 21-26`

**무엇이 잘못됐나**: URL 쿼리(`?area=`)에서 계산 가능한 값을 `useState`에 담고 `useEffect`로 동기화한다. 룰북 5.1이 "props/state로 계산 가능하면 state에 담지도, effect로 갱신하지도 말라"고 직접 금지하는 형태다. 결과적으로 쿼리 변경 시 렌더가 한 번 더 돈다.

**근거**:
```js
const [activeId, setActiveId] = useState(queryArea || areas[0]?.id || "");
useEffect(() => {
  const nextId = areas.some((area) => area.id === queryArea) ? queryArea : areas[0]?.id || "";
  setActiveId(nextId);
}, [areas, queryArea]);
```
`selectArea`(30-37행)가 `router.replace({ query: { area: id } }, { shallow: true })`로 URL을 갱신하므로 URL이 이미 단일 진실 원천이다. state는 그 복제본이다.

**최소 수정**: `activeId`를 렌더 중 계산으로 바꾸고 state와 effect를 삭제한다. `selectArea`는 `router.replace`만 남긴다. (과제 T8 — 회귀 위험이 있어 검증 절차를 명시함)

---

### V10. `client-event-listeners` / `advanced-event-handler-refs` — MEDIUM

**위치**: `src/components/public/DesktopNavigation.jsx:43-66`

**무엇이 잘못됐나**: `document`의 `keydown`과 `pointerdown` 리스너를 `openGroup`이 바뀔 때마다 해제하고 다시 등록한다. 메가메뉴를 열고 닫을 때마다 리스너 4회 조작이 일어난다. 룰북 8.2가 다루는 "콜백이 바뀐다고 재구독하지 말라"의 사례다.

**근거**: 의존성 배열이 `[openGroup]`인데, effect 본문이 `openGroup`을 쓰는 곳은 `closeOnEscape`의 가드(`!openGroup`)와 `previous` 캡처뿐이다. `openGroup`을 ref에 담거나 `useEffectEvent`(React 19.2에서 사용 가능)로 감싸면 구독은 `[]`로 고정된다.

부수 항목: `pointerdown`은 `preventDefault()`를 부르지 않으므로 `{ passive: true }`를 붙일 수 있다(룰북 4.2). `Header.jsx:36`과 `StatementBand.jsx:69`는 이미 붙어 있어 이 파일만 빠졌다.

**최소 수정**: `openGroup`을 ref로 미러링해 effect 의존성을 `[]`로 만들고, `pointerdown`에 `{ passive: true }`를 추가한다. (과제 T9)

---

### V11. `js-early-exit` / `js-combine-iterations` — LOW-MEDIUM

**위치**: `src/pages/news.jsx:187-224`

**무엇이 잘못됐나**: 검색어가 비어 있어도(초기 상태이자 대부분의 시간) 항목마다 `translate().toLowerCase()`를 **6회** 무조건 실행한다. 검색어가 없으면 그중 4개(제목 ko/en, 요약 ko/en)는 결과에 아무 영향이 없다.

**근거**:
```js
const titleKo = translate(item.title, "ko").toLowerCase();
// ... 6개 전부 계산 ...
const matchesQuery = !query || titleKo.includes(query) || ...;
```
`!query`가 참이면 앞의 6줄이 전부 헛일이다. 이 memo는 `searchQuery`가 의존성이라 **타이핑 한 글자마다** 전체 목록을 다시 돈다.

**최소 수정**: `query`가 빈 문자열이면 제목/요약 계산을 건너뛰고, 분류 필터에 필요한 `categoryKo`/`categoryEn`만 계산한다. (과제 T10)

---

### V12. `js-min-max-loop` / `js-set-map-lookups` / `js-combine-iterations` — LOW-MEDIUM

**위치**: `src/server/modules/admin/dashboard.ts:88-92, 105-112, 121-127, 143`

**무엇이 잘못됐나**: 관리자 대시보드 집계에 교과서적 비효율이 네 종류 겹쳐 있다.

**근거**:
1. `:127`과 `:143` — `.sort((a, b) => toTime(b.localeUpdatedAt) - toTime(a.localeUpdatedAt))` 다음에 `.slice(0, 8)`. `toTime`(`:68`)은 문자열이면 `new Date(value)`를 **비교마다** 생성한다. 정렬 비교는 O(n log n)회이므로 `Date` 객체가 2 x O(n log n)개 만들어진다. 게다가 필요한 건 상위 8개뿐이다(룰북 7.11).
2. `:92` — `rows.filter(row => row.contentType === contentType)`가 `dashboardContentTypes.map` 안에 있어 rows를 4회 완주한다(룰북 7.6).
3. `:105-112` — `[...itemStatuses.values()].filter(...).length`를 ACTIVE/ARCHIVED로 **두 번** 돌려 중간 배열을 두 개 만든다(룰북 7.6).
4. `:90-93`(attention 필터) — `["DRAFT", "HIDDEN", "UNPUBLISHED"].includes(...)`가 행마다 배열 리터럴을 새로 할당하고 선형 탐색한다. 모듈 레벨 `Set`이면 끝난다(룰북 7.12).

솔직한 평가: 현재 데이터 규모(콘텐츠 x 로케일 행 수백 건 수준)에서는 체감 차이가 없다. 한 파일에서 끝나는 저위험 정리라 목록에 넣되 우선순위는 마지막이다.

**최소 수정**: 날짜를 미리 한 번만 계산해 붙이고(decorate), 상위 8개는 부분 선택으로, 상태 집합은 모듈 레벨 `Set`으로, 두 카운트는 단일 루프로 합친다. (과제 T11)

---

### V13. `js-index-maps` / `js-combine-iterations` — LOW

**위치**: `src/server/modules/catalog/queries.ts:48-58`, `src/server/modules/honors/queries.ts:40-41`

**무엇이 잘못됐나**:
- `catalog/queries.ts`: `areas.map()` 안에서 `rows.filter(...)`를 돌려 O(영역 수 x 솔루션 행 수)다. `businessAreaKey`로 Map을 한 번 만들면 O(n)이다(룰북 7.2).
- `honors/queries.ts:40-41`: 같은 `rows` 배열을 `AWARD`/`CERTIFICATION`으로 두 번 `.filter().map()` 한다. 한 루프로 합칠 수 있다(룰북 7.6).

**근거**: 실측 규모가 영역 4개 x 솔루션 수십 건, 수상 3건 + 인증 4건(`src/utils/awardsData.js`, `certificationsData.js`)이라 효과는 측정 불가 수준이다. 규칙 위반이므로 기록만 하고 과제로 올리지 않는다.

**최소 수정**: 있으나 권장하지 않음. 현행 코드가 더 읽기 쉽다.

---

### V14. `rerender-use-ref-transient-values` — MEDIUM (죽은 코드)

**위치**: `src/components/home/BusinessAreaCarousel.jsx:20, 23-26, 39-47`

**무엇이 잘못됐나**: 100ms `setInterval`마다 `setElapsed`를 호출해 컴포넌트 트리 전체를 **초당 10회** 무한 리렌더한다. 목적은 진행 막대 폭 하나를 바꾸는 것뿐이고, 같은 값이 이미 `elapsedRef`에 들어 있다. 룰북 5.15의 정확한 반례다.

**근거**: `updateElapsed`(23-26행)가 ref와 state를 동시에 쓰므로 ref만으로 충분함이 코드에 드러나 있다. `ProgressTrack`(`src/components/ui/progress-track.jsx:24`)은 인라인 `style={{ width }}`만 바꾼다.

**단, 이 컴포넌트는 어디에서도 import되지 않는다.** 고아 모듈 검사 결과 미사용 확인. 현재 번들에 실리지 않으므로 성능 영향이 0이다. 고치지 말고 **지우는 쪽**이 맞다(과제 T12).

같은 검사에서 확인된 다른 고아 모듈: `src/components/notices/NoticeAttachments.jsx`, `src/components/public/ActionLink.jsx`, `src/components/ui/card.jsx`, `src/data/popups.js`, `src/data/translations.js`.

---

### 점검했고 위반이 없는 규칙 (커버리지)

| 규칙 | 판정 | 근거 |
|------|------|------|
| `async-defer-await` | 통과 | `requireAdminPage` 계열은 전부 가드 실패 시 조기 반환 후 데이터 조회. `notices/[slug].tsx`도 `notFound`/`redirect` 분기를 마크다운 컴파일보다 앞에 둠 |
| `async-api-routes` | 통과 | `src/pages/api/**` 전수 확인. 순차 await은 전부 실제 의존 관계(`requireAdmin` → `ensureAdminActor` → `create*`). 병렬화 가능한 독립 await 없음 |
| `async-dependencies` | 통과 | 부분 의존 체인이 존재하지 않음 |
| `bundle-barrel-imports` | 통과 | `lucide-react`는 Next 16 기본 `optimizePackageImports` 대상. `@base-ui/react`는 이미 서브패스 import. `lodash`/`date-fns`/`react-icons` 등 미사용 |
| `bundle-conditional` | 통과 | 조건부로만 쓰이는 대용량 데이터 모듈 없음 |
| `bundle-defer-third-party` | 통과 | 애널리틱스/로깅/에러 트래킹 서드파티 자체가 없음 |
| `bundle-preload` | 통과(해당 없음에 가까움) | 동적 import가 없으므로 preload 대상도 없음. T2 적용 후 재검토 대상 |
| `server-hoist-static-io` | 통과 | `src/lib/markdown.js:9`에서 unified processor를 모듈 레벨에 생성. 요청마다 재조립하지 않음 |
| `server-parallel-fetching` | 통과 | 관리자 GSSP 5곳 + `notices/index.tsx`가 `Promise.all` 사용 중. 누락은 V1 하나 |
| `client-swr-dedup` | 통과 | `useEffect` 안의 `fetch`가 **0건**. 모든 데이터가 `getServerSideProps` 경유. SWR 없이도 중복 요청 문제가 성립하지 않음 |
| `client-passive-event-listeners` | 부분 통과 | `Header.jsx:36`, `StatementBand.jsx:69` 모두 `{ passive: true }`. `DesktopNavigation.jsx:60`만 누락(V10에 포함) |
| `rerender-lazy-state-init` | 통과 | 관리자 폼 5종 전부 `useState(() => JSON.stringify(initial))` 함수형 초기화 사용 |
| `rerender-no-inline-components` | 통과 | 컴포넌트 내부 컴포넌트 정의 0건(전수 grep) |
| `rerender-simple-expression-in-memo` | 통과 | `useMemo` 4곳 전부 배열/객체 반환. 원시값을 감싼 곳 없음 |
| `rerender-functional-setstate` | 통과 | `IndustrialHero.jsx:88`, `BusinessAreaCarousel.jsx:42`, `MobileNavigation.jsx:71` 모두 함수형. `PopupNoticeRegion.jsx:60`만 직접 참조지만 같은 핸들러 안에서 즉시 읽은 최신값이라 안전 |
| `rerender-memo`, `rerender-memo-with-default-value` | 통과 | `memo()` 사용처 자체가 없고, 필요할 만큼 비싼 렌더 트리도 없음 |
| `rerender-dependencies` | 통과에 가까움 | `useUnsavedChanges.ts:68`의 `[dirty, router]`가 객체 의존성이나, pages router의 `router`는 라우트 전환 시에만 교체되고 재구독 비용이 리스너 2개 등록이라 실익 없음 |
| `rerender-split-combined-hooks` | 통과 | 서로 다른 의존성을 한 훅에 묶은 곳 없음. `IndustrialHero`의 `usePauseCauses`/`useTypedSlot`은 이미 분리돼 있음 |
| `rerender-move-effect-to-event` | 통과 | 이벤트를 state + effect로 모델링한 곳 없음 |
| `rendering-conditional-render` | 통과 | JSX 내 `&&` 조건부 렌더 **0건**. 전부 삼항 + `null`. `0`이나 `NaN`이 새어나올 경로 없음 |
| `rendering-hydration-no-flicker` | 통과 | `_document.tsx:33-37`의 인라인 스크립트가 `documentElement.dataset.reveal`을 첫 페인트 전에 설정. `_app.jsx:21-23`의 훅이 같은 값을 reflow 후 `"ready"`로 승격하는 2단계 구성도 의도대로 동작(주석에 이유 명시). `data-design="industrial"`도 서버에서 부착해 흰 화면 번쩍임 방지 |
| `rendering-script-defer-async` | 통과 | 외부 `<script src>` 0건. `_document.tsx`의 유일한 스크립트는 의도적 동기 인라인(위 패턴의 전제) |
| `rendering-resource-hints` | 태그는 통과, 크기는 보류 | `_document.tsx:25-31` 폰트 preload가 `as="font" type="font/woff2" crossOrigin="anonymous"`로 정확하고, 대상이 `globals.css:6`의 `@font-face src`와 **동일 파일**이며, 저장소 전체에 preload/preconnect가 이 한 건뿐(중복 없음). 외부 CDN/폰트 호스트가 없어 preconnect 대상도 없음. 다만 파일 크기 1.96MB는 보류 B1 참조 |
| `rendering-hoist-jsx` | 통과 | 매 렌더 재생성되는 대형 정적 JSX 없음. 인라인 SVG는 `news.jsx:252` 검색 아이콘과 `GlobalNetwork.jsx` 둘뿐이고 둘 다 작음 |
| `rendering-svg-precision` | 통과 | SVG 2건, 좌표가 이미 정수 수준(`M21 21l-4.35-4.35...`) |
| `rendering-animate-svg-wrapper` | 통과 | SVG 요소에 직접 애니메이션을 건 곳 없음. `Clients.jsx:48`의 `animate-scroll`은 `div` 래퍼 |
| `rendering-usetransition-loading` | 통과 | 폼 제출 로딩은 `useState`지만 `await fetch` 기반 명시적 상태라 `useTransition`이 더 낫다고 단정할 수 없음. 룰북 6.11도 Impact LOW |
| `rendering-content-visibility` | 통과(대상 없음) | 후보였던 목록들의 실제 길이를 확인: 공지는 `pageSize` 기본 12 상한 50(`notices/queries.ts:51`), 수상 3건 + 인증 4건(`awardsData.js`, `certificationsData.js`), 뉴스 아카이브도 유사 규모. 룰북 6.2의 전제(수백~수천 항목)에 해당하지 않음. 보류 B3 참조 |
| `js-tosorted-immutable` | 통과 | `.sort()` 6곳 전부 직전에 `.map()`/`.filter()`/`[...]`/`Array.from()`으로 만든 새 배열에 적용. props나 state를 변형하는 곳 없음 |
| `js-batch-dom-css` | 통과 | `StatementBand.jsx:39-52`가 rAF 안에서 `getBoundingClientRect()`를 **먼저 전부 모으고**(41행) 그 다음 `style.opacity`를 일괄 기록(50행). 레이아웃 스래싱 회피가 정확히 구현돼 있음 |
| `js-length-check-first` | 통과 | 배열 비교 전 길이 체크가 필요한 지점 없음 |
| `js-flatmap-filter` | 통과 | `.map().filter(Boolean)` 패턴은 `src/lib/news.js:96-110` 한 곳뿐이고 DB 미사용 폴백 경로 |
| `js-cache-property-access` | 통과 | 속성 접근이 병목인 핫 루프 없음(V12의 `toTime`은 함수 호출 문제로 분류) |
| `advanced-use-latest` | 통과 | `useUnsavedChanges.ts:14-15`가 `dirtyRef.current = dirty`를 렌더마다 갱신하는 useLatest 패턴을 정확히 구현. 주석(12-13행)이 "구독 시점 클로저가 아닌 최신 dirty를 보게 한다"는 의도까지 명시. 룰북 8.3 준수 |
| `advanced-init-once` | 통과 | `_app.jsx`의 `useReveal`은 앱 1회 초기화가 아니라 라우트마다 재무장이 **의도**인 효과다(`routeChangeComplete` 구독). 모듈 레벨 가드가 오히려 틀림 |

---

## 3. 해당 없음 (N/A)

| 규칙 | 사유 |
|------|------|
| `server-auth-actions` | Server Actions가 없다(pages router). 대응 개념인 API 라우트 인증은 `src/pages/api/admin/**` 전 경로가 핸들러 첫 줄에서 `requireAdmin(request)`를 호출하며, 이 함수가 `assertSameOrigin` + 세션 + `isActiveAdmin`을 모두 검사한다. 대응 규칙 기준으로는 통과 |
| `server-dedup-props` | RSC 직렬화 참조 중복 제거가 전제인데 RSC가 없다. pages router의 `__NEXT_DATA__`는 참조 기반 중복 제거를 하지 않으므로 규칙 자체가 성립하지 않는다. 대응 개념(불필요한 prop 전달)은 V2로 별도 보고 |
| `server-serialization` (RSC 경계 의미) | RSC 경계가 없다. pages router 대응(`getServerSideProps` props 최소화)으로 매핑해 V2에서 다뤘다 |
| `server-after-nonblocking` | `after()`는 app router API다. pages router API 라우트에서 응답 후 작업을 안전하게 스케줄할 1급 수단이 없고, 현재 응답을 막는 부수 로깅도 없다 |
| `async-suspense-boundaries` | 스트리밍 SSR과 async 서버 컴포넌트가 pages router에 없다. `getServerSideProps`는 전부 해결된 뒤 HTML을 보낸다 |
| `rendering-activity` | React `<Activity>`는 전환 시 상태 보존이 필요한 비싼 컴포넌트용이다. 후보였던 모바일 메뉴는 상태가 `openGroup` 하나뿐이고, 오히려 T2에서 동적 로드로 떼어낼 대상이라 방향이 반대다 |
| `rendering-hydration-suppress-warning` | 서버/클라이언트가 의도적으로 다른 값(랜덤 ID, 현재 시각)을 렌더하는 곳이 없다. 날짜는 전부 서버에서 문자열로 직렬화돼 내려온다 |
| `client-swr-dedup` (SWR 도입) | SWR 미설치이며 도입 금지 제약. 위 표에 적었듯 클라이언트 fetch 자체가 0건이라 도입 동기도 없다 |
| `rerender-defer-reads` | `useSearchParams` 같은 구독형 훅을 콜백 전용으로 쓰는 곳이 없다 |
| `rerender-derived-state` (연속값 구독) | 픽셀 단위 연속값을 구독하는 곳이 없다. `Header`는 이미 `isHidden` 불리언으로 좁혀 구독한다 |
| `rerender-transitions` / `rerender-use-deferred-value` | 적용 후보는 `news.jsx` 검색 필터 하나인데 항목 수가 작아 현 시점 근거가 없다. 보류 B2 참조 |
| `js-cache-storage` | 스토리지 읽기가 팝업 마운트 시 공지 수만큼(최대 3회) 발생할 뿐 반복 호출 경로가 아니다. 캐시를 넣으면 다른 탭 변경 무효화 처리가 따라붙어 순증이다 |

---

## 4. 권장 수정 순서

각 항목은 독립적으로 배정 가능하다. 순서는 룰북 우선순위 → 측정 가능한 효과 순.

공통 검증 기준선: `npm test`, `npm run lint`, `npm run build`가 모두 통과해야 한다(현재 통과 상태).
번들 수치 재측정: `node scratchpad/size.js`(빌드 후 실행, `.next/build-manifest.json` 기반).

---

### T1. 홈 getServerSideProps 병렬화 + 미사용 prop 제거
**규칙**: `async-parallel` (CRITICAL), `server-serialization` (HIGH) — V1, V2
**파일**: `src/pages/index.jsx` (1개)

**정확한 변경**:
1. `getServerSideProps`(47-63행)의 순차 await 3개 중, `getPublishedBusinessAreas` 호출을 **삭제**한다(결과가 쓰이지 않음).
2. 남은 두 호출을 `Promise.all`로 묶는다:
   ```js
   const [newsList, popupNotices] = await Promise.all([
     getPublishedNewsList({ locale: currentLocale }),
     getPublishedPopupNotices(currentLocale),
   ]);
   return { props: { newsItems: newsList.items, popupNotices } };
   ```
3. 14행의 `getPublishedBusinessAreas` import를 제거한다.
4. 16행 컴포넌트 시그니처에서 `areas`를 제거한다.

**검증**: `npm run build` 통과 + 홈(`/`, `/en`)을 열어 뉴스 목록과 팝업이 그대로 나오는지 확인. `curl -s localhost:3000/ | grep -c businessArea`로 `__NEXT_DATA__`에서 사업영역 트리가 사라졌는지 확인.

**기대 효과**: 홈 TTFB에서 DB 왕복 3회 직렬 → 2회 병렬. 왕복 1회를 15ms로 잡으면 약 45ms → 15ms. 더해 `__NEXT_DATA__`에서 사업영역 전체 트리(영역 4개 x 솔루션 + 이미지 URL, 직렬화 기준 수 KB)가 HTML에서 빠진다.

---

### T2. 모바일 메뉴 동적 로드 — Base UI를 전 라우트에서 분리
**규칙**: `bundle-dynamic-imports` (CRITICAL) — V3
**파일**: `src/components/Header.jsx` (1개)

**정확한 변경**:
1. `Header.jsx:5`의 정적 import를 제거하고 `next/dynamic`으로 교체한다:
   ```js
   import dynamic from "next/dynamic";
   const MobileNavigation = dynamic(
     () => import("@/components/public/MobileNavigation").then((m) => m.MobileNavigation),
     { ssr: false, loading: () => <div className="h-10 w-10" aria-hidden="true" /> },
   );
   ```
2. `loading` 자리표시자의 크기는 `ui/button.jsx:23`의 `size: "icon"`(`h-10 w-10`)과 맞춰 레이아웃 시프트를 막는다.
3. 사용처(90-104행)는 그대로 둔다.

**주의**: `ssr: false`이므로 모바일 메뉴 버튼은 하이드레이션 후 나타난다. 컨테이너가 `lg:hidden`이라 데스크톱에는 영향이 없고, 모바일에서는 자리표시자가 공간을 유지한다. `PopupNoticeRegion`도 같은 다이얼로그를 쓰지만 홈에서만 쓰이므로 청크는 홈에만 남는다.

**검증**: `npm run build` 후 `node scratchpad/size.js`. `40c35e3n6wo7z` 계열(Base UI) 청크가 `/404`, `/bid-notice/[[...slug]]`, `/about/*`, `/education`, `/news` 등의 라우트 목록에서 사라지고 `/` 와 `/contact`(Button 직접 사용)에만 남아야 한다. 브라우저에서 뷰포트를 375px로 줄여 햄버거 메뉴를 열고 닫는 동작, 하위 그룹 펼침, 언어 전환 버튼을 확인.

**기대 효과**: `/education` First Load JS **501.7kB raw / 160.3kB gz → 약 404kB raw / 129kB gz**. `/404`는 467.5kB → 약 370kB. 정적 프리렌더 라우트 9개를 포함한 전 공개 라우트에 동일하게 **-98.0kB raw / -31.6kB gz** 적용.

---

### T3. 사업영역 로케일 변환 캐시
**규칙**: `js-cache-function-results` (LOW-MEDIUM, 단 클라이언트 핫 패스) — V4
**파일**: `src/data/businessAreas.js` (1개)

**정확한 변경**: 214-225행의 `getLocalizedBusinessAreas`를 모듈 레벨 캐시로 감싼다.
```js
const localizedCache = {};
export const getLocalizedBusinessAreas = (language) =>
  (localizedCache[language] ??= businessAreas.map((area) => ({ /* 기존 본문 그대로 */ })));
```
데이터가 정적 모듈 상수이고 결과를 어디서도 변형하지 않으므로 캐시 공유가 안전하다. 입력 경우의 수는 `"ko"`, `"en"` 둘뿐이라 상한도 필요 없다.

**검증**: `npm test` 통과. 홈과 `/services`에서 언어를 전환해 메가메뉴와 사업영역 탭의 문구가 모두 바뀌는지 확인(캐시 키가 로케일별로 분리됐는지 검증하는 지점).

**기대 효과**: 스크롤 방향이 바뀔 때마다 일어나던 8.3kB 데이터 트리 깊은 map이 로케일당 1회로 줄어든다. 서버 측에서도 `catalog/queries.ts:17`의 요청당 재계산이 사라진다.

---

### T4. 날짜 포매터 호이스트 + 중복 구현 제거
**규칙**: `js-cache-function-results` (LOW-MEDIUM) — V5
**파일**: `src/lib/format-date.js`, `src/components/notices/NoticeList.jsx`, `src/components/popup-notices/dismissal-store.ts` (3개)

**정확한 변경**:
1. `format-date.js`: `ko-KR`/`en-US` 두 `Intl.DateTimeFormat` 인스턴스를 모듈 레벨 상수로 올리고 `formatDate`는 선택만 한다. 옵션(`year: numeric`, `month: short`, `day: 2-digit`)과 반환 규약(빈 값 → `''`, 파싱 실패 → 원본 문자열)은 그대로 유지한다.
2. `NoticeList.jsx`: 4-11행의 지역 `formatDate`를 **삭제**하고 `import { formatDate } from "@/lib/format-date";`로 대체한다. 호출부(54행)는 인자 순서가 같아 수정 불필요. 단, 공용 함수는 빈 값에 `''`를 반환하고 파싱 실패 시 원본을 반환하므로 기존과 동작이 같은지 한 번 확인한다.
3. `dismissal-store.ts`: 11-13행 `today()`의 `new Intl.DateTimeFormat("sv-SE")`를 모듈 레벨 상수로 올린다.

**검증**: `npm test` 통과. `/notices`와 `/news`에서 날짜 표기가 ko/en 양쪽 모두 이전과 동일한지 눈으로 확인.

**기대 효과**: 뉴스 검색창 타이핑 시 항목 수만큼 일어나던 `Intl.DateTimeFormat` 생성이 0이 된다. 중복 구현 파일 하나 감소.

---

### T5. 마크다운 컴파일 결과 캐시
**규칙**: `server-cache-lru` (HIGH, 모듈 레벨 Map으로 대체 구현) — V6
**파일**: `src/lib/markdown.js` (1개)

**정확한 변경**: `markdownToHtml`에 상한 있는 모듈 레벨 `Map` 캐시를 붙인다.
```js
// ponytail: 상한 200개 단순 FIFO. 본문이 그보다 많아지면 LRU로 올릴 것.
const cache = new Map();
const MAX = 200;

export function markdownToHtml(markdown) {
  if (!markdown) return "";
  const hit = cache.get(markdown);
  if (hit !== undefined) return hit;
  const trimmed = markdown.charCodeAt(0) === 0xfeff ? markdown.slice(1) : markdown;
  const html = processor.processSync(trimmed).toString().trim();
  if (cache.size >= MAX) cache.delete(cache.keys().next().value);
  cache.set(markdown, html);
  return html;
}
```
키가 본문 원문이므로 관리자가 본문을 고치면 키가 달라져 자동으로 무효화된다. 별도 무효화 경로가 필요 없다.

**검증**: 이 로직은 분기 + 루프이므로 룰북 외에도 확인이 필요하다. 기존 마크다운 테스트가 있으면 `npm test`로 충분하고, 없으면 같은 입력 두 번 호출이 동일 문자열을 반환하는지와 상한 초과 시 크기가 `MAX`를 넘지 않는지 검사하는 `assert` 한 쌍을 추가한다. 이후 `/notices/<번호>`를 두 번 열어 렌더 결과가 같은지 확인.

**기대 효과**: 공지/뉴스 상세 재방문 시 unified 파이프라인 6단계 실행이 사라진다. 본문 수 KB 기준 요청당 약 1~5ms의 서버 CPU 절감. 상한 200개면 메모리는 수백 KB 수준.

---

### T6. 관리자 계정 페이지 세션 이중 조회 제거
**규칙**: `server-cache-react` 대응 (HIGH) — V7
**파일**: `src/pages/admin/account.tsx` (1개)

**정확한 변경**: `getServerSideProps`에서 `requireAdminPage` + `requireAdmin` 두 호출을 `requireAdmin` 한 번으로 합친다.
```ts
export async function getServerSideProps(context: GetServerSidePropsContext) {
  let session;
  try {
    session = await requireAdmin(context.req);
  } catch {
    const returnTo = normalizeReturnTo(context.resolvedUrl);
    return { redirect: { destination: `/admin/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`, permanent: false } };
  }
  const user = session.user as typeof session.user & { role?: string; accountStatus?: string };
  return { props: { account: { /* 기존과 동일 */ } } };
}
```
`normalizeReturnTo`는 `@/server/auth/policy`에서 import한다(`require-admin.ts:5`와 동일 경로). 리다이렉트 문자열은 `require-admin.ts:35-41`과 한 글자도 다르지 않게 유지한다.

**대안(더 나은 방향, 다만 범위가 커짐)**: `requireAdminPage`가 세션을 함께 돌려주도록 바꾸는 것이 근본 해결이지만, `src/pages/admin/news/new.tsx:`의 `export const getServerSideProps = requireAdminPage`처럼 반환값을 그대로 GSSP 결과로 쓰는 곳이 있어 키를 추가하면 Next가 거부한다. 이번 과제에서는 호출부 한 곳만 고친다.

**검증**: 로그아웃 상태로 `/admin/account`에 접근 → 기존과 동일한 `returnTo` 쿼리로 로그인 페이지 리다이렉트. 로그인 상태로 접근 → 이름/이메일/역할/상태가 그대로 표시. `npm test` 통과.

**기대 효과**: 계정 페이지 요청당 better-auth 세션 조회(DB 왕복) 2회 → 1회. 순차였으므로 왕복 1회분 지연 제거.

---

### T7. 팝업 제외 기록 스토리지 예외 처리
**규칙**: `client-localstorage-schema` (MEDIUM-HIGH) — V8
**파일**: `src/components/popup-notices/dismissal-store.ts` (1개)

**정확한 변경**:
1. `isDismissed`(15-24행): 17행의 `sessionStorage.getItem`을 아래 `localStorage` 읽기와 **같은 try 블록 안으로** 옮긴다. catch는 기존대로 `false` 반환.
2. `dismissForSession`(26-28행), `dismissForDay`(30-32행): 각각 try-catch로 감싸고 catch는 빈 블록(기록 실패는 무시하고 닫기 동작은 계속되어야 한다).

**검증**: 이 파일은 분기가 있는 로직이므로 확인을 남긴다. 기존 팝업 테스트가 있으면 `npm test`, 없으면 `window.sessionStorage`가 던지도록 스텁한 상태에서 `isDismissed`가 `false`를 반환하고 `dismissForDay`가 던지지 않는지 검사하는 `assert` 두 줄을 추가한다. 브라우저 시크릿 모드(Safari)에서 홈을 열어 팝업이 뜨고 "오늘 하루 보지 않기"가 화면을 닫는지 확인.

**기대 효과**: 시크릿 모드/스토리지 차단 환경에서 팝업이 아예 안 뜨거나 닫기 버튼이 먹통이 되는 버그 제거. 성능이 아니라 견고성 항목이다.

---

### T8. 사업영역 탐색기 파생 상태 제거
**규칙**: `rerender-derived-state-no-effect` (MEDIUM) — V9
**파일**: `src/components/services/BusinessAreaExplorer.jsx` (1개)

**정확한 변경**:
1. 18행 `useState`와 21-26행 `useEffect`를 삭제한다.
2. 렌더 중 계산으로 대체한다:
   ```js
   const activeId = areas.some((area) => area.id === queryArea)
     ? queryArea
     : areas[0]?.id || "";
   ```
3. `selectArea`(30-37행)에서 `setActiveId(id)` 호출을 제거하고 `router.replace`만 남긴다.
4. `useState`, `useEffect` import가 다른 곳에서 쓰이지 않으면 1행 import에서 제거한다.

**위험과 확인 사항**: `router.replace`가 `shallow: true`라도 즉시 동기 반영되지 않으므로 탭 하이라이트가 한 틱 늦을 수 있다. **이 지연이 체감되는지 반드시 손으로 확인**하고, 체감된다면 이 과제를 되돌리고 보류로 옮긴다. 되돌리기 비용이 낮으므로(한 파일, 한 커밋) 먼저 시도해 보는 편이 낫다.

**검증**: `/services`에서 탭을 클릭할 때 (a) 하이라이트가 지연 없이 바뀌는지, (b) 주소창의 `?area=`가 갱신되는지, (c) `?area=<유효한 id>`로 직접 접근 시 해당 탭이 선택되는지, (d) `?area=없는값`으로 접근 시 첫 탭으로 떨어지는지 네 가지를 모두 확인. 메가메뉴에서 `?area=...#business-areas` 링크를 타고 들어오는 경로(`businessMegaMenu.ts:48`)도 함께 확인. `npm test` 통과.

**기대 효과**: 쿼리 변경 시 렌더 2회 → 1회. state 하나와 effect 하나 삭제(코드 6줄 감소).

---

### T9. 데스크톱 내비게이션 리스너 재구독 제거
**규칙**: `advanced-event-handler-refs` (LOW), `client-passive-event-listeners` (MEDIUM) — V10
**파일**: `src/components/public/DesktopNavigation.jsx` (1개)

**정확한 변경**:
1. `openGroup`을 ref로 미러링한다: `const openGroupRef = useRef(null); openGroupRef.current = openGroup;`
2. 43-66행 effect 본문에서 `openGroup` 참조를 `openGroupRef.current`로 바꾸고 의존성 배열을 `[openGroup]` → `[]`로 바꾼다.
3. 60행에 `{ passive: true }`를 추가한다: `document.addEventListener("pointerdown", closeOnPointerDown, { passive: true });` (`closeOnPointerDown`은 `preventDefault()`를 호출하지 않으므로 안전하다. 제거 시에는 옵션 인자가 필요 없다.)

**검증**: `/`에서 데스크톱 폭(1280px)으로 (a) 메가메뉴 hover 열기, (b) Escape로 닫으면서 트리거 버튼에 초점이 되돌아오는지, (c) 메뉴 밖 클릭으로 닫히는지 확인. `npm test`, `npm run lint`(exhaustive-deps 경고가 새로 뜨지 않는지) 통과.

**기대 효과**: 메뉴 열고 닫을 때마다 일어나던 `document` 리스너 4회 조작 제거. 스크롤 중 포인터 이벤트 처리 지연 요인 하나 제거.

---

### T10. 뉴스 필터 조기 종료
**규칙**: `js-early-exit` (LOW-MEDIUM) — V11
**파일**: `src/pages/news.jsx` (1개)

**정확한 변경**: 187-224행 `filteredItems` memo 안에서, `query`가 빈 문자열일 때 제목/요약 4개의 `translate().toLowerCase()`를 건너뛴다.
```js
return newsItems.filter((item) => {
  const categoryKo = translate(item.category, "ko").toLowerCase();
  const categoryEn = translate(item.category, "en").toLowerCase();

  if (query) {
    const matches =
      translate(item.title, "ko").toLowerCase().includes(query) ||
      translate(item.title, "en").toLowerCase().includes(query) ||
      translate(item.summary, "ko").toLowerCase().includes(query) ||
      translate(item.summary, "en").toLowerCase().includes(query) ||
      categoryKo.includes(query) ||
      categoryEn.includes(query);
    if (!matches) return false;
  }

  if (activeFilter === "all") return true;
  const keywords = FILTER_KEYWORDS[activeFilter] || [];
  if (keywords.length === 0) return true;
  return [categoryKo, categoryEn].some((value) =>
    keywords.some((keyword) => value.includes(keyword.toLowerCase())),
  );
});
```
`||` 단락 평가 덕분에 검색어가 있을 때도 제목에서 맞으면 요약 계산을 건너뛴다.

**검증**: `/news`에서 (a) 검색어 없이 분류 탭 전환이 이전과 같은 결과를 내는지, (b) 검색어가 제목/요약/분류 각각에 걸릴 때 매칭되는지 확인. `npm test` 통과.

**기대 효과**: 검색어 미입력 상태(기본)에서 항목당 문자열 연산 6회 → 2회. 항목 수가 작아 체감은 미미하지만 확실한 순감이다.

---

### T11. 관리자 대시보드 집계 정리
**규칙**: `js-min-max-loop`, `js-set-map-lookups`, `js-combine-iterations` (LOW-MEDIUM) — V12
**파일**: `src/server/modules/admin/dashboard.ts` (1개)

**정확한 변경**:
1. `:90-93` attention 필터의 상태 배열을 모듈 레벨 `const ATTENTION_STATUSES = new Set(["DRAFT", "HIDDEN", "UNPUBLISHED"]);`로 올리고 `.has()`로 바꾼다.
2. `:127`, `:143` 정렬 전에 `toTime`을 한 번씩만 계산해 붙인 뒤(decorate) 그 숫자로 비교한다.
3. `:105-112`의 두 `[...itemStatuses.values()].filter(...).length`를 단일 `for` 루프로 합쳐 `activeCount`/`archivedCount`를 동시에 센다.
4. `:92`의 `rows.filter(...)` 4회 완주는 `contentType`별 `Map<DashboardContentType, DashboardRow[]>`를 한 번 만들어 대체한다.

**상위 8개 부분 선택은 하지 않는다.** 전체 정렬을 부분 선택으로 바꾸는 것은 코드가 길어지는 데 비해 현 데이터 규모에서 이득이 없다. 정렬은 그대로 두고 비교 함수만 싸게 만든다.

**검증**: `buildAdminDashboardData`는 순수 함수이므로 테스트가 있으면 `npm test`가 회귀를 잡는다. 없으면 대표 rows 배열 하나로 리팩터 전후 결과 JSON이 동일한지 비교하는 `assert` 한 줄을 남긴다. 이후 `/admin` 대시보드에서 요약 카운트, 확인 필요 목록, 최근 변경 목록이 이전과 같은지 확인.

**기대 효과**: 정렬 비교당 `new Date()` 생성 2회 제거(2 x O(n log n) → O(n)), rows 완주 4회 → 1회, 중간 배열 2개 제거. 현 규모에서 체감 차이는 없고 데이터가 늘어날 때를 대비한 정리다.

---

### T12. 고아 모듈 삭제
**규칙**: 룰북 범위 밖(유지보수 표면 축소) — V14 관련
**파일**: 6개 삭제

**정확한 변경**: 아래 파일을 삭제한다. 전 저장소 grep에서 참조가 0건임을 확인했다.
- `src/components/home/BusinessAreaCarousel.jsx` (초당 10회 리렌더 로직을 안고 있는 미사용 컴포넌트)
- `src/components/notices/NoticeAttachments.jsx`
- `src/components/public/ActionLink.jsx`
- `src/components/ui/card.jsx`
- `src/data/popups.js`
- `src/data/translations.js`

삭제 후 `src/components/ui/progress-track.jsx`, `carousel-controls.jsx`, `media-frame.jsx`, `src/components/public/MediaStory.jsx`가 새로 고아가 되는지 재검사하고, 되면 함께 지운다.

**검증**: `npm run build`와 `npm test`, `npm run lint` 통과. 빌드가 깨지면 참조가 남아 있다는 뜻이다.

**기대 효과**: 번들 크기 변화 없음(이미 트리 셰이킹으로 빠져 있다). 읽어야 할 코드 약 400줄 감소, 잘못된 성능 패턴 한 건이 물리적으로 제거된다.

---

## 보류 (측정 선행 또는 사용자 판단 필요)

### B1. Pretendard Variable 폰트 1.96MB — 서브셋 여부 결정 필요
**관련 규칙**: `rendering-resource-hints` (HIGH)

`public/fonts/PretendardVariable.woff2`가 2,057,688바이트다. `_document.tsx:25-31`에서 preload로 올려놓아 브라우저가 최우선으로 내려받는다. 가장 무거운 라우트의 전체 JS(501.7kB raw)의 **네 배**이고, 이 보고서의 모든 JS 과제를 합친 절감분(약 98kB)의 **20배**다.

`font-display: swap`(`globals.css:9`) 덕분에 렌더를 막지는 않지만, preload로 승격된 이상 초기 JS/CSS와 대역폭을 다툰다. 느린 회선에서는 T2의 98kB 절감이 이 2MB에 묻힌다.

**왜 보류인가**: 서브셋 범위(한글 2,350자 완성형이면 충분한지, KS X 1001 전체가 필요한지, 영문 페이지 전용 서브셋을 분리할지)는 콘텐츠 담당자의 판단이 필요하다. 또 빌드 단계에 서브셋 도구가 들어가므로 "새 의존성 금지" 제약의 경계에 걸린다(런타임 의존성은 아니지만 개발 의존성은 는다).

**결정에 필요한 측정**: 현재 사이트 전체 텍스트의 유니크 글리프 수를 세면 서브셋 크기를 바로 추산할 수 있다. 한국어 웹사이트 통상 사례로는 완성형 2,350자 서브셋이 약 300~500kB로, **1.4MB 이상 절감**이 예상된다. 대안으로 `unicode-range`를 쪼갠 다중 `@font-face`(동적 서브셋)도 있다.

### B2. `news.jsx` 검색 입력에 `useDeferredValue` 적용 여부
**관련 규칙**: `rerender-use-deferred-value` (MEDIUM)

검색 입력이 `filteredItems` memo 전체를 매 키 입력마다 재계산시키고, 그 결과가 `FeaturedNews`/`SupportingNews`/`NewsArchive` 전체 재렌더로 이어진다. 룰북 5.14의 적용 대상 형태이긴 하다.

**왜 보류인가**: 현재 뉴스 항목 수가 `useDeferredValue`가 필요한 규모인지 확인되지 않았다. T4(포매터 호이스트)와 T10(조기 종료)을 먼저 적용하면 항목당 비용이 크게 줄어 필요 없어질 가능성이 높다.

**결정에 필요한 측정**: 운영 DB의 게시 뉴스 건수를 확인하고, T4/T10 적용 후 Chrome DevTools Performance로 키 입력 1회의 렌더 시간을 잰다. 16ms를 넘으면 `useDeferredValue`를 도입하고, 넘지 않으면 도입하지 않는다.

### B3. 긴 목록 `content-visibility` 적용 여부
**관련 규칙**: `rendering-content-visibility` (HIGH)

현재 실측 규모(공지 페이지당 12건, 수상 3건 + 인증 4건)로는 룰북 6.2의 전제인 "수백~수천 항목"에 한참 못 미쳐 적용 이득이 없다. 오히려 `contain-intrinsic-size` 추정이 틀리면 스크롤바가 요동친다.

**결정에 필요한 측정**: 공지 `pageSize`를 상한인 50으로 올릴 계획이 생기거나 뉴스 아카이브가 100건을 넘으면 재검토한다.

### B4. 관리자 폼의 `JSON.stringify(form)` dirty 검사
**관련 규칙**: `rerender-memo`, `js-length-check-first` — 명시 요청 항목

다섯 폼(`AiSolutionForm.tsx:73`, `HonorForm.tsx:62`, `NewsForm.tsx:72`, `NoticeForm.tsx:73`, `PopupNoticeForm.tsx`)이 모두 `const dirty = JSON.stringify(form) !== baseline;`를 렌더마다 실행한다.

**판정**: `AiSolutionForm`과 `HonorForm`처럼 스칼라 필드 위주(약 20개 필드)인 폼은 **고칠 필요 없다**. `JSON.stringify`가 수 마이크로초이고 키 입력 간격(수십 밀리초) 대비 무의미하다. `useMemo`로 감싸는 것은 실익이 없는 정도가 아니라 **틀리다**. 의존성이 `form`인데 `form`은 키 입력마다 새 객체가 되므로 memo가 절대 적중하지 않고, 훅 호출과 의존성 비교 비용만 순증한다(룰북 5.3의 취지).

**보류 대상은 `NewsForm` / `NoticeForm` / `PopupNoticeForm` 셋뿐이다.** 이 셋은 `locales.ko.bodyMarkdown`과 `locales.en.bodyMarkdown`을 폼 상태에 담고 있어, 본문이 길어지면 키 입력마다 (ko + en) 전체를 직렬화한다. 본문 20kB짜리 공지를 편집하면 타이핑 한 글자마다 40kB 문자열을 만들어 버리는 셈이라, 지연보다 GC 압력이 문제가 될 수 있다.

**결정에 필요한 측정**: 운영 공지 본문의 최대 길이를 확인하고, 그 길이의 본문을 넣은 상태에서 `/admin/notices/<id>` 본문 입력창에 연속 타이핑하며 DevTools Performance로 프레임 드롭을 관찰한다. 드롭이 없으면 손대지 않는다. 있으면 해법은 `useMemo`가 아니라 본문 필드만 dirty 판정에서 분리하거나(길이 비교 선행, 룰북 7.7) 본문 입력을 비제어 컴포넌트로 돌리는 쪽이다.

### B5. 공지 목록의 애플리케이션 레벨 페이지네이션
**관련 규칙**: 룰북 직접 대응 없음(확장성)

`src/server/modules/notices/queries.ts:59-67`이 조건에 맞는 공지를 **전부** 가져와 JS에서 `effectiveNoticeVisibility`로 거른 뒤 `slice`로 페이지를 자른다. SQL `LIMIT`/`OFFSET`이 없다. 공지가 쌓이면 페이지 1을 보는 요청도 전체 행을 전송받는다.

**왜 보류인가**: 가시성 판정이 시각 의존적(`publishStartsAt`/`publishEndsAt`)이라 SQL로 옮기려면 조건식을 DB 표현으로 재작성해야 하고, `총 건수`/`총 페이지` 계산도 함께 바뀐다. 한 파일이지만 도메인 규칙을 건드리는 변경이라 단순 성능 과제로 배정하기에 위험하다.

**결정에 필요한 측정**: 운영 공지 총 건수. 수백 건 이하면 그대로 두는 것이 맞다.

---

## 부록: 확인한 파일 목록

측정 산출물
- `scratchpad/build.txt` — `npm run build` 원문(Turbopack이 크기 열을 출력하지 않음을 확인한 근거)
- `scratchpad/size.js` — 라우트별 First Load JS 산출 스크립트(빌드 후 저장소 루트에서 `node`로 실행)

위반이 지적된 파일
- `src/pages/index.jsx` (V1, V2 / T1)
- `src/components/Header.jsx` (V3 / T2)
- `src/components/public/MobileNavigation.jsx`, `src/components/ui/dialog.jsx`, `src/components/ui/button.jsx` (V3 근거)
- `src/data/businessAreas.js` (V4 / T3), `src/shared/navigation/businessMegaMenu.ts`, `src/shared/navigation/publicNavigation.ts` (V4 근거)
- `src/lib/format-date.js`, `src/components/notices/NoticeList.jsx`, `src/components/popup-notices/dismissal-store.ts` (V5, V8 / T4, T7)
- `src/lib/markdown.js` (V6 / T5), `src/pages/notices/[slug].tsx`, `src/server/modules/news/database-source.ts` (V6 근거)
- `src/pages/admin/account.tsx` (V7 / T6), `src/server/auth/require-admin.ts` (V7 근거)
- `src/components/services/BusinessAreaExplorer.jsx` (V9 / T8)
- `src/components/public/DesktopNavigation.jsx` (V10 / T9)
- `src/pages/news.jsx` (V11 / T10)
- `src/server/modules/admin/dashboard.ts` (V12 / T11)
- `src/server/modules/catalog/queries.ts`, `src/server/modules/honors/queries.ts` (V13, 과제 제외)
- `src/components/home/BusinessAreaCarousel.jsx` 외 고아 5개 (V14 / T12)

통과 판정의 근거로 읽은 파일
- `src/pages/_app.jsx`, `src/pages/_document.tsx`, `src/styles/globals.css`, `public/fonts/`
- `src/pages/404.jsx`, `src/pages/bid-notice/[[...slug]].tsx`, `src/pages/services.jsx`, `src/pages/education.jsx`, `src/pages/about/honors.jsx`, `src/pages/notices/index.tsx`, `src/pages/sitemap.xml.tsx`
- `src/pages/admin/**` 전 GSSP, `src/pages/api/**` 대표 라우트 + `src/server/http/api-handler.ts`
- `src/hooks/useUnsavedChanges.ts`, `src/components/public/StatementBand.jsx`, `src/components/public/PageHeroMedia.jsx`, `src/components/ui/media-frame.jsx`, `src/components/ui/progress-track.jsx`, `src/components/popup-notices/PopupNoticeRegion.jsx`
- `src/shared/routing/routes.ts`, `src/shared/routing/useLocale.jsx`, `src/lib/news.js`, `src/lib/datetime-local.ts`, `src/server/modules/news/query-service.js`, `src/server/modules/news/static-source.js`, `src/server/modules/notices/queries.ts`
- `next.config.js`, `package.json`

보고 전용 (수정 과제 아님)
- `src/components/industrial/IndustrialHero.jsx` — 다른 작업 공간에서 편집 중이라 손대지 않았다. 읽은 범위에서 특이사항 하나: `usePauseCauses`의 `set`(87-90행)이 렌더마다 새로 만들어지는데 `[]` 의존성 effect(92-105행) 안에서 쓰인다. `setCauses`가 함수형 갱신이라 실제 버그는 없지만 `react-hooks/exhaustive-deps`가 지적할 형태다. 편집이 끝난 뒤 `useEffectEvent`로 감싸거나 `set`을 effect 안으로 옮기면 깔끔해진다. `useTypedSlot`이 `phase`를 ref가 아닌 state로 두는 선택은 주석(57-59행)에 근거가 적혀 있고 타당하다.
