# SDD ledger — plan: docs/superpowers/plans/2026-09-14-deferred-items.md

Worktree: C:\브레인웍스\brainworks.co.kr\.claude\worktrees\completeness-fixes (branch fix/completeness-audit, base 81c907d)
Spec: 사용자 결정(2026-09-14) + 이전 보고서 §5~6 + 관리자 설계 §3, §4
Baseline at 81c907d: typecheck 0, lint 0 오류/20 경고, vitest 60 파일 199 통과, build OK

Ruling: 사용자 결정 반영 — 본사 표기 보류, docs 미추적 유지(Task 8은 원본 docs 로컬 수정만), 폰트 동적 서브셋, DB 테스트 신설(배포 사이트 공지 픽스처 허용), 개인정보처리방침은 '회사 검토 전 초안', 보류 권고 항목(B2~B5, forgot-password, 수상 순서 UI)은 유지.
Ruling(process): 파일이 겹치지 않는 과제는 격리 워크트리(브랜치 deferred/task-N)로 병렬 실행하고 cherry-pick. 웨이브 A: T1, T9, T10(격리) + T11(메인) + T8(원본 docs). 웨이브 B: T2(메인), T3, T5, T6(격리; T1 반영 후). 웨이브 C: T4(메인, T2 후) → T7(마지막). 틀리면 비용: cherry-pick 충돌 시 수동 해결.

## Pre-flight scan

| 쌍/과제 | 공유 파일 또는 인터페이스 | 확인 결과 |
|---|---|---|
| T1 ↔ T5 | notice-categories API(T1: zod / T5: 중복 이름 검사) | T5는 T1 반영 후 실행(웨이브 B) |
| T1 ↔ T6 | popup-notices reorder.ts(T1: 스키마 적용 / T6: 삭제) | T6가 T1 뒤에 삭제. T1은 reorder에도 스키마를 넣지만 T6에서 파일째 사라짐 — 낭비지만 충돌 없음 |
| T2 ↔ T4 | 5개 폼(T2: catch에 스냅숏 / T4: uploadImage 가드, 테스트) | 순차(T2 → T4) |
| T2 ↔ T6 | require-admin.ts(T6) vs admin-api.ts(T2) | 별개 파일 |
| T3 ↔ T7 | 이미지 최적화(T3) 후 no-img-element 판정(T7) | T7 마지막 |
| T9 ↔ T11 | _document.tsx(T9: preload 제거) vs Footer/contact/sitemap(T11) | 별개 파일 |
| T10 | tests/db, vitest.db.config, package.json test:db, README | 다른 과제와 겹치지 않음. README는 T3/T9가 건드리지 않음 |
| T11 ↔ T6 | news/[slug].jsx(T6) vs sitemap.xml.tsx(T11) | 별개 |
| T8 | 원본 체크아웃 docs만 | 저장소 추적 파일 없음 |
| 각 과제 정합성 | 변경 ↔ 테스트 ↔ 검증 | T3는 standalone 확인 실패 시 되돌림 허용을 명시. T10은 DATABASE_TEST_URL 없을 때 skip 규칙 명시 |

## Progress
WAVE A dispatched base 81c907d: T1(iso,opus) T9(iso) T10(iso,opus) T11(main) T8(원본 docs). Docker 재기동.
Task 8: complete (원본 docs 5개 로컬 수정, 커밋 없음). Ruling: 미추적 개인 문서라 정식 리뷰 대신 컨트롤러가 머리말과 grep만 확인 — 틀리면 비용: 문서 오탈자.
T11 done @a4b2a7a — review dispatch; T2 dispatched (main) base a4b2a7a
T9 done on deferred/task-9 @8c2c5a0 — review dispatch; T3 dispatched (iso) base a4b2a7a
Task 11: complete (commits 81c907d..a4b2a7a, review clean)
Task 11: minor (deferred): contact.jsx:120 검증 오류 문구에 기존 가운뎃점(수집·이용) 잔존 — Task 7 정리 시 함께 처리
Task 11: note: public-shell-navigation.test.tsx의 finalFocus 케이스가 간헐 실패(기존) — 최종 리뷰에서 안정화 여부 확인
T10 done on deferred/task-10 @c0a4afe — review dispatch. 주목: DB 테스트가 23505 매핑이 drizzle 래핑 때문에 작동 안 하던 실버그를 발견해 수정함
T1 done on deferred/task-1 @7c123e6 — review dispatch. previews/[contentType].ts 미검증(브리프 밖) → T6에 추가
Task 9: complete (deferred/task-9 8c2c5a0 → cherry-pick 424c061, review clean; 홈 폰트 2,057,688B → 340,964B)
Task 10: complete (deferred/task-10 c0a4afe → cherry-pick 4ae578a, review clean; 23505 매핑 실버그 수정 포함)
Task 10: minor (deferred): 시드 멱등 테스트가 migrate() 추적에 의존(SQL 직접 재실행 아님); ESM/CJS Vite 경고 기존
Task 1: complete (deferred/task-1 7c123e6 → cherry-pick 47077fc, review clean)
Task 1: minor (deferred): news category min(1)은 정책 검사가 스키마에 있음; displayDate 빈 값이 400(이전엔 500); zod4 표기 z.iso.datetime 권장; 테스트에서 noticeCategory 케이스 제외
WAVE B: T5, T6 dispatched (iso) base 47077fc. T6에 previews/[contentType].ts zod 적용 추가(계획 결함 보완).
T3 done on deferred/task-3 @2a7fbf4 — review dispatch

