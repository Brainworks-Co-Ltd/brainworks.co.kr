# SDD ledger — plan: docs/superpowers/plans/2026-09-11-react-best-practices.md

Worktree: C:\브레인웍스\brainworks.co.kr\.claude\worktrees\completeness-fixes (branch fix/completeness-audit, base e2526d9)
Spec: scratchpad/audit/react-best-practices-audit.md (점수 78/100) + Vercel react-best-practices 규칙집
Baseline at e2526d9: typecheck 0, lint 0 오류/23 경고, vitest 53 파일 170 통과, build OK, audit high 통과

Ruling: 이전 계획과 같은 브랜치/워크트리에서 이어감(사용자가 병합 전이라 브랜치 하나로 유지) — 틀리면 비용: 커밋 범위로 분리 가능.
Ruling: 보류 B1(폰트 서브셋 2MB), B2(useDeferredValue), B3(content-visibility), B4(폼 JSON.stringify), B5(공지 SQL 페이지네이션)는 측정 또는 사용자 판단이 필요해 계획에서 제외하고 보고서로 넘김 — 틀리면 비용: 없음(보류).
Ruling: T8(파생 상태 제거)은 탭 하이라이트 지연이 체감되면 되돌린다는 점검자 조건을 브리프 그대로 유지 — 틀리면 비용: 커밋 1개 되돌리기.

## Pre-flight scan

| 쌍/과제 | 공유 파일 또는 인터페이스 | 확인 결과 |
|---|---|---|
| T4 ↔ T7 | src/components/popup-notices/dismissal-store.ts (T4: Intl 인스턴스 호이스트 / T7: try-catch) | 다른 함수, 순차 실행이라 충돌 없음 |
| T4 ↔ 이전 계획 Task 15 | src/lib/format-date.js (이전에 신설) | T4는 내부 구현만 바꾸고 export 계약 유지 |
| T1 ↔ 이전 계획 Task 11 | src/pages/index.jsx (SeoMetadata 추가됨) | T1은 getServerSideProps와 시그니처만 수정, SeoMetadata 유지 |
| T2 ↔ T9 | Header.jsx vs DesktopNavigation.jsx | 별개 파일 |
| T3 ↔ T8 | businessAreas.js 캐시 vs BusinessAreaExplorer 소비 | 반환 객체 동일성 변화(캐시로 같은 참조 반환)가 T8의 렌더 계산에 영향 없음(id 비교만) |
| T12 | 고아 파일 6개 삭제 | 마지막 순서. 삭제 전 임포터 0건 재확인 지시가 브리프에 있음 |
| 각 과제 자체 정합성 | 변경 ↔ 검증 명령 ↔ 기대 효과 | T1~T12 모두 파일과 검증이 일치. T2 검증은 size.js 재측정 필요 |

