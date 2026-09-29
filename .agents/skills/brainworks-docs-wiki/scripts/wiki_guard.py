from __future__ import annotations

import argparse
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import unquote


REQUIRED_KEYS = ("wiki_type", "status", "updated", "sources")
VALID_STATUSES = {"draft", "review", "approved", "deprecated"}
MARKDOWN_LINK = re.compile(r"\[[^\]]*\]\(([^)]+)\)")


def collect_markdown(repo_root: Path) -> list[Path]:
    docs_root = (repo_root.resolve() / "docs").resolve()
    if not docs_root.is_dir():
        return []

    files: list[Path] = []
    for path in docs_root.rglob("*.md"):
        if not path.is_file():
            continue
        resolved = path.resolve()
        if resolved.is_relative_to(docs_root):
            files.append(resolved)
    return sorted(files, key=lambda item: item.as_posix().casefold())


def _parse_scalar(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1]
    return value


def parse_front_matter(path: Path) -> tuple[dict[str, object], str]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        raise ValueError("1행: YAML 머리말 시작 구분자(---)가 없습니다.")

    closing = next(
        (index for index, line in enumerate(lines[1:], start=1) if line.strip() == "---"),
        None,
    )
    if closing is None:
        raise ValueError("YAML 머리말 종료 구분자(---)가 없습니다.")

    metadata: dict[str, object] = {}
    list_key: str | None = None
    for line_number, raw_line in enumerate(lines[1:closing], start=2):
        stripped = raw_line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if raw_line.startswith(("  - ", "- ")):
            if list_key is None:
                raise ValueError(f"{line_number}행: 소속 키가 없는 목록 항목입니다.")
            item = stripped[2:].strip()
            assert isinstance(metadata[list_key], list)
            metadata[list_key].append(_parse_scalar(item))
            continue
        if raw_line[:1].isspace():
            raise ValueError(f"{line_number}행: 지원하지 않는 YAML 들여쓰기입니다.")
        if ":" not in raw_line:
            raise ValueError(f"{line_number}행: '키: 값' 형식이 아닙니다.")

        key, raw_value = raw_line.split(":", 1)
        key = key.strip()
        value = raw_value.strip()
        if not key:
            raise ValueError(f"{line_number}행: 빈 키는 허용하지 않습니다.")
        if key in metadata:
            raise ValueError(f"{line_number}행: 중복 키 '{key}'입니다.")

        if not value:
            metadata[key] = []
            list_key = key
        elif value == "[]":
            metadata[key] = []
            list_key = None
        else:
            metadata[key] = _parse_scalar(value)
            list_key = None

    return metadata, "".join(lines[closing + 1 :])


def _format_error(path: Path, message: str) -> str:
    return f"{path.as_posix()}: {message}"


def validate_document(path: Path, docs_root: Path) -> list[str]:
    docs_root = docs_root.resolve()
    path = path.resolve()
    errors: list[str] = []

    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError as error:
        return [_format_error(path, f"UTF-8 디코딩 실패: {error}")]
    except OSError as error:
        return [_format_error(path, f"파일 읽기 실패: {error}")]

    if "\ufffd" in text:
        errors.append(_format_error(path, "유니코드 대체 문자 U+FFFD가 있습니다."))

    try:
        metadata, body = parse_front_matter(path)
    except (UnicodeDecodeError, OSError, ValueError) as error:
        errors.append(_format_error(path, str(error)))
        return errors

    for key in REQUIRED_KEYS:
        if key not in metadata:
            errors.append(_format_error(path, f"필수 머리말 키 '{key}'가 없습니다."))

    status = metadata.get("status")
    if status is not None and status not in VALID_STATUSES:
        errors.append(_format_error(path, f"허용되지 않은 status 값입니다: {status}"))

    updated = metadata.get("updated")
    if updated is not None:
        try:
            date.fromisoformat(str(updated))
        except ValueError:
            errors.append(_format_error(path, f"updated는 YYYY-MM-DD 형식이어야 합니다: {updated}"))

    sources = metadata.get("sources")
    if sources is not None and not isinstance(sources, list):
        errors.append(_format_error(path, "sources는 YAML 목록이어야 합니다."))

    for match in MARKDOWN_LINK.finditer(body):
        raw_target = match.group(1).strip().strip("<>")
        if not raw_target or raw_target.startswith("#"):
            continue
        if re.match(r"^[a-z][a-z0-9+.-]*://", raw_target, flags=re.IGNORECASE):
            continue
        target_without_fragment = unquote(raw_target.split("#", 1)[0].split("?", 1)[0])
        if not target_without_fragment.lower().endswith(".md"):
            continue
        target = (path.parent / target_without_fragment).resolve()
        line_number = body[: match.start()].count("\n") + 1
        if not target.is_relative_to(docs_root):
            errors.append(
                _format_error(path, f"본문 {line_number}행: docs 밖 Markdown 링크입니다: {raw_target}")
            )
        elif not target.is_file():
            errors.append(
                _format_error(path, f"본문 {line_number}행: 존재하지 않는 Markdown 링크입니다: {raw_target}")
            )

    return errors


def validate_index(files: list[Path], index_path: Path) -> list[str]:
    index_path = index_path.resolve()
    try:
        content = index_path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError) as error:
        return [_format_error(index_path, f"인덱스 읽기 실패: {error}")]

    linked: set[Path] = set()
    for match in MARKDOWN_LINK.finditer(content):
        raw_target = match.group(1).strip().strip("<>")
        if re.match(r"^[a-z][a-z0-9+.-]*://", raw_target, flags=re.IGNORECASE):
            continue
        target = unquote(raw_target.split("#", 1)[0].split("?", 1)[0])
        if target.lower().endswith(".md"):
            linked.add((index_path.parent / target).resolve())

    errors: list[str] = []
    for path in sorted((item.resolve() for item in files), key=lambda item: item.as_posix().casefold()):
        if path == index_path:
            continue
        if path not in linked:
            relative = path.relative_to(index_path.parent).as_posix()
            errors.append(_format_error(index_path, f"인덱스에 없는 문서입니다: {relative}"))
    return errors


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="BrainWorks docs Wiki 기계 검증기")
    parser.add_argument("command", choices=("inventory", "lint"))
    parser.add_argument("--repo", type=Path, default=Path("."))
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    repo_root = args.repo.resolve()
    docs_root = repo_root / "docs"
    files = collect_markdown(repo_root)

    if args.command == "inventory":
        for path in files:
            print(path.relative_to(repo_root).as_posix())
        return 0

    errors: list[str] = []
    for path in files:
        errors.extend(validate_document(path, docs_root))

    index_path = docs_root / "index.md"
    if index_path.is_file():
        errors.extend(validate_index(files, index_path))
    else:
        errors.append(_format_error(index_path, "필수 Wiki 진입점이 없습니다."))

    for error in errors:
        print(error)
    if errors:
        print(f"검증 실패: {len(errors)}개 오류", file=sys.stderr)
        return 1
    print(f"검증 통과: {len(files)}개 Markdown 문서")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
