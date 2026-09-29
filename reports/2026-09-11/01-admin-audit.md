# 관리자 영역 점검 보고

- 점검일: 2026-09-11
- 대상: `C:\브레인웍스\brainworks.co.kr`, 브랜치 `redesign/industrial`, HEAD `9bff514`
- 기준 문서: `docs/superpowers/specs/2026-09-07-admin-operations-completion-design.md` (승인), 같은 날짜 계획, `reports/2026-09-07-admin-audit.md`, `docs/superpowers/specs/2026-08-27-notice-public-number-design.md`, `docs/planning/04-admin-and-data/*`
- 방식: 읽기 전용. 관리자 화면/API/서버 모듈/테스트 전량 정독, `npx tsc --noEmit`, `npx vitest run` 실행. DB와 개발 서버는 실행하지 않았습니다.
- 실행 결과: 타입 검사 통과(exit 0). 테스트 37개 파일 중 2개 파일 3개 테스트 실패(아래 6절).

---

## 1. 요약 점수

**68 / 100**

1. 기능 범위는 실제로 거의 다 있습니다. 뉴스, 공지, 공지 카테고리, 팝업, 수상 및 인증, AI 솔루션 여섯 종 모두 목록에서 편집 화면으로 들어가 저장하고 언어별로 게시/중단하고 보관/복원할 수 있으며, 이전 감사(2026-09-07)에서 지적한 아홉 가지 결손 중 여덟 가지는 코드에 반영되어 있습니다. SSR 직렬화 위반은 한 건도 남아 있지 않습니다.
2. 반면 "저장했다고 말하지만 저장되지 않는" 조용한 데이터 손실 한 건, 잘못된 파일 업로드 한 번으로 요청 프로미스가 영원히 미결로 남는 경로 한 건, 예약 시각이 저장할 때마다 9시간씩 밀리는 시간대 왕복 오류 한 건이 그대로 있습니다. 전부 운영자가 "왜 이러지" 하고 넘어가기 쉬운 종류입니다.
3. 승인 계획이 지정한 테스트 파일 16개 중 5개만 존재합니다. 관리자 폼 여섯 개 가운데 렌더링 테스트가 하나도 없어서, 위 세 건 같은 결함을 잡아줄 그물이 아예 없습니다. 이게 감점의 가장 큰 부분입니다.

---

## 2. 확정 런타임 오류 및 버그 목록

### C-1. (Critical) 이미지 대체 설명과 뉴스 커버 설명을 지우면 저장되지 않는데 "저장했습니다"라고 안내함

- 위치
  - `src/components/admin/HonorForm.tsx:93`, `:99` — `imageAlt: form.locales.ko.imageAlt || undefined`
  - `src/components/admin/AiSolutionForm.tsx:102`, `:108` — 동일 패턴
  - `src/components/admin/NewsForm.tsx:117`, `:123` — `coverAlt: form.locales.ko.coverAlt || undefined`
  - 소비 지점: `src/server/modules/honors/repository.ts:193`, `src/server/modules/catalog/repository.ts:206`, `src/server/modules/news/repository.ts:127` — 모두 `set({ ...input.locales[locale], ... })`
- 무엇이 깨지는가: 이미 값이 들어 있는 대체 설명을 빈 문자열로 지우고 저장하면, 빈 문자열이 `|| undefined`로 바뀌어 `JSON.stringify`가 키 자체를 본문에서 제거합니다. 서버는 스프레드로 받은 객체에 그 키가 없으므로 Drizzle이 해당 컬럼을 UPDATE 대상에서 빼고, 예전 값이 DB에 그대로 남습니다. 화면에는 "수상 및 인증 내용을 저장했습니다"가 뜹니다. 새로고침하면 지웠던 문구가 되살아납니다.
- 어떻게 아는가: `JSON.stringify({a: undefined})`는 `"{}"`이고, Drizzle의 `set()`은 값이 없는 키를 SET 절에 포함하지 않습니다. 세 저장 함수 모두 로케일 필드를 개별 지정이 아닌 스프레드로 넘기므로 누락이 그대로 전달됩니다. 팝업만 `PopupNoticeForm.tsx:112` 에서 `|| null`을 써서 이 문제가 없습니다 — 같은 코드베이스 안에 올바른 대조군이 있습니다.
- 최소 수정: 세 폼의 `|| undefined`를 `|| null`로 바꿉니다(팝업과 동일하게). 컬럼이 nullable인지 확인하고, 아니면 `?? ""`로 맞춥니다. 파일 3개, 각 2줄.

### C-2. (Critical) 허용되지 않은 이미지를 올리면 업로드 요청이 예외로 빠져나가 응답하지 않음

- 위치: `src/server/modules/assets/upload-service.ts:32-40`
- 무엇이 깨지는가: `parser.on("finish", ...)` 콜백 안에서 `assertImageUploadMetadata`가 `HttpError("BAD_REQUEST")`를 던집니다. 이 콜백은 `new Promise` 실행자가 이미 반환된 뒤 스트림 내부에서 호출되므로, 던져진 예외는 프로미스가 잡지 못합니다. `resolve`도 `reject`도 호출되지 않아 `uploadImageAsset`의 await가 영원히 멈추고, 예외는 Node의 `uncaughtException`으로 올라갑니다. 운영 서버에는 전역 핸들러가 없으므로 프로세스가 내려갈 수 있습니다. 파일 입력은 `accept="image/jpeg,image/png,image/webp"`(`PopupNoticeForm.tsx:385`)로 힌트만 줄 뿐 강제가 아니므로, 운영자가 실수로 PDF나 SVG를 고르면 바로 이 경로입니다. 10MB 초과도 같은 경로입니다.
- 어떻게 아는가: `readMultipartImage`의 reject 호출은 `file.on("limit")`과 `parser.on("error")` 두 곳뿐이고, 검증은 세 번째 위치인 `finish` 리스너 본문에서 방어 없이 호출됩니다(`:38`). EventEmitter 리스너에서 던진 예외는 `emit()` 호출 스택을 타고 올라가며, 여기서는 스트림 내부이므로 어디에서도 잡히지 않습니다.
- 최소 수정: `finish` 리스너 본문 전체를 `try { ... } catch (error) { reject(error); }` 로 감쌉니다. 파일 1개, 3줄.

### C-3. (Important) 게시 시작/종료 시각이 편집 화면을 왕복할 때마다 시간대만큼 밀림

