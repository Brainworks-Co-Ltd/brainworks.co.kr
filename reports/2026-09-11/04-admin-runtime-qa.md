# 관리자 콘솔 런타임 QA 보고서

- 대상: http://localhost:3300 (Next.js 16.3.2 dev, Turbopack, Pages Router)
- DB: postgres dev (5433), 마이그레이션 적용 상태
- 계정: qa-admin@brainworks.local (로컬 QA 전용)
- 실행일: 2026-09-11
- 도구: gstack browse 헤드리스 브라우저(Aside 미설치 환경 → `$B` 폴백), 서버 로그 `C:\브레인웍스\.tmp\dev-3300.log`
- 스크린샷 폴더: `C:\Users\cjh51\AppData\Local\Temp\claude\C-------\ec9d5c0e-0bf1-42da-84c2-b936273d13d5\scratchpad\qa\`

## 요약

| 심각도 | 건수 | 내역 |
|---|---|---|
| Critical | 4 | (1) better-auth Invalid origin으로 로그인, 로그아웃, 비밀번호 변경, 비밀번호 재설정 요청 전부 403 (2) 같은 날 한글 제목 뉴스 두 번째부터 슬러그 충돌 500 (3) 저장 직후 게시/숨김/보관 버튼 영구 비활성화(5개 폼 공통) (4) 예약 게시와 팝업 노출 기간이 UI로 도달 불가 |
| Important | 10 | nav 이동 시 미저장 경고 미작동, 저장 후 경고 오탐, 중복 제출 미차단(500), 서버 예외 무로깅, AI 솔루션 섹션 진입 불가, 카테고리 중복 생성 허용, 수상 게시 422가 누락 필드를 안 알려줌, 세션 만료 화면에 로그인 경로 없음, 뉴스 목록에 원문 enum `COMPANY` 노출, 수상 순서 관리 UI 부재와 순서 충돌 500 |
| Minor | 12 | 대시보드 현황표에 AI 솔루션 누락, 카테고리 등록 후 폼 미초기화, S3 미설정 안내가 일시 장애처럼 보임, 초안에도 "공개 보기" 링크(404), 초안 상태에서 숨김 허용, 버전 충돌 복구 경로 없음, 관리자 URL에 UUID 노출, 미매핑 오류가 한 문장으로 뭉개짐, 비밀번호 찾기 화면에 제목 없음, `/bid-notice`가 410 Gone, 404가 브랜드 없는 영문 기본 화면, 공지 상세에서 제목과 날짜 중복 출력 |

가장 큰 문제 두 가지는 서로 독립적이다.

1. **로그인 자체가 불가능하다.** `.env`의 `APP_ORIGIN=http://localhost:3000`과 실제 구동 포트 3300이 달라 better-auth가 모든 POST를 `Invalid origin`으로 403 처리한다. 로그인, 로그아웃, 비밀번호 변경, 비밀번호 재설정 요청이 전부 막히고, 화면에는 전혀 다른 원인을 가리키는 메시지가 나온다. QA는 API로 세션 쿠키를 발급받아 우회한 뒤 나머지 흐름을 진행했다.
2. **저장하면 게시 버튼이 죽는다.** 5개 관리 폼 전부가 같은 `dirty` 계산 버그를 갖고 있어, 한 번 저장하면 새로고침 전까지 게시/숨김/보관 버튼이 영구 비활성화된다. 여기에 게시 기간 입력까지 겹치면 예약 게시는 UI로 아예 도달할 수 없다.

---

## 1. 흐름별 결과 표

### 1.1 로그인과 세션