- 09:58 T3 reviewer: Approved (Critical 0, Important 0, Minor 1: new URL 2회 호출, 스타일). 2a7fbf4 cherry-pick → main. Task 3: complete
T2 done @4b56117 (base 8158f19) — review dispatch
Task 2: complete (4b56117, review clean; 7/7 tests, typecheck OK)
Task 2: minor (deferred): handleUnauthorized 5개 폼 중복(브리프 파일 범위 제약); 편집 페이지가 폼에 key 없이 initial 전달(기존, A→B 클라이언트 이동 시 상태 잔존 가능); 500/네트워크 오류 경로 테스트 없음 → T4에서 고려
WAVE C: T4 dispatched (main) base 4b56117
T6 done on deferred/task-6 @50fc07e (base 47077fc) — review dispatch
T4 done @fe3297e (base 4b56117) — review dispatch. 주목: public-shell-navigation.test.tsx finalFocus 간헐 실패 재발(T11에서도 보고) → 최종 리뷰 전 안정화 항목
T5 done on deferred/task-5 @fdf32a1 (base 47077fc) — review dispatch. 주목: admin-api.ts adminApiErrorMessage 범위 밖 수정(BAD_REQUEST 서버 메시지 폐기 버그)
T6 reviewer: Approved (Critical 0, Important 0, Minor 1: require-admin.test이 getAuth를 mock). cherry-pick은 T4 리뷰어의 메인 워크트리 테스트 실행이 끝난 뒤 수행(공개 셸 내비 테스트 파일 겹침)
Task 4: complete (fe3297e, review clean; 간헐 실패 3회 재실행 재현 안 됨 — 병렬 실행 시에만 발생 추정)
Task 6: complete (deferred/task-6 50fc07e → cherry-pick d13a506, review clean)
Note: T6 반영 후 메인 typecheck 실패 원인은 이전 prod 빌드가 남긴 .next/types/validator.ts의 reorder 참조(빌드 산출물, 코드 결함 아님). 파일 삭제 후 재검사. 최종 검증은 npm run build로 재생성 확인
T5 reviewer: Approved (Critical 0, Important 0, Minor 3: 대소문자 구분 비교, 카테고리 이름 DB unique 제약 없음(동시 생성 경합), admin-api.ts 범위 밖 수정은 근본 원인 수정으로 인정). cherry-pick은 메인 검사 종료 후
Task 5: complete (deferred/task-5 fdf32a1 → cherry-pick 4c500b9; admin-api.ts T2 변경과 충돌 없음, typecheck+폼 테스트 통과)
T7 dispatched (main) base 4c500b9 — 마지막 과제. 추가: contact.jsx:120 가운뎃점 제거
T7 done @1e89b28 (base 4c500b9) — review dispatch. 주목: IndustrialHero.jsx 경고 2건 잔존(금지 파일), 사이트 전반 가운뎃점 구분자 약 20파일은 범위 밖으로 보고서에 기록
Task 7: complete (1e89b28, review clean; Minor: PageHeroMedia priority가 모든 사용처에 적용 — 현재 사용처는 전부 상단 히어로). 경고 20 → 2(IndustrialHero.jsx, 금지 파일)
FINAL REVIEW dispatch: range 81c907d..1e89b28 (10 commits)
FINAL REVIEW: Mergeable (Critical 0, Important 0, Minor 6). typecheck 0, lint 0 오류/2 경고(IndustrialHero), vitest 65/246, test:db 10/27, build OK, 번들 +0.2~0.6kB. public-shell-navigation 3회 통과
FIX WAVE dispatched (main) base 1e89b28: Minor 1(폰트 개수 92 고정), 2(카테고리 빈 이름 400), 3(images.domains 제거, new URL 1회). Minor 4(픽스처 원문), 5(PageHeroMedia priority), 6(next-env.d.ts 산출물)은 후속으로 기록
FIX WAVE: complete (84671c5, re-review Approved; vitest 65/247). PLAN COMPLETE. 보고서 reports/2026-09-14/ 커밋 후 SDD 작업 폴더 삭제
