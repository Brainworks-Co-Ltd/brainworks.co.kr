# BrainWorks Docs Wiki 스키마

## YAML 머리말

모든 `docs/**/*.md` 문서는 다음 네 키를 사용합니다.

```yaml
---
wiki_type: guide
status: review
updated: 2026-08-23
sources:
  - relative-source.md
---
```

- `wiki_type`: 문서 역할을 나타내는 짧은 소문자 값입니다. 예: `guide`, `index`, `glossary`, `analysis`, `design`, `plan`, `log`, `evidence`.
- `status`: `draft`, `review`, `approved`, `deprecated` 중 하나입니다. 승인 근거가 없으면 `review`를 사용합니다.
- `updated`: 실제 내용이 바뀐 날짜를 `YYYY-MM-DD`로 기록합니다.
- `sources`: 실제 근거 목록입니다. 근거가 없으면 `sources: []`를 사용하며 추측으로 채우지 않습니다.

## 본문 지식 상태

필요한 경우 다음 성격을 제목이나 문장으로 명확히 구분합니다.

- 사실: 출처에서 직접 확인한 현재 상태
- 결정: 승인 또는 확정 근거가 있는 선택
- 제안: 아직 검토 중인 방향
- 미해결 항목: 추가 확인이나 결정이 필요한 사항

기존 문서가 이 구조를 사용하지 않는다면 의미를 바꾸는 대규모 재편집을 하지 말고, 혼동되는 부분만 최소한으로 표시합니다.

## 관계와 충돌

- 관계는 존재하는 `docs` 상대 Markdown 링크로 표현합니다.
- 링크를 추가하기 전에 양쪽 문서의 내용을 읽고 실제 관계를 확인합니다.
- 새 근거가 기존 주장과 충돌하면 어느 한쪽을 자동 삭제하거나 최신 사실로 단정하지 않습니다.
- 양쪽 주장, 각각의 출처, 현재 검토 상태를 함께 남기고 사용자 결정을 요청합니다.
- Graphify의 `INFERRED` 관계를 문서의 확정 사실로 되쓰지 않습니다.

## 진입점과 연대기

- `docs/index.md`: 모든 Markdown으로 이동할 수 있는 주제별 진입점입니다.
- `docs/log.md`: 날짜, 변경 대상, 근거, 상태를 시간순으로 기록합니다.
- ingest 변경에는 대상 문서와 함께 index 및 log 변경안을 검토합니다.