- 위치
  - 읽기: `src/pages/admin/notices/[noticeId].tsx:10-14`, `src/pages/admin/popup-notices/[popupNoticeId].tsx:13-17` — `date.toISOString().slice(0, 16)`
  - 쓰기: `src/components/admin/NoticeForm.tsx:53-55`, `src/components/admin/PopupNoticeForm.tsx:62-64` — `new Date(value).toISOString()`
- 무엇이 깨지는가: `toDateTimeLocal`은 UTC 벽시계 문자열을 만들어 `<input type="datetime-local">`에 넣습니다. 그런데 이 입력 요소의 값은 브라우저가 로컬 시각으로 해석합니다. 저장할 때 `toIso`는 그 로컬 시각을 다시 UTC로 변환합니다. 결과적으로 KST 기준 한 번 왕복할 때마다 9시간씩 과거로 밀립니다. 18:00 예약 → 다시 열면 09:00으로 보이고, 다시 게시하면 00:00으로 저장됩니다. 예약 팝업이 예정보다 일찍 뜨고, 종료가 시작보다 앞서면 `publishPopupNotice`가 `PUBLICATION_INVALID` "게시 기간을 확인해 주세요."로 거절합니다(`src/server/modules/popup-notices/repository.ts:91-97`).
- 어떻게 아는가: `toISOString()`은 정의상 UTC 문자열을 반환하고, `datetime-local`의 값은 시간대 정보가 없어 `new Date(...)`가 로컬로 파싱합니다. 두 변환이 서로의 역함수가 아닙니다.
- 최소 수정: 읽기 쪽을 `new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16)`으로 바꿉니다. 두 페이지의 `toDateTimeLocal`이 동일 코드이므로 공용 함수 하나로 뽑아 두 곳에서 가져다 쓰는 편이 낫습니다. 파일 2~3개.

### C-4. (Important) 한글 제목 뉴스는 같은 날 두 번째부터 저장 자체가 실패함

- 위치: `src/components/admin/NewsForm.tsx:56-64` (`suggestSlug`), `src/server/db/schema/news.ts:78` (`news_slugs_slug_uk`)
- 무엇이 깨지는가: `suggestSlug`는 `[^a-z0-9]+`가 아닌 문자를 전부 하이픈으로 바꾸므로 순한글 제목은 전체가 사라지고 `candidate`가 빈 문자열이 됩니다. 그러면 대체값 `news-${displayDate.replaceAll("-","")}`가 쓰입니다. 즉 같은 표시일의 한글 제목 뉴스는 전부 `news-20260911` 하나로 수렴합니다. 두 번째 초안 저장에서 `news_slugs_slug_uk` 고유 인덱스 위반이 나고, 이는 `HttpError`가 아니므로 `toPublicError`가 `INTERNAL_ERROR`로 바꿔 500과 "요청을 처리하지 못했습니다."만 표시됩니다. 운영자는 원인을 알 수 없습니다.
- 어떻게 아는가: 정규식 동작과 `createNews`(`src/server/modules/news/repository.ts:79-83`)가 `newsSlugs`에 무조건 INSERT하는 경로, 그리고 스키마의 `uniqueIndex("news_slugs_slug_uk")`를 대조했습니다. `src/pages/api/admin/news/index.ts:14`도 `input.slug`를 필수로 요구하므로 빈 값으로 우회할 수 없습니다.
- 최소 수정: `suggestSlug`의 대체값에 충돌 방지 접미사를 붙입니다(예: `news-${displayDate}-${Date.now().toString(36).slice(-4)}`). 근본적으로는 서버에서 고유 충돌을 잡아 `BAD_REQUEST` + "다른 공개 주소 이름을 입력해 주세요."로 바꾸는 편이 낫습니다. 파일 1~2개.

### C-5. (Important) 없는 ID로 편집/미리보기 화면에 들어가면 404 대신 500

- 위치
  - `src/pages/admin/notices/[noticeId].tsx:41-44`
  - `src/pages/admin/popup-notices/[popupNoticeId].tsx:50-53`
  - `src/pages/admin/honors/[honorId].tsx:26`
  - `src/pages/admin/ai-solutions/[solutionId].tsx:43-46`
  - `src/pages/admin/preview/notices/[contentId].tsx:8`
  - `src/pages/admin/preview/popup-notices/[contentId].tsx:36`
- 무엇이 깨지는가: `getAdminNotice`/`getAdminPopupNotice`/`getAdminHonor`/`getAdminAiSolution`은 대상이 없으면 `HttpError("NOT_FOUND")`를 던집니다(각 repository의 `if (!parent[0]) throw`). 위 여섯 곳은 `try`가 없어 `getServerSideProps`가 그대로 reject되고 Next가 500 오류 페이지를 냅니다. 보관 후 삭제된 링크나 북마크, 대시보드의 오래된 `adminHref`로 들어가면 바로 이 화면입니다.
- 어떻게 아는가: `src/pages/admin/news/[newsId].tsx:26,53-55`만 유일하게 `try/catch`로 `{ notFound: true }`를 반환합니다. 같은 저장소 안에서 여섯 곳이 그 처리를 빠뜨린 상태입니다.
- 최소 수정: 뉴스 편집 페이지와 동일하게 `try { ... } catch { return { notFound: true }; }`로 감쌉니다. 파일 6개, 각 2줄.

### C-6. (Important) 상태 변경 API 8개에 HTTP 메서드 가드가 없음

- 위치 (전부 `request.method` 검사 없음)
  - `src/pages/api/admin/notices/[id]/archive.ts:6-11`
  - `src/pages/api/admin/notices/[id]/restore.ts:6-11`
  - `src/pages/api/admin/popup-notices/[id]/archive.ts:7-11`
  - `src/pages/api/admin/popup-notices/[id]/restore.ts:7-11`
  - `src/pages/api/admin/popup-notices/[id]/renotify.ts:7-11`
  - `src/pages/api/admin/popup-notices/[id]/reorder.ts:7`
  - `src/pages/api/admin/popup-notices/[id]/publish.ts:7-12`
  - `src/pages/api/admin/honors/[id]/publish.ts:7`
  - `src/pages/api/admin/notice-categories/[id]/active.ts:7-10`
  - `src/pages/api/admin/popup-notices/[id].ts:7-13` (GET 외 모든 메서드가 저장으로 떨어짐)
