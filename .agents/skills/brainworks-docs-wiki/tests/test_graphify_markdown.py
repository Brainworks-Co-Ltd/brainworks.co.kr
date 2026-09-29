from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPTS_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

import graphify_markdown


class GraphifyMarkdownTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp_dir.name)
        self.docs = self.repo / "docs"
        self.docs.mkdir()
        self.first = self.docs / "first.md"
        self.second = self.docs / "nested" / "second.md"
        self.second.parent.mkdir()
        self.first.write_text("첫 문서", encoding="utf-8")
        self.second.write_text("두 번째 문서", encoding="utf-8")

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def raw_detection(self) -> dict[str, object]:
        txt = self.docs / "note.txt"
        html = self.docs / "view.html"
        png = self.docs / "image.png"
        data = self.docs / "data.json"
        for path in (txt, html, png, data):
            path.write_text("보조 파일", encoding="utf-8")
        return {
            "files": {
                "code": [str(data.resolve())],
                "document": [str(self.first.resolve()), str(txt.resolve()), str(html.resolve())],
                "paper": [],
                "image": [str(png.resolve())],
                "video": [],
            },
            "total_files": 5,
            "total_words": 999,
            "needs_graph": False,
            "warning": None,
            "scan_root": str(self.docs.resolve()),
        }

    def test_filters_non_markdown_and_recomputes_counts(self) -> None:
        raw = self.raw_detection()
        raw["files"]["document"].append(str(self.second.resolve()))

        with patch.object(graphify_markdown, "count_words", side_effect=[2, 3]):
            result = graphify_markdown.filter_markdown_detection(raw, self.docs)

        self.assertEqual(result["files"]["document"], [
            str(self.first.resolve()),
            str(self.second.resolve()),
        ])
        self.assertTrue(all(not values for key, values in result["files"].items() if key != "document"))
        self.assertEqual(result["total_files"], 2)
        self.assertEqual(result["total_words"], 5)

    def test_fails_when_graphify_misses_a_markdown_file(self) -> None:
        raw = self.raw_detection()

        with self.assertRaisesRegex(ValueError, "누락"):
            graphify_markdown.filter_markdown_detection(raw, self.docs)

    def test_build_forces_gitignore_false(self) -> None:
        raw = self.raw_detection()
        raw["files"]["document"].append(str(self.second.resolve()))

        with (
            patch.object(graphify_markdown, "detect", return_value=raw) as detect_mock,
            patch.object(graphify_markdown, "count_words", return_value=1),
        ):
            result = graphify_markdown.build_markdown_detection(self.docs)

        self.assertEqual(detect_mock.call_args.args, (self.docs.resolve(),))
        self.assertIs(detect_mock.call_args.kwargs["gitignore"], False)
        self.assertEqual(result["total_files"], 2)

    def test_build_redirects_graphify_cache_outside_docs(self) -> None:
        raw = self.raw_detection()
        raw["files"]["document"].append(str(self.second.resolve()))

        with (
            patch.object(graphify_markdown, "detect", return_value=raw) as detect_mock,
            patch.object(graphify_markdown, "count_words", return_value=1),
        ):
            graphify_markdown.build_markdown_detection(self.docs)

        cache_root = Path(detect_mock.call_args.kwargs["cache_root"])
        self.assertFalse(cache_root.resolve().is_relative_to(self.docs.resolve()))

    def test_write_detection_outputs_utf8_json_with_absolute_docs_paths(self) -> None:
        raw = self.raw_detection()
        raw["files"]["document"].append(str(self.second.resolve()))
        output = self.repo / "result.json"

        with (
            patch.object(graphify_markdown, "detect", return_value=raw),
            patch.object(graphify_markdown, "count_words", return_value=1),
        ):
            graphify_markdown.write_detection(self.repo, output)

        result = json.loads(output.read_text(encoding="utf-8"))
        paths = [Path(path) for values in result["files"].values() for path in values]
        self.assertTrue(paths)
        self.assertTrue(all(path.is_absolute() for path in paths))
        self.assertTrue(all(path.is_relative_to(self.docs.resolve()) for path in paths))


if __name__ == "__main__":
    unittest.main()
