# 브레인웍스 공개 사이트 감사

- 대상: `C:\브레인웍스\brainworks.co.kr`, 브랜치 `redesign/industrial`
- 범위: 공개 페이지, 공개 컴포넌트, 공개 API, 라우팅·스타일·데이터. 관리자 화면과 관리자 API는 제외
- 방식: 읽기 전용. 빌드·개발 서버를 띄우지 않고 코드와 문서만 대조
- 미커밋 3개(`AGENTS.md`, `src/components/industrial/IndustrialHero.jsx`, `src/styles/industrial.css`)는 작업 중으로 간주하고 결함 판정에서 제외했습니다. 히어로 자체는 이 저장소에서 가장 완성도 높은 화면입니다.

---

## 1. 두 축 점수

### A. 계획대로 구현됐는가 — 72 / 100

정보구조, 라우트 계약, 로케일 전환, 레거시 경로 정리, 상세 페이지 상단 계약까지 문서가 정한 것이 코드에 그대로 들어와 있습니다. `src/shared/routing/routes.ts`와 `src/shared/navigation/publicNavigation.ts`가 단일 정의를 쥐고 Header·Footer·모바일 메뉴가 같은 배열을 쓰며, 03-01 §7의 5개 영구 이동과 `/bid-notice` 410까지 구현돼 있습니다.

다만 계획이 명시한 것 중 빠진 것이 남아 있습니다. 03-01 §8.1이 요구한 Open Graph 문구가 어디에도 없고, §8.2의 검색 사이트맵에서 공지사항 목록과 뉴스·공지 상세가 통째로 빠져 있습니다. 홈은 03-03 §4의 관리자 사업 영역 데이터를 서버에서 가져와 놓고 화면에 넘기지 않습니다.

가장 큰 이탈은 승인 계획이 `[x]`로 완료 처리한 항목이 코드에서 되돌아가 있는 것입니다. 2026-09-07 색·모션 계획은 "고객 로고는 자동 이동 대신 정적인 균등 그리드"라고 적고 완료로 표시했는데, `src/components/Clients.jsx:48`은 여전히 무한 마퀴입니다.

### B. 완성도 높은 스타트업 사이트 기준 — 58 / 100

디자인 의사결정의 품질은 벤치마크 대상 수준입니다. 토큰 표, 대비 실측치, 기각된 대안까지 코드 주석에 남아 있고 `BusinessAreaExplorer`의 탭 구현은 ARIA 패턴을 정확히 지킵니다.

문제는 "폴리시 완성도"의 바닥이 빠져 있다는 것입니다. favicon이 없고, `robots.txt`가 없고, 404·500 페이지가 없고, OG·Twitter 카드가 없습니다. 링크를 슬랙에 붙이면 제목만 나오고, 브라우저 탭에는 회색 기본 아이콘이 뜨며, 오타 URL을 치면 Next.js 기본 404 화면이 헤더·푸터 없이 영어로 나옵니다. Linear·Vercel·업스테이지 어느 곳도 이 셋 중 하나라도 비어 있지 않습니다.

성능 위생도 기준 미달입니다. `/education`이 10MB PNG 한 장을 그대로 내려주는데 `next.config.js:34`가 이미지 최적화를 전역으로 꺼두어 방어선이 없습니다. 여기에 다크 구간 키보드 초점이 배경과 같은 색이라 보이지 않고, 고객사 로고 대체 텍스트가 `client1`~`client8`이며, 영문 화면에 한국어 문자열이 섞여 나옵니다.

---

## 2. 스타트업 벤치마크 대비 격차 top 10

사용자 눈에 보이는 정도순입니다.

| # | 격차 | 지금 벌어지는 일 |
|---|---|---|
| 1 | favicon 없음 | `public/`에 `favicon.ico`도 `favicon.png`도 없고 `_document.tsx`에 `<link rel="icon">`도 없습니다. 모든 탭에 브라우저 기본 아이콘이 뜹니다. |
| 2 | OG·Twitter 카드 없음 | `SeoMetadata.jsx`는 title·description·canonical·hreflang만 냅니다. 슬랙·카카오·링크드인에 공유하면 썸네일과 설명이 안 나옵니다. |
| 3 | 404·500 페이지 없음 | `src/pages/404.*`, `500.*`, `_error.*` 모두 없습니다. 존재하지 않는 경로는 헤더·푸터·로케일 없는 Next 기본 화면입니다. |
| 4 | 10MB 이미지를 최적화 없이 전송 | `public/images/education/Global.png`(10MB)를 `src/pages/education.jsx:159`가 쓰고, `next.config.js:34`가 `unoptimized: true`입니다. 모바일에서 이 섹션은 사실상 로드되지 않습니다. |
| 5 | 다크 구간 키보드 초점이 보이지 않음 | 초점 링 색이 푸터 배경과 같은 값이라 푸터 전체에서 탭 위치를 알 수 없습니다. |
| 6 | 영문 화면의 한국어 잔존 | 영문 홈 최신소식 카드에 `자세히 보기`, 영문 상세 히어로 미디어 실패 시 `미디어를 표시할 수 없습니다.`, 영문 모바일 메뉴 닫기 버튼 `aria-label="닫기"`. |
| 7 | 고객사 로고 대체 텍스트가 `client1`~`client8` | 홈의 신뢰 근거 구간이 스크린리더에서 의미 없는 문자열 여덟 개로 읽힙니다. 검색엔진도 어느 기업인지 알 수 없습니다. |
| 8 | 문의 폼이 필드 단위 검증을 하지 않음 | `noValidate`로 브라우저 검증을 끄고 JS는 목적·동의만 봅니다. 이름·이메일·내용이 비어도 전송되고, 서버 400을 "전송에 실패했습니다"라는 통짜 메시지로 보여줍니다. |
| 9 | 관리자·미리보기가 색인 가능 | `robots.txt`도 `noindex` 메타도 `X-Robots-Tag` 헤더도 없습니다. `/admin`, `/admin/preview/*`, `/auth/signin`이 그대로 노출 대상입니다. |
| 10 | E2E 테스트 0개 | `playwright.config.ts`가 `./tests/e2e`를 가리키는데 그 폴더가 없습니다. 페이지 렌더 회귀를 잡는 장치가 컴포넌트 테스트뿐입니다. |