- 무엇이 깨지는가: `assertSameOrigin`(`src/server/http/origin-guard.ts:10`)은 GET/HEAD/OPTIONS를 안전 메서드로 보고 바로 통과시킵니다. 위 라우트들은 메서드 구분이 없으므로 GET 요청도 게시/보관/복원/다시 알림 로직으로 들어갑니다. 실제로 상태가 바뀌려면 본문의 `expectedVersion`이 필요해 GET 단독으로는 `Number(undefined)` = NaN이 되어 DB 단계에서 실패하므로 즉시 악용 가능한 CSRF는 아니지만, 승인 설계가 약속한 "동일 출처 검사" 경계가 실제로는 이 라우트들에서 작동하지 않는 상태이고 405 규율도 깨져 있습니다. 같은 폴더의 `hide.ts`, `archive.ts`(뉴스), `publish.ts`(공지)에는 가드가 있어 일관성도 없습니다.
- 어떻게 아는가: 위 파일 전량을 읽고 `request.method` 검사 유무를 대조했습니다. `origin-guard.ts:4`의 `safeMethods` 집합이 GET을 포함합니다.
- 최소 수정: 각 파일 상단에 `if (request.method !== "POST") { response.setHeader("Allow","POST"); response.status(405).end(); return; }`를 추가합니다. 더 나은 방법은 `withApiErrorBoundary`에 메서드 화이트리스트 인자를 추가해 한 곳에서 강제하는 것입니다. 파일 9개, 각 1~4줄 또는 공통 래퍼 1곳.

### C-7. (Minor) 세션 만료 시 입력 보존과 로그인 화면 이동이 없음

- 위치: `src/lib/admin-api.ts:48-72`
- 무엇이 깨지는가: 설계 §4는 "세션 만료 응답은 로그인 화면으로 이동하기 전에 현재 입력을 브라우저 세션 저장소에 임시 보존한다"고 정했습니다. 현재 `requestAdminApi`는 `UNAUTHORIZED`에서 한국어 안내 문구만 던지고 끝입니다. `sessionStorage` 사용처는 팝업 닫기 기록(`src/components/popup-notices/dismissal-store.ts`) 하나뿐입니다. 장문 공지를 작성하다 세션이 끊기면 안내만 보고 그 뒤 모든 저장이 실패하며, 브라우저를 닫으면 내용을 잃습니다.
- 어떻게 아는가: `grep -rn "sessionStorage" src` 결과가 팝업 모듈 2줄뿐입니다.
- 최소 수정: `requestAdminApi`에서 `UNAUTHORIZED`를 잡아 호출자가 넘긴 폼 스냅숏을 `sessionStorage`에 쓰고 `/admin/auth/sign-in?returnTo=...`로 보냅니다. 폼 쪽은 마운트 시 스냅숏을 복원합니다. 파일 2개 + 각 폼 1줄.

### C-8. (Minor) 목록 조회가 전 행을 메모리로 읽고 자바스크립트에서 자름

- 위치: `src/server/modules/news/admin-queries.ts:18-38`(LIMIT/OFFSET 없음, `:98-100`에서 slice), `src/server/modules/notices/queries.ts:136-152`, `src/server/modules/popup-notices/queries.ts:53-67`, `src/server/modules/honors/repository.ts:72-88`, `src/server/modules/catalog/repository.ts:83-102`
- 무엇이 깨지는가: 콘텐츠가 수백 건을 넘어가면 관리자 목록 한 번에 `콘텐츠 수 x 2(로케일)` 행을 전부 읽습니다. 검색어 필터도 DB가 아니라 JS에서 돕니다(`admin-queries.ts:79-97`). 지금 데이터 양에서는 체감되지 않지만 운영 1~2년이면 문제가 됩니다.
- 어떻게 아는가: 다섯 쿼리 모두 `.limit()`/`.offset()` 없이 `select`하고 결과 배열에 `.filter`/`.slice`를 겁니다.
- 최소 수정: 당장은 불필요합니다. 뉴스 목록만이라도 `q`/`status`를 SQL WHERE로 내리고 `limit/offset`을 쓰면 충분합니다.

---

## 3. 스펙 대비 완성도 표 (§2.1~2.6)

범례: ✅ 구현, ⚠️ 부분, ❌ 없음

| 항목 | 뉴스 | 공지사항 | 공지 카테고리 | 팝업 공지 | 수상 및 인증 | AI 솔루션 | 계정/인증 |
|---|---|---|---|---|---|---|---|
| 목록 | ✅ `admin/news.tsx` (검색, 상태 필터, 페이지) | ⚠️ `admin/notices.jsx` — 검색/필터/페이지 없음 | ✅ `admin/notices/categories.tsx` | ⚠️ `admin/popup-notices.jsx` — 노출 기간/순서 미표시, 검색/필터 없음 | ⚠️ `admin/honors.tsx` — 검색/필터/페이지 없음 | ⚠️ `admin/ai-solutions/index.tsx` — 검색/필터/페이지 없음 | — |
| 등록 | ✅ `admin/news/new.tsx` | ✅ `admin/notices/new.tsx` | ✅ `NoticeCategoryForm.tsx:153` | ✅ `admin/popup-notices/new.tsx` | ✅ `admin/honors/new.tsx` | ✅ `admin/ai-solutions/new.tsx` | ❌ 계정 생성은 범위 밖(설계 §6) |
| 편집 | ✅ `NewsForm.tsx` | ✅ `NoticeForm.tsx` | ✅ `CategoryRow.save` | ✅ `PopupNoticeForm.tsx` | ✅ `HonorForm.tsx` | ✅ `AiSolutionForm.tsx` | ✅ `admin/account.tsx` 읽기 전용 + 비밀번호 변경 |
| 미리보기 | ✅ 서버 Markdown 정제 (`api/admin/previews/[contentType].ts`) | ⚠️ `NoticeForm.tsx:397-410` — Markdown을 `whitespace-pre-wrap` 평문으로만 출력, 공개 컴포넌트 미사용 | — | ✅ 실제 `PopupNoticeRegion` 재사용 (`PopupNoticeForm.tsx:515`) | ❌ 미리보기 없음(계획 문서 10.4가 요구) | ❌ 미리보기 없음(계획 문서 10.5가 요구) | — |
| 언어별 게시 | ✅ publish/hide | ✅ publish/unpublish + 예약 창 (단 C-3 시간대 오류) | — | ✅ publish/unpublish + 노출 기간 (단 C-3) | ✅ publish/hide | ✅ publish/hide | — |
| 게시 중단/숨김 | ✅ | ✅ | ⚠️ 삭제 대신 활성/비활성 토글 (설계대로) | ✅ | ✅ | ✅ | — |
| 보관 | ✅ | ✅ | ❌ 카테고리 보관 없음(설계가 요구하지 않음) | ✅ | ✅ | ✅ | — |
| 복원 | ✅ | ✅ | ❌ 동일 | ✅ | ✅ | ✅ | — |
| 미저장 변경 보호 | ✅ `useUnsavedChanges` | ✅ | ❌ `NoticeCategoryForm`은 훅 미사용 | ✅ | ✅ | ✅ | ❌ `account.tsx` 미사용(입력이 비밀번호뿐이라 무해) |
| 한국어 오류 매핑 | ✅ `adminApiErrorMessage` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ `account.tsx:46`, `sign-in.tsx:25` 등은 공통 매핑 대신 자체 문자열 |
| 버전 충돌 처리 | ✅ `expectedVersion` 전송 + 409 → 한국어 안내 | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| 순서 관리 | — | ⚠️ 고정 순서 숫자 입력만 | ✅ 숫자 입력 | ⚠️ 숫자 입력만, `reorder` API는 미연결 | ⚠️ 숫자 입력만 | ⚠️ 숫자 입력만 | — |