| 단계 | 기대 | 실제 | 심각도 | 스크린샷 | 로그 |
|---|---|---|---|---|---|
| 로그인 화면 진입 | 정상 렌더 | 정상, 콘솔 오류 없음 | - | `01-signin.png` | - |
| 틀린 비밀번호 | 원인 메시지 | "이메일 또는 비밀번호를 확인해 주세요." 표시. 문구 자체는 적절 | - | `02-signin-wrongpw.png` | `POST /api/auth/sign-in/email/ 403` |
| **맞는 비밀번호** | `/admin` 진입 | **로그인 실패. 틀린 비밀번호와 똑같은 메시지** | **Critical** | `02-signin-wrongpw.png` | `[Better Auth]: Invalid origin: http://localhost:3300` + `403` |
| 세션 유지(새로고침) | 유지 | 쿠키 주입 후 정상 유지 | - | - | - |
| **로그아웃 버튼** | 로그아웃 | **"로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요." 무한 반복. 세션 종료 불가** | **Critical** | `04-logout.png` | `[Better Auth]: Invalid origin` + `POST /api/auth/sign-out/ 403` |

### 1.2 대시보드와 네비게이션

| 단계 | 기대 | 실제 | 심각도 | 스크린샷 |
|---|---|---|---|---|
| `/admin` 렌더 | 콘텐츠 현황 표시 | 정상. 콘텐츠 상태표, 처리할 항목, 최근 변경, 빠른 작성 4개 블록 | - | `03-dashboard.png` |
| 좌측 nav 링크 8개 | 전부 200 | 전부 200, 빈 화면 없음 | - | - |
| 콘텐츠 상태표 구성 | nav와 일치 | **AI 솔루션 행이 없음.** 뉴스, 공지사항, 팝업 공지, 수상 및 인증 4행만 존재 | Minor | `03-dashboard.png` |

### 1.3 뉴스

| 단계 | 기대 | 실제 | 심각도 | 스크린샷 | 로그 |
|---|---|---|---|---|---|
| 새 뉴스 폼 | 렌더 | 정상. 슬러그 필드("공개 주소 이름") 존재 | - | `05-news-new.png` | - |
| 국문 제목만 입력 후 초안 저장 | 생성 | 201, 편집 화면으로 이동 | - | - | `POST /api/admin/news/ 201` |
| 목록 반영 | 상태 표시 | "국문 초안, 영문 초안" 정상 표시 | - | `28-news-list.png` | - |
| 목록의 분류 표기 | 한글 라벨 | **`COMPANY` 원문 enum 그대로 노출** (편집 화면은 "회사 소식"으로 정상) | Important | `28-news-list.png` | - |
| 한글 제목 슬러그 자동 제안 | 의미 있는 값 | `news-20260911` (날짜 fallback). "QA 뉴스..."처럼 영문이 섞이면 `qa`로 잘림 | Important | `27-...png` | - |
| **한글 제목 뉴스 2건을 같은 날 작성** | 중복 안내 | **두 번째 저장에서 HTTP 500, "요청을 처리하지 못했습니다."만 표시. 어느 필드가 문제인지 단서 없음** | **Critical** | `27-news-korean-slug-collision.png`, `06-news-dup-slug.png` | `POST /api/admin/news/ 500` (서버 로그에 스택 없음) |
| 국문 미리보기 | 인라인 미리보기 | 정상 | - | `08-news-preview-ko.png` | `POST /api/admin/previews/news/ 200` |
| 영문 내용 없이 영문 게시 | 검증 거부 | 422 + "게시할 언어의 필수 내용을 확인한 뒤 다시 시도해 주세요." 정상 | - | `09-news-en-publish-empty.png` | `publish/ 422` |
| 국문 게시 | 공개 | 정상. `/news/qa` 200 | - | - | `publish/ 200` |
| 슬러그 변경 | 확인 후 변경 + 리다이렉트 | 정상. 구 주소 308 리다이렉트 확인 | - | - | `slug/ 200`, `GET /news/qa/ 308` |
| 국문 숨김 | 공개 404 | 정상 | - | - | `hide/ 200` |
| 보관 → 복원 | 상태 전환 | 정상. 복원 시 두 언어 초안 전환을 confirm에서 사전 고지 | - | - | `archive/ 200`, `restore/ 200` |
| 목록 검색/상태 필터 | 동작 | 정상 (`?q=한글&status=ALL` → 1건) | - | - | - |
| 목록의 "공개 보기" | 게시 항목만 유효 | **초안 항목에도 링크가 노출되어 클릭 시 404** | Minor | `28-news-list.png` | - |

