from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

LEGACY_METHOD_DIRS = [
    ROOT / "methods" / "5pp",
    ROOT / "methods" / "dialogue-lifecycle",
    ROOT / "methods" / "orbit",
    ROOT / "methods" / "aics",
    ROOT / "methods" / "dialectic",
    ROOT / "methods" / "rigvedan",
    ROOT / "methods" / "hermeneutic-didactic",
]

TEXT_SUFFIXES = {".html", ".md", ".js"}

DASH_REPLACEMENTS = {
    "\u2011": "-",  # non-breaking hyphen
    "\u2012": "-",  # figure dash
    "\u2013": "-",  # en dash
    "\u2014": "-",  # em dash
    "\u2015": "-",  # horizontal bar
    "\u2212": "-",  # minus sign used typographically
    "&mdash;": "-",
    "&ndash;": "-",
    "&#8212;": "-",
    "&#8211;": "-",
    "&#x2014;": "-",
    "&#x2013;": "-",
    "&#X2014;": "-",
    "&#X2013;": "-",
}

SCIENTIFIC_REPLACEMENTS = {
    "Scientific and visual profiles": "Interactive and visual profiles",
    "scientific and visual profiles": "interactive and visual profiles",
    "Scientific profile": "Method profile",
    "scientific profile": "method profile",
    "Scientific framing": "Evaluation framing",
    "scientific framing": "evaluation framing",
    "Scientific interpretation": "Evaluation interpretation",
    "scientific interpretation": "evaluation interpretation",
    "Scientific hypotheses": "Evaluation hypotheses",
    "scientific hypotheses": "evaluation hypotheses",
    "Scientific analysis": "Evidence analysis",
    "scientific analysis": "evidence analysis",
}

# Legacy engines stored the supplied width and height directly. Event handlers later
# called draw() without arguments, replacing valid dimensions with undefined. The
# fallback below preserves the last measured Canvas dimensions for event-driven redraws.
COLON_BOUNDS = re.compile(
    r"function draw\(ctxArg,\s*(?P<w>[A-Za-z_$][\w$]*),\s*(?P<h>[A-Za-z_$][\w$]*)\)\s*\{\s*"
    r"bounds\s*=\s*\{\s*width\s*:\s*(?P=w)\s*,\s*height\s*:\s*(?P=h)\s*\}\s*;"
)

SHORTHAND_BOUNDS = re.compile(
    r"function draw\(ctxArg,\s*(?P<w>[A-Za-z_$][\w$]*),\s*(?P<h>[A-Za-z_$][\w$]*)\)\s*\{\s*"
    r"bounds\s*=\s*\{\s*(?P=w)\s*,\s*(?P=h)\s*\}\s*;"
)

COLON_SIZE = re.compile(
    r"function draw\(ctxArg,\s*(?P<w>[A-Za-z_$][\w$]*),\s*(?P<h>[A-Za-z_$][\w$]*)\)\s*\{\s*"
    r"size\s*=\s*\{\s*w\s*:\s*(?P=w)\s*,\s*h\s*:\s*(?P=h)\s*\}\s*;"
)

SHORTHAND_SIZE = re.compile(
    r"function draw\(ctxArg,\s*(?P<w>[A-Za-z_$][\w$]*),\s*(?P<h>[A-Za-z_$][\w$]*)\)\s*\{\s*"
    r"size\s*=\s*\{\s*(?P=w)\s*,\s*(?P=h)\s*\}\s*;"
)


def bounds_replacement(match: re.Match[str]) -> str:
    w = match.group("w")
    h = match.group("h")
    return (
        f"function draw(ctxArg,{w},{h}){{"
        f"{w}=Number.isFinite({w})?{w}:bounds.width;"
        f"{h}=Number.isFinite({h})?{h}:bounds.height;"
        f"if(!{w}||!{h})return;"
        f"bounds={{width:{w},height:{h}}};"
    )


def size_replacement(match: re.Match[str]) -> str:
    w = match.group("w")
    h = match.group("h")
    return (
        f"function draw(ctxArg,{w},{h}){{"
        f"{w}=Number.isFinite({w})?{w}:size.w;"
        f"{h}=Number.isFinite({h})?{h}:size.h;"
        f"if(!{w}||!{h})return;"
        f"size={{w:{w},h:{h}}};"
    )


def patch_legacy_interactions() -> tuple[int, dict[str, int]]:
    total = 0
    per_file: dict[str, int] = {}

    for directory in LEGACY_METHOD_DIRS:
        for path in sorted(directory.glob("*.js")):
            original = path.read_text(encoding="utf-8")
            updated = original
            count = 0
            for pattern, replacement in (
                (COLON_BOUNDS, bounds_replacement),
                (SHORTHAND_BOUNDS, bounds_replacement),
                (COLON_SIZE, size_replacement),
                (SHORTHAND_SIZE, size_replacement),
            ):
                updated, n = pattern.subn(replacement, updated)
                count += n

            if count:
                path.write_text(updated, encoding="utf-8")
                rel = str(path.relative_to(ROOT))
                per_file[rel] = count
                total += count

    if total < 7:
        raise SystemExit(
            f"Expected at least 7 legacy draw-function repairs, found {total}: {per_file}"
        )

    return total, per_file


def normalize_public_copy() -> tuple[int, int, list[str]]:
    scientific_count = 0
    dash_count = 0
    changed: list[str] = []

    candidates = [ROOT / "README.md", ROOT / "methods" / "index.html"]
    candidates.extend(
        p
        for p in (ROOT / "methods").rglob("*")
        if p.is_file() and p.suffix.lower() in TEXT_SUFFIXES
    )

    seen: set[Path] = set()
    for path in candidates:
        if path in seen or not path.exists():
            continue
        seen.add(path)
        original = path.read_text(encoding="utf-8")
        updated = original

        for old, new in SCIENTIFIC_REPLACEMENTS.items():
            occurrences = updated.count(old)
            if occurrences:
                scientific_count += occurrences
                updated = updated.replace(old, new)

        # Final guarantee: the requested word must not remain in method presentations.
        updated, upper_n = re.subn(r"\bScientific\b", "Evidence-based", updated)
        updated, lower_n = re.subn(r"\bscientific\b", "evidence-based", updated)
        scientific_count += upper_n + lower_n

        for old, new in DASH_REPLACEMENTS.items():
            occurrences = updated.count(old)
            if occurrences:
                dash_count += occurrences
                updated = updated.replace(old, new)

        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed.append(str(path.relative_to(ROOT)))

    residual_scientific = []
    residual_dash = []
    for path in seen:
        text = path.read_text(encoding="utf-8")
        if re.search(r"\bscientific\b", text, flags=re.IGNORECASE):
            residual_scientific.append(str(path.relative_to(ROOT)))
        if any(token in text for token in DASH_REPLACEMENTS):
            residual_dash.append(str(path.relative_to(ROOT)))

    if residual_scientific:
        raise SystemExit(f"Residual scientific wording: {residual_scientific}")
    if residual_dash:
        raise SystemExit(f"Residual typographic dash tokens: {residual_dash}")

    return scientific_count, dash_count, changed


def main() -> None:
    draw_count, draw_files = patch_legacy_interactions()
    scientific_count, dash_count, copy_files = normalize_public_copy()

    print(f"Legacy draw functions repaired: {draw_count}")
    for path, count in draw_files.items():
        print(f"  {path}: {count}")
    print(f"Scientific-word replacements: {scientific_count}")
    print(f"Dash replacements: {dash_count}")
    print(f"Copy files changed: {len(copy_files)}")
    for path in copy_files:
        print(f"  {path}")


if __name__ == "__main__":
    main()
