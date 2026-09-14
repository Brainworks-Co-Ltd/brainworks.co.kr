# BrainWorks 에이전트 지침

## 기본 규칙

1. 모든 처리 과정과 응답은 UTF-8 한국어로 작성한다.
2. 사용자 응답에는 존댓말을 사용한다.
3. 요청 범위 밖 파일은 수정하지 않는다.
4. 원인을 확인하지 않은 추측성 수정과 임시 우회 코드를 금지한다.
5. 코드 작업 전 `docs`의 모든 Markdown 문서를 읽고 규칙을 준수한다.

## LLM Wiki 범위

- 유일한 원본은 `docs/**/*.md`이다.
- 코드, 이미지, PPT, HTML, JSON, `graphify-out`, 저장소 밖 파일을 Wiki 입력으로 사용하지 않는다.
- `docs/wiki`나 원문 복제 폴더를 만들지 않는다.
- 새 자료는 한 번에 하나씩 처리한다.

## 작업 전 지식 확인

1. 모든 프로젝트 작업을 시작하기 전에 `docs/index.md`에서 관련 LLM Wiki 문서를 찾고, 해당 문서의 결정·용어·미해결 항목을 확인한다.
2. `graphify-out/graph.json`과 `graphify-out/GRAPH_REPORT.md`가 최신이면 Graphify 질의·관계 정보를 사용해 함께 확인해야 할 문서와 영향 범위를 찾는다.
3. Graphify는 탐색을 돕는 파생 관계 지도이며 지식의 원본이 아니다. Graphify 결과와 `docs/**/*.md`가 충돌하면 LLM Wiki 문서와 그 출처를 기준으로 판단한다.
4. Graphify가 현재 `docs/**/*.md`보다 오래됐으면 이를 최신 근거처럼 사용하지 않는다. 구현이나 설계 변경 전에 `docs` 전용 지도 갱신 절차를 수행하거나, 갱신할 수 없으면 LLM Wiki만 근거로 사용하고 지도가 오래됐음을 명시한다.
5. 코드 작업에는 기본 규칙 5번을 추가로 적용해 `docs`의 모든 Markdown 문서를 숙지한다.

## 문서 스키마

- 문서는 `wiki_type`, `status`, `updated`, `sources` YAML 머리말을 사용한다.
- 사실, 결정, 제안, 미해결 항목을 구분한다.
- 근거 없는 사실과 관계를 만들지 않는다.
- 충돌은 덮어쓰지 말고 양쪽 근거와 상태를 기록한다.
- 문서 관계는 상대 Markdown 링크로 표현한다.
- `docs/index.md`는 주제별 진입점, `docs/log.md`는 시간순 변경 기록이다.

## 작업 계약

- 읽기 전용 작업은 `query`, `lint`다.
- 쓰기 작업은 `ingest`, `map`이며 작업별 사전 승인이 필요하다.
- 무시된 파일 변경도 승인 전에 통합 diff를 제시한다.
- Graphify는 반드시 `docs`만 읽고 `.gitignore`를 무시하도록 `gitignore=False`를 사용한다.
- Graphify의 Wiki 생성 기능은 사용하지 않는다.
- 지도 생성 실패 시 기존 `graphify-out`을 보존한다.

## 커밋 메시지 전략

- 커밋 실행 자체는 사용자 요청, 승인된 구현 계획 또는 작업 절차에 포함된 경우에만 수행한다.
- 메시지는 `<type>: <작업 내용>` 형식을 사용하고 한 커밋에는 하나의 목적만 담는다.
- 작업 내용은 `fix: 회원가입 시 닉네임 중복 오류 수정`처럼 명사형으로 작성하고 마침표를 붙이지 않는다.
- 커밋 하나만 읽어도 대상과 변경 결과를 알 수 있도록 구체적이고 직관적으로 작성한다.
- 상황에 맞지 않는 접두사를 사용하거나 서로 다른 목적을 한 커밋에 섞지 않는다.
- 장문형 메시지는 제목과 본문을 합쳐 내용이 있는 줄이 3줄 이상이어야 한다. 제목 다음에 빈 줄을 두고 본문에는 변경 이유·핵심 내용 또는 영향을 구체적으로 기록한다.

| 접두사 | 사용 상황 |
|---|---|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 추가·수정 |
| `style` | 코드 포맷·세미콜론 등 기능 변화가 없는 변경 |
| `refactor` | 기능 변화가 없는 코드 구조 개선 |
| `test` | 테스트 코드 추가·수정 |
| `chore` | 빌드·패키지 설정과 기타 유지보수 작업 |
| `perf` | 성능 개선 |
| `ci` | CI/CD 설정 변경 |
| `revert` | 이전 커밋 되돌리기 |

짧은 메시지 예시는 다음과 같다.

```text
fix: 회원가입 시 닉네임 중복 오류 수정
```

장문형 메시지 예시는 다음과 같다.

```text
feat: 공지사항 로케일별 게시 기능 추가

- 국문·영문 게시 상태 분리
- 미게시 로케일 상세 접근 차단
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