### 1.4 공지사항

| 단계 | 기대 | 실제 | 심각도 | 스크린샷 | 로그 |
|---|---|---|---|---|---|
| 카테고리 페이지 | 렌더 | 정상 | - | `10-notice-categories.png` | - |
| 카테고리 생성 | 생성 + 폼 초기화 | 201 생성. **입력값이 폼에 그대로 남음** | Minor | `11-categories-after.png` | `POST /api/admin/notice-categories/ 201` |
| **동일 이름 재등록** | 중복 거부 | **201로 그대로 중복 생성됨** (DB에 동일 이름, 동일 표시 순서 2건 확인) | Important | - | `201` |
| 카테고리 비활성화 | 목록에서 제외 | 정상. "새 공지의 선택 목록에서 제외했습니다." + 공지 작성 화면 옵션에서 사라짐 | - | - | `active/ 200` |
| 새 공지 폼 | 렌더 | 정상. 슬러그 없음, 공지 번호 자동 부여 | - | `12-notice-new.png` | - |
| 카테고리 미선택 저장 | - | 201 (카테고리는 선택 사항) | - | - | `201` |
| 첨부파일 영역 안내 | 명확한 안내 | "문서 악성코드 검사 제공자와 운영 정책이 확정되기 전까지 첨부파일 업로드는 사용할 수 없습니다." 명확 | - | `13-notice-edit.png` | - |
| **내용 저장 후 게시 시도** | 게시 가능 | **게시, 게시 중단, 보관 버튼 전부 비활성화. 새로고침해야 풀림** | **Critical** | `14-notice-buttons-disabled.png` | - |
| **게시 시작 일시 입력 후 게시** | 예약 게시 | **입력 순간 게시 버튼 비활성화 → 변경 저장해도 안 풀림 → 새로고침하면 입력값 소실. 예약 게시 도달 불가** | **Critical** | `15-notice-schedule-deadend.png` | 저장 시 `PUT 200`이지만 일시는 payload에 없음 |
| 국문 게시(새로고침 후) | 공개 | 정상. `/notices/2` 200 | - | - | `publish/ 200` |
| 공개 목록 `/notices` | 게시분 노출 | 정상, 고정 표기 반영 | - | - | `GET /notices/ 200` |
| 게시 중단 | 공개 404 | 정상 | - | - | `unpublish/ 200`, `GET /notices/2/ 404` |
| 보관 → 복원 | 정상 | 정상 | - | - | `archive/ 200`, `restore/ 200` |
| 존재하지 않는 번호 | 404 | `/notices/999` 404 정상 | - | - | - |

### 1.5 팝업 공지

| 단계 | 기대 | 실제 | 심각도 | 스크린샷 | 로그 |
|---|---|---|---|---|---|
| 새 팝업 폼 | 렌더 | 정상. 연결 공지 선택, 언어별 제목/본문/이미지/순서 | - | `16-popup-new.png` | - |
| **S3 없이 이미지 업로드** | 명확한 오류 | 크래시 없음. 503 + "연결된 서비스가 준비되지 않았습니다. 잠시 뒤 다시 시도해 주세요." **다만 영구 미설정을 일시 장애처럼 안내** | Minor | - | `POST /api/admin/assets/ 503` |
| 공지 연결 | 선택 반영 | 정상 | - | - | - |
| 초안 저장 → 국문 게시 | 게시 | 정상 (3번째 팝업) | - | - | `publish/ 200` |
| **4번째 팝업 게시** | 3개 제한 거부 | 409 + "같은 언어로 노출되는 팝업이 이미 3개입니다. 게시 기간을 조정하거나 기존 팝업의 게시를 중단해 주세요." 정상 | - | `17-popup-4th.png` | `publish/ 409` |
| 다시 알림(renotify) | confirm + 반영 | confirm "이 팝업을 오늘 보지 않기로 한 방문자에게도 다시 표시합니다." 후 200, 성공 메시지 표시 | - | - | `renotify/ 200` |
| **노출 기간 입력 후 게시** | 기간 게시 | **공지사항과 동일한 막다른 길. 기간 입력 즉시 게시 버튼 비활성화, 저장해도 안 풀림** | **Critical** | - | - |
| 공개 홈 팝업 | 노출 | 정상. 3건이 순차 노출 | - | `18-home-popup.png` | - |
| 오늘 하루 보지 않기 | 재노출 안 함 | 정상. localStorage `brainworks:popup:day:<id>`에 `{revision, day}` 저장, 새로고침 후 재노출 없음 | - | - | - |