---

## 3. 계획 대비 미구현·이탈

| # | 항목 | 계획 근거 | 현재 상태 |
|---|---|---|---|
| 1 | Open Graph 문구 | 03-01 §8.1 "제목, 설명, Open Graph 문구는 현재 URL의 언어로 제공합니다" | `src/components/public/SeoMetadata.jsx:14-26`에 og·twitter 태그 없음 |
| 2 | 검색 사이트맵 범위 | 03-01 §8.2 "국문·영문 공개 페이지를 모두 포함합니다" | `src/pages/sitemap.xml.tsx:5-16`의 `publicRouteKeys`에 `notices.list` 누락, `news.detail`·`notices.detail` 전부 누락 |
| 3 | 홈 사업 영역 데이터 출처 | 03-03 §4 순서 2 `home-solutions` 데이터 출처 "고정 사업 영역 데이터와 관리자 AI 솔루션 데이터" | `src/pages/index.jsx:44`가 `getPublishedBusinessAreas`를 호출해 `areas` prop으로 넘기지만 `DomainGrid`는 prop을 받지 않고 정적 `@/data/businessAreas`만 씁니다. 매 요청 DB 질의가 버려집니다 |
| 4 | 홈 최신 소식 빈 상태 | 03-03 §4 순서 4 "공개된 현재 로케일 뉴스가 없으면 섹션 전체 제외" | `src/components/home/LatestNews.jsx:30-35`가 섹션을 유지한 채 "등록된 소식이 없습니다."를 표시 |
| 5 | 고객 로고 표시 방식 | 2026-09-07 색·모션 계획, `[x]` 완료 항목 "고객 로고는 자동 이동 대신 기존 로고를 정적인 균등 그리드로 표시합니다" | `src/components/Clients.jsx:48`이 `animate-scroll` 무한 마퀴 유지, 로고 배열을 4배로 복제 |
| 6 | 번역 미게시 시 타 언어 대체 금지 | 03-01 §2, §6.3 "다른 언어 콘텐츠로 자동 대체하지 않으며" | `src/server/modules/news/static-source.js:6`, `src/pages/news.jsx:14`, `src/pages/news/[slug].jsx:13` 모두 `value[locale] \|\| value.ko \|\| value.en`. 현재 정적 뉴스 13건은 ko·en이 모두 있어 드러나지 않는 잠재 위반 |
| 7 | 디자인 토큰 값 | 08 §2.2 색 표 (`--bw-surface-muted: #f7f8f9`, `--bw-surface-dark: #0e1013`, `--bw-ink: #16181d`, `--bw-muted: #5b6068`, `--bw-line: #e4e6e9`, `--bw-line-strong: #cfd2d7`) | `src/styles/industrial.css:13-26`은 `#f4f7f5`, `#10191b`, `#10191b`, `#53615d`, `#d7e1dc`, `#b5c9c2`. 2026-09-07 청록 개정값인데 그 개정은 히어로 부분이 철회됐고 §2.2 표는 갱신되지 않았습니다 |
| 8 | 팝업 공지 비모달 | 03-03 §4 순서 0 "비모달, 데스크톱 동시 표시, 모바일 한 건씩 수동 탐색" | `src/components/popup-notices/PopupNoticeRegion.jsx:67`이 차단형 모달 한 건씩. 공지 명세 2026-09-02 결정 변경(§107, §111)으로는 정당하지만 **03-03이 갱신되지 않아 두 승인 문서가 서로 반대를 말합니다** |
| 9 | `PageHero` 죽은 변형 정리 | detail-page-roles.md Dependencies "`PageHero`의 `media`·`split`·`dark` 변형은 호출부가 없는 죽은 코드다. 정리 대상" | `media`는 이후 4개 서비스 페이지가 쓰게 됐으나 `split`(PageHero.jsx:124-140)과 `dark`(:142-144)는 여전히 호출부 0개 |
| 10 | 헬스 체크 외 보조 기능 | plan.md §7 보조 기능 "검색 사이트맵과 메타데이터" | 사이트맵은 있으나 `robots.txt`가 없어 사이트맵 위치를 크롤러에 알릴 수단이 없습니다 |

---

## 4. 확정 결함 목록

심각도: **치명** 즉시 고침 / **중대** 출시 전 고침 / **보통** 다음 반복 / **경미** 여유 있을 때

### 치명

**D1. `/api/news/[id]` 가 빈 파일이라 500을 던집니다**
`src/pages/api/news/[id].js` — 파일 크기 1바이트, 개행 하나뿐이고 default export가 없습니다. Next는 이 경로 호출 시 "API handler should export a default function"으로 실패합니다. 공개 API 라우트로 배포됩니다.
최소 수정: 파일 삭제. 호출부가 없습니다(`grep -rn "api/news" src` 결과 0건).

