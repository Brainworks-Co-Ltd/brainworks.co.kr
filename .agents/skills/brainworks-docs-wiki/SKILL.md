---
name: brainworks-docs-wiki
description: BrainWorks 저장소의 docs Markdown을 LLM Wiki로 수집·질의·검사하고 Graphify 지도를 안전하게 갱신합니다. BrainWorks 문서 지식, Wiki ingest/query/lint/map 요청에 사용하며 코드나 다른 프로젝트 분석에는 사용하지 않습니다.
---

# BrainWorks Docs Wiki

`docs/**/*.md`를 유일한 지식 원본으로 다룹니다. 코드, 이미지, PPT, HTML, JSON, 저장소 밖 파일, `graphify-out`을 입력 문서로 읽지 않습니다.

## 작업 선택

- `ingest`: 새 자료 하나를 기존 Wiki에 반영합니다. [운영 절차](references/operations.md)의 ingest를 읽습니다.
- `query`: 문서를 바꾸지 않고 질문에 답합니다. [운영 절차](references/operations.md)의 query를 읽습니다.
- `lint`: 문서를 바꾸지 않고 스키마와 링크를 검사합니다. [스키마](references/schema.md)와 [운영 절차](references/operations.md)의 lint를 읽습니다.
- `map`: 별도 승인을 받아 Graphify 지도를 갱신합니다. 공식 `graphify` 스킬과 [운영 절차](references/operations.md)의 map을 모두 읽습니다.

## 필수 계약

1. 쓰기 전에 대상 파일, 근거, 예상 변경, 통합 diff를 제시하고 작업별 사전 승인을 받습니다.
2. 새 자료는 한 번에 하나씩 처리하고 사실·결정·제안·미해결 항목을 구분합니다.
3. 근거 없는 사실이나 관계를 만들지 않습니다. 충돌은 양쪽 근거와 상태를 함께 보존합니다.
4. 일반 `git diff`가 비어 있어도 변경 없음으로 단정하지 않습니다. 무시 파일은 `git check-ignore`와 `git diff --no-index`로 확인합니다.
5. map 입력은 `docs/**/*.md`뿐입니다. `graphify_markdown.py`가 내부에서 `detect(Path("docs"), gitignore=False)`를 강제하고 실제 Markdown 집합과 대조해야 합니다.
6. 임시 위치의 새 지도가 검증되기 전에는 기존 `graphify-out`을 교체하지 않습니다. 생성 실패 시 기존 지도를 보존합니다.
7. Graphify의 `--wiki`, Obsidian export, 저장소 전체 탐색, 요청하지 않은 HTML 시각화를 실행하지 않습니다.

Graphify 기본 설정이나 범위 확대를 요청받으면 `docs/**/*.md` 전용 범위, `gitignore=False`, 임시 위치 생성, 검증 전 기존 지도 보존을 응답에서 명시합니다.

승인 범위가 불분명하면 쓰지 말고 질문합니다. query와 lint는 항상 읽기 전용입니다.
