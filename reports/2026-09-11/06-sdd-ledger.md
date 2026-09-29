# SDD ledger — plan: docs/superpowers/plans/2026-09-11-completeness-audit-fixes.md

Worktree: C:\브레인웍스\brainworks.co.kr\.claude\worktrees\completeness-fixes (branch fix/completeness-audit, base 9bff514)
Spec: 점검 보고서 4종 (scratchpad/audit/*.md) + docs/superpowers/specs/2026-09-07-admin-operations-completion-design.md
Baseline at 9bff514: typecheck 0, lint 0(규칙 없음), vitest 121 중 1 실패 (published-business-areas)

Ruling: 워크트리 사용 — 사용자가 원본 체크아웃에서 IndustrialHero.jsx/industrial.css/AGENTS.md를 미커밋 편집 중이라 격리 필요. SDD 스킬이 격리 작업 공간을 요구함 — 틀리면 비용: 워크트리 삭제와 브랜치 재생성 정도.
Ruling: 사용자 결정이 필요한 항목은 계획에서 제외하고 보고서로 넘김 — 개인정보처리방침 링크, 푸터 본사 표기, 홈 DomainGrid의 DB 연결(계획 3 유지/포기), images.unoptimized 해제, docs/** git 추적, DATABASE_TEST_URL 존폐, 08 색표/03-03 팝업 문서 갱신 — 틀리면 비용: 없음(보류일 뿐).
Ruling: IndustrialHero.jsx는 어떤 과제도 건드리지 않음(사용자 WIP). design-interactions 테스트 2건 실패는 원본 체크아웃의 WIP가 원인이며 워크트리(HEAD)에서는 통과 — 보고서에서 사용자에게 알림.

## Pre-flight scan

| 쌍/과제 | 공유 파일 또는 인터페이스 | 확인 결과 |
|---|---|---|
| T4 ↔ T23 | tests/components/admin-honor-form-alt.test.tsx (T4 생성, T23 케이스 추가) | 순차 실행이라 충돌 없음 |
| T4 ↔ T9 | NewsForm.tsx (T4: 117,123행 coverAlt / T9: 56-64행 suggestSlug) | 다른 구간, 순차 |
| T6 ↔ T7 | notices/[noticeId].tsx, popup-notices/[popupNoticeId].tsx (T6: toDateTimeLocal import / T7: getServerSideProps try) | 다른 구간, 순차 |
| T10 ↔ T11 | SeoMetadata 소비(T10) vs key 추가(T11) | props 계약 불변 |
| T11 ↔ T17 | _app.jsx (T11: 81행 SeoMetadata 제거 / T17: 4,9-28,75행 useUiVariant 제거) | 다른 구간, 순차. T17 브리프의 행 번호는 T11 이후 밀릴 수 있음 → 심볼 기준으로 찾도록 브리프에 있음 |
| T2 ↔ T3 | README 파일 구조 표가 T2 삭제 디렉터리를 언급 | T3가 T2 뒤 |
| T19 ↔ T21 | Honors.jsx/Awards.jsx 생존 여부 | T21이 임포터 grep으로 재확인 |
| T20 (eslint --fix) | 다수 파일 | 이후 과제(T21~25)와 순차라 충돌 없음 |
| T24 (npm uninstall) | node_modules 정션 공유 → 원본 체크아웃 dev 서버(3300) 영향 | 미사용 패키지라 무해. 마지막 순서로 둠 |
| T13 industrial.css | 사용자 WIP가 같은 파일을 편집 중 | 파일 끝 추가만 허용(브리프 명시). 병합 시 충돌 가능성 낮음 |
| 각 과제 자체 정합성 | 테스트 ↔ 구현 ↔ 검증 명령 | T1~T25 모두 지정 파일과 검증 명령이 일치. T8 검증 grep은 인용부호가 셸에 따라 깨질 수 있어 구현자가 조정 |

## Progress
T1 dispatched at 09:45 base 9bff514
Task 1: complete (commits 9bff514..0bcbff6, review clean)
Task 2: complete (commits 0bcbff6..bbea7ce, review clean)
Ruling: 런타임 QA 반영 — Task 26(dirty 기준선+중복 제출), 27(nav 이동 미저장 경고), 28(APP_ORIGIN 불일치 안내), 29(사업 영역 시드 마이그레이션) 추가, Task 8에 서버 예외 로깅 추가. QA #7(수상 필수 표시), #9(세션 만료 입력 보존, 설계 §4), #10(카테고리 중복/폼 초기화), #11(초안의 공개 보기 링크), #12(수상 순서 UI)는 보고서 보류 — 틀리면 비용: 후속 세션에서 추가 과제.
Ruling: APP_ORIGIN 단일 신뢰 출처 설정은 유지하고 메시지와 README만 고침(보안 경계 완화 금지) — 틀리면 비용: 개발 편의만 손해.
T3 dispatched base bbea7ce
Task 3: complete (commits bbea7ce..5211a75, review clean)
Task 3: minor (deferred): README 44-46행 문장 중복, src/hooks/가 파일 구조 표에 없음
T4 dispatched base 5211a75
Task 4: complete (commits 5211a75..f6a1f6f, review clean)
Task 4: minor (deferred): 서버 입력 타입(HonorInput/LocalizedSolution/NewsCommandInput)의 imageAlt/coverAlt가 string|null을 반영하지 않음. request.body가 any라 지금은 무해. 관리자 API에 zod 검증이 없다는 근본 문제(관리자 보고서 §4 #2)와 함께 후속
T5 dispatched base f6a1f6f
Task 5: complete (commits f6a1f6f..8de01b2, review clean)
T6 dispatched base 8de01b2
Task 6: complete (commits 8de01b2..e98d0a2, review clean)
T7 dispatched base e98d0a2
Ruling: 워크트리 node_modules 정션이 Turbopack 빌드를 깨뜨림(심링크가 파일시스템 루트 밖을 가리킨다는 패닉). 정션을 제거하고 npm ci로 실제 설치 — 틀리면 비용: 디스크 수백 MB와 몇 분. Task 24의 npm uninstall도 이제 워크트리에만 영향.
Task 7: complete (commits e98d0a2..dd385c2, review clean; 인증된 NOT_FOUND 경로의 실기 확인은 미완 — 최종 QA에서 확인)
T8 dispatched base dd385c2
Ruling: Task 8 라우트 목록에 popup-notices/[id]/unpublish.ts 누락(계획 결함). 같은 수정을 범위에 포함해 후속 구현자에게 지시 — 틀리면 비용: 없음(같은 유형 1줄).
Task 8: complete (commits dd385c2..17ecb8c, review clean)
Task 8: minor (deferred): popup-notices/[id]/reorder.ts는 UI 호출자가 없는 죽은 API(관리자 보고서 §4 #5)
T9 dispatched base 17ecb8c
Task 9: complete (commits 17ecb8c..7e6d3ac, review clean)
Task 9: minor (deferred): 23505→BAD_REQUEST 매핑 단위 테스트 없음(DB 테스트 기반 부재); NewsForm.tsx:420 기존 가운뎃점
T10 dispatched base 7e6d3ac
Task 10: review round 1 — Important: 404/500이 SeoMetadata로 인해 하이드레이션 후 canonical/hreflang이 요청된 잘못된 URL을 가리킴. fix round 1 dispatch (fresh implementer, SendMessage 불가)
Task 10: fix round 1/5 (1 addressed, 1 open — 404/500 canonical/hreflang은 _app.jsx:81의 전역 SeoMetadata가 원인; commits 2536418..5f0fa25)
Task 10: Ruling: 남은 finding은 Task 11(전역 SeoMetadata 제거)이 근본 수정. Task 10은 1건 parked로 완료 처리하고 Task 11 리뷰 제약에 '404 페이지에 canonical/hreflang 없음'을 추가 — 틀리면 비용: Task 11 리뷰에서 재발견됨.
Task 10: complete (commits 7e6d3ac..5f0fa25, 1 parked → Task 11)
T11 dispatched base 5f0fa25
Task 11: Ruling: 홈(index.jsx)이 전역 SeoMetadata에만 의존하고 있었음(계획 결함). index.jsx에 SeoMetadata 추가를 범위에 포함 승인 — 틀리면 비용: 4줄 되돌리기.
Task 11: review — Important 1건(공지 summary가 빈 문자열이면 description 메타 누락, 대체값 없음). fix round 1 dispatch
Task 11: fix round 1/5 (1 addressed 대기 중 재리뷰, 0 open; commits 1afbfc5..b2da726)
Task 11: fix round 1/5 결과 (1 addressed, 0 open; commits 1afbfc5..b2da726)
Task 11: complete (commits 5f0fa25..b2da726, review clean; Task 10 parked 항목 해소)
T12 dispatched base b2da726
Task 12: complete (commits b2da726..498c42e, review clean)
T13 dispatched base 498c42e
Task 13: complete (commits 498c42e..406429a, review clean)
T14 dispatched base 406429a
Task 14: complete (commits 406429a..3d79ba7, review clean)
Task 14: minor (deferred): 클라이언트 이메일 정규식이 서버 zod .email()보다 느슨함(서버 400으로 걸러짐); 500 응답 케이스 테스트 없음
T15 dispatched base 3d79ba7
Task 15: Ruling: 뉴스 상세 날짜는 목록 페이지와 동일한 기존 포맷터를 쓴다(브리프의 '2025년 6월 16일' 예시보다 사이트 내 일관성 우선) — 틀리면 비용: 포맷 옵션 한 줄 변경.
Task 15: review — Critical: formatDate를 fs 의존 src/lib/news.js에 넣어 news 페이지 클라이언트 번들에서 next build 실패. fix round 1 dispatch
Ruling(process): Task 15의 빌드 깨짐이 vitest+typecheck로는 안 잡혔음. 이후 src/pages 또는 import 그래프를 건드리는 모든 과제(16,17,18,19,21,22,24)의 구현자 지시에 'npm run build 성공'을 완료 조건으로 추가 — 틀리면 비용: 과제당 빌드 시간 1~2분.
Task 15: fix round 1/5 (재리뷰 대기; commits 211ae96..ce7f996)
Task 15: fix round 1/5 결과 (1 addressed, 0 open; commits 211ae96..ce7f996)
Task 15: minor (deferred): 비활성 span 클래스에서 pointer-events-none 제외(브리프 '같은 클래스' 문구와 다름, 기능상 더 정확)
Task 15: complete (commits 3d79ba7..ce7f996, review clean)
T16 dispatched base ce7f996
Task 16: complete (commits ce7f996..b68b0e4, review clean)
T17 dispatched base b68b0e4
Task 17: complete (commits b68b0e4..97aa285, review clean)
T18 dispatched base 97aa285
Ruling: next-env.d.ts는 next build/dev가 번갈아 덮어쓰는 생성 파일. 커밋하지 않고 HEAD로 되돌림 — 틀리면 비용: 없음.
Task 18: complete (commits 97aa285..7dfd70e, review clean)
Task 18: minor (deferred): DB 상세 응답에 slug 필드 없음(정적 소스와 차이, 기존 결손); 상세 경로의 커버 없음 케이스 테스트 없음
T19 dispatched base 7dfd70e
Task 19: complete (commits 7dfd70e..c37f6b9, review clean)
Task 19: minor (deferred): tests/unit/honors/queries.test.ts afterEach가 ASSET_PUBLIC_BASE_URL을 복원하지 않고 고정값 설정
T20 dispatched base c37f6b9
T20 재배정 (이전 구현자 429로 중단, 변경 없음)
Task 20: complete (commits c37f6b9..4a4f83d, review clean)
Task 20: note: react-hooks/refs 경고 5건(관리자 폼의 baseline useRef+useMemo)은 Task 26이 useState 기준선으로 바꾸며 해소 예정. BidNoticePopup.jsx 경고는 Task 21에서 파일 삭제로 해소 예정
T21 dispatched base 4a4f83d
Task 21: complete (commits 4a4f83d..fdde2ab, review clean)
Task 21: note: HomeHero 테스트가 검증하던 6가지 동작(수동 이전/다음/정지, aria-current, 단일 장면, 미디어 오류 대체, 6초 자동 전환, 정지 후 진행 유지)은 IndustrialHero에 대응 테스트 없음 — 사용자 WIP 파일이라 보류
T22 dispatched base fdde2ab
Task 22: complete (commits fdde2ab..dd0b868, review clean)
T23 dispatched base dd0b868
Task 23: complete (commits dd0b868..0354cc3, review clean)
Task 23: minor (deferred): 계약 키 비교가 POST(생성) 본문만 검증, PUT 갱신 본문은 미검증
T24 dispatched base 0354cc3
Task 24: review — Important: mdast-util-to-hast 13.2.1 lock 단언 삭제(계획이 지시). 버전이 변하지 않았으므로 가드 유지가 옳음.
Task 24: Ruling: 계획(Task 24 브리프)의 '단언 제거' 지시를 뒤집고 단언을 복구한다. 보안 패치 가드는 근거 없이 약화하지 않는다 — 틀리면 비용: lock 재구성 시 테스트 1건 갱신.
Task 24: fix round 1 dispatch
Task 24: fix round 1/5 (재리뷰 대기; commits 36d6151..23006ed)
Task 24: fix round 1/5 결과 (1 addressed, 0 open; commits 36d6151..23006ed)
Task 24: complete (commits 0354cc3..23006ed, review clean)
T25 dispatched base 23006ed
Ruling: Task 25 구현자가 워크트리에서 compose를 실행해 'completeness-fixes' 프로젝트의 빈 DB 볼륨이 생김. 그 프로젝트는 down -v로 제거하고 원본 프로젝트(brainworkscokr)의 컨테이너를 재기동해 QA 데이터 유지 — 틀리면 비용: 없음(빈 볼륨 삭제). 이후 구현자 지시에 compose 실행 금지를 명시.
Task 25: review — Critical: en 200 검증 누락(/en/* 라우트가 없다는 잘못된 전제), Important: /about/history 누락. fix round 1 dispatch
Task 25: fix round 1/5 (재리뷰 대기; commits e09a605..bb9b888)
Task 25: fix round 1/5 결과 (2 addressed, 0 open; commits e09a605..bb9b888)
Task 25: complete (commits 23006ed..bb9b888, review clean)
T26 dispatched base bb9b888
Task 26: review — Important: NewsForm changeSlug에 inFlight 가드 누락(같은 파일 내 패턴 불일치). fix round 1 dispatch
Task 26: fix round 1/5 (재리뷰 대기; commits 5c2c254..10392d5)
Task 26: fix round 1/5 결과 (1 addressed, 0 open; commits 5c2c254..10392d5)
Task 26: minor (deferred): uploadImage(3개 폼)와 showPreview(NewsForm)는 inFlight 가드 없음(비파괴적이라 보류)
Task 26: complete (commits bb9b888..10392d5, review clean)
T27 dispatched base 10392d5
Task 27: Ruling: 후크 수정으로 드러난 생성 경로 버그(5개 폼이 router.push 전에 기준선을 갱신하지 않아 생성 직후 미저장 경고) — 계획 결함. Task 27 후속 라운드에서 5개 폼의 생성 경로를 함께 수정하고 한 범위로 리뷰 — 틀리면 비용: 폼당 1줄.
Task 27: review — Critical: skipNextRouteCheck가 수정키 클릭(새 탭) 시 무장 상태로 남아 다음 경고 억제. Important: 생성 경로 setBaseline→push 순서가 Next 내부 await에 의존, 4개 폼 생성 경로 테스트 없음, 후속 테스트 RED 증거 없음.
Task 27: Ruling: Critical은 fix round 1(플래그에 1초 TTL). Important 1은 리뷰어가 Next 16 router.js에서 await 순서를 확인했으므로 코드 주석으로 의존을 명시하고 parked. Important 2,3은 minor(deferred)로 기록 — 틀리면 비용: 향후 Next 패치 시 생성 직후 경고 재발(테스트 미검출).
Task 27: fix round 1 dispatch
Task 27: fix round 1/5 (재리뷰 대기; commits 3cc74d9..17284a5)
Task 27: fix round 1/5 결과 (1 addressed, 0 open; commits 3cc74d9..17284a5)
Task 27: parked — 생성 경로 setBaseline→push가 Next 내부 await 순서에 의존 — Ruling: router.js 확인 근거로 코드 주석 명시 후 유지, 향후 Next 업그레이드 시 회귀 확인 항목
Task 27: minor (deferred): 생성 경로 회귀 테스트가 NoticeForm만 있음(4개 폼 미검증); 후속 커밋 테스트의 RED 증거 없음; resetSkip 리스너는 사실상 무해한 잉여
Task 27: complete (commits 10392d5..17284a5, 1 parked)
T28 dispatched base 17284a5
Task 28: complete (commits 17284a5..c5a264e, review clean)
Task 28: parked — forgot-password의 출처 불일치 분기는 better-auth가 /request-password-reset에 Origin 검사를 걸지 않아 실제로는 도달 불가 가능성 — Ruling: 무해한 방어 코드로 유지, 수정 없음 — 틀리면 비용: 없음
T29 dispatched base c5a264e
Ruling: meta/0004_snapshot.json은 drizzle-kit generate의 필수 산출물이라 범위에 포함 승인 — 틀리면 비용: 없음.
Task 29: complete (commits c5a264e..2bba941, review clean)
ALL TASKS COMPLETE — final whole-branch review dispatch (9bff514..2bba941)
FINAL REVIEW: With fixes — Important 3 (I-1 npm audit CI 실패: next/nodemailer/sharp 패치 버전, I-2 datetime-local이 서버 TZ 사용, I-3 생성 경로 타이밍 의존).
Ruling(final I-1): 패치 버전만 올림(next 16.3.4, nodemailer 9.1.1, sharp 0.35.4). audit이 그래도 실패하면 추적하지 않고 보고 — 틀리면 비용: 패치 회귀(빌드/테스트로 검증).
Ruling(final I-2): 클라이언트 변환으로 재설계하지 않고 서버 프로세스 TZ를 Asia/Seoul로 고정(pm2 ecosystem, README, 코드 주석). 관리자가 전원 KST라는 전제. 진짜 클라이언트 변환은 후속 — 틀리면 비용: 해외 관리자 생기면 재작업.
Ruling(final I-3): 후크가 dirty를 ref로 읽고, 폼 생성 경로는 flushSync로 기준선을 동기 반영해 Next 내부 await 의존 제거 — 틀리면 비용: 폼당 1줄.
FINAL FIX WAVE dispatch base 2bba941
FINAL FIX WAVE: commits 2bba941..5040aa6 (3건). 재리뷰 대기.
Ruling(final): nodemailer 9.0.5→9.1.1은 마이너 경계지만 취약 범위가 <=9.1.0이라 불가피 — 틀리면 비용: 메일 발송 회귀(테스트로 미검증, 운영 확인 필요).
Ruling(final): dirtyRef.current = dirty 렌더 중 대입으로 react-hooks/refs 경고 1건 재발(22→23). 2차 수정 배치는 없으므로 parked. 후속에서 useLayoutEffect 대입으로 바꾸면 해소 — 틀리면 비용: 경고 1건.
FINAL: fix wave re-review clean. docs commit added. workspace deleted.