## Progress
T1 dispatched base e2526d9
Task 1: complete (commits e2526d9..ac745bd, review clean)
T2 dispatched base ac745bd
Task 2: review — Important: ssr:false로 모바일 메뉴 트리거가 SSR HTML에 없음(접근성/no-JS 공백). 계획 결함.
Task 2: Ruling: 트리거 버튼은 정적 렌더, Base UI 다이얼로그 내용만 첫 열기 시 동적 로드(bundle-conditional)로 재구성. 범위에 MobileNavigation.jsx 포함 승인 — 틀리면 비용: 파일 2개 되돌리기.
Task 2: fix round 1 dispatch
Task 2: fix round 1/5 (재리뷰 대기; commits 71ebeda..43edd03; /education 446.6kB — 정적 Button이 39kB를 되가져옴, 재리뷰에서 원인 확인 지시)
Task 2: Ruling: 정적 트리거가 ui/button.jsx를 통해 @base-ui/react/button을 끌어와 39kB 회귀. 트리거를 buttonVariants 클래스만 쓴 순수 <button>으로 바꿔 Base UI를 정적 경로에서 완전히 제거(round 2를 재리뷰 전에 바로 배정) — 틀리면 비용: 파일 1개 되돌리기.
Task 2: fix round 2 결과 (/education 408.8kB) — 구현자가 buttonVariants 복제(cva+twMerge 로컬 계산)로 우회. Ruling: 복제 대신 buttonVariants를 Base UI 없는 별도 파일(ui/button-variants.js)로 분리하고 button.jsx가 재export. round 3 배정 후 1~3 라운드 일괄 재리뷰 — 틀리면 비용: 파일 3개.
Task 2: fix round 3 결과 — Base UI 제거 확인, 그러나 cva+clsx+tailwind-merge가 공개 라우트 정적 그래프에 새로 들어와 +28kB(/education 436.8kB).
Task 2: Ruling(round 4): 트리거 한 개의 클래스 문자열을 위해 세 라이브러리를 전 라우트에 싣지 않는다. round 3의 모듈 분리는 유지하되 MobileNavigation은 사전 계산된 문자열 상수를 쓰고, 그 상수가 cn(buttonVariants({outline, icon}))와 같음을 단언하는 테스트로 드리프트를 막는다 — 틀리면 비용: 테스트 1개와 상수 1개.
Task 2: fix round 4/5 결과 (/education 408.8kB, 재리뷰 대기; commits 71ebeda..16e2d76)
Ruling: 브라우저 QA에서 favicon 404 확인 — 이전 계획에서 favicon 과제(공개 점검 T5)를 누락. 이 계획 끝에 Task 13(favicon 세트)을 추가 — 틀리면 비용: 없음.
Task 2: fix round 4/5 결과 (1 addressed, 0 open; commits 71ebeda..16e2d76)
Task 2: minor (deferred): DialogTrigger 제거로 aria-controls 연결 사라짐(다이얼로그가 지연 로드라 id를 미리 알 수 없음)
Task 2: complete (commits ac745bd..16e2d76, review clean; /education 501.7kB → 408.8kB)
T3 dispatched base 16e2d76
Task 3: complete (commits 16e2d76..ab96c5c, review clean)
T4 dispatched base ab96c5c
Task 4: note: 구현자가 자기 세션 지침에 따라 Co-Authored-By를 Claude Sonnet 5로 적음. 히스토리 수정 없이 유지 — 틀리면 비용: 없음.
Task 4: review — 코드 findings 없음. 리뷰어가 Co-Authored-By 트레일러를 Critical로 올렸으나 리뷰 범위에서 제외한 항목. Ruling: 기각(커밋 히스토리 재작성 불필요, 코드 결함 아님) — 틀리면 비용: 없음.
Task 4: complete (commits ab96c5c..418b355, review clean)
T5 dispatched base 418b355
Task 5: complete (commits 418b355..63281f2, review clean; __markdownCacheSize 테스트용 export는 내가 dispatch에서 제안한 것)
T6 dispatched base 63281f2
Task 6: complete (commits 63281f2..8958481, review clean)
Task 6: minor (deferred): requireAdminPage와 account.tsx의 catch가 HttpError가 아닌 예외(DB 장애)도 로그인 리다이렉트로 삼킴(기존 동작, require-admin.ts 후속 과제)
T7 dispatched base 8958481
Task 7: complete (commits 8958481..64841a7, review clean; 차단 스토리지 브라우저 재현은 도구 한계로 단위 테스트로 대체)
T8 dispatched base 64841a7
Task 8: complete (commits 64841a7..2628edd, review clean)
Task 8: minor (deferred): 탭 마우스 클릭 테스트 없음(키보드 경로만, 기존 결손)
T9 dispatched base 2628edd
Task 9: complete (commits 2628edd..7610f2f, review clean)
T10 dispatched base 7610f2f
Ruling(process): 사용자 요청으로 남은 독립 과제(T11, T13)를 격리 워크트리에서 병렬 실행. 각자 브랜치(rbp/task-11, rbp/task-13)에 커밋하고 컨트롤러가 T10 완료 후 fix/completeness-audit에 순차 병합. T12(고아 삭제)는 병합 뒤 마지막 — 틀리면 비용: 병합 충돌 시 수동 해결(파일 겹침 없음이라 낮음).
SESSION RESTART (2026-09-12): T11/T13 병렬 구현자가 중단됨(워크트리에 미커밋 변경 존재, node_modules 설치됨). SendMessage로 재개. T10 리뷰어 dispatch. Docker 재기동.
Task 10: complete (commits 7610f2f..b2ff682, review clean)
Task 10: minor (deferred): translate/FILTER_KEYWORDS가 news/[slug].jsx에도 중복(기존)
T13 done on rbp/task-13 @66b370d — review dispatch
Task 13: complete (rbp/task-13 66b370d → cherry-pick onto fix/completeness-audit 7470c41, review clean)
Ruling: 병렬 브랜치는 merge 커밋 대신 cherry-pick으로 선형 반영(단일 커밋, 파일 겹침 없음) — 틀리면 비용: 없음.
T11 done on rbp/task-11 @92fb29b — review dispatch
Task 11: complete (rbp/task-11 92fb29b → cherry-pick 1512556, review clean)
T12 dispatched base 1512556
Ruling: 병렬 워크트리 2개(rbp/task-11, rbp/task-13)는 cherry-pick 반영 후 제거, 브랜치 삭제 — 틀리면 비용: 없음(커밋은 fix/completeness-audit에 있음).
Task 12: complete (commits 1512556..1b04e19, review clean)
Task 12: note: 점검 보고서의 'BusinessAreaCarousel 참조 0건'은 오류(테스트 임포터 존재). progress-track/carousel-controls/media-frame는 테스트만 참조해 유지.
ALL 13 TASKS COMPLETE — final whole-branch review dispatch (e2526d9..1b04e19)
FINAL REVIEW(RBP): With fixes — Important 1 (모바일 메뉴 초점 복귀를 finalFocus={triggerRef}로, 테스트 추가), Minor 8.
FINAL FIX WAVE dispatch base 1b04e19
FINAL FIX WAVE(RBP): 1b04e19..a1529be, 재리뷰 대기
FINAL(RBP): fix wave 재리뷰 clean. docs commit, workspace 삭제.
