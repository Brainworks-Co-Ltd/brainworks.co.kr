# brainworks.co.kr

## 실행 방법

### 공개 사이트만 볼 때 — 도커 필요 없음

```bash
npm install
npm run dev            # http://localhost:3000
npm run dev -- -p 3300 # 포트를 바꾸려면
```

`.env`의 `DATABASE_URL`이 주석 처리되어 있으면 공개 페이지 전체가 승인된 정적
콘텐츠로 렌더링된다. PostgreSQL도 도커도 띄우지 않아도 된다. 디자인 확인이나
시연은 이 상태로 한다.

`DATABASE_URL`을 다시 켜면 DB가 떠 있어야 하고, 없으면 콘텐츠를 읽는 페이지가
`DEPENDENCY_UNAVAILABLE`로 실패한다 (`src/server/env.ts`).

### 관리자 화면까지 쓸 때 — 도커 필요

관리자 로그인은 세션을 `admin_sessions` 테이블에 저장하므로 DB 없이는 안 된다.

```bash
docker compose -f compose.dev.yml up -d postgres-dev   # 5433 포트
cp .env.example .env                                   # DATABASE_URL 포함본
npm run db:migrate                                     # 마이그레이션 적용
npm run admin:provision                                # 관리자 계정 생성
npm run dev
```

`admin:provision`은 비밀번호를 직접 입력받으므로 **대화형 터미널에서** 실행한다.
계정을 만든 뒤 `/auth/signin`으로 로그인하고 `/admin`으로 들어간다.

DB를 끄고 다시 공개 사이트만 보려면 `.env`의 `DATABASE_URL`을 주석 처리한다.

### 컨테이너 둘의 용도가 다르다

| 서비스 | 포트 | 용도 |
|---|---|---|
| `postgres-dev` | 5433 | 개발용. `npm run dev`가 쓴다 |
| `postgres-test` | 5434 | DB 테스트용으로 준비되어 있으나 현재는 쓰이지 않는다 |

`npm test`(vitest)와 `npm run test:db`는 모두 DB를 쓰지 않으므로 컨테이너 없이
돈다. 현재 `tests/db/**`는 실제 DB에 접속하지 않는 정책 테스트라 컨테이너 없이
돈다. `DATABASE_TEST_URL`은 아직 읽는 코드가 없다.

### 백엔드 서버는 따로 없다

Next.js 한 프로세스가 화면과 API를 모두 처리한다. `npm run dev` 말고 띄울
서버가 없다. `src/pages/api/` 아래가 백엔드다.

## 자주 쓰는 명령

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드. **개발 서버가 떠 있을 때 실행하면 `.next`를 덮어써서 개발 서버가 깨진다** |
| `npm start` | 빌드 결과 실행 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | vitest. DB 불필요 |
| `npm run test:db` | DB 접속 없는 정책 테스트. `postgres-test` 불필요 |
| `npm run test:e2e` | Playwright |
| `npm run db:generate` | 스키마 변경 후 마이그레이션 파일 생성 |
| `npm run db:migrate` | 마이그레이션 적용 |
| `npm run admin:provision` | 관리자 계정 생성 (대화형) |

## 파일 구조

```text
brainworks.co.kr/
├── docs/                     # 운영 및 콘텐츠 관리 문서
├── public/                   # 정적 파일
│   ├── files/                # 다운로드용 문서 파일
│   └── images/               # 사이트 이미지 및 SVG 자산
├── src/
│   ├── assets/               # 컴포넌트에서 직접 가져오는 이미지 자산
│   ├── components/           # 공통 UI 및 페이지 구성 컴포넌트
│   │   ├── admin/            # 관리자 화면 컴포넌트
│   │   └── ui/               # 재사용 UI 컴포넌트
│   ├── content/              # 마크다운/PDF 기반 콘텐츠
│   │   └── news/             # 뉴스 게시글 및 원문 자료
│   ├── data/                 # 회사 소개, 사업 영역, 팝업 등 정적 데이터
│   ├── lib/                  # 메일, 마크다운, 뉴스 처리 유틸리티
│   ├── models/               # 데이터 모델
│   ├── pages/                # Next.js Pages Router 라우트
│   │   ├── about/            # 회사 소개 하위 페이지
│   │   ├── admin/            # 관리자 페이지
│   │   ├── api/              # API 라우트
│   │   ├── auth/             # 인증 페이지
│   │   ├── bid-notice/       # 입찰 공고 경로. 410 종료 안내 페이지만 남아 있다
│   │   └── news/             # 뉴스 상세 페이지
│   ├── server/               # 서버 전용 로직 (인증, DB, 인프라, 모듈)
│   ├── shared/               # 클라이언트/서버 공용 네비게이션, 라우팅, 스키마
│   ├── styles/               # 전역 스타일
│   └── utils/                # 데이터 가공 및 보조 함수
├── tests/                    # Node.js 테스트
├── jsconfig.json             # 경로 별칭 설정
├── next.config.js            # Next.js 설정
└── package.json              # 의존성 및 실행 스크립트
```
