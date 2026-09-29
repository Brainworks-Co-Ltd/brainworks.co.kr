# BrainWorks Docs Wiki 운영 절차

명령은 저장소 루트 `C:\브레인웍스\brainworks.co.kr`에서 실행합니다. Python 출력에는 UTF-8을 사용합니다.

## ingest

1. 사용자가 지정한 자료 하나와 연결 대상 문서만 읽습니다.
2. 자료에서 직접 확인한 사실, 결정, 제안, 미해결 항목과 출처를 분리합니다.
3. 대상 문서, `docs/index.md`, `docs/log.md`의 변경안을 만듭니다.
4. 추적 파일은 `git diff`로, 무시 파일은 임시 승인본과 `git diff --no-index`로 통합 diff를 만듭니다. `git status`가 비어도 `git check-ignore -v --no-index <경로>`로 확인합니다.
5. 사용자에게 대상 파일, 근거, 충돌, 예상 결과, 전체 diff를 제시하고 사전 승인을 기다립니다.
6. 승인된 내용만 적용한 뒤 lint를 실행합니다. 지도 갱신은 자동으로 이어가지 않고 별도 승인을 받습니다.

## query

파일을 수정하지 않습니다.

1. `graphify-out/graph.json`이 있으면 질의 로그를 끄고 다음처럼 실행합니다.

   ```powershell
   $env:GRAPHIFY_QUERY_LOG_DISABLE='1'
   python -m graphify query "질문" --graph graphify-out/graph.json
   ```

2. 지도가 없거나 답의 근거가 부족하면 `docs/index.md`에서 관련 문서만 찾아 읽습니다.
3. 답변에는 문서 경로 또는 Graphify의 `source_location`을 근거로 표시합니다.
4. `INFERRED` 관계는 추론이라고 밝히고 문서에 없는 사실로 단정하지 않습니다.

## lint

```powershell
$env:PYTHONUTF8='1'
$env:PYTHONIOENCODING='utf-8'
python .agents/skills/brainworks-docs-wiki/scripts/wiki_guard.py --repo . lint
```

오류를 파일과 원인별로 보고합니다. 자동 수정하지 않으며 수정안을 만들 때는 ingest 승인 절차를 따릅니다.

## map

map은 쓰기 작업이며 탐지, 생성, 교체를 각각 명확히 보고합니다.

1. lint가 통과했는지 확인합니다. 실패하면 지도를 만들지 않습니다.
2. 다음 어댑터로 Markdown 전용 탐지 sidecar를 만듭니다.

   ```powershell
   $detectOut = Join-Path $env:TEMP 'brainworks-graphify-detect.json'
   python .agents/skills/brainworks-docs-wiki/scripts/graphify_markdown.py --repo . --output $detectOut
   ```

   어댑터는 `from graphify.detect import detect`를 사용해 `detect(Path("docs"), gitignore=False, cache_root=Path(tempfile.gettempdir()) / "brainworks-graphify-cache" / 프로젝트해시)` 형태로 호출합니다. 명시적 `cache_root`로 Graphify 단어 수 캐시가 `docs/graphify-out`에 생기지 않게 합니다. 감지된 Markdown과 실제 `docs/**/*.md` 집합이 다르거나 비 Markdown 입력이 남으면 실패합니다. 원문 복사본과 `.graphifyignore`를 만들지 않습니다.

3. 입력 파일 수, 단어 수, 의미 추출 청크와 예상 비용을 보고하고 생성 승인을 기다립니다.
4. 저장소 밖의 새 임시 디렉터리에서 공식 `graphify` 스킬을 실행합니다. 공식 Step 2의 결과 대신 검증된 Markdown 전용 sidecar를 사용합니다. `--wiki`, Obsidian export, 요청하지 않은 HTML 시각화를 실행하지 않습니다.
5. 모든 청크 JSON, `graph.json`, `GRAPH_REPORT.md`, 노드 수, 관계 수, 모든 출처 경로가 `docs` 아래인지 검사합니다. 절반 이상의 청크가 실패하거나 범위 밖 출처가 있으면 중단합니다.
6. 검사 결과와 교체 diff를 보고하고 별도 교체 승인을 기다립니다.
7. 기존 `graphify-out`을 타임스탬프 백업으로 이동한 뒤 검증된 새 지도만 승격합니다. 승격 후 검증이 실패하면 새 지도를 실패 경로로 옮기고 백업을 복원합니다.
8. 성공해도 백업을 자동 삭제하지 않습니다.

## 금지 사항

- `git rm --cached`로 기존 문서 추적을 해제하지 않습니다.
- 저장소 전체, 코드, 이미지, PPT, HTML, JSON, TXT를 Graphify 입력에 넣지 않습니다.
- 빈 `git diff`만 보고 무시 파일 변경이 없다고 결론 내리지 않습니다.
- 생성 실패나 부분 결과로 기존 지도를 덮어쓰지 않습니다.
