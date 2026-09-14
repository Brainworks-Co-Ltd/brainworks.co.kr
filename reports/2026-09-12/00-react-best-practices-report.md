# 프론트엔드 보완 보고서: Vercel React 모범 사례 기준 (2026-09-12)

## 1. 한 줄 총평

Vercel의 React 모범 사례 규칙 64개로 점검한 결과 78점이었습니다. 재렌더링과 렌더링 범주는 이미 모범에 가까웠고(삼항 조건부, 컴포넌트 안 컴포넌트 없음, effect 안 fetch 없음, 지연 초기화), 치명 범주에서 두 건이 남아 있었습니다. 홈의 순차 DB 조회와, 모바일 메뉴 때문에 Base UI 다이얼로그 청크가 42개 라우트 전부에 실리는 문제입니다. 이번 세션에서 배정 가능한 12건과 파비콘 1건을 13개 과제 17개 커밋으로 반영했고, 가장 무거운 공개 라우트(`/education`)의 First Load JS는 501.7kB에서 408.8kB로 줄었습니다.

## 2. 점검 방법

- 기준: `react-best-practices` 규칙집 64개(8범주). pages router 프로젝트라 RSC와 서버 액션 규칙은 `getServerSideProps` props 크기, API 라우트 인증 등 대응 항목으로 매핑했습니다.
- 방법: `npm run build` 후 `.next/build-manifest.json`으로 라우트별 First Load JS를 산출하고, 위반 후보마다 import 추적과 코드 근거를 붙였습니다.
- 규칙 커버리지: 위반 14건, 통과 판정 다수, 해당 없음 5건. 위반 14건 중 12건을 과제로 배정했고 2건(V13 catalog 조회 순회, V14 죽은 캐러셀의 리렌더 로직)은 각각 미미하거나 삭제로 해소됐습니다.

## 3. 반영한 과제

| # | 규칙 | 변경 | 효과 | 커밋 |
|---|---|---|---|---|
| 1 | async-parallel, server-serialization | 홈 `getServerSideProps`의 순차 조회 3개를 병렬 2개로, 쓰지 않는 `areas` prop 제거 | DB 왕복 3회 직렬 → 2회 병렬, `__NEXT_DATA__`에서 사업 영역 트리 제거 | ac745bd |
| 2 | bundle-dynamic-imports, bundle-conditional | 모바일 메뉴 트리거는 서버 렌더, Base UI 다이얼로그는 첫 열기 시 로드. 버튼 변형 정의를 Base UI 없는 모듈로 분리, 트리거 클래스는 상수화하고 동등성 테스트로 드리프트 방지 | `/education` First Load JS 501.7kB → 408.8kB, 공개 라우트 39개에서 Base UI 청크 제거 | 71ebeda, 43edd03, ab3dac3, 81a2b32, 16e2d76 |
| 3 | js-cache-function-results | `getLocalizedBusinessAreas` 결과를 로케일별 모듈 캐시 | 헤더 스크롤 방향 전환마다 돌던 8.3kB 트리 변환이 로케일당 1회 | ab96c5c |
| 4 | js-cache-function-results | `Intl.DateTimeFormat` 인스턴스 호이스트, `NoticeList`의 중복 포매터 제거 | 뉴스 검색 타이핑 시 항목 수만큼 생기던 포매터 생성 0 | 418b355 |
| 5 | server-cache-lru | 마크다운 변환 결과를 상한 200개 모듈 캐시 | 공지와 뉴스 상세 재방문 시 unified 파이프라인 재실행 없음 | 63281f2 |
| 6 | server-cache-react 대응 | 관리자 계정 페이지의 세션 조회 2회 → 1회 | 요청당 DB 왕복 1회 제거 | 8958481 |
| 7 | client-localstorage-schema | 팝업 보지 않기 기록의 스토리지 읽기와 쓰기에 예외 처리 | 시크릿 모드나 스토리지 차단 환경에서 팝업 렌더와 닫기 버튼이 깨지지 않음 | 64841a7 |
| 8 | rerender-derived-state-no-effect | 사업 영역 탐색기의 `useState`+`useEffect`를 렌더 중 계산으로 | 쿼리 변경 시 렌더 2회 → 1회 | 2628edd |
| 9 | advanced-event-handler-refs, client-passive-event-listeners | 데스크톱 내비게이션 문서 리스너를 단일 구독으로, `pointerdown`을 passive로 | 메뉴 열고 닫을 때마다 리스너 4회 조작 제거 | 7610f2f |
| 10 | js-early-exit | 뉴스 필터를 순수 함수로 분리하고 검색어 없을 때 제목과 요약 변환 생략 | 항목당 문자열 연산 6회 → 2회, 단위 테스트 7건 | b2ff682 |
| 11 | js-min-max-loop, js-set-map-lookups, js-combine-iterations | 대시보드 집계의 4회 순회를 1회로, 정렬 비교 시각을 사전 계산 | 결과 바이트 동일(스냅샷 회귀 테스트), 데이터 증가 대비 | 1512556 |
| 12 | 유지보수 표면 축소 | 참조 없는 컴포넌트 5개, 데이터 2개, 낡은 테스트 1개 삭제 | 347줄 감소 | 1b04e19 |
| 13 | 이전 세션 누락 보완 | 파비콘, 32px PNG, 애플 터치 아이콘 추가 | 모든 페이지의 favicon 404 제거 | 7470c41 |

