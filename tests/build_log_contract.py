from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BUILD_LOG = ROOT / "build-log"
MANIFEST = BUILD_LOG / "entries.json"
PAGE = BUILD_LOG / "index.html"

ALLOWED_STATES = {"SHIPPED", "PUBLISHED", "VERIFIED"}
REQUIRED_TEXT_FIELDS = {"date", "state", "title", "summary", "why_it_matters"}
PRIVATE_PATH_MARKERS = ("/mnt/", "d:/", "c:/", "\\users\\", "\\temp\\myprojects", "file_000")


def fail(message: str) -> None:
    raise AssertionError(message)


def check_manifest() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        fail("build-log/entries.json must be a JSON array")

    for index, item in enumerate(data):
        if not isinstance(item, dict):
            fail(f"entry {index}: must be an object")

        missing = REQUIRED_TEXT_FIELDS - item.keys()
        if missing:
            fail(f"entry {index}: missing required fields {sorted(missing)}")

        for field in REQUIRED_TEXT_FIELDS:
            value = item[field]
            if not isinstance(value, str) or not value.strip():
                fail(f"entry {index}: {field} must be a non-empty string")

        try:
            date.fromisoformat(item["date"])
        except ValueError as exc:
            fail(f"entry {index}: date must be YYYY-MM-DD: {exc}")

        if item["state"] not in ALLOWED_STATES:
            fail(f"entry {index}: public manifest state {item['state']!r} is not allowed")

        evidence = item.get("evidence")
        if not isinstance(evidence, list) or not evidence:
            fail(f"entry {index}: at least one public evidence link is required")
        for ref_index, ref in enumerate(evidence):
            if not isinstance(ref, dict):
                fail(f"entry {index} evidence {ref_index}: must be an object")
            label = ref.get("label")
            url = ref.get("url")
            if not isinstance(label, str) or not label.strip():
                fail(f"entry {index} evidence {ref_index}: label is required")
            if not isinstance(url, str) or not url.strip():
                fail(f"entry {index} evidence {ref_index}: url is required")
            parsed = urlparse(url)
            if parsed.scheme != "https" or not parsed.netloc:
                fail(f"entry {index} evidence {ref_index}: evidence URL must be public HTTPS")

        tags = item.get("tags", [])
        if not isinstance(tags, list) or any(not isinstance(tag, str) or not tag.strip() for tag in tags):
            fail(f"entry {index}: tags must be a list of non-empty strings")

        public_text = json.dumps(item, ensure_ascii=False).lower()
        for marker in PRIVATE_PATH_MARKERS:
            if marker in public_text:
                fail(f"entry {index}: contains private/local path marker {marker!r}")


def check_page_boundary() -> None:
    text = PAGE.read_text(encoding="utf-8")
    required = [
        "Public proof of work",
        "What shipped, and why it matters.",
        "recorded work != public work",
        "./entries.json",
        "Why it matters:",
        "textContent",
        "createTextNode",
    ]
    for value in required:
        if value not in text:
            fail(f"build-log/index.html: missing required boundary/rendering token {value!r}")

    if ".innerHTML" in text or "innerHTML =" in text:
        fail("build-log/index.html: manifest content must not be rendered with innerHTML")


def main() -> None:
    check_manifest()
    check_page_boundary()
    print("Build Log contract passed.")


if __name__ == "__main__":
    main()
