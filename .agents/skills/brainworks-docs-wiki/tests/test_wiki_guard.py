from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path


SCRIPTS_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

import wiki_guard


VALID_HEADER = """---
wiki_type: guide
status: review
updated: 2026-08-23
sources:
  - source.md
---
"""


class WikiGuardTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp_dir.name)
        self.docs = self.repo / "docs"
        self.docs.mkdir()

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def write(self, relative_path: str, content: str = VALID_HEADER) -> Path:
        path = self.repo / relative_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def test_collects_every_markdown_below_docs_only(self) -> None:
        first = self.write("docs/first.md")
        second = self.write("docs/ignored/nested.md")
        self.write("outside.md")
        self.write("docs/note.txt", "not markdown")

        self.assertEqual(
            wiki_guard.collect_markdown(self.repo),
            [first.resolve(), second.resolve()],
        )

    def test_parse_front_matter_returns_metadata_and_body(self) -> None:
        path = self.write("docs/page.md", VALID_HEADER + "\n# 제목\n")

        metadata, body = wiki_guard.parse_front_matter(path)

        self.assertEqual(metadata["wiki_type"], "guide")
        self.assertEqual(metadata["sources"], ["source.md"])
        self.assertEqual(body, "\n# 제목\n")

    def test_missing_required_front_matter_keys_are_reported(self) -> None:
        path = self.write("docs/page.md", "---\nwiki_type: guide\n---\n본문\n")

        errors = wiki_guard.validate_document(path, self.docs)

        self.assertTrue(any("status" in error for error in errors))
        self.assertTrue(any("updated" in error for error in errors))
        self.assertTrue(any("sources" in error for error in errors))

    def test_sources_must_be_a_list(self) -> None:
        path = self.write(
            "docs/page.md",
            "---\nwiki_type: guide\nstatus: review\nupdated: 2026-08-23\n"
            "sources: source.md\n---\n본문\n",
        )

        errors = wiki_guard.validate_document(path, self.docs)

        self.assertTrue(any("sources" in error and "목록" in error for error in errors))

    def test_missing_relative_markdown_link_is_reported(self) -> None:
        path = self.write("docs/page.md", VALID_HEADER + "\n[없는 문서](missing.md)\n")

        errors = wiki_guard.validate_document(path, self.docs)

        self.assertTrue(any("missing.md" in error for error in errors))

    def test_existing_relative_markdown_link_is_allowed(self) -> None:
        self.write("docs/target.md")
        path = self.write("docs/page.md", VALID_HEADER + "\n[대상](target.md)\n")

        errors = wiki_guard.validate_document(path, self.docs)

        self.assertFalse(any("target.md" in error for error in errors))

    def test_index_reports_documents_without_links(self) -> None:
        index = self.write("docs/index.md", VALID_HEADER + "\n[첫 문서](first.md)\n")
        first = self.write("docs/first.md")
        second = self.write("docs/nested/second.md")

        errors = wiki_guard.validate_index([index, first, second], index)

        self.assertEqual(len(errors), 1)
        self.assertIn("nested/second.md", errors[0])

    def test_replacement_character_is_reported(self) -> None:
        path = self.write("docs/page.md", VALID_HEADER + "\n손상: \ufffd\n")

        errors = wiki_guard.validate_document(path, self.docs)

        self.assertTrue(any("U+FFFD" in error for error in errors))

    def test_invalid_utf8_is_reported(self) -> None:
        path = self.docs / "broken.md"
        path.write_bytes(b"---\n\xff\n---\n")

        errors = wiki_guard.validate_document(path, self.docs)

        self.assertTrue(any("UTF-8" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
