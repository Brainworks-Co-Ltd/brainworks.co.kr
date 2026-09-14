# 보류 항목 처리 보고서 (2026-09-14)

## 1. 한 줄 총평

이전 두 보고서에서 "확인 필요"와 "남긴 항목"으로 미뤄 둔 것들을 사용자 결정에 따라 11개 과제로 묶어 처리했습니다. 회사 확인이 필요한 두 건(푸터 본사 표기, 개인정보처리방침 문안)은 보류와 초안으로 두고, 나머지는 모두 코드로 반영했습니다. 가장 큰 변화는 홈 첫 방문 폰트 전송량이 2.06MB에서 0.34MB로 줄어든 것, 관리자 API 30개 라우트가 zod 검증을 거치게 된 것, 실제 Postgres에 붙는 DB 테스트가 생기면서 슬러그 중복 오류 매핑이 실제로는 동작하지 않던 버그를 찾아 고친 것입니다.

## 2. 사용자 결정과 반영

| 결정 | 반영 |
|---|---|
| 푸터 본사 표기는 대표님 확인 후 | 보류. 코드 변경 없음 |
| docs 폴더는 개인 메모라 계속 git 미추적 | 유지. 문서 오류 정정(Task 8)은 원본 체크아웃의 docs만 로컬 수정, 커밋 없음 |
| 폰트 오버로드 줄이기 | Task 9: Pretendard 동적 서브셋 92개 자체 호스팅 |
| DB 테스트 만들기, 배포 사이트 공지 내용을 픽스처로 써도 됨 | Task 10: `tests/db/` 5개 파일, 공지 픽스처 `tests/db/fixtures/notices.json` |
| 개인정보처리방침은 회사 확인 필수, 현재 문안 없음 | Task 11: `/privacy` 초안 페이지. 회사가 채워야 할 곳 4군데에 `[확인 필요]` 표시 |
| 제 판단으로 바로 처리 제안은 그대로 | Task 1~7 반영 |
| 보류 권고는 그대로 둠 | B2 `useDeferredValue`, B3 `content-visibility`, B4 폼 dirty 검사, B5 공지 SQL 페이지네이션, 비밀번호 찾기, 수상 순서 UI는 손대지 않음 |

## 3. 반영한 과제

