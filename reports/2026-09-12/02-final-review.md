# 최종 전체 브랜치 리뷰 — fix/completeness-audit (e2526d9..1b04e19)

리뷰 범위: 커밋 17개 / 과제 13개. 읽기 전용 리뷰(유일한 쓰기는 빌드가 바꾼 `next-env.d.ts` 복구).

## Strengths

- **Task 2의 4라운드가 옳은 자리에 도달했다.** 계획은 `MobileNavigation` 전체를 `ssr:false`로 내리라고 했고 그대로 했으면 no-JS와 SSR HTML에서 메뉴 버튼이 사라졌다. 리뷰가 이를 잡아내고 트리거는 정적, Base UI 다이얼로그만 첫 열기 시 로드로 재구성했다. 룰북 기준으로도 `bundle-dynamic-imports`보다 `bundle-conditional`("기능이 활성화될 때만 로드")에 더 정확히 맞는 형태다.
- **번들 감축이 실측으로 확인된다.** `/education` 청크 8개 전부에서 `base-ui` / `tailwind-merge` / `cva` 마커가 0건이다(build-manifest로 `/education` + `/_app` 청크를 뽑아 직접 grep). 공개 라우트 전반이 -92.8kB raw로 균일하게 내려갔고 원장의 408.8kB 주장과 실측 408.9kB가 일치한다.
- **`TRIGGER_BUTTON_CLASSNAME` 드리프트 가드가 실효적이다.** `tests/components/mobile-navigation-trigger.test.tsx`가 상수와 `cn(buttonVariants({outline, icon}))`의 완전 일치를 단언한다. 상수에 `px-4 py-2`가 없는 것도 맞다 — twMerge가 `p-0`으로 덮기 때문이다. 즉 이 테스트는 손으로 베낀 문자열이 아니라 실제 병합 결과를 검증한다.
- **Task 11의 스냅샷은 진짜 리팩터 전 캡처였다.** 주장만 믿지 않고 `e2526d9`의 `buildAdminDashboardData`를 추출해 같은 `regressionRows`로 직접 실행했다. 결과:

  ```
  old === expected : true
  new === expected : true
  old === new      : true
  ```

  동률 정렬 순서와 slice(0,8) 경계까지 byte-identical이다. "perf 커밋에 숨은 동작 변경"은 없다.
- **계획 결함 2건을 구현 단계에서 바로잡았다.** (1) 위의 `ssr:false`. (2) Task 9는 계획이 렌더 중 `openGroupRef.current = openGroup`을 지시했는데 이는 이 저장소의 `react-hooks/refs` 규칙에 걸린다(`src/hooks/useUnsavedChanges.ts:15`가 같은 이유로 이미 경고를 내고 있다). 구현은 `useLayoutEffect`로 바꿔 경고를 새로 만들지 않았고, 룰북 `advanced-event-handler-refs`의 정본 패턴(ref 미러 + 빈 의존성 구독)과도 일치한다.
- **테스트가 목만 두드리지 않는다.** 팝업 스토리지 테스트는 `Storage.prototype.getItem/setItem`이 실제로 `DOMException`을 던지게 하고, 뉴스 필터 테스트는 `translate` 스파이의 호출 인자를 필드별로 분류해 "검색어가 없으면 title/summary를 번역하지 않는다"는 조기 종료 자체를 검증한다.
- **마크다운 캐시는 서버 전용이고 상한이 있다.** 호출부 전부가 GSSP 또는 `src/server/**`다(`src/lib/news.js`, `src/pages/notices/[slug].tsx`, `src/server/modules/news/database-source.ts`, `src/server/modules/preview/preview-service.ts`). 클라이언트 번들에 캐시가 실리지 않는다. 키가 본문 원문이라 관리자 수정 시 자동 무효화되는 것도 맞다.
- **캐시 공유 참조가 안전하다.** `getLocalizedBusinessAreas`의 소비자 4곳(`BusinessAreaExplorer`, `contact.jsx`, `catalog/queries.ts`, `businessMegaMenu.ts`)을 전부 확인했고 어디서도 반환 배열이나 그 원소를 변형하지 않는다. `catalog/queries.ts:48`은 `map`으로 새 객체를 만든다. `js-cache-function-results`의 공유 참조 요건 충족.
- **고아 삭제가 실제로 깨끗하다.** 8개 이름을 저장소 전체 grep한 결과 남은 히트는 주석 2건(`DomainGrid.jsx:28`, `SolutionCard.jsx:6`)뿐이다. `progress-track` / `carousel-controls` / `media-frame`은 테스트 임포터가 있어 유지한 판단이 맞다.
- **위생 양호.** `git status` 클린, 커밋 범위에 `next-env.d.ts` 없음, lint 경고 23 → 20(고아 삭제분), 테스트 53파일/170 → 59파일/198.