## 4. 번들 측정

| 라우트 | 수정 전 First Load JS | 수정 후 |
|---|---|---|
| `/education` | 501.7kB raw / 160.3kB gz | 408.8kB raw / 130.9kB gz |
| `/404` | 467.5kB raw | 약 370kB raw |
| 공개 라우트 39개 | Base UI 다이얼로그 청크 98.0kB 포함 | 제외 |
| `/`, 관리자 팝업 편집 | Base UI 청크 유지(팝업 공지가 실제로 사용) | 동일 |

Task 2는 네 라운드가 필요했습니다. 처음에는 컴포넌트 전체를 지연 로드했다가 서버 HTML에 메뉴 버튼이 사라지는 접근성 공백이 리뷰에서 잡혔고, 트리거를 서버 렌더로 되돌리자 `ui/button.jsx`가 Base UI 버튼을 끌어와 39kB가 되돌아왔으며, 이를 `buttonVariants`로 대체하자 `class-variance-authority`와 `tailwind-merge`가 공개 라우트에 새로 들어와 28kB가 늘었습니다. 최종안은 트리거 클래스 문자열을 상수로 두고 그 상수가 `cn(buttonVariants({...}))`와 같음을 테스트로 고정하는 방식입니다.

## 5. 보류한 항목 (측정 또는 판단 필요)

| 항목 | 내용 | 왜 보류인가 |
|---|---|---|
| B1 폰트 서브셋 | `PretendardVariable.woff2`가 1.96MB이고 preload로 최우선 다운로드됨. 이번 JS 절감 전체(약 93kB)의 20배 | 글리프 범위(완성형 2,350자로 충분한지) 판단과 빌드 단계 도구 추가가 필요. 완성형 서브셋이면 1.4MB 이상 절감 예상 |
| B2 `useDeferredValue` | 뉴스 검색 입력이 목록 전체를 재계산 | Task 4와 10으로 항목당 비용이 줄어 필요 없어졌을 가능성. 운영 뉴스 건수와 키 입력 렌더 시간 측정 후 결정 |
| B3 `content-visibility` | 긴 목록 렌더 비용 | 현재 규모(공지 12건, 수상 7건)에서는 이득 없음 |
| B4 관리자 폼 dirty 검사 | 본문이 긴 공지를 편집할 때 키 입력마다 `JSON.stringify(form)` | 스칼라 폼 2종은 손댈 필요 없음. 본문 폼 3종은 운영 최대 본문 길이로 프레임 드롭 측정 후 결정. 해법은 `useMemo`가 아니라 본문 필드 분리 |
| B5 공지 SQL 페이지네이션 | 공지 목록이 전체 행을 읽어 JS에서 자름 | 가시성 판정이 시각 의존이라 도메인 규칙 변경. 수백 건 이하면 그대로 |