### 1.6 수상 및 인증

| 단계 | 기대 | 실제 | 심각도 | 스크린샷 | 로그 |
|---|---|---|---|---|---|
| 새 항목 폼 | 렌더 | 정상. 유형 내 순서는 다음 값 자동 제안(1 → 2 → 3) | - | `19-honor-new.png` | - |
| 제목 + 기관만 채우고 게시 | 검증 안내 | 422 + "게시할 언어의 필수 내용을 확인한 뒤 다시 시도해 주세요." **어느 필드가 필수인지(설명) 화면에 표시가 없음** | Important | - | `publish/ 422` |
| 설명 채운 뒤 게시 | 게시 | 정상. 공개 `/about/honors`에 반영 | - | `20-honors-list.png` | `publish/ 200` |
| 숨김 / 보관 / 복원 | 정상 | 정상 | - | - | `hide/ 200`, `archive/ 200`, `restore/ 200` |
| 초안 상태에서 숨김 | 의미 없는 조작 차단 | 초안인데도 숨김이 200으로 처리됨 | Minor | - | `hide/ 200` |
| 유형 내 순서 관리 | 목록에서 재정렬 | 목록에는 정렬 UI가 없고 항목별 숫자 입력만 존재. 순서 충돌 시 서버가 500을 냄(아래 2.4) | Important | `20-honors-list.png` | - |

### 1.7 AI 솔루션

| 단계 | 기대 | 실제 | 심각도 | 스크린샷 |
|---|---|---|---|---|
| 목록 | 렌더 | "등록된 AI 솔루션이 없습니다." + "새 솔루션" 버튼 | - | - |
| **새 솔루션(사업 영역 0건)** | 안내 또는 생성 경로 | 크래시 없음. "사용할 수 있는 사업 영역이 없습니다. 기준 데이터 반영 상태를 확인해 주세요."만 표시되고 **폼 자체가 렌더되지 않음** | Important | `21-ai-solution-new.png` |
| 사업 영역 생성 경로 | 관리자에 존재 | **관리자 어디에도 사업 영역을 만드는 화면이나 API가 없음.** 마이그레이션/스크립트로만 주입 가능 → 이 섹션 전체가 운영자에게 막힌 길 | Important | - |
| 이후 생명주기 | - | 진입 불가로 검증 불가 | - | - |

### 1.8 계정

| 단계 | 기대 | 실제 | 심각도 | 스크린샷 | 로그 |
|---|---|---|---|---|---|
| `/admin/account` 읽기 전용 정보 | 이름/이메일/권한/상태 | 정상 표시 | - | `22-account.png` | - |
| 비밀번호 입력 필드 | type=password, autocomplete | 3개 전부 `type=password`, `current-password`/`new-password` 지정, `required` 적용. 정상 | - | - | - |
| **틀린 현재 비밀번호로 변경** | "현재 비밀번호가 다릅니다" | "현재 비밀번호를 확인하거나 새 비밀번호 조건을 확인해 주세요." 표시. **그러나 실제 원인은 origin 403이며 맞는 비밀번호로도 동일 실패** | **Critical** | - | `[Better Auth]: Invalid origin` + `POST /api/auth/change-password/ 403` |
| 맞는 현재 비밀번호로 변경 | 변경 성공 | **UI로는 불가.** API에 `Origin: http://localhost:3000`을 붙이면 200으로 정상 동작(틀린 값은 400 `INVALID_PASSWORD`). 즉 로직은 정상, origin 설정만 문제 | **Critical** | - | `change-password/ 200` |
| 비밀번호 원복 | 원복 | API 경유로 원복 완료. 현재 비밀번호는 `QaAdmin!2026pass` 그대로 | - | - | - |
| 비밀번호 찾기 화면 | 메일 발송 안내 | 화면은 렌더되나 전송 시 "요청을 전송하지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요." 표시. 원인은 동일한 origin 403 | Critical | `23-forgot-password.png` | `POST /api/auth/request-password-reset/ 403` |
| 비밀번호 찾기 화면 제목 | h1 존재 | 접근성 트리에 제목 노드 없음(입력과 버튼만) | Minor | `23-forgot-password.png` | - |