추가 관찰

- §2.1 "영구 삭제는 제공하지 않습니다" — 준수. 삭제 API가 하나도 없습니다.
- §2.2 "제목을 바탕으로 슬러그를 제안하고 관리자가 수정" — 구현됨(`NewsForm.tsx:99-102`, `:325-334`). 다만 한글 제목에서는 사실상 제안이 무력합니다(C-4).
- §2.3 "공개 번호는 DB가 발급하며 슬러그 입력은 다시 추가하지 않습니다" — 준수. `NoticeForm`, `NoticeCommandInput`, 공지 API 어디에도 `slug`가 없습니다. `tests/unit/notices/admin-notice-form.test.ts`가 회귀를 막고 있습니다.
- §2.4 "팝업에는 슬러그를 추가하지 않습니다" — 준수. 팝업 관련 전체 소스에 `slug` 없음.
- §2.4 "같은 언어에서 겹치는 팝업 최대 3건" — 구현됨. `publishPopupNotice`가 `pg_advisory_xact_lock`으로 언어별 잠금을 얻고(`repository.ts:98-100`) 기존 구간과 후보 구간을 함께 `assertPopupOverlapLimit`에 넘깁니다(`:122-128`). 이전 감사의 7번 항목은 해소되었습니다.
- §2.4 "다시 알림은 영향을 설명하고 확인한 뒤 실행" — 구현됨(`PopupNoticeForm.tsx:293-298`).
- §2.5 "사업 영역을 생성/수정/게시하는 관리자 기능은 만들지 않습니다" — 준수. `listAdminBusinessAreaOptions`는 읽기 전용입니다.
- §2.6 로그아웃 — 구현됨(`AdminShell.jsx:19-33`). 이전 감사에서 없다고 지적된 항목입니다.
- §2.6 재설정 메일 — 환경별 분기 구현됨(`password-reset-mail.ts:44-52`). local/test/development는 메모리 전송기, 그 외는 SMTP.
- §4 "저장 실패 시 입력을 유지" — 준수. 모든 폼이 `catch`에서 `setError`만 하고 상태를 건드리지 않습니다.
- §4 "보관/복원/다시 알림은 확인 대화상자" — 준수.
- §4 "게시 필수값 누락은 선택 언어와 누락 필드를 표시" — ⚠️. `PUBLICATION_INVALID` 하나로 뭉뚱그린 "게시할 언어의 필수 내용을 확인한 뒤 다시 시도해 주세요."만 나오고, 어느 언어의 어떤 필드인지는 알려주지 않습니다.
- 대시보드(`src/pages/admin/index.tsx`)는 뉴스/공지/팝업/수상 네 종만 집계합니다. AI 솔루션이 빠져 있고(`src/server/modules/admin/dashboard.ts:4-9`), 수상의 `adminHref`가 항목별 편집이 아니라 목록 `'/admin/honors'`로 고정입니다(`dashboard.ts:166`).

---

## 4. 계약 불일치 목록

| # | 폼 → API | 불일치 | 영향 | 근거 |
|---|---|---|---|---|
| 1 | `HonorForm`/`AiSolutionForm`/`NewsForm` → `PUT /api/admin/{honors,ai-solutions}/[id]`, `PATCH /api/admin/news/[id]` | `imageAlt`/`coverAlt`를 `\|\| undefined`로 보내 키가 사라짐 | 값 삭제가 저장되지 않음 (C-1) | `HonorForm.tsx:93`, `AiSolutionForm.tsx:102`, `NewsForm.tsx:117` vs `honors/repository.ts:193` |
| 2 | 관리자 API 전반 | zod 스키마가 한 곳도 없음. `zod`는 `package.json` 의존성이고 `src/server/env.ts`에서만 쓰입니다. 관리자 입력 검증은 `isNewsInput`(`api/admin/news/index.ts:7-20`), `isNoticeCommandInput`(`notices/contracts.ts:27-37`) 같은 truthy 검사 두 개와 각 repository의 도메인 어서션뿐 | `{ locales: { ko: 1, en: 1 } }` 같은 본문이 타입 검사를 통과해 DB 제약 위반(500)까지 내려감. 설계 §3의 "도메인 저장/게시 정책은 서버 모듈에 두고 React 폼의 HTML 필수 속성에만 의존하지 않습니다"를 형식적으로만 만족 | 전 라우트 grep 결과 `z.` 사용 0건 |
| 3 | `NoticeForm`/`PopupNoticeForm` → `POST .../publish` | 클라이언트가 `startsAt`/`endsAt`를 UTC ISO로 보내지만 원본은 로컬 벽시계 | 예약 시각 9시간 이동 (C-3) | `NoticeForm.tsx:165-172`, `notices/[noticeId].tsx:10-14` |
| 4 | `PopupNoticeForm` → `POST /api/admin/popup-notices` (생성) | `expectedVersion` 없이 생성 후 즉시 `/admin/popup-notices/{id}`로 이동. 서버는 `createPopupNotice` 반환값에 `version`을 담지만 폼은 쓰지 않고 SSR이 다시 읽음 | 문제 없음. 다만 뉴스/공지/수상/AI 솔루션과 달리 일부 API가 본문 검증 없이 `request.body`를 그대로 repository에 전달 | `api/admin/popup-notices/index.ts:11` — 검증 함수 없음 |
| 5 | 없음 → `POST /api/admin/popup-notices/[id]/reorder` | UI 호출자가 하나도 없음. 팝업 순서는 `savePopupNotice`의 `displayOrder`로만 바뀜 | 죽은 API. 계획 문서 §11의 "순서 조정 화면"이 미구현이라는 신호 | `grep -rn "reorder" src` 결과가 서버 측 4곳뿐 |
| 6 | 없음 → `POST /api/admin/assets/documents` | UI 호출자 없음. 항상 `DEPENDENCY_UNAVAILABLE`를 던짐 | 의도된 차단(설계 §2.3/§6)이므로 유지가 맞음. 다만 화면에는 안내 문구만 있고 이 API로 가는 경로가 없음 | `assets/documents.ts:14-17`, `NoticeForm.tsx:389-395` |
| 7 | 없음 → `/admin/preview/news/[contentId]`, `/admin/preview/notices/[contentId]`, `/admin/preview/popup-notices/[contentId]` | 세 페이지 모두 링크하는 UI가 없음. 미리보기는 폼 안에서 처리됨 | 죽은 화면 3개. `preview/news`는 Markdown 본문을 쿼리스트링으로 받는 구조라 긴 본문에서 URL 길이 제한에 걸림 | `grep -rn "admin/preview" src` 결과가 자기 자신뿐 |
| 8 | 없음 → `GET /api/admin/{news,notices,popup-notices,honors,ai-solutions,notice-categories}` | SSR이 repository를 직접 부르므로 GET 라우트를 아무도 호출하지 않음 | 무해. 유지 여부는 외부 연동 계획에 달림 | `grep -rno "/api/admin/..."` 결과 대조 |
| 9 | `NoticeCategoryForm` → `PUT /api/admin/notice-categories/[id]` | 본문 전체(`expectedVersion` 포함)를 `CategoryInput`으로 전달 | 현재는 무해(서버가 필드를 개별 지정). 다만 #2와 같은 계열의 느슨함 | `notice-categories/[id].ts:17-22` |
| 10 | 로그인/재설정 | 속도 제한 없음. `RATE_LIMITED` 코드와 한국어 문구는 준비되어 있으나 실제 사용처는 문의 폼(`contact/service.ts:22`)뿐 | 관리자 로그인 무차별 대입에 대한 방어가 better-auth 기본값에만 의존 | `grep -rn "RATE_LIMITED" src` |

