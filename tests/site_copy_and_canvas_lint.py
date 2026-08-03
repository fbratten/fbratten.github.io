from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
METHODS = ROOT / "methods"

FORBIDDEN_DASHES = {
    "\u2011": "non-breaking hyphen",
    "\u2012": "figure dash",
    "\u2013": "en dash",
    "\u2014": "em dash",
    "\u2015": "horizontal bar",
    "\u2212": "typographic minus",
    "&mdash;": "HTML em dash",
    "&ndash;": "HTML en dash",
    "&#8212;": "numeric em dash",
    "&#8211;": "numeric en dash",
    "&#x2014;": "hex em dash",
    "&#x2013;": "hex en dash",
}

PUBLIC_TEXT_SUFFIXES = {".html", ".md", ".js"}
LEGACY_JS = [
    METHODS / "5pp" / "profile.js",
    METHODS / "dialogue-lifecycle" / "profile.js",
    METHODS / "orbit" / "profile.js",
    METHODS / "aics" / "graph-engine.js",
    METHODS / "dialectic" / "graph-engine.js",
    METHODS / "rigvedan" / "graph-engine.js",
    METHODS / "hermeneutic-didactic" / "graph-engine.js",
]


def public_files() -> list[Path]:
    files = [ROOT / "index.html", ROOT / "README.md"]
    files.extend(
        path
        for path in METHODS.rglob("*")
        if path.is_file() and path.suffix.lower() in PUBLIC_TEXT_SUFFIXES
    )
    return sorted(set(files))


def check_copy() -> list[str]:
    failures: list[str] = []
    for path in public_files():
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT)
        if re.search(r"\bscientific\b", text, flags=re.IGNORECASE):
            failures.append(f"{rel}: contains the removed word 'scientific'")
        for token, label in FORBIDDEN_DASHES.items():
            if token in text:
                failures.append(f"{rel}: contains {label} ({token!r})")
    return failures


def check_legacy_canvas_guards() -> list[str]:
    failures: list[str] = []
    for path in LEGACY_JS:
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(ROOT)
        draw_functions = len(re.findall(r"function draw\(ctxArg,", text))
        guarded = len(re.findall(r"Number\.isFinite\([^)]*\)\?[^:]+:(?:bounds\.(?:width|height)|size\.(?:w|h))", text))
        if draw_functions == 0:
            failures.append(f"{rel}: expected at least one legacy draw(ctxArg, ...) function")
            continue
        if guarded < draw_functions * 2:
            failures.append(
                f"{rel}: {draw_functions} draw functions require width and height fallbacks, found {guarded} guards"
            )
    return failures


def check_homepage() -> list[str]:
    text = (ROOT / "index.html").read_text(encoding="utf-8")
    failures: list[str] = []
    required = [
        "Recruiter proof packages",
        "Methods, protocols and prompt systems",
        "./methods/",
        "./intelligence-engine-showcase/",
        "./mads/",
        "./adaptivearts-ai/",
        "./gate-monitor/",
    ]
    for value in required:
        if value not in text:
            failures.append(f"index.html: missing required landing content {value!r}")
    forbidden = ["readme-typing-svg", "Prompt Engineering Aficionado"]
    for value in forbidden:
        if value in text:
            failures.append(f"index.html: obsolete animated positioning remains: {value!r}")
    return failures


def main() -> None:
    failures = check_copy() + check_legacy_canvas_guards() + check_homepage()
    if failures:
        print("Site regression lint failed:")
        for failure in failures:
            print(f"- {failure}")
        raise SystemExit(1)
    print("Site regression lint passed.")


if __name__ == "__main__":
    main()