| # | 과제 | 변경 | 효과 | 커밋 |
|---|---|---|---|---|
| 1 | 관리자 API 입력 검증 | `src/server/http/validate.ts`의 `parseBody`와 모듈별 zod 스키마 6개, 관리자 라우트 30개 적용 | 잘못된 본문이 500 대신 400으로 응답, 단위 테스트 23건 | 47077fc |
| 2 | 세션 만료 시 관리자 폼 보존 | 401 응답 시 입력을 `sessionStorage`에 저장하고 로그인 페이지로 이동, 재로그인 후 같은 편집 화면에서 복원 | 긴 본문을 쓰다 세션이 끊겨도 입력 유실 없음, 이동 시 "저장하지 않은 변경" 확인창 미출력 | 4b56117 |
| 3 | Next 이미지 최적화 활성화 | `images.unoptimized` 제거, `ASSET_PUBLIC_BASE_URL`이 있으면 `remotePatterns` 추가 | standalone 서버에서 `/_next/image`가 webp로 응답, 스모크 테스트 케이스 추가 | 8158f19 |
| 4 | 폼 회귀 테스트와 중복 제출 가드 | 생성 경로 테스트 4개 폼 추가, 500 오류 테스트, 탭 마우스 클릭 테스트, `uploadImage`와 `showPreview`에 `inFlight` 가드 | 이미지 업로드와 미리보기 중복 요청 차단 | fe3297e |
| 5 | 관리자 사용성 3건 | 카테고리 중복 이름 차단(생성과 이름 변경), 초안 항목의 "공개 보기" 링크를 "아직 공개되지 않음"으로, DB 뉴스 상세 응답에 `slug` 포함 | 중복 카테고리 생성 불가, 초안 링크 404 없음 | 4c500b9 |
| 6 | 잔여 정리 4건 + 미리보기 API 검증 | 모바일 메뉴 `aria-controls` 연결, 관리자 페이지 가드가 인증 오류만 리다이렉트하고 DB 장애는 다시 던짐, 뉴스 상세 `translate` 중복 제거, 죽은 팝업 순서 변경 API 삭제, 미리보기 API에 zod 적용 | 접근성 연결 복원, 장애 원인 은폐 제거, 코드 66줄 삭제 | d13a506 |
| 7 | ESLint 경고 20건 판정 | 미사용 변수 4건과 익명 기본 내보내기 1건 수정, `useUnsavedChanges`의 렌더 중 ref 대입을 `useLayoutEffect`로, `set-state-in-effect` 2건은 스토리지와 라우터 쿼리 하이드레이션 사유를 적어 유지, `<img>` 11건 중 정적 자산 6건을 `next/image`로 교체(로고, CEO 사진, 사업 영역 4장, 페이지 히어로 배경), 동적 업로드와 혼합 포맷 로고 5건은 사유를 적어 유지. 문의 폼 검증 문구의 가운뎃점 제거 | 경고 20건 → 2건(둘 다 `IndustrialHero.jsx`, 사용자 WIP 파일이라 손대지 않음). 교체한 이미지는 크기를 sharp로 확인해 레이아웃 시프트 없음 | 1e89b28 |
| 8 | 문서 정정 | 원본 체크아웃 docs 5개 파일의 낡은 서술 수정 | 커밋 없음(미추적) | 없음 |
| 9 | 폰트 동적 서브셋 | `PretendardVariable.woff2`(1.96MB) 삭제, 유니코드 범위별 92개 woff2와 `src/styles/pretendard.css`로 교체, preload 제거 | 홈 첫 방문 폰트 전송량 2,057,688B에서 340,964B로 | 424c061 |
| 10 | DB 테스트 | `vitest.db.config.ts`, `tests/db/` 5개 파일(공지, 팝업, 뉴스 슬러그, 관리자 목록, 시드), 전역 셋업이 마이그레이션 실행, 파일별 truncate | 실버그 발견: drizzle 0.45가 오류를 감싸서 `error.code === "23505"`가 매칭되지 않아 슬러그 중복이 409 대신 500이었음 → `cause` 검사로 수정 | 4ae578a |
| 11 | 개인정보처리방침 초안 | `/privacy` 페이지(ko/en, 10개 항목), 푸터와 문의 폼 동의 문구 링크, sitemap 등록 | 문의 폼 동의 문구가 실제 문서를 가리킴 | a4b2a7a |
| 수정 배치 | 최종 리뷰 Minor 3건 | 폰트 서브셋 개수 테스트를 92개로 고정, 카테고리 이름 빈 값을 zod에서 400으로 차단(생성과 편집 모두), `next.config.js`의 폐기된 `images.domains` 제거와 URL 파싱 1회화 | 회귀 테스트가 실제 결손을 잡음, 빈 이름 카테고리 생성 불가 | 84671c5 |

## 4. 회사 확인이 필요한 항목

| 항목 | 위치 | 내용 |
|---|---|---|
| 푸터 본사 표기 | `src/components/Footer.jsx` | 광주 실무 본사와 대구 사업자등록 본점 중 무엇을 표기할지 |
| 개인정보 보호책임자 | `src/pages/privacy.jsx` `[확인 필요]` | 성명, 직책, 연락처 |
| 보유 기간 | 같은 파일 | 문의 접수 후 보관 기간 |
| 위탁과 제3자 제공 | 같은 파일 | 이메일 발송 등 실제 위탁 업체 유무 |
| 시행일 | 같은 파일 | 게시 시점 |

초안은 현재 코드가 실제로 수집하는 항목(이름, 이메일, 회사명, 문의 목적, 사업 영역, 문의 내용)만 적었고, 문의 내용이 DB에 저장되지 않고 요청 ID 해시만 남는다는 코드 사실만 반영했습니다. 확인 전에는 게시하지 않아야 합니다.

## 5. 리뷰에서 남긴 항목

