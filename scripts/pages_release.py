"""Seal the built Pages tree and verify the exact release after deployment."""
import argparse
import base64
import hashlib
import json
import re
import subprocess
import time
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ORIGIN = "https://fbratten.github.io/"
RECEIPT = "pages-release.json"


class InlineScripts(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.inline = False
        self.hashes = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script":
            self.inline = "src" not in attrs and attrs.get("type", "") in {
                "", "module", "text/javascript", "application/javascript", "importmap"
            }

    def handle_endtag(self, tag):
        if tag == "script":
            self.inline = False

    def handle_data(self, data):
        if self.inline:
            digest = hashlib.sha256(data.encode()).digest()
            self.hashes.add("'sha256-" + base64.b64encode(digest).decode() + "'")


def add_policy(page):
    html = page.read_text(encoding="utf-8")
    scripts = InlineScripts()
    scripts.feed(html)
    policy = "; ".join([
        "default-src 'none'",
        "script-src " + " ".join(["'self'", *sorted(scripts.hashes)]),
        "script-src-attr 'none'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://adaptivearts.ai https://rqparchqgvrfvbumvccl.supabase.co",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'", "base-uri 'none'", "form-action 'none'",
    ])
    meta = '<meta http-equiv="Content-Security-Policy" content="' + escape(policy, quote=True) + '">'
    result, count = re.subn(r'(<head(?:\s[^>]*)?>)', lambda m: m[0] + '\n' + meta,
                            html, count=1, flags=re.I)
    if count != 1:
        raise ValueError(f"Missing head in {page}")
    page.write_text(result, encoding="utf-8")


def git(*args):
    return subprocess.check_output(["git", *args]).decode().splitlines()


def seal(output, sha):
    if git("rev-parse", "HEAD") != [sha]:
        raise ValueError("Checkout does not match the release SHA")
    tracked = git("ls-files")
    for name in tracked:
        if name.endswith(".html"):
            add_policy(output / name)
    changed = git("diff", "--name-only", "--diff-filter=AM", "HEAD^1", "HEAD")
    probes = ["index.html"]
    for name in changed:
        if Path(name).suffix in {".html", ".js", ".css", ".json"} and (output / name).is_file():
            if name not in probes:
                probes.append(name)
    receipt = {"commit": sha, "files": {
        name: hashlib.sha256((output / name).read_bytes()).hexdigest() for name in probes
    }}
    serialized = json.dumps(receipt, separators=(",", ":"))
    (output / RECEIPT).write_text(serialized + "\n", encoding="utf-8")
    return serialized


def fetch(path, sha):
    url = ORIGIN + quote(path) + "?release=" + sha
    with urlopen(Request(url, headers={"Cache-Control": "no-cache"}), timeout=15) as response:
        return response.read()


def verify(serialized):
    expected = json.loads(serialized)
    sha = expected["commit"]
    deadline = time.monotonic() + 600
    while True:
        try:
            if json.loads(fetch(RECEIPT, sha)) != expected:
                raise ValueError("Published receipt differs from the tested build")
            for name, digest in expected["files"].items():
                if hashlib.sha256(fetch(name, sha)).hexdigest() != digest:
                    raise ValueError(f"Published bytes differ for {name}")
            print(f"Verified {sha} and {len(expected['files'])} published resources.")
            return
        except (OSError, ValueError) as error:
            if time.monotonic() >= deadline:
                raise
            print(f"Waiting for release propagation: {error}", flush=True)
            time.sleep(10)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    cmd = parser.add_subparsers(dest="command", required=True)
    build = cmd.add_parser("seal")
    build.add_argument("output", type=Path)
    build.add_argument("sha")
    cmd.add_parser("verify").add_argument("receipt")
    args = parser.parse_args()
    if args.command == "seal":
        print(seal(args.output, args.sha))
    else:
        verify(args.receipt)
