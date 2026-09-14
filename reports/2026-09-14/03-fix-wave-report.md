# fix-wave-report — completeness-audit 마무리 3건

브랜치: `fix/completeness-audit`, 커밋: `84671c5`

## 1. 폰트 서브셋 개수 고정

- `tests/unit/font-assets.test.ts`: 실제 개수(파일 92개, `public/fonts/pretendard/*.woff2`;
  `unicode-range:` 92개, `src/styles/pretendard.css`)를 확인한 뒤 `toBeGreaterThanOrEqual(80)` →
  `toBe(92)`으로 정확히 고정. 테스트 설명 문구도 "80개 이상" → "정확히 92개"로 맞춤.
- `@font-face` 블록 수도 92개로 파일 수·unicode-range 수와 일치함을 확인(별도 assertion은 없었고
  테스트가 실제로 검사하는 두 항목만 고정).

## 2. 카테고리 빈 이름 차단 (생성 + 수정)

- 원인: `src/server/modules/notices/schema.ts`의 `noticeCategoryCommandSchema`가 이름 필드를
  `z.string()`으로만 받아 zod 단계에서 빈 문자열을 통과시켰다. 실제 차단은
  `category-repository.ts`의 `validate()`가 담당했는데, 이건 `HttpError("PUBLICATION_INVALID")`를
  던져 상태 코드가 400이 아니라 422였다(생성·수정 둘 다 이 경로를 탔으므로 "수정만 안 됨"이
  아니라 "둘 다 400이 아니었음"이 실제 문제).
- 수정: 스키마 단(`z.string().trim().min(1, "카테고리 이름을 입력해 주세요.")`)에 규칙을 추가.
  `noticeCategorySaveSchema`가 `noticeCategoryCommandSchema.extend(...)`이므로 base를 고치는 것만으로
  생성(POST `/api/admin/notice-categories`)과 수정(PUT `/api/admin/notice-categories/[id]`) 양쪽
  모두 `parseBody` 단계에서 `HttpError("BAD_REQUEST")` → 400으로 통일됨.
- `trim()`을 스키마에 넣었으므로 저장되는 이름 값도 앞뒤 공백이 제거된 채로 넘어감(부수 효과지만
  요청받은 패턴 그대로).
- `category-repository.ts`의 기존 `validate()` 방어 코드는 그대로 둠(도달 불가능해졌지만 제거 요청
  없었고 방어적 이중 체크로 유지). DB 유니크 제약이나 대소문자 처리는 손대지 않음(범위 밖).
- 테스트: `tests/unit/admin-schemas.test.ts`에 `noticeCategorySaveSchema` import 추가하고
  "카테고리 이름은 생성과 수정 모두에서 공백만 있으면 거절한다" 케이스 추가 — create/save 스키마 각각
  공백 이름 거절 + 정상 값 통과를 확인.

## 3. next.config.js 정리

- `images.domains: []` (Next 16 deprecated 키) 제거.
- `new URL(process.env.ASSET_PUBLIC_BASE_URL)`을 파일 최상단에서 한 번만 생성해
  `assetOrigin`으로 재사용(기존엔 `assetHost` 계산 시 한 번, `remotePatterns`의 `protocol` 계산 시
  또 한 번 `new URL(...)`을 호출했음). `remotePatterns`는 `assetOrigin.protocol` /
  `assetOrigin.hostname`에서 파생. 환경 변수가 비어있거나 없으면 기존과 동일하게 빈 배열.

## 검증

- `npx vitest run tests/unit/font-assets.test.ts tests/unit/admin-schemas.test.ts` → 2 files, 28 tests passed
- `npm run typecheck` → 통과(에러 없음)
- `npm run lint` → 0 errors, 2 warnings (모두 `src/components/industrial/IndustrialHero.jsx`, 손대지 않음)
- `npm test` → 65 files, 247 tests passed (baseline 246 + 신규 카테고리 이름 테스트 1건)
- `npm run build` → 성공 (26 페이지 생성)
- `git checkout -- next-env.d.ts` 실행, 커밋 후 `git status` clean 확인

## 변경 파일

- `next.config.js`
- `src/server/modules/notices/schema.ts`
- `tests/unit/admin-schemas.test.ts`
- `tests/unit/font-assets.test.ts`
