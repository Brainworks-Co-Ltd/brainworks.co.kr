from __future__ import annotations

import argparse
import copy
import hashlib
import json
import tempfile
from pathlib import Path

from graphify.detect import (
    CORPUS_UPPER_THRESHOLD,
    CORPUS_WARN_THRESHOLD,
    FILE_COUNT_UPPER,
    count_words,
    detect,
)


def _all_detected_paths(raw: dict[str, object]) -> list[Path]:
    raw_files = raw.get("files")
    if not isinstance(raw_files, dict):
        raise ValueError("Graphify 탐지 결과에 files 객체가 없습니다.")

    paths: list[Path] = []
    for values in raw_files.values():
        if not isinstance(values, list):
            raise ValueError("Graphify files 범주의 값은 목록이어야 합니다.")
        paths.extend(Path(str(value)).resolve() for value in values)
    return paths


def filter_markdown_detection(
    raw: dict[str, object], docs_root: Path
) -> dict[str, object]:
    docs_root = docs_root.resolve()
    actual = sorted(
        (path.resolve() for path in docs_root.rglob("*.md") if path.is_file()),
        key=lambda path: path.as_posix().casefold(),
    )
    detected_markdown = sorted(
        {
            path
            for path in _all_detected_paths(raw)
            if path.suffix.lower() == ".md" and path.is_relative_to(docs_root)
        },
        key=lambda path: path.as_posix().casefold(),
    )

    actual_set = set(actual)
    detected_set = set(detected_markdown)
    missing = sorted(actual_set - detected_set, key=lambda path: path.as_posix().casefold())
    extra = sorted(detected_set - actual_set, key=lambda path: path.as_posix().casefold())
    if missing or extra:
        details: list[str] = []
        if missing:
            details.append("누락=" + ", ".join(path.as_posix() for path in missing))
        if extra:
            details.append("초과=" + ", ".join(path.as_posix() for path in extra))
        raise ValueError("Markdown 탐지 집합이 실제 docs와 다릅니다: " + "; ".join(details))

    result = copy.deepcopy(raw)
    raw_files = result.get("files")
    assert isinstance(raw_files, dict)
    categories = set(raw_files) | {"code", "document", "paper", "image", "video"}
    result["files"] = {category: [] for category in sorted(categories)}
    result["files"]["document"] = [str(path) for path in actual]

    total_files = len(actual)
    total_words = sum(count_words(path) for path in actual)
    needs_graph = total_words >= CORPUS_WARN_THRESHOLD
    warning: str | None = None
    if not needs_graph:
        warning = (
            f"Corpus is ~{total_words:,} words - fits in a single context window. "
            "You may not need a graph."
        )
    elif total_words >= CORPUS_UPPER_THRESHOLD or total_files >= FILE_COUNT_UPPER:
        warning = (
            f"Large corpus: {total_files} files · ~{total_words:,} words. "
            "Semantic extraction will be expensive."
        )

    result["total_files"] = total_files
    result["total_words"] = total_words
    result["needs_graph"] = needs_graph
    result["warning"] = warning
    result["scan_root"] = str(docs_root)
    return result


def build_markdown_detection(docs_root: Path) -> dict[str, object]:
    docs_root = docs_root.resolve()
    if not docs_root.is_dir():
        raise ValueError(f"docs 디렉터리가 없습니다: {docs_root}")
    cache_key = hashlib.sha256(str(docs_root).encode("utf-8")).hexdigest()[:12]
    cache_root = Path(tempfile.gettempdir()) / "brainworks-graphify-cache" / cache_key
    raw = detect(docs_root, gitignore=False, cache_root=cache_root)
    return filter_markdown_detection(raw, docs_root)


def write_detection(repo_root: Path, output_path: Path) -> None:
    repo_root = repo_root.resolve()
    result = build_markdown_detection(repo_root / "docs")
    output_path = output_path.resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(result, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Graphify용 Markdown 전용 탐지 sidecar 생성")
    parser.add_argument("--repo", type=Path, default=Path("."))
    parser.add_argument("--output", type=Path, required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    write_detection(args.repo, args.output)
    data = json.loads(args.output.resolve().read_text(encoding="utf-8"))
    print(
        f"탐지 완료: Markdown {data['total_files']}개 · 약 {data['total_words']:,}단어"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