**D2. 10MB PNG를 그대로 전송합니다**
`src/pages/education.jsx:159` → `/images/education/Global.png` (10MB). `next.config.js:32-35`의 `images.unoptimized: true`가 `next/image`의 리사이즈·WebP 변환을 전역으로 끕니다. 같은 페이지에 `AI포트폴리오.jpg`(3MB), `AI면접.jpg`(2.3MB), `AI해커톤.jpg`(1.3MB)도 있어 `/education` 한 페이지가 17MB 이상입니다.
최소 수정: 네 이미지를 WebP 1600px 폭으로 재인코딩(각 200KB 이하 목표). 이후 `unoptimized: true` 제거 가능 여부를 별도 판단.

**D3. DB 모드에서 뉴스 썸네일과 외부 기사 링크가 사라집니다**
`src/server/modules/news/database-source.ts:50` `thumbnail: ""`, `:104` `thumbnail: "", externalLinks: []` — 하드코딩입니다. `DATABASE_URL`이 설정된 운영 환경에서 뉴스 목록 전체가 "이미지 없음"/"No image"(`src/pages/news.jsx:68`)로 렌더되고, 홈 최신소식 카드의 이미지도 사라지며(`src/components/home/LatestNews.jsx:13`), 상세의 "관련 외부 기사" 섹션이 통째로 없어집니다. 정적 모드에서만 정상 동작하므로 로컬 확인으로는 드러나지 않습니다.
최소 수정: `newsLocales`/`news` 스키마의 썸네일·외부링크 컬럼을 select에 추가. 컬럼이 없다면 결손 사실을 먼저 확정.

### 중대

**D4. 404·500 페이지가 없습니다**
`src/pages/404.*`, `500.*`, `_error.*` 전부 부재. 잘못된 뉴스 슬러그(`src/pages/news/[slug].jsx:127` `notFound: true`)와 공지 슬러그(`src/pages/notices/[slug].tsx:65`)가 실제로 이 경로로 떨어집니다.
최소 수정: `src/pages/404.jsx` 하나 추가. `Header` + `PageHero variant="plain"` + `Footer` 조합으로 `bid-notice/[[...slug]].tsx`를 그대로 본뜨면 됩니다. 500도 같은 틀.

**D5. 모든 페이지가 canonical과 hreflang을 두 번 냅니다**
`src/pages/_app.jsx:81`이 `<SeoMetadata title="Brainworks" />`를 렌더하고, 각 페이지가 또 `SeoMetadata`를 렌더합니다. `next/head`는 `<title>`과 `<meta name=...>`은 중복 제거하지만 `<link>`는 `key` prop이 있어야만 합칩니다. `SeoMetadata.jsx:18-25`의 canonical·alternate 4개에 `key`가 없어 모든 공개 페이지에 canonical 2개, hreflang 6개가 나갑니다.
최소 수정: `_app.jsx:81`의 전역 `SeoMetadata` 제거. (동시에 `SeoMetadata.jsx`의 각 `<link>`에 `key`를 붙이면 이중 안전장치)

**D6. 어두운 구간에서 키보드 초점이 보이지 않습니다**
`src/styles/globals.css:191` `:focus-visible { outline: 3px solid var(--bw-color-focus); }` + `src/styles/industrial.css:885` `--bw-color-focus: var(--bw-ink)` = `#10191b`. 푸터 배경은 `industrial.css:656` `--bw-surface-dark` = `#10191b`로 **완전히 같은 값**입니다. 푸터의 모든 링크(사이트 링크 9개 + 문의)에서 탭 위치를 알 수 없습니다. 히어로와 media 히어로만 `industrial.css:1438-1441`에 전용 초점 규칙이 있어 살아 있습니다.
최소 수정: `industrial.css`에 `.bw-footer :focus-visible, .ind-dark :focus-visible { outline-color: var(--bw-accent-strong); }` 한 줄 추가.

**D7. 고객사 로고 대체 텍스트가 `client1`~`client8`**
`src/components/Clients.jsx:18-25`. 홈의 신뢰 근거 구간 전체가 의미 없는 문자열입니다. 06 감사(`docs/planning/06-01-mentor-content-request.md:136`)에 실제 기관명 여덟 개가 이미 확인돼 있습니다.
최소 수정: `alt`를 실제 기관명으로 교체. 순서는 파일명 대조로 확정 필요.

**D8. 공지 상세에 `h1`이 두 개입니다**
`src/components/public/PageHero.jsx:43`이 `<h1>{notice.title}</h1>`, `src/components/notices/NoticeDetail.jsx:12`가 다시 `<h1>{notice.title}</h1>`. 같은 문자열의 h1 두 개가 연달아 나옵니다.
최소 수정: `NoticeDetail.jsx:12`의 `h1`을 제거(제목과 날짜가 이미 히어로에 있음). 또는 `notices/[slug].tsx:37-42`의 `PageHero`를 빼고 상세가 제목을 단독 소유.

**D9. 관리자·미리보기가 검색엔진에 열려 있습니다**
`robots.txt` 없음, `noindex` 메타 없음(`grep -rn "noindex\|robots" src` 0건), `next.config.js`에 `headers()` 없음, 미들웨어 없음. `/admin/*`, `/admin/preview/news/[contentId]`, `/auth/signin`이 크롤링 대상입니다.
최소 수정: `public/robots.txt` 추가 — `Disallow: /admin/`, `Disallow: /auth/`, `Sitemap: https://brainworks.co.kr/sitemap.xml`. 병행해 `AdminShell`에 `<meta name="robots" content="noindex,nofollow">`.