## Issues

### Critical (Must Fix)

없음.

### Important (Should Fix)

**1. 트리거 포커스 복귀가 라이브러리 API 대신 수작업이고, 테스트가 전혀 없다**

- `src/components/public/MobileNavigation.jsx:33-40` — `handleOpenChange`가 닫힐 때 동기적으로 `triggerRef.current?.focus()`를 호출한다.
- `src/components/public/MobileNavigationDialog.jsx:30` — 그러려고 `finalFocus={false}`로 Base UI의 복귀 기능을 꺼 두었다.

무엇이 문제인가: `onOpenChange(false)` 시점에는 React가 아직 배치를 플러시하지 않아 팝업이 마운트된 상태이고, `FloatingFocusManager`가 바깥 요소를 여전히 표시해 둔 상태다. 이 코드가 지금 동작하는 유일한 이유는 Base UI가 바깥 요소를 `inert`가 아니라 `aria-hidden`으로 표시하기 때문이다(`node_modules/@base-ui/react/floating-ui-react/components/FloatingFocusManager.js:345`가 `markOthers(insideElements, { ariaHidden })`만 넘기고 `inert`는 기본값 `false`로 남긴다). Base UI가 마이너 업그레이드에서 `inert`로 바꾸면 `.focus()`는 조용한 no-op이 되고 메뉴를 닫을 때마다 포커스가 `<body>`로 떨어진다. 에러도, 테스트 실패도 나지 않는다.

왜 중요한가: 키보드 사용자가 메뉴를 닫으면 페이지 맨 앞부터 다시 탭해야 한다. 이 계약은 원래 라이브러리가 보장하던 것을 이 브랜치가 직접 떠안은 것인데, `tests/components/public-shell-navigation.test.tsx`에는 열기 → 닫기 → `document.activeElement` 확인 케이스가 없다(추가된 테스트는 트리거의 초기 렌더 존재 확인뿐이다).

고치는 법 — 라이브러리에 되돌려주는 쪽이 코드도 줄어든다:

```jsx
// MobileNavigation.jsx
<MobileNavigationDialog triggerRef={triggerRef} ... />
// handleOpenChange의 else 분기와 .focus() 호출 삭제

// MobileNavigationDialog.jsx
<DialogContent finalFocus={triggerRef} ... />
```

`finalFocus`는 `boolean | RefObject<HTMLElement> | fn`을 받는 공개 API다(`node_modules/@base-ui/react/dialog/popup/DialogPopup.d.ts:34`, 내부적으로 `returnFocus`로 전달). 최소한, 현재 구조를 유지한다면 `public-shell-navigation.test.tsx`에 닫은 뒤 `expect(document.activeElement).toBe(trigger)` 한 줄을 추가해 계약을 고정할 것.

### Minor (Nice to Have)

**2. 로케일 캐시가 프로토타입 키에 노출된다** — `src/data/businessAreas.js:229-232`. `localizedCache`가 맨 객체 리터럴이라 `??=`가 `localizedCache["toString"]`을 nullish로 보지 않는다. `getLocalizedBusinessAreas("toString")`은 계산 대신 `Function.prototype.toString`을 반환하고, 호출부의 `areas.some(...)`이 터진다. 현재 인자는 Next i18n이 제한하는 `"ko" | "en"`뿐이라 도달 불가지만 `Object.create(null)`이나 `Map`으로 바꾸는 비용이 0이다.

**3. `translate` 중복이 남아 있다** — `src/pages/news/[slug].jsx:11-15`. Task 10이 `src/lib/news-filter.js`로 뽑아낸 바로 그 함수가 여기 그대로 복제돼 있다(원장에 deferred로 기록됨). `import { translate } from "@/lib/news-filter";` 한 줄 교체로 끝난다. 참고로 `FILTER_KEYWORDS`는 이 파일에 없다 — 원장 문구가 실제보다 넓게 적혔다.

**4. 파생 상태 테스트가 계획이 지목한 위험을 덮지 못한다** — `tests/components/design-interactions.test.tsx:12-25`. `useRouter` 목이 `replace`를 동기 setState로 구현해 탭 하이라이트가 같은 틱에 반영된다. 계획 Task 8이 되돌리기 조건으로 명시한 "`router.replace`가 한 틱 늦어 하이라이트가 지연되는가"는 이 테스트로는 원리적으로 검출되지 않는다. 파생 계산의 정합성(유효/무효 `?area=`, 순환 이동)은 잘 검증하므로 테스트 자체는 유효하다. 그 게이트가 원장에 기록된 수동 브라우저 확인에 전적으로 의존한다는 점만 알고 넘어갈 것.