### 1.9 교차 관심사

| 항목 | 기대 | 실제 | 심각도 | 스크린샷 | 로그 |
|---|---|---|---|---|---|
| 미저장 이탈 경고(폼 내 "목록으로") | 확인창 | 정상. "저장하지 않은 변경사항이 있습니다. 이 화면에서 나가시겠습니까?" | - | - | - |
| **미저장 이탈 경고(좌측 nav)** | 확인창 | **경고 없이 즉시 이동. 입력 내용 소실 확인** | **Important** | - | - |
| **저장 후 오탐 경고** | 경고 없음 | **저장 성공 직후에도 이탈 시 미저장 경고가 뜸** | Important | - | - |
| 중복 제출 방지 | 1회만 전송 | **버튼 3연타 시 POST 3건 전송. 2, 3번째가 500** | Important | - | `POST /api/admin/honors/ 201, 500, 500` |
| 버전 충돌(두 탭 동시 저장) | 안내 | 409 + "다른 관리자 작업으로 내용이 변경되었습니다. 페이지를 새로고침한 뒤 다시 저장해 주세요." 정상 | - | `24-version-conflict.png` | `PATCH ... 409` |
| 버전 충돌 후 복구 경로 | 병합 또는 백업 | 새로고침 외 경로 없음. 편집 내용은 그대로 소실 | Minor | - | - |
| 세션 만료 | 안내와 재로그인 경로 | "관리자 세션이 만료되었습니다. 로그인한 뒤 다시 시도해 주세요." 정상 표시. **다만 로그인 링크가 없고 자동 이동도 없음** | Important | `25-session-expired.png` | `PATCH ... 401` |
| 한국어 오류 메시지 | 코드 미노출 | `src/lib/admin-api.ts`에 8개 코드가 한국어로 매핑되어 있고 원문 코드 노출 없음. 다만 매핑 없는 오류는 전부 "요청을 처리하지 못했습니다."로 뭉개짐 | Minor | - | - |
| 원문 UUID 노출 | 감춤 | 편집 화면 URL이 `/admin/news/2dfa61b8-...` 형태로 UUID 그대로. 운영자가 주소를 공유하거나 기억하기 어려움 | Minor | - | - |
| 버전 번호 노출 | - | 화면에 버전 숫자는 노출되지 않음. 정상 | - | - | - |
| 서버 500 로깅 | 스택 기록 | **`withApiErrorBoundary`가 예외를 전부 삼켜 dev 로그에 스택이 전혀 남지 않음.** 500이 나도 원인 추적 불가 | Important | - | - |

### 1.10 공개 페이지 스윕

| URL | HTTP | 콘솔 |
|---|---|---|
| `/` | 200 | Next dev HMR 잡음만 |
| `/en` | 200 | 없음 |
| `/news` | 200 | HMR 잡음 |
| `/notices` | 200 | 없음 |
| `/about` | 200 | 없음 |
| `/about/history` | 200 | HMR 잡음 |
| `/about/honors` | 200 | HMR 잡음 |
| `/services` | 200 | HMR 잡음 |
| `/consulting` | 200 | HMR 잡음 |
| `/education` | 200 | HMR 잡음 |
| `/global-programs` | 200 | HMR 잡음 |
| `/contact` | 200 | HMR 잡음 |
| `/bid-notice` | **410 Gone** | 410 리소스 오류. 본문(연락처)은 렌더됨 |
| `/nonexistent-qa-404` | 404 | 기본 Next 404 화면 |
| `/notices/2` (게시) | 200 | 없음 |
| `/news/qa-news-test` (숨김 후) | 404 | - |