**D10. 문의 폼이 필드 검증 없이 서버로 보냅니다**
`src/pages/contact.jsx:139` `noValidate` + `:73-88`의 JS 검증이 `topic`과 `privacyAccepted`만 확인. `name`(`:243` required), `email`(`:259` required type=email), `message`(`:309` required minLength=10)의 브라우저 검증이 `noValidate`로 꺼져 있고 JS 대체 검증도 없습니다. 빈 이름으로 제출하면 서버 400 → `catch` → "문의 전송에 실패했습니다. 입력 내용을 유지했으니 잠시 후 다시 시도해 주세요."라는 **틀린 안내**가 나옵니다. 다시 시도해도 영원히 실패합니다.
최소 수정: `noValidate` 제거(브라우저 기본 검증 복구)하거나, `submit` 시작부에 `event.target.checkValidity()` 검사 추가. 서버 오류도 4xx와 5xx를 구분해 메시지를 나눌 것.

**D11. 문의 폼이 사업 영역을 내부 식별자로 보여줍니다**
`src/components/services/BusinessAreaExplorer.jsx:141`이 `/contact?topic=solution&area=manufacturing`으로 보내고, `src/pages/contact.jsx:210-212`가 그 값을 그대로 `<strong>`에 찍습니다. 사용자는 "선택한 사업 영역: manufacturing"을 봅니다.
최소 수정: `contact.jsx`에서 `getLocalizedBusinessAreas(language)`로 id→title을 조회해 표시. 없는 id면 안내 상자를 숨김.

### 보통

**D12. 뉴스 목록 필터가 가짜 탭입니다**
`src/pages/news.jsx:290-307` — `role="tablist"`/`role="tab"`을 쓰면서 `aria-controls`도, `tabpanel`도, roving `tabIndex`도, 화살표 키 처리도 없습니다. 스크린리더는 탭 위젯이라 안내하고 방향키를 안내하지만 실제로는 동작하지 않습니다. 같은 저장소의 `BusinessAreaExplorer.jsx:68-126`에 올바른 구현이 이미 있습니다.
최소 수정: `role`을 전부 제거하고 `<div role="group">` + `aria-pressed`로 내리거나, `BusinessAreaExplorer`의 패턴을 그대로 가져오기.

**D13. 영문 화면에 한국어 문자열이 남습니다**
- `src/components/public/EditorialList.jsx:49` `자세히 보기` — 영문 홈 최신소식 대표 카드에 노출
- `src/components/public/PageHeroMedia.jsx:3` `미디어를 표시할 수 없습니다.` — `/en/services`, `/en/consulting`, `/en/global-programs`의 미디어 실패 시
- `src/components/ui/dialog.jsx:60` `aria-label="닫기"` — 영문 모바일 메뉴·팝업 공지
- `src/components/public/DesktopNavigation.jsx:130,136` `` `${item.label} 하위 메뉴` `` — 영문 메가메뉴 aria-label
- `src/components/ui/state-panel.jsx:2-4` 로딩·빈·오류 기본 문구 전부 한국어
- `src/components/public/StatementBand.jsx:78` `aria-label={eyebrow \|\| "선언"}`
최소 수정: 각 컴포넌트에 `useLocale()`을 붙이거나 로케일 문자열을 prop으로 올리기.

**D14. 홈이 쓰지 않는 DB 질의를 매 요청 실행합니다**
`src/pages/index.jsx:44` `getPublishedBusinessAreas(currentLocale)` → `:50` props로 전달 → `:14` `Home({ ..., areas })`에서 구조분해만 되고 `:26` `<DomainGrid />`에 넘어가지 않습니다. `DomainGrid.jsx:22`는 prop을 받지 않습니다.
최소 수정: 둘 중 하나. 질의를 지우거나(계획 3 항목 포기), `DomainGrid`가 `areas`를 받아 정적 데이터 대신 쓰도록 연결(계획 준수).

**D15. `SeoMetadata` 설명이 제목과 같은 페이지가 있습니다**
`src/pages/notices/[slug].tsx:34` `description={notice.title}`. 검색 결과에 제목이 두 번 나옵니다.
최소 수정: 본문 앞부분 요약을 `getServerSideProps`에서 생성해 넘기기.

**D16. 페이지네이션 링크가 실제로 비활성화되지 않습니다**
`src/components/notices/NoticeList.jsx:74,84` — `aria-disabled`와 `pointer-events-none`만 걸립니다. `pointer-events: none`은 키보드 초점을 막지 않으므로 탭으로 도달해 Enter를 누르면 같은 페이지로 이동합니다.
최소 수정: 첫 페이지·마지막 페이지에서는 `<Link>` 대신 `<span aria-disabled="true">`를 렌더.

**D17. `next/image`와 원시 `<img>`가 섞여 있습니다**
`next/image`: `about/honors.jsx`, `education.jsx`(일부), `news.jsx`, `Clients.jsx`, `SolutionCard.jsx`.
원시 `<img>`: `about.jsx:48`(1.6MB `대표사진.png`), `education.jsx:712`, `news/[slug].jsx:48`, `Header.jsx:67`, `DomainGrid.jsx:49`, `EditorialList.jsx:20`, `PageHeroMedia.jsx:52,79`, `PopupNoticeRegion.jsx:79`.
`unoptimized: true`라 현재는 둘의 결과가 같지만, 최적화를 켜는 순간 절반만 혜택을 받습니다.
최소 수정: 이미지 최적화를 켜는 작업과 묶어서 한 번에 정리.