**5. 캐시 테스트 한 케이스가 신호를 주지 않는다** — `tests/unit/business-areas-cache.test.ts:22-23`. `ko[0].title`과 `en[0].title`이 둘 다 `"Manufacturing AI"`임을 단언하는데, 이 값은 어떤 로케일 매핑에서도 통과한다. 로케일 분리는 바로 위 `subtitle` 단언이 이미 증명한다.

**6. 관리자 미리보기가 마크다운 캐시를 밀어낸다** — `src/server/modules/preview/preview-service.ts:4`. 저장되지 않은 초안 본문이 매번 새 키로 들어가 200칸을 채우고 실제 공지/뉴스 본문을 FIFO로 밀어낸다. 캐시는 최적화일 뿐이라 정확성 문제는 없지만, 미리보기 경로는 캐시를 건너뛰는 편이 의도에 맞는다.

**7. 캐시 상한이 개수 기준이다** — `src/lib/markdown.js:17-19`. 200개 × 본문 크기이므로 긴 공지가 많으면 수십 MB까지 간다. `ponytail:` 주석이 천장을 명시하고 있어 의도된 트레이드오프로 본다.

**8. Task 12가 계획에 없던 테스트 파일을 지웠다** — `tests/components/business-area.test.tsx` 45줄 삭제. `BusinessAreaCarousel.jsx`를 지우면 필연적인 결과이고 원장이 "참조 0건은 오류"라고 정정해 두었으므로 판단은 옳다. 계획의 사전 grep이 테스트 디렉터리를 보지 않았다는 계획 결함의 기록으로 남긴다.

**9. 커밋 트레일러 불일치** — 6개 커밋(`ac745bd`, `ab3dac3`, `81a2b32`, `418b355`, `64841a7`, `b2ff682`)이 계획의 `Claude Fable 5.1` 대신 `Claude Sonnet 5`를 달고 있다. 브리프가 명시적으로 리뷰 범위 밖으로 제외한 항목이라 지적이 아니라 기록이다.

## Deferred/Parked Triage

| 원장 항목 | 판정 | 근거 |
|---|---|---|
| 보류 B1 폰트 서브셋 2MB | SHIP | 측정과 사용자 판단이 필요해 계획에서 제외됨. 이 브랜치의 결함이 아님 |
| 보류 B2 `useDeferredValue` | SHIP | 동일. 뉴스 항목 수가 작아 효과 미측정 |
| 보류 B3 `content-visibility` | SHIP | 동일. 측정 선행 필요 |
| 보류 B4 폼 `JSON.stringify` | SHIP | 동일 |
| 보류 B5 공지 SQL 페이지네이션 | SHIP | 동일. 데이터 규모가 커질 때의 과제 |
| Task 2 minor: `aria-controls` 연결 소실 | SHIP | 지연 로드라 id를 미리 알 수 없는 게 맞고, ARIA APG의 모달 다이얼로그 트리거는 `aria-controls`를 요구하지 않는다. `aria-haspopup="dialog"` + `aria-expanded`로 충분 |
| Task 6 minor: catch가 DB 장애도 로그인 리다이렉트로 삼킴 | SHIP | 리팩터 전 `requireAdminPage`도 동일하게 전부 삼켰으므로 동작 변화 0. `require-admin.ts` 차원의 후속 과제로 유지 |
| Task 8 minor: 탭 마우스 클릭 테스트 없음 | SHIP | 클릭과 키보드가 같은 `selectArea`로 수렴하고 키보드 경로는 덮여 있다 |
| Task 10 minor: `translate` 중복 | SHIP | Minor #3. 한 줄 교체지만 머지를 막을 사안은 아님 |
| Task 12 note: `BusinessAreaCarousel` 참조 0건이 오류 | SHIP | Minor #8. 삭제 판단 자체는 옳고 빌드/테스트가 증명 |
| Task 4 note/ruling: `Co-Authored-By` 편차 | SHIP | Minor #9. 브리프가 범위 밖으로 명시 |
| Ruling T8: 하이라이트 지연 체감 시 되돌린다 | SHIP | 원장에 수동 확인 기록됨. 단 Minor #4대로 자동 테스트가 이 조건을 대신하지 못한다는 점을 알고 유지 |