---

## 5. 정리 대상 파일

### 5.1 라우팅 충돌 여부 (요청 항목 5의 결론)

**충돌은 없습니다.** Next Pages Router에서 `pages/admin/news.tsx`와 `pages/admin/news/new.tsx`는 서로 다른 경로(`/admin/news`, `/admin/news/new`)로 해석되며, 충돌은 `news.tsx`와 `news/index.tsx`가 동시에 있을 때만 발생합니다. 확인 결과 `news/`, `notices/`, `popup-notices/`, `honors/` 네 디렉터리 어디에도 `index.tsx`가 없습니다(`ai-solutions/`만 `index.tsx`를 쓰고 그쪽에는 형제 `ai-solutions.tsx`가 없습니다). 따라서 `honors.tsx` + `honors/`도 안전합니다. 고아 파일도 없습니다.

### 5.2 그래도 정리할 값이 있는 것

| 파일 | 상태 | 처리 |
|---|---|---|
| `src/pages/admin/notices.jsx` | 유일하게 남은 `.jsx` 목록 페이지. 전체 JSX가 한 줄(15행)로 압축되어 있고 타입이 없음 | `.tsx`로 전환하고 줄바꿈 복원. 기능 변경 없음 |
| `src/pages/admin/popup-notices.jsx` | 위와 동일(9~10행이 한 줄) | 위와 동일 |
| `src/components/admin/AdminShell.jsx` | JSDoc도 없는 `.jsx` | 낮은 우선순위로 `.tsx` 전환 |
| `src/components/admin/AdminPageHeader.jsx` | JSDoc 타입만 있는 `.jsx` | 위와 동일 |
| `src/pages/admin/preview/news/[contentId].tsx` | UI 호출자 없음. 본문을 쿼리스트링으로 받음 | 삭제 |
| `src/pages/admin/preview/notices/[contentId].tsx` | UI 호출자 없음 | 삭제 |
| `src/pages/admin/preview/popup-notices/[contentId].tsx` | UI 호출자 없음 | 삭제 |
| `src/pages/api/admin/popup-notices/[id]/reorder.ts` | UI 호출자 없음 | 순서 조정 화면을 만들 계획이면 유지, 아니면 삭제 |
| `src/server/modules/notices/services.ts` | repository를 그대로 재수출만 하는 배럴. `scheduleNotice`는 어디서도 호출되지 않음 | 삭제 또는 실제 사용처 연결 |
| `src/server/modules/popup-notices/services.ts` | 재수출만 하는 배럴. 모든 호출자가 repository를 직접 import | 삭제 |
| `src/server/modules/news/publication-policy.ts:32-37` | `resolveSlugRedirect`가 호출되지 않음(뉴스 리다이렉트는 `database-source.ts:60-105`가 직접 처리) | 삭제 또는 `database-source`를 이 함수로 통일 |

### 5.3 슬러그 잔존 참조 판정 (요청 항목 1)

| 위치 | 판정 |
|---|---|
| `src/components/admin/NewsForm.tsx` (11곳), `src/pages/admin/news/[newsId].tsx:46`, `src/pages/admin/news.tsx:106`, `src/pages/api/admin/news/[id]/slug.ts`, `src/pages/api/admin/news/index.ts:14`, `src/server/modules/news/{repository,admin-queries,database-source,publication-policy}.ts`, `src/server/db/schema/news.ts:61-79` | **유지 대상.** 설계 §2.2와 공개 번호 결정 §8이 뉴스 슬러그 정책을 명시적으로 범위 밖에 둡니다 |
| `src/server/db/schema/notices.ts:99-111` (`noticeSlugs` 테이블) | **유지 대상.** 공개 번호 결정 §3이 "마이그레이션에서 삭제하지 않는다, 기존 주소 호환 조회에만 사용한다"고 정했습니다 |
| `src/server/modules/notices/queries.ts:94-132` (`getPublishedNoticePublicNumberByLegacySlug`) | **유지 대상.** 같은 결정 §4의 308 리다이렉트 호환 경로입니다 |
| `src/pages/notices/[slug].tsx`, `src/pages/api/notices/[slug]/attachments/...` | **유지 대상.** 파일명의 `[slug]`는 동적 세그먼트 이름일 뿐이고, 내부에서는 `parseNoticePublicNumber`로 숫자 번호를 먼저 해석합니다 |
| `src/shared/routing/routes.ts:21` `{ key: "notices.detail", path: "/notices/:slug" }` | **표기만 낡음.** 동작에는 영향이 없으나 `:publicNumber`로 바꾸면 읽는 사람이 헷갈리지 않습니다 |
| 팝업 관련 전 소스 | **참조 없음.** 설계 §2.4 준수 |
| `src/components/{Awards,Honors,Footer}.jsx`, `src/utils/{awardsData,certificationsData}.js`, `src/data/bidNotices.js`, `src/lib/news.js` | **관리자와 무관.** 정적 공개 데이터의 키 이름입니다 |