**D18. 폰트 2MB를 preload 없이 `swap`으로 받습니다**
`src/styles/globals.css:4-10` — `PretendardVariable.woff2` 2.0MB, `font-display: swap`, `<link rel="preload">` 없음, `unicode-range` 서브셋 없음. 첫 화면이 시스템 폰트로 그려졌다가 늦게 뒤바뀝니다(FOUT).
최소 수정: `_document.tsx`의 `<Head>`에 `<link rel="preload" as="font" type="font/woff2" href="/fonts/PretendardVariable.woff2" crossOrigin="anonymous" />` 추가. 서브셋 분할은 별건.

**D19. 발표용 디버그 기능이 운영 코드에 있습니다**
`src/pages/_app.jsx:9-28` `useUiVariant` — `?ui=a|b|c` 쿼리로 `data-ui`를 붙여 `src/styles/ui-variants.css`(312줄)의 대체 토큰 묶음을 적용합니다. 주석이 "발표용 UI 방향 비교"라고 밝히고 있습니다. 운영 URL에 붙이면 누구나 다른 디자인을 볼 수 있고, CSS 312줄이 모든 페이지 번들에 들어갑니다.
최소 수정: `_app.jsx`의 훅 호출과 `ui-variants.css` import를 제거. 파일은 보관하되 import를 끊기.

**D20. 보안 헤더가 하나도 없습니다**
`next.config.js`에 `headers()` 없음, `poweredByHeader` 미설정(기본 `X-Powered-By: Next.js` 노출). CSP·`X-Content-Type-Options`·`Referrer-Policy`·`X-Frame-Options` 전부 없습니다.
최소 수정: `next.config.js`에 `poweredByHeader: false`와 기본 4종 헤더 추가.

### 경미

**D21. `src/pages/services/` 가 빈 디렉터리입니다.** 안에 파일이 없습니다. 삭제.

**D22. `/outbound` 는 도달 불가능한데 페이지로 빌드됩니다.** `next.config.js:14`가 `/outbound`를 301로 보내는데 `src/pages/outbound.jsx`(476줄)가 여전히 페이지입니다. `src/pages/global-programs.tsx:1`이 이 파일을 import만 합니다. 파일명을 `global-programs.tsx`로 옮기고 `outbound.jsx`를 지우면 라우트 하나와 번들 하나가 줄어듭니다.

**D23. `Home.jsx` 는 재수출뿐인 도달 불가 라우트입니다.** `src/pages/Home.jsx:1` `export { default, getServerSideProps } from "./index";` — `next.config.js:13`이 `/Home`을 `/`로 보내므로 영원히 렌더되지 않습니다.

**D24. 뉴스 상세 날짜가 포맷되지 않습니다.** `src/pages/news/[slug].jsx:43` `` `${news.date} · ${...}` `` — 목록(`news.jsx:23-27`)은 `Intl.DateTimeFormat`을 쓰는데 상세는 `2025-06-16` 원문입니다.

**D25. 한국어 문구에 가운뎃점이 남아 있습니다.** `src/pages/news.jsx:45`, `src/components/public/EditorialList.jsx:9`의 구분자 `·`. 장식용이라 판단은 취향 문제지만, `news/[slug].jsx:43`처럼 문장 안에 들어간 경우는 다릅니다.

**D26. `business` 메가메뉴 링크가 쿼리와 해시를 동시에 씁니다.** `src/shared/navigation/businessMegaMenu.ts:48` `/services?area=...#business-areas`. 그런데 `BusinessAreaExplorer.jsx:32-36`의 `router.replace({ pathname, query: { area: id } })`가 탭 전환 때 해시와 다른 쿼리를 모두 버립니다.

**D27. 외부 링크가 사실상 하나뿐입니다.** `src/content/news/2025-08-07-ai-award.md`의 `https://www.wowtv.co.kr/NewsCenter/News/Read?articleId=A202508071234` 1건. 나머지 뉴스 12건에는 외부 기사 링크가 없습니다. 깨진 링크는 아니나, D3 때문에 운영 DB 모드에서는 이 하나마저 표시되지 않습니다.

### 확인해 둔 것 — 문제 없음

- `console.log`, `debugger`, `TODO`, `FIXME`, `Lorem`은 공개 코드 전체에 0건입니다.
- 마크다운은 `src/lib/markdown.js:14`에서 `rehypeSanitize`를 거칩니다. `dangerouslySetInnerHTML` 두 곳(`news/[slug].jsx:57`, `NoticeDetail.jsx:18`) 모두 안전합니다.
- 문의 폼에 허니팟(`contact.jsx:336-344` `website` 필드)이 있습니다.
- 운영 DB 경로는 로케일별 게시 상태를 정확히 지킵니다(`database-source.ts:22-23`, `:91-92`). 한국어 대체가 일어나지 않습니다.
- `<html lang>`은 `_document.tsx:23`에서 로케일에 맞게 설정됩니다.
- 헤더 메가메뉴는 Escape 닫기와 초점 복귀(`DesktopNavigation.jsx:42-48`), 바깥 클릭 닫기(`:50-56`)를 구현합니다.
- 회사 주소는 문서(`06-content-and-asset-readiness-audit.md:222`)의 사무소 5곳과 일치합니다. `Footer.jsx:12-48`이 대구를 `본사`, 광주를 `광주본사`로 표기하는데 **사업자등록 본점이 대구이므로 틀린 표기는 아닙니다.** 다만 실무 본사가 광주라면 방문자에게 오해를 줄 수 있어 대표님 확인이 필요합니다. 판정 보류.
- 저작권 연도는 `Footer.jsx:161`에서 `new Date().getFullYear()`로 자동 계산됩니다.

---

## 5. 정리 대상 파일

### 죽은 컴포넌트 — 어디서도 import되지 않음

한 덩어리입니다. `HomePage.jsx`가 옛 홈이었고 그 아래 트리 전체가 `src/pages/index.jsx`로 교체되면서 남았습니다.