머지 전 필수(FIX BEFORE MERGE)로 올릴 deferred 항목은 없다.

## Verification Run

워크트리 루트에서 실행.

```
$ npm run typecheck
> tsc --noEmit
(출력 없음, exit 0)

$ npm run lint
✖ 20 problems (0 errors, 20 warnings)     [기준선 23 경고 → 20. 새 경고 0건]

$ npm test
Test Files  59 passed (59)
     Tests  198 passed (198)
  Duration  26.63s
                                          [기준선 53파일 170테스트 → 59파일 198테스트]

$ npm run build
(성공. useLayoutEffect 관련 경고 출력 없음)

$ node <scratchpad>/size.js
SHARED(_app): 331.9kB raw / 103.7kB gz across 5 files
route       | own(raw) | own(gz) | firstLoad(raw) | firstLoad(gz)
/           | 197.2kB  | 68.4kB  | 499.1kB        | 160.8kB
/education  | 107.0kB  | 38.6kB  | 408.9kB        | 131.0kB
/news       |  93.2kB  | 33.2kB  | 395.1kB        | 125.5kB
/404        |  72.8kB  | 26.2kB  | 374.7kB        | 118.6kB

$ git checkout -- next-env.d.ts && git status --short
(출력 없음 — 클린)
```

원장 대조:

- `/education` 501.7kB → 408.8kB 주장 vs 실측 **408.9kB**. 반올림 차 0.1kB, 일치.
- `/404` 467.5kB → 실측 **374.7kB** (-92.8kB). 계획의 "-98.0kB" 추정보다 5kB 적지만 같은 자릿수이고 전 공개 라우트에 균일하게 적용됐다.

`/education` 청크 마커 스캔 (build-manifest의 `/education` + `/_app` 청크 8개):

```
1lfezafpf8edy  base-ui=0  tailwind-merge=0  cva=0
1jgx1vlrimgrz  base-ui=0  tailwind-merge=0  cva=0
3_icqmoqgxkms  base-ui=0  tailwind-merge=0  cva=0
0v5g9uk2pov0j  base-ui=0  tailwind-merge=0  cva=0
3ntdk8s_9jj_d  base-ui=0  tailwind-merge=0  cva=0
2khpibdbbpe8h  base-ui=0  tailwind-merge=0  cva=0
1xv108r4f8yn8  base-ui=0  tailwind-merge=0  cva=0
33re-5jxk8bqj  base-ui=0  tailwind-merge=0  cva=0
```

Task 11 독립 검증 (e2526d9의 구현을 추출해 동일 입력 재생):

```
old === expected : true
new === expected : true
old === new      : true
```

## Recommendations

1. Important #1을 머지 전에 처리한다. `finalFocus={triggerRef}`로 되돌리면 코드가 줄면서 계약이 라이브러리로 돌아간다. 그 선택을 하지 않겠다면 최소한 열기 → 닫기 → `document.activeElement` 테스트 한 건은 넣을 것.
2. Minor #2, #3은 각각 한 줄이다. 같은 커밋에 묶어 처리하면 비용이 0에 가깝다.
3. 보류 B1(폰트 2MB)이 지금 가장 큰 남은 덩어리다. 이 브랜치가 공개 라우트에서 93kB를 걷어냈으므로 다음 사이클에서는 폰트 서브셋이 체감 이득이 제일 큰 후보다.
4. `src/hooks/useUnsavedChanges.ts:15`의 `react-hooks/refs` 경고는 Task 9가 `DesktopNavigation`에서 푼 것과 정확히 같은 패턴이다. 같은 `useLayoutEffect` 치환으로 정리할 수 있는 후속 과제.

## Assessment

**Ready to merge?** With fixes

**Reasoning:** 13개 과제의 산출물이 모두 존재하고, 번들 감축과 대시보드 무동작변경이라는 두 핵심 주장을 실측으로 재현했다 — 특히 Task 11 스냅샷은 리팩터 전 구현을 직접 돌려 byte-identical임을 확인했고, 계획 결함 2건(트리거 SSR, 렌더 중 ref 쓰기)은 구현 단계에서 정확히 교정됐다. 막는 결함은 하나뿐이다: 모바일 메뉴를 닫을 때의 트리거 포커스 복귀가 Base UI의 공개 API 대신 수작업 호출로 대체되면서 라이브러리 내부 구현(`aria-hidden` vs `inert`)에 의존하게 됐고 테스트가 0건이다. `finalFocus={triggerRef}` 한 줄 또는 테스트 한 건이면 해소되며, 나머지 8건은 모두 Minor다.