요약하면 **"슬러그 작성 기능 삭제"로 인해 관리자 영역에 남은 죽은 참조나 형태 불일치는 없습니다.** 폼이 보내는데 스키마에 없는 슬러그 필드도, 컴포넌트가 기대하지 않는 형태를 반환하는 `getServerSideProps`도 발견되지 않았습니다. 체감하신 런타임 오류는 2절의 C-1~C-6, 특히 C-5(없는 ID → 500)와 C-4(한글 제목 뉴스 저장 실패)일 가능성이 큽니다.

### 5.4 SSR 직렬화 (요청 항목 2)

**위반 0건.** 관리자 페이지 16개의 `getServerSideProps`를 각각 호출 쿼리와 DB 스키마까지 추적했습니다.

- Date가 나올 수 있는 컬럼은 전부 차단되어 있습니다. `displayDate`는 `String()`(`admin-queries.ts:65`, `notices/queries.ts:169`, `news/[newsId].tsx:48`, `notices/[noticeId].tsx:65`), `occurredOn`은 `String()` 또는 `null`(`honors/repository.ts:116`, `honors/[honorId].tsx:47`), `publishStartsAt`/`publishEndsAt`는 `toDateTimeLocal`로 문자열화(`notices/[noticeId].tsx:52-53`, `popup-notices/[popupNoticeId].tsx:65-66`), 대시보드의 `updatedAt`은 `toIso`(`dashboard.ts:83`)입니다.
- `getAdminNotice`/`getAdminPopupNotice`/`getAdminHonor`/`getAdminAiSolution`은 `{ ...parent[0] }`로 `createdAt`/`updatedAt`/`archivedAt` Date를 그대로 반환하지만, 여섯 페이지 전부 필요한 필드만 명시적으로 골라 담기 때문에 props에는 들어가지 않습니다.
- `undefined`도 없습니다. 모든 선택 필드가 `|| ""`, `|| null`, `|| 0`, `|| 1`로 정규화되어 있습니다.
- 이전 감사의 8번(공지 편집 `.notice.createdAt` 직렬화 오류)은 해소되었습니다.

---

## 6. 테스트 공백

### 6.1 승인 계획이 지정한 테스트 파일 대비 실재 여부

| 계획이 지정한 파일 | 존재 |
|---|---|
| `tests/components/admin-form-foundation.test.tsx` | ✅ |
| `tests/unit/admin-api.test.ts` | ✅ |
| `tests/unit/admin-draft-publication-policy.test.ts` | ✅ |
| `tests/db/popup-notices-overlap.test.ts` | ✅ |
| `tests/unit/notices/admin-notice-form.test.ts` | ✅ |
| `tests/components/admin-notice-management.test.tsx` | ❌ |
| `tests/components/admin-popup-management.test.tsx` | ❌ |
| `tests/unit/assets/public-url.test.ts` | ❌ |
| `tests/components/admin-news-management.test.tsx` | ❌ |
| `tests/unit/news/admin-news-query.test.ts` | ❌ |
| `tests/components/admin-honors-management.test.tsx` | ❌ |
| `tests/unit/honors/draft-policy.test.ts` | ❌ |
| `tests/components/admin-ai-solutions-management.test.tsx` | ❌ |
| `tests/unit/catalog/ai-solution-draft-policy.test.ts` | ❌ |
| `tests/components/admin-account.test.tsx` | ❌ |
| `tests/unit/auth/password-reset-mail.test.ts` | ❌ |

16개 중 5개만 존재합니다. 계획은 각 Task마다 "실패 테스트 작성 → RED 확인 → 최소 구현 → GREEN 확인" 순서를 요구했는데, Task 1과 2를 제외하면 구현만 남고 테스트가 빠졌습니다.

### 6.2 설계 §5 검증 항목별 현황

| §5 항목 | 현황 |
|---|---|
| 초안과 게시 조건 실패 테스트 | ⚠️ `admin-draft-publication-policy.test.ts`가 `assertDraftLocales`와 `validatePopupLocale` 두 함수만 검증. `publishNewsLocale`/`publishNotice`/`publishAiSolution`의 로케일별 필수값 검사는 미검증 |
| 팝업 겹침 | ⚠️ `assertPopupOverlapLimit` 순수 함수만 검증. `publishPopupNotice`가 기존 구간을 실제로 읽어 합치는지(즉 이전 감사 7번의 근본 원인)는 미검증 |
| 공개 자산 URL | ❌ `resolvePublicAssetUrl` 테스트 없음. 계획이 지정한 `tests/unit/assets/public-url.test.ts` 부재 |
| 관리자 폼 6종의 RTL 테스트(한 언어 초안, 저장 요청, 언어별 명령, 오류, 미저장 변경) | ❌ **6종 전부 없음.** `NewsForm`, `NoticeForm`, `PopupNoticeForm`, `HonorForm`, `AiSolutionForm`, `NoticeCategoryForm` 어느 것도 렌더링되지 않습니다. C-1(대체 설명 미저장)과 C-3(시간대 이동)은 저장 요청 본문을 한 번만 단언하는 테스트로 즉시 잡혔을 결함입니다 |
| 관리자 목록/SSR 화면 모델의 공개 필터 누출과 날짜 직렬화 회귀 | ❌ `tests/unit/notices/serialization.test.ts`는 **공개** 조회 변환기(`toPublishedNoticeListItem`/`toPublishedNoticeDetail`)만 검증합니다. `getAdminNewsList`/`getAdminNoticeList`/`getAdminPopupNoticeList`/`listAdminHonors`/`listAdminAiSolutions` 다섯 개 관리자 쿼리는 테스트가 하나도 없습니다 |
| 전체 단위/컴포넌트 테스트, 타입 검사, 린트, 빌드 | ⚠️ 타입 검사는 통과. 테스트는 현재 RED |

### 6.3 지금 깨져 있는 테스트

```
Test Files  2 failed | 35 passed (37)
     Tests  3 failed | 118 passed (121)
```