| 파일 | 유일한 참조처 |
|---|---|
| `src/components/HomePage.jsx` | 없음 (루트) |
| `src/components/Hero.jsx` | `HomePage.jsx`(죽음), 테스트 2개 |
| `src/components/HomeHero.jsx` | `Hero.jsx`(죽음), 테스트 1개 |
| `src/components/home/BusinessAreaCarousel.jsx` | 없음 |
| `src/components/public/MediaStory.jsx` | `BusinessAreaCarousel.jsx`(죽음) |
| `src/components/ui/carousel-controls.jsx` | `HomeHero.jsx`·`BusinessAreaCarousel.jsx` (둘 다 죽음) |
| `src/components/ui/progress-track.jsx` | 같음 |
| `src/components/ui/media-frame.jsx` | 같음 |
| `src/components/About.jsx` | 없음 |
| `src/components/AboutSidebar.jsx` | 없음 (`public/AboutLocalNav.jsx`가 대체) |
| `src/components/Awards.jsx` | 없음 (`utils/awardsData.js`가 대체) |
| `src/components/Honors.jsx` | `HomePage.jsx`(죽음) |
| `src/components/News.jsx` | `HomePage.jsx`(죽음). 현역은 `home/LatestNews.jsx` |
| `src/components/Services.jsx` | `HomePage.jsx`(죽음) |
| `src/components/Portfolio.jsx` | 없음 |
| `src/components/BidNoticePopup.jsx` | 없음 (기능 폐기) |
| `src/components/public/ActionLink.jsx` | 없음 |
| `src/components/ui/card.jsx` | 없음 |
| `src/components/notices/NoticeAttachments.jsx` | 없음 (`NoticeDetail.jsx`가 첨부를 직접 렌더) |
| `src/data/bidNotices.js` | 없음 (기능 폐기) |
| `src/data/popups.js` | 없음 (DB로 이관) |
| `src/data/translations.js` | `About.jsx`·`Portfolio.jsx` (둘 다 죽음) |
| `src/models/News.js` | 확인 필요 — orphan 스캔에는 안 잡혔으나 `src/server/modules/news/`가 실제 경로 |
| `src/pages/api/news/[id].js` | 빈 파일. D1 |
| `src/pages/services/` | 빈 디렉터리 |

**주의:** `tests/components/home-hero.test.tsx`와 `tests/components/design-interactions.test.tsx`가 죽은 `Hero.jsx`/`HomeHero.jsx`를 테스트합니다. 반대로 현역 `IndustrialHero.jsx`를 직접 다루는 테스트는 없습니다. 컴포넌트를 지우려면 테스트를 `IndustrialHero`로 옮겨야 합니다.

### 죽은 자산

| 파일 | 크기 | 비고 |
|---|---|---|
| `public/images/hero-animation.gif` | 5.0MB | git 추적 중. `HomeHero.jsx:12`만 참조(죽음) |
| `src/assets/hero-animation.gif` | 5.0MB | git 미추적 |
| `src/components/hero-animation.gif` | 5.0MB | git 미추적. 컴포넌트 폴더 안의 GIF |
| `src/assets/news/*` | 2.5MB+ | `경북소마고.png` 등. 현재 뉴스는 `public/images/news/`를 씀 |
| `src/assets/clients/client8.jpg` | — | `client8.png`로 교체됨(`Clients.jsx:12` 주석) |
| `public/images/outbound/map.png` + `맵.png` | 778K + 749K | 같은 지도의 중복. `GlobalNetwork.jsx`가 SVG로 대체 |
| `public/images/대표사진.png` + `public/images/about/대표사진.png` | 1.6MB × 2 | 동일 파일 중복 |
| `public/images/education/전남tp.jpg` + `전남tp.png` | — | 중복 |
| `public/images/education/image-removebg-preview (95).png` | — | 자동 생성 파일명 그대로 |
| `public/files/bid-notices/*.hwpx` | 256K | 입찰공고 기능 폐기(03-01 §7). 4개 파일 |

### 루트 잡동사니 — `git ls-files` 기준 추적 여부

| 파일 | git 추적 | `.gitignore` 적용 |
|---|---|---|
| `test.html` (7.5KB) | **추적됨** | 미적용 |
| `test.txt` | **추적됨** | 미적용 |
| `bid-notice-console-errors.json` | **추적됨** | 미적용 |
| `bid-notice-snapshot.md` | **추적됨** | 미적용 |
| `ko_escapes.json` | **추적됨** | 미적용 |
| `.playwright-mcp/` (4개 로그·yml) | **추적됨** | 미적용 |
| `reports/2026-09-07-admin-audit.md` | **추적됨** | `/reports/migration/`만 무시 |
| `graphify-out/` | 미추적 | `/graphify-out/` 적용됨 |
| `out/` | 미추적 | `/out/` 적용됨 |
| `tsconfig.tsbuildinfo` (599KB) | 미추적 | `*.tsbuildinfo` 적용됨 |

추적된 7항목은 `git rm --cached` + `.gitignore` 추가가 필요합니다. GitHub에서 저장소를 여는 사람이 `test.html`과 `bid-notice-console-errors.json`을 루트 목록에서 먼저 봅니다.

---

## 6. 권장 수정 순서

독립적으로 배분 가능한 단위로 묶었습니다. 각 과제는 1~3개 파일만 건드리며 서로 충돌하지 않습니다.

### 1차 — 출시 차단급 (병렬 가능, 6개)

**T1. 공개 API 빈 파일 제거**
파일: `src/pages/api/news/[id].js` (삭제)
`grep -rn "api/news" src tests`로 호출부 0건임을 먼저 확인한 뒤 삭제. 1분.