---

## 2. 확정 런타임 오류 목록

### 2.1 better-auth Invalid origin (Critical)

- 서버 로그 원문: `ERROR [Better Auth]: Invalid origin: http://localhost:3300`
- 트리거 URL/동작
  - `POST /api/auth/sign-in/email/` — `/admin/auth/sign-in`에서 로그인 버튼 (403)
  - `POST /api/auth/sign-out/` — 좌측 nav "로그아웃" (403)
  - `POST /api/auth/change-password/` — `/admin/account`에서 비밀번호 변경 (403)
  - `POST /api/auth/request-password-reset/` — `/admin/auth/forgot-password`에서 전송 (403)
- 원인: `.env`의 `APP_ORIGIN=http://localhost:3000`이 `src/server/auth/config.ts`의 `trustedOrigins`/`baseURL`로 들어가는데 dev 서버는 3300 포트로 뜬다. 포트가 다르면 better-auth의 모든 상태 변경 엔드포인트가 거부된다.
- 화면 메시지는 전부 원인과 무관하다. 로그인은 자격 증명을 의심하게 만들고, 로그아웃과 비밀번호 찾기는 일시 장애처럼 안내한다.
- 검증: 같은 요청에 `Origin: http://localhost:3000` 헤더를 붙이면 로그인 200, 비밀번호 변경 200, 틀린 비밀번호는 400 `INVALID_PASSWORD`로 정상 동작한다.

### 2.2 뉴스 슬러그 중복 시 500 (Critical)

- 응답 원문: `{"error":{"code":"INTERNAL_ERROR","message":"요청을 처리하지 못했습니다."}}`
- 트리거: `/admin/news/new`에서 한글 제목만 넣고 "초안 저장". 같은 날 두 번째 항목부터 실패한다.
  - `suggestSlug()`가 `[^a-z0-9]+`를 모두 지우므로 순한글 제목은 항상 `news-<표시일>`로 수렴한다. 같은 날 두 번째 뉴스는 반드시 충돌한다.
- 서버 로그: `POST /api/admin/news/ 500 in 34ms` (스택 없음)
- DB 원인: `news_slugs_slug_uk` (`CREATE UNIQUE INDEX news_slugs_slug_uk ON public.news_slugs USING btree (slug)`) 위반. 도메인 오류로 감싸지 않아 500으로 새어 나온다.
- 화면에는 어느 필드가 문제인지 아무 단서가 없다. 스크린샷 `27-news-korean-slug-collision.png`

### 2.3 저장 후 게시/보관 버튼 영구 비활성화 (Critical)

- 트리거: 아무 관리 폼에서 값을 바꾸고 "변경 저장" → 성공 메시지가 떠도 게시, 게시 중단, 숨김, 보관 버튼이 전부 disabled로 남는다. 새로고침해야 풀린다.
- 원인: 5개 폼 공통 코드
  ```
  const baseline = useRef(JSON.stringify(initial));
  const dirty = useMemo(() => JSON.stringify(form) !== baseline.current, [form]);
  ```
  저장 성공 시 `baseline.current`만 갱신되는데 `baseline`은 ref라 의존성 배열에 없다. `form`이 다시 바뀌기 전까지 `dirty`가 true로 굳는다.
- 해당 파일: `src/components/admin/NewsForm.tsx:80`, `NoticeForm.tsx:72`, `PopupNoticeForm.tsx:84`, `HonorForm.tsx:61`, `AiSolutionForm.tsx:72`
- 부작용 두 가지: (a) 미저장 경고 오탐, (b) 아래 2.4의 예약 게시 봉쇄