- `tests/unit/catalog/published-business-areas.test.ts:23` — `getPublishedBusinessAreas("ko")`가 `TypeError: Cannot read properties of undefined (reading 'select')`로 거부됨. 테스트는 `DATABASE_URL`이 있어도 `getDb`가 호출되지 않는다고 단언하는데(`:26`), 현재 구현(`catalog/queries.ts:20-36`)은 AI 솔루션을 읽기 위해 실제로 DB를 조회합니다. 즉 **테스트가 설계 §2.5 이전의 계약을 그대로 들고 있는 낡은 테스트**입니다. 구현이 아니라 테스트를 고쳐야 합니다.
- `tests/components/design-interactions.test.tsx` 2건 — 공개 웹 히어로 타이핑 문구 관련. 이번 관리자 점검 범위 밖이지만 `npm test`를 빨간 상태로 만들고 있어 함께 정리가 필요합니다.

---

## 7. 권장 수정 순서

각 작업은 서로 의존하지 않으며, 이 설명만으로 착수할 수 있게 적었습니다.

### 작업 1 — 대체 설명 삭제가 저장되지 않는 문제 (최우선)

- 파일: `src/components/admin/HonorForm.tsx`, `src/components/admin/AiSolutionForm.tsx`, `src/components/admin/NewsForm.tsx`
- 내용: `payload()`/`inputPayload()`에서 `imageAlt: ... || undefined`, `coverAlt: ... || undefined` 네 쌍(각 파일 ko/en 2줄)을 `|| null`로 바꿉니다. `src/components/admin/PopupNoticeForm.tsx:110-119`가 이미 `|| null`을 쓰는 올바른 참고 구현입니다. 컬럼이 nullable이 아니면 `?? ""`로 맞추되, `honor_locales.image_alt` 등의 notNull 여부를 `src/server/db/schema/` 에서 먼저 확인하세요.
- 검증: 새 테스트 `tests/components/admin-honors-management.test.tsx`에서 `HonorForm`을 기존 `imageAlt`가 있는 값으로 렌더링하고, 해당 입력을 비운 뒤 저장 버튼을 눌러 `fetch` 목의 요청 본문에 `imageAlt`가 `null`로 포함되는지 단언합니다.

### 작업 2 — 업로드 검증 예외가 프로미스를 빠져나가는 문제

- 파일: `src/server/modules/assets/upload-service.ts`
- 내용: `parser.on("finish", ...)`(32~40행) 본문 전체를 `try/catch`로 감싸고 `catch (error) { reject(error); }`를 추가합니다. 겸사겸사 busboy 1.x 권장 이벤트인 `close`로 바꿀지 검토하되, 바꾼다면 파일 스트림을 끝까지 소비했는지 확인이 필요하므로 기본은 `try/catch`만 추가하는 쪽이 안전합니다.
- 검증: `tests/unit/assets/upload-service.test.ts`를 새로 만들어, `Content-Type: multipart/form-data`로 `application/pdf` 파트를 담은 가짜 `IncomingMessage`를 넘겼을 때 `uploadImageAsset`이 `HttpError("BAD_REQUEST")`로 **거부**되는지(무한 대기가 아니라) 단언합니다.

### 작업 3 — datetime-local 시간대 왕복 오류

- 파일: `src/pages/admin/notices/[noticeId].tsx`, `src/pages/admin/popup-notices/[popupNoticeId].tsx` (필요하면 공용 함수를 `src/lib/` 에 신설)
- 내용: 두 파일의 동일한 `toDateTimeLocal`을 로컬 시각 기준으로 고칩니다.
  ```ts
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  ```
  쓰기 쪽(`NoticeForm.tsx:53-55`, `PopupNoticeForm.tsx:62-64`의 `toIso`)은 이미 로컬 해석이므로 그대로 둡니다. 중복 정의를 공용 함수 하나로 합치면 다음에 또 어긋나지 않습니다.
- 검증: 순수 함수 테스트로 `toDateTimeLocal(toIso("2026-09-11T18:00"))`이 `"2026-09-11T18:00"`을 돌려주는 왕복 항등을 단언합니다.

### 작업 4 — 편집/미리보기 화면의 NOT_FOUND 처리

- 파일: `src/pages/admin/notices/[noticeId].tsx`, `src/pages/admin/popup-notices/[popupNoticeId].tsx`, `src/pages/admin/honors/[honorId].tsx`, `src/pages/admin/ai-solutions/[solutionId].tsx` (미리보기 페이지를 작업 7에서 삭제한다면 그쪽은 불필요)
- 내용: 각 `getServerSideProps`의 데이터 조회부를 `try { ... } catch { return { notFound: true }; }`로 감쌉니다. `src/pages/admin/news/[newsId].tsx:26-55`가 참고 구현입니다. `Promise.all`을 쓰는 세 곳은 `try` 블록이 `Promise.all` 전체를 덮어야 합니다.
- 검증: 지금 구조로는 SSR 테스트 기반이 없으므로 수동 확인(없는 UUID로 접근 시 404)으로 충분합니다.

### 작업 5 — 상태 변경 API의 메서드 가드 통일

- 파일: `src/server/http/api-handler.ts` + C-6에 나열한 라우트 9개
- 내용: `withApiErrorBoundary(handler, allowedMethods?: string[])` 형태로 선택 인자를 추가해, 허용 목록이 주어지면 핸들러 진입 전에 `Allow` 헤더를 세우고 405를 반환하게 합니다. 그다음 9개 라우트의 `export default`를 `withApiErrorBoundary(handler, ["POST"])`로 바꿉니다(`popup-notices/[id].ts`는 `["GET", "PUT"]`). 이미 개별 가드가 있는 라우트도 같은 방식으로 통일하면 중복 코드가 줄어듭니다.
- 검증: `tests/unit/http/api-handler.test.ts`에서 허용 목록 밖 메서드가 405와 `Allow` 헤더를 받는지 단언합니다.

### 작업 6 — 한글 제목 뉴스의 슬러그 충돌

- 파일: `src/components/admin/NewsForm.tsx`, `src/server/modules/news/repository.ts`
- 내용: (a) `suggestSlug`의 대체값에 짧은 랜덤 접미사를 붙여 같은 날 충돌을 막습니다. (b) `createNews`/`changeNewsSlug`의 `newsSlugs` INSERT를 감싸 Postgres 고유 제약 위반(코드 `23505`)을 `HttpError("BAD_REQUEST", "이미 사용 중인 공개 주소 이름입니다. 다른 이름을 입력해 주세요.")`로 바꿉니다. (b)가 근본 수정이고 (a)는 사용성 개선입니다.
- 검증: `suggestSlug` 순수 함수 테스트로 순한글 제목 두 개가 서로 다른 결과를 내는지 단언합니다.

### 작업 7 — 죽은 파일 정리