**T2. 404·500 페이지 추가**
파일: `src/pages/404.jsx`, `src/pages/500.jsx` (신규)
`src/pages/bid-notice/[[...slug]].tsx:8-41`을 본으로 삼는다. `Header` + `PageHero variant="plain"` + 홈 링크 + `Footer`. 문구는 `useLocale()`로 ko/en 분기. 404는 "요청하신 페이지를 찾을 수 없습니다", 500은 "일시적인 오류가 발생했습니다". `getServerSideProps` 없이 정적으로.

**T3. canonical·hreflang 중복 제거**
파일: `src/pages/_app.jsx`, `src/components/public/SeoMetadata.jsx`
`_app.jsx:81`의 `<SeoMetadata title="Brainworks" />` 줄을 삭제한다. 삭제 후 `SeoMetadata`를 렌더하지 않는 공개 페이지가 있는지 확인 — 현재 `src/pages/bid-notice/[[...slug]].tsx`가 그렇다(SEO 태그 없음). 그 페이지에도 `SeoMetadata`를 붙인다. 추가로 `SeoMetadata.jsx:18-25`의 `<link>` 4개에 `key="canonical"`, `key="alt-ko"` 등을 붙여 이후 중복을 원천 차단.

**T4. OG·Twitter 메타 추가**
파일: `src/components/public/SeoMetadata.jsx`, `public/og-default.png` (신규 자산)
`og:title`, `og:description`, `og:url`(= canonical), `og:type="website"`, `og:site_name`, `og:locale`(`ko_KR`/`en_US`), `og:image`, `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image`. 이미지는 1200×630. 기존 자산 중 `public/images/services/hero/manufacturing.webp`를 크롭해 쓰거나 로고 기반 단색 카드. **T3과 같은 파일을 만지므로 T3 다음에 진행.**

**T5. favicon 세트 + robots.txt 추가**
파일: `public/favicon.ico`, `public/apple-touch-icon.png`, `public/robots.txt`, `src/pages/_document.tsx`
원본은 `public/images/회사로고.png`. `_document.tsx`의 `<Head>`(현재 25-30행)에 `<link rel="icon" href="/favicon.ico" sizes="any" />`와 `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` 추가. `robots.txt`는 `User-agent: *` / `Disallow: /admin/` / `Disallow: /auth/` / `Disallow: /api/` / `Allow: /` / `Sitemap: https://brainworks.co.kr/sitemap.xml`.

**T6. 대용량 이미지 재인코딩**
파일: `public/images/education/Global.png`, `AI포트폴리오.jpg`, `AI면접.jpg`, `AI해커톤.jpg` (교체), `src/pages/education.jsx` (경로 확장자 수정)
네 파일을 최대 폭 1600px WebP로 변환하고 각 200KB 이하를 목표로 한다. `education.jsx:159, 209, 257`의 `src` 확장자를 맞춰 수정. 1.6MB `대표사진.png` 두 벌(`public/images/`와 `public/images/about/`)도 같이 처리하고 `about.jsx:49`의 참조를 하나로 통일.

### 2차 — 접근성·i18n (병렬 가능, 4개)

**T7. 다크 구간 초점 링 복구**
파일: `src/styles/industrial.css`
`:root[data-design="industrial"] .bw-footer :focus-visible`, `.ind-dark :focus-visible`, `section[data-variant="cta"] :focus-visible`에 `outline-color: var(--bw-accent-strong)`(`#f0be4e`, 잉크 대비 10.3) 지정. 기존 규칙 1438-1441행 바로 아래에 붙이면 된다. 푸터에서 실제로 탭을 눌러 확인할 것.

**T8. 고객사 로고 대체 텍스트 교체**
파일: `src/components/Clients.jsx`
`:18-25`의 `alt: "client1"` 등을 실제 기관명으로. 후보 목록은 `docs/planning/06-01-mentor-content-request.md:136`에 있음 — 한국항공우주산업, 한국자동차연구원, 대구기계부품연구원, 대구디지털혁신진흥원, 중소벤처기업진흥공단, 한국생산성본부, 충남연구원, 한국IT비즈니스진흥협회. `src/assets/clients/client1~8`의 실제 이미지와 대조해 순서를 확정할 것. 언어별로 다를 필요는 없다(기관 고유명).

**T9. 영문 화면의 한국어 문자열 제거**
파일: `src/components/public/EditorialList.jsx`, `src/components/public/PageHeroMedia.jsx`, `src/components/ui/dialog.jsx`
- `EditorialList.jsx:49` `자세히 보기` → `useLocale()`로 `자세히 보기` / `Read more`
- `PageHeroMedia.jsx:3` 상수 → 컴포넌트 안에서 `useLocale()` 분기, 영문은 `Media unavailable.`
- `dialog.jsx:60` `aria-label="닫기"` → prop으로 받고 기본값 `Close`
남은 `state-panel.jsx`, `DesktopNavigation.jsx`, `StatementBand.jsx`는 별도 과제로 미뤄도 됨(노출 빈도가 낮음).

**T10. 뉴스 필터의 가짜 탭 정리 + 공지 페이지네이션**
파일: `src/pages/news.jsx`, `src/components/notices/NoticeList.jsx`
`news.jsx:290-307`에서 `role="tablist"`/`role="tab"`/`aria-selected`를 제거하고 `<div role="group" aria-label=...>` + `aria-pressed={activeFilter === option.value}`로 내린다. 목록 컨테이너에 `aria-live="polite"`를 붙여 필터 결과 변화를 알린다.
`NoticeList.jsx:73-89`의 양 끝 페이지에서는 `<Link>` 대신 `<span aria-disabled="true">`를 렌더.