### 2.4 예약 게시, 노출 기간 설정 불가 (Critical)

- 트리거: `/admin/notices/<id>`에서 "게시 시작" 입력, 또는 `/admin/popup-notices/<id>`에서 "노출 시작" 입력
- 관측: 입력 순간 `dirty`가 true가 되어 게시 버튼이 disabled. "변경 저장"을 눌러도 2.3 때문에 풀리지 않는다. 새로고침하면 풀리지만 입력한 일시는 사라진다.
- 근본 원인이 하나 더 있다: `NoticeForm.save()`의 payload에 `publishStartsAt`/`publishEndsAt`이 아예 없다. 이 값은 publish 호출 시에만 전송되는데 publish 버튼에 도달할 수 없다.
- DB 확인: 미래 일시를 입력하고 저장해도 `notice_locales.publish_starts_at`에는 실제 게시 시각만 들어 있다.
- 결과: 예약 게시와 노출 기간 기능이 UI로 전혀 사용할 수 없다. 스크린샷 `15-notice-schedule-deadend.png`

### 2.5 중복 제출 시 500 (Important)

- 트리거: `/admin/honors/new`에서 "초안 저장" 연타
- 서버 로그: `POST /api/admin/honors/ 201` → `500` → `500`
- DB 원인: `honors_type_order_uk` (`btree (honor_type, display_order)`) 위반
- 클라이언트에 중복 제출 차단이 없다. `disabled={busy}`는 React 리렌더 이후에야 반영되므로 빠른 연타를 막지 못한다.

### 2.6 서버 예외가 로그에 남지 않음 (Important)

- `src/server/http/api-handler.ts`의 `withApiErrorBoundary`가 catch 블록에서 응답만 만들고 예외를 기록하지 않는다.
- 결과: 위 2.2, 2.5의 500이 dev 로그에 `500 in 34ms` 한 줄만 남고 원인 추적이 불가능하다.

### 2.7 개발 환경 잡음 (참고, 앱 코드 아님)

- 콘솔 원문:
  ```
  [HMR] Invalid message: {"type":"isrManifest", ...}
  TypeError: Cannot read properties of undefined (reading 'components')
      at handleStaticIndicator (/_next/static/chunks/node_modules_next_dist_client_16lnmlo._.js:668:46)
  ```
- 발생처가 `node_modules/next/dist/client`이며 공개/관리자 페이지 모두에서 간헐적으로 뜬다. Next 16.3.2 dev 오버레이 문제이고 앱 코드가 아니다. 프로덕션 빌드에는 나타나지 않는다.

---

## 3. UX 막다른 길 목록

1. **로그아웃할 수 없다.** 버튼을 누르면 실패 메시지만 뜨고 세션이 유지된다. 공용 PC에서 심각하다.
2. **비밀번호를 바꿀 수도, 잊었을 때 재설정을 요청할 수도 없다.** 두 화면 모두 실패하고 메시지는 원인을 가리킨다.
3. **예약 게시와 팝업 노출 기간은 입력할 수는 있지만 실행할 수 없다.** 입력하는 순간 게시 버튼이 잠기고, 저장해도 안 풀리고, 새로고침하면 입력값이 사라진다. 운영자는 자기가 뭘 잘못했는지 알 수 없다.
4. **AI 솔루션 섹션 전체가 진입 불가다.** 사업 영역이 0건이면 폼이 아예 뜨지 않는데, 사업 영역을 만드는 화면이 관리자 어디에도 없다. "기준 데이터 반영 상태를 확인해 주세요"는 운영자가 취할 수 있는 행동이 아니다.
5. **좌측 nav로 이동하면 편집 내용이 조용히 사라진다.** 폼 안의 "목록으로"만 경고가 걸려 있다.
6. **저장했는데도 나갈 때마다 미저장 경고가 뜬다.** 경고를 믿지 않게 되고, 결국 5번의 실제 손실을 막지 못한다.
7. **수상 및 인증 게시 실패 시 어떤 필드가 필요한지 알 수 없다.** 설명이 필수인데 폼에 필수 표시가 없다.
8. **같은 날 한글 제목 뉴스 두 건째부터 저장이 막힌다.** 실패 메시지가 슬러그를 가리키지 않아 운영자는 원인을 찾을 수 없다.
9. **세션이 만료되면 화면에 로그인 링크가 없다.** 메시지만 뜨고, 다른 데로 이동하면 작성 중이던 내용이 사라진다.
10. **카테고리를 같은 이름으로 몇 번이고 만들 수 있다.** 등록 후 입력 폼이 초기화되지 않아 실수로 연타하기 쉽다.
11. **초안 항목에도 "공개 보기" 링크가 보이고 누르면 404다.**
12. **수상 및 인증 순서 변경은 목록이 아니라 항목을 하나씩 열어 숫자를 고쳐야 하고**, 숫자가 겹치면 서버가 500을 낸다.