- Task 1: 뉴스 카테고리 `min(1)` 정책 검사가 스키마 안에 있음. `displayDate` 빈 값이 이전에는 500, 지금은 400.
- Task 2: `handleUnauthorized`가 5개 폼에 중복(브리프의 파일 범위 제약). 편집 페이지가 폼에 `key` 없이 `initial`을 넘겨 같은 종류의 레코드 A에서 B로 클라이언트 이동 시 상태가 남을 수 있음(기존).
- Task 5: 카테고리 이름 비교는 대소문자 구분. 이름에 DB unique 제약이 없어 동시 생성 경합은 막지 못함.
- Task 6: `require-admin.test.ts`가 `getAuth`를 mock(같은 모듈 함수는 부분 mock 불가).
- Task 10: 시드 멱등 테스트가 `migrate()` 추적에 의존.
- 모바일 메뉴 `finalFocus` 테스트가 전체 병렬 실행 중 두 차례 간헐 실패(단독 3회 실행에서는 재현 안 됨). 최종 리뷰어의 단독 3회 실행도 전부 통과했습니다.

## 6. 검증

최종 전체 리뷰(별도 리뷰 에이전트, 10커밋 212파일 전량)는 "병합 가능"으로 판정했고 Critical 0, Important 0, Minor 6이었습니다. 과제 사이 봉합 지점 다섯 곳(zod 검증 일원화, 세션 스냅샷과 `inFlight` 가드와 `useLayoutEffect`의 상호작용, 이미지와 폰트 잔여물, reorder 삭제 완결성, 23505 매핑)을 직접 확인했고, 관리자 API 38개 라우트 중 multipart 2개를 뺀 36개가 `parseBody`를 지납니다. Minor 6건 중 3건(폰트 개수 테스트 임계값, 카테고리 빈 이름 허용, `next.config.js`의 폐기 키)은 한 차례 수정 배치로 처리했고(커밋 84671c5, 재리뷰 통과), 나머지 3건(픽스처가 배포 공지 원문이라 낡을 수 있음, `PageHeroMedia`의 무조건 `priority`, 빌드 후 `next-env.d.ts` 변경)은 후속으로 남겼습니다.

| 항목 | 결과 |
|---|---|
| `npm run typecheck` | 0 오류 |
| `npm run lint` | 0 오류, 경고 2 (둘 다 `IndustrialHero.jsx`) (시작 시 0 오류, 경고 20) |
| `npm test` (vitest) | 65 파일 247 테스트 전부 통과 (시작 시 60 파일 199 테스트) |
| `npm run test:db` | 10 파일 27 테스트 통과 (테스트 DB 5434 실접속) |
| `npm run build` | 성공. 공개 라우트 First Load JS 변화 +0.2~0.6kB (`/education` 409.1kB, `/news` 395.7kB, `/` 499.3kB) |
| 홈 폰트 전송량 | 2,057,688B → 340,964B |

## 7. 병합 방법

브랜치는 같습니다(`fix/completeness-audit`). 원본 체크아웃에 `src/components/industrial/IndustrialHero.jsx`와 `src/styles/industrial.css`의 미커밋 변경이 남아 있는데, 같은 내용이 커밋 81c907d로 이미 브랜치에 들어 있으니 먼저 되돌려야 병합이 됩니다.

```bash
cd C:\브레인웍스\brainworks.co.kr
git checkout -- src/components/industrial/IndustrialHero.jsx src/styles/industrial.css
git merge fix/completeness-audit
```

`.claude/worktrees/` 아래 `agent-a289ec0952c2f062b` 폴더는 에이전트 작업이 끝났지만 프로세스가 잡고 있어 삭제하지 못했습니다. git에서는 이미 등록 해제됐으니 세션을 닫은 뒤 폴더만 지우면 됩니다.

## 8. 파일 목록

- 이 보고서: `reports/2026-09-14/00-deferred-items-report.md`
- 최종 리뷰와 판정 장부: `reports/2026-09-14/01-final-review.md`, `reports/2026-09-14/02-sdd-ledger.md`
- 실행 계획: 워크트리 `docs/superpowers/plans/2026-09-14-deferred-items.md` (docs는 git 미추적)
- 이전 보고서: `reports/2026-09-11/`, `reports/2026-09-12/`