### 3차 — 계획 준수 복구 (순차, 3개)

**T11. 뉴스 썸네일·외부 링크 DB 경로 복구**
파일: `src/server/modules/news/database-source.ts`, 필요 시 `src/server/db/schema/news.ts`
먼저 `news`/`newsLocales` 스키마에 썸네일·외부링크 컬럼이 있는지 확인한다. 있으면 `:34-41`과 `:80-86`의 select에 추가하고 `:50`, `:104`의 하드코딩 `""`/`[]`를 제거. 없으면 마이그레이션이 필요하므로 **범위를 넘는다고 보고하고 멈출 것.** 관리자 업로드 흐름까지 걸리는 문제다.

**T12. 홈 사업 영역을 관리자 데이터에 연결**
파일: `src/pages/index.jsx`, `src/components/industrial/DomainGrid.jsx`
03-03 §4를 따른다면: `DomainGrid`가 `areas` prop을 받아 `businessAreas` 정적 import를 대체하고, `SHOT` 매핑은 area.id 기준으로 유지. 계획을 포기한다면: `index.jsx:44`의 `getPublishedBusinessAreas` 호출과 `:50` props를 삭제. **어느 쪽인지는 사용자 판단이 필요하므로 먼저 물을 것.**

**T13. 사이트맵 범위 보정**
파일: `src/pages/sitemap.xml.tsx`
`publicRouteKeys`에 `"notices.list"` 추가. 뉴스·공지 상세는 `getPublishedNewsList`/`getPublishedNoticeList`를 호출해 게시된 슬러그만 로케일별로 넣는다 — 03-01 §8.2의 "영문 번역이 게시되지 않은 뉴스·공지사항의 영문 경로는 포함하지 않습니다"를 지켜야 하므로 로케일별로 따로 질의한다. `<lastmod>`도 같이 넣을 것.

### 4차 — 저장소 위생 (독립, 3개)

**T14. 루트 잡동사니 정리**
파일: `.gitignore`, 그리고 `git rm --cached`
`test.html`, `test.txt`, `bid-notice-console-errors.json`, `bid-notice-snapshot.md`, `ko_escapes.json`, `.playwright-mcp/`, `reports/`를 `.gitignore`에 추가하고 `git rm --cached`로 추적 해제. `reports/`는 `/reports/migration/`만 무시 중이므로 전체로 넓힐지 사용자 확인.

**T15. 죽은 컴포넌트 트리 제거**
파일: §5 표의 컴포넌트 19개 + `tests/components/home-hero.test.tsx`, `tests/components/design-interactions.test.tsx`
한 번에 지우기 전에 두 테스트 파일이 `Hero`/`HomeHero`에 걸어둔 검증(타이핑 순환, 동작 줄이기, 수동 정지)을 `IndustrialHero`로 옮긴다. 옮기고 나서 컴포넌트를 지운다. **순서를 뒤집으면 회귀 안전망이 사라진다.** 자산(`hero-animation.gif` 3벌, `src/assets/news/`, 중복 지도·대표사진)도 같은 커밋에서.

**T16. 발표용 UI 변형 스위치 제거**
파일: `src/pages/_app.jsx`, `src/styles/ui-variants.css`
`_app.jsx:9-28`의 `UI_VARIANTS`와 `useUiVariant`, `:75`의 호출, `:4`의 `ui-variants.css` import를 제거. CSS 파일은 남겨둬도 되지만 import가 끊기면 번들에서 빠진다.

### 미루기 — 별도 판단 필요

- **`outbound.jsx` → `global-programs.tsx` 파일 이동** (D22). 476줄 이동이라 diff가 크고 기능 변화가 없다. 다른 작업이 끝난 뒤 단독 커밋으로.
- **`unoptimized: true` 해제** (D2 후속). T6로 큰 파일을 줄인 뒤, 배포 환경이 Next 이미지 최적화를 감당하는지(standalone + sharp 설치 여부) 확인이 선행돼야 한다.
- **E2E 테스트 작성** (top 10 #10). `playwright.config.ts`가 이미 `./tests/e2e`를 가리키므로 파일만 넣으면 된다. 최소 스모크: ko·en 각 5개 페이지가 200으로 뜨고 h1이 하나인지, 문의 폼이 제출되는지.
- **푸터의 개인정보처리방침 링크** — 문의 폼(`contact.jsx:331`)이 "실제 개인정보 처리방침을 따릅니다"라고 쓰는데 그 방침으로 가는 링크가 사이트 어디에도 없습니다. plan.md §11이 "회사 확인 후 결정할 내용"으로 미뤄둔 항목이지만, 동의 체크박스를 이미 받고 있으므로 법적으로 앞당겨야 할 수 있습니다. 대표님 확인 사항.
- **본사 표기** (§4 확인 항목). `Footer.jsx:12-19`가 대구를 `본사`로 둡니다. 사업자등록 본점 기준으로는 맞지만 실무 본사가 광주라면 표기 방식을 정해야 합니다.
- **08 §2.2 색 표 갱신** (이탈 7). 코드가 문서보다 앞서 있습니다. 코드를 문서에 맞출지 문서를 코드에 맞출지 사용자 결정이 필요합니다.
- **03-03 §4 팝업 공지 항목 갱신** (이탈 8). 공지 명세는 2026-09-02에 모달로 바뀌었는데 03-03은 비모달로 남아 있습니다. 두 승인 문서가 충돌하므로 03-03에 결정 변경을 반영해야 합니다.