## 6. 리뷰에서 남긴 항목

- Task 2: `DialogTrigger`를 쓰지 않아 트리거와 다이얼로그 사이 `aria-controls` 연결이 없음(다이얼로그가 지연 로드라 id를 미리 알 수 없음).
- Task 6: 관리자 페이지 가드가 인증 오류가 아닌 예외(DB 장애)도 로그인 리다이렉트로 처리(기존 동작, `require-admin.ts` 후속).
- Task 8: 탭 마우스 클릭 테스트 없음(키보드 경로만 검증, 기존 결손).
- Task 10: `translate`와 `FILTER_KEYWORDS`가 뉴스 상세 페이지에도 중복(기존).
- 점검 오류 1건: 보고서가 `BusinessAreaCarousel` 참조 0건이라 했으나 낡은 테스트가 임포트하고 있었음. 컴포넌트와 테스트를 함께 삭제.

## 7. 검증

최종 전체 리뷰(별도 리뷰 에이전트, 17커밋 전량)는 "수정 후 병합 가능"으로 판정했고 Critical 0, Important 1, Minor 8이었습니다. Important 1건(모바일 메뉴 닫힘 시 초점 복귀를 수동 처리하고 테스트가 없음)은 한 차례 수정 배치로 Base UI의 `finalFocus`에 위임하고 테스트를 추가했습니다. 리뷰어는 Task 11의 스냅샷이 실제로 수정 전 구현에서 나온 값인지 옛 커밋을 재생해 바이트 동일함을 독립 확인했습니다.

| 항목 | 결과 |
|---|---|
| `npm run typecheck` | 0 오류 |
| `npm run lint` | 0 오류, 경고 20 (이전 계획 종료 시 23) |
| `npm test` (vitest) | 59 파일 198 테스트 전부 통과 (이전 계획 종료 시 53 파일 170) |
| `npm run build` | 성공 |
| `/education` First Load JS | 408.9kB raw / 131.0kB gz (시작 501.7kB / 160.3kB) |
| `/news` | 395.1kB raw / 125.5kB gz |
| `/404` | 374.7kB raw / 118.6kB gz (시작 467.5kB) |
| `/` | 499.1kB raw / 160.8kB gz (팝업 공지 다이얼로그를 실제로 쓰므로 Base UI 유지) |
| `/education` 청크 내 Base UI, tailwind-merge, cva 마커 | 0 |

수정 배치 범위 재리뷰: 반영 확인(커밋 a1529be), 새 Critical/Important 없음. 재리뷰어가 실제 Base UI 초점 관리자 경로로 도는 테스트 9건을 직접 재실행해 통과를 확인했습니다.

## 8. 병합 방법

이전 보고서와 같은 브랜치입니다. 두 계획의 커밋이 모두 `fix/completeness-audit`에 있으므로 한 번에 합칩니다.

```bash
cd C:\브레인웍스\brainworks.co.kr
git merge fix/completeness-audit
```

## 9. 파일 목록

- 이 보고서: `reports/2026-09-12/00-react-best-practices-report.md`
- 점검 원문(규칙별 위반, 커버리지, 빌드 라우트 표): `reports/2026-09-12/01-react-best-practices-audit.md`
- 최종 리뷰와 판정 장부: `reports/2026-09-12/02-final-review.md`, `reports/2026-09-12/03-sdd-ledger.md`
- 실행 계획: 워크트리 `docs/superpowers/plans/2026-09-11-react-best-practices.md` (docs는 git 미추적)
- 이전 세션 보고서: `reports/2026-09-11/`