---

## 4. 공개 페이지 콘솔 오류 요약

- **앱 코드에서 발생한 콘솔 오류는 0건이다.** 14개 URL 전부 렌더에 실패한 페이지가 없다.
- 관측된 콘솔 오류는 전부 두 종류다.
  1. Next.js dev 오버레이의 `[HMR] Invalid message` + `TypeError: Cannot read properties of undefined (reading 'components')` — `node_modules/next/dist/client` 내부, 개발 모드 한정.
  2. HTTP 상태 코드에 따른 브라우저 기본 로그 — `/bid-notice`의 410, 404 URL의 404.
- **`/bid-notice`가 HTTP 410 Gone으로 응답한다.** 본문은 연락처 안내로 정상 렌더된다. 의도된 폐지 처리인지 확인이 필요하다. 410이 맞다면 검색엔진에서 색인이 제거된다.
- **404 화면이 브랜드 없는 Next 기본 화면이다.** 한국어 사이트인데 "This page could not be found." 영문이 그대로 나오고 헤더/푸터도 없다. 숨김 처리한 뉴스나 공지로 들어온 방문자가 그대로 이탈한다.
- 공개 공지 상세(`/notices/2`)에서 제목과 날짜가 각각 두 번 출력된다. 심층 UX는 다른 감사 담당이지만 렌더 중복이라 기록해 둔다.

---

## 부록 A. QA가 남긴 테스트 데이터

dev DB에 아래가 남아 있다. 정리가 필요하면 삭제해도 무방하다.

- 뉴스 2건: `2dfa61b8-...`(slug `qa-news-test`, 제목이 QA 과정에서 깨진 상태), `2100e0fe-...`("첫 번째 한글 뉴스")
- 공지 1건: `fd0bbf21-...`("QA 공지 테스트", 공지 번호 2)
- 공지 카테고리 2건: "QA 분류" 활성 1건, 비활성 1건
- 팝업 2건: `a097874d-...`(게시 중), `9e6f6b63-...`(초안)
- 수상 및 인증 3건: `23c619b3-...`(게시 중), `d4e089d8-...`, `78fc1571-...`
- `admin_sessions` 테이블은 세션 만료 테스트로 한 번 비웠고, 이후 QA 세션 1건이 다시 생성되어 있다.

## 부록 B. 재현 절차 메모

로그인이 막혀 있으므로 현 상태에서 관리자 화면을 보려면 둘 중 하나가 필요하다.

1. `.env`의 `APP_ORIGIN`을 `http://localhost:3300`으로 맞추고 dev 서버 재시작 (권장)
2. 또는 API로 세션을 발급받아 쿠키를 주입
   ```
   curl -s -i -X POST "http://localhost:3300/api/auth/sign-in/email/" \
     -H "Content-Type: application/json" -H "Origin: http://localhost:3000" \
     -d '{"email":"qa-admin@brainworks.local","password":"QaAdmin!2026pass"}'
   ```
   응답의 `set-cookie`를 브라우저에 심으면 `/admin`에 들어갈 수 있다. 관리자 API는 `sec-fetch-site: same-origin`으로 통과하므로 origin 검사에 걸리지 않는다.