- 파일: `src/pages/admin/preview/` 디렉터리 전체(3개), `src/server/modules/{notices,popup-notices}/services.ts`, `src/server/modules/news/publication-policy.ts`의 `resolveSlugRedirect`, (순서 조정 화면 계획이 없다면) `src/pages/api/admin/popup-notices/[id]/reorder.ts`
- 내용: 삭제 전 `grep -rn "<심볼>" src tests`로 참조 0건을 확인합니다. `services.ts`의 `scheduleNotice`는 어디서도 호출되지 않으므로 함께 사라집니다.
- 검증: `npx tsc --noEmit`과 `npx vitest run`이 기존과 동일한 결과인지 확인합니다.

### 작업 8 — 낡은 catalog 테스트 수정 (테스트를 빨간 상태에서 꺼내는 작업)

- 파일: `tests/unit/catalog/published-business-areas.test.ts`
- 내용: 이 테스트는 `DATABASE_URL`이 있어도 `getDb`가 호출되지 않는다고 단언하지만, 설계 §2.5가 AI 솔루션을 DB 관리 콘텐츠로 정한 이후 `getPublishedBusinessAreas`는 실제로 솔루션을 조회합니다. `getDbMock`이 체이닝 가능한 가짜 쿼리 빌더를 반환하도록 바꾸고, "사업 영역 분류 자체는 고정 목록에서 오고 각 영역의 솔루션만 DB에서 온다"로 단언을 다시 씁니다.
- 검증: `npx vitest run tests/unit/catalog`

### 작업 9 — 관리자 폼 RTL 테스트 (계획 미이행분 회수)

- 파일: `tests/components/admin-news-management.test.tsx`, `admin-notice-management.test.tsx`, `admin-popup-management.test.tsx`, `admin-honors-management.test.tsx`, `admin-ai-solutions-management.test.tsx`
- 내용: 폼마다 `fetch`를 스텁하고 네 가지를 단언합니다. (1) 한 언어 제목만 채운 초안이 저장 요청을 보낸다, (2) 요청 본문의 필드 이름과 값이 서버 입력 타입과 일치한다(작업 1과 3의 회귀 방지), (3) 미저장 변경이 있으면 언어별 게시 버튼이 비활성이다, (4) 서버가 `VERSION_CONFLICT`를 주면 새로고침 안내가 `role="alert"`로 뜨고 입력이 유지된다. `tests/components/admin-form-foundation.test.tsx`가 기존 작성 양식의 참고입니다.
- 검증: `npx vitest run tests/components`

### 작업 10 — 관리자 목록 쿼리 형태 테스트

- 파일: `tests/unit/news/admin-news-query.test.ts` 신설
- 내용: `getAdminNewsList`의 그룹화/필터/페이지 로직을 순수 함수로 분리한 뒤(또는 `getDb`를 목으로 두고) 다음을 단언합니다. (1) `DRAFT`와 `ARCHIVED` 항목이 목록에서 빠지지 않는다(공개 필터 누출 회귀), (2) 반환값에 `Date` 인스턴스가 하나도 없다(`JSON.parse(JSON.stringify(x))`와 깊은 동등 비교), (3) `status=ARCHIVED` 필터가 `itemStatus` 기준으로 동작한다. 공지/팝업/수상/AI 솔루션 목록에도 같은 (2)번 단언을 붙이면 SSR 직렬화 회귀를 앞으로도 막을 수 있습니다.

### 작업 11 (선택) — 설계 §4의 나머지

- 세션 만료 시 입력 임시 보존과 로그인 화면 이동 (`src/lib/admin-api.ts` + 각 폼)
- 게시 필수값 누락 시 어느 언어의 어떤 필드인지 표시 (`PUBLICATION_INVALID`에 `locale`/`fields` 메타 추가 → `adminApiErrorMessage` 확장)
- 로그인/재설정 속도 제한 (better-auth의 rateLimit 옵션을 `src/server/auth/config.ts`에서 명시)
- 대시보드에 AI 솔루션 추가 및 수상 항목의 `adminHref`를 항목별 편집 경로로 변경 (`src/server/modules/admin/dashboard.ts:4-9`, `:166`)

---

## 부록. 이번 점검에서 실제로 읽은 주요 파일

**관리자 화면 (16)**
`src/pages/admin/index.tsx`, `account.tsx`, `news.tsx`, `news/new.tsx`, `news/[newsId].tsx`, `notices.jsx`, `notices/new.tsx`, `notices/[noticeId].tsx`, `notices/categories.tsx`, `popup-notices.jsx`, `popup-notices/new.tsx`, `popup-notices/[popupNoticeId].tsx`, `honors.tsx`, `honors/new.tsx`, `honors/[honorId].tsx`, `ai-solutions/index.tsx`, `ai-solutions/new.tsx`, `ai-solutions/[solutionId].tsx`, `auth/{sign-in,forgot-password,reset-password}.tsx`, `preview/{news,notices,popup-notices}/[contentId].tsx`

**관리자 컴포넌트 (9)**
`src/components/admin/{AdminShell.jsx, AdminPageHeader.jsx, AdminFormFeedback.tsx, LocalePublicationPanel.tsx, NewsForm.tsx, NoticeForm.tsx, NoticeCategoryForm.tsx, PopupNoticeForm.tsx, HonorForm.tsx, AiSolutionForm.tsx}`

**관리자 API (38)**
`src/pages/api/admin/**` 전량

**서버 모듈**
`src/server/modules/{news,notices,popup-notices,honors,catalog,admin,preview,assets}/**`, `src/server/http/{api-handler,errors,origin-guard}.ts`, `src/server/auth/{config,policy,require-admin}.ts`, `src/server/db/{client,integrity}.ts`, `src/server/env.ts`, `src/server/infrastructure/password-reset-mail.ts`

**공용**
`src/lib/admin-api.ts`, `src/hooks/useUnsavedChanges.ts`, `src/shared/routing/routes.ts`, `src/shared/schemas/contact.ts`

**테스트**
`tests/components/admin-form-foundation.test.tsx`, `tests/unit/{admin-api, admin-dashboard, admin-draft-publication-policy}.test.ts`, `tests/unit/notices/*`, `tests/unit/catalog/published-business-areas.test.ts`, `tests/db/{popup-notices-overlap, notices-repository}.test.ts`

**가장 먼저 열어 볼 파일 5개**
1. `src/components/admin/HonorForm.tsx:93` — C-1
2. `src/server/modules/assets/upload-service.ts:32` — C-2
3. `src/pages/admin/notices/[noticeId].tsx:10` — C-3, C-5
4. `src/components/admin/NewsForm.tsx:56` — C-4
5. `src/pages/api/admin/popup-notices/[id]/publish.ts:7` — C-6
