#!/usr/bin/env python3
"""Render shared navigation and public directories into ordinary static HTML.

Run after editing article/progress metadata or adding a page. --check detects stale
output without writing. No template runtime or JavaScript is needed to navigate.
"""
from pathlib import Path
from html import escape
import argparse
import json
import re
import xml.etree.ElementTree as ET
from email.utils import formatdate
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://fbratten.github.io"
NAV = [("Home", "/"), ("Projects", "/projects/"), ("Methods & Labs", "/methods/"),
       ("Writing", "/articles/"), ("Build log", "/build-log/"), ("About", "/#about")]
LABELS = {"/": "Home", "/projects/": "Projects", "/methods/": "Methods & Labs",
          "/labs/": "Labs", "/articles/": "Writing", "/build-log/": "Build log",
          "/blueprint-ai-studio/": "Blueprint AI Studio", "/all-pages/": "All pages",
          "/methods/solutions/": "Solution-space map",
          "/blueprint-ai-studio/labs/rules-authority-enforcement/": "Rules, authority & enforcement",
          "/404.html": "Page not found"}
METHOD_NAMES = {"5pp": "5PP", "aics": "AICS", "dial4": "DIAL-4", "dial4plus": "DIAL-4+",
                "dial4p-possibility": "DIAL-4P Possibility", "cbe": "CBE", "cbe-ix": "CBE-IX",
                "card-pointer": "CARD & POINTER", "csr": "CSR", "gdsa": "GDSA",
                "ipb": "IPB", "orbit": "ORBIT", "pisd": "PISD", "sorr": "SORR",
                "srcb": "SRCB", "dialectic": "DIALECTIC", "rigvedan": "RigVedan",
                "dialogue-lifecycle": "Dialogue Lifecycle", "capability-gap": "Capability-Gap",
                "hermeneutic-didactic": "Hermeneutic-didactic"}
LABELS.update({f"/methods/{slug}/": name for slug, name in METHOD_NAMES.items()})
LABELS.update({f"/{slug}/": name for slug, name in [
    ("mads", "MADS"), ("adaptivearts-ai", "Adaptivearts.ai evidence"),
    ("gate-monitor", "Gate Monitor"), ("vertex", "Vertex"),
    ("worktrace", "Worktrace"), ("broker-lane-sandbox", "Broker Lane Sandbox")]})


def replace_block(text, name, content):
    start, end = f"<!-- FB:{name} -->", f"<!-- /FB:{name} -->"
    return re.sub(re.escape(start) + r"[\s\S]*?" + re.escape(end),
                  lambda _: f"{start}\n{content}\n{end}", text)


def path_url(path):
    rel = path.relative_to(ROOT).as_posix()
    return "/" + rel.removesuffix("index.html")


def section_for(url):
    if url.startswith("/methods/") or url == "/labs/": return "/methods/"
    if url.startswith("/blueprint-ai-studio/labs/"): return "/methods/"
    if url in ("/blueprint-ai-studio/", "/mads/", "/adaptivearts-ai/", "/gate-monitor/", "/vertex/", "/worktrace/", "/broker-lane-sandbox/"):
        return "/projects/"
    return url


def navigation(url):
    links = []
    for label, href in NAV:
        current = ' aria-current="page"' if url == href else (' aria-current="true"' if section_for(url) == href else '')
        links.append(f'<a href="{href}"{current}>{escape(label)}</a>')
    return '''<a class="fb-skip" href="#main">Skip to content</a>
<div class="fb-header" role="banner"><div class="fb-header-inner">
<a class="fb-brand" href="/" aria-label="Fredrik Bratten - Home"><span class="fb-monogram" aria-hidden="true">FB</span>Fredrik Bratten</a>
<button class="fb-menu-button" type="button" aria-controls="fb-primary" aria-expanded="true" hidden>Menu</button>
<div class="fb-menu-panel" id="fb-primary"><nav class="fb-links" aria-label="Site navigation">''' + "".join(links) + '''</nav>
<a class="fb-initiative" href="https://adaptivearts.ai/">Adaptivearts.ai<sup>®</sup> <span aria-hidden="true">&#8599;</span></a>
<div class="fb-mobile-project"><span class="fb-menu-label">Now building</span><a href="/blueprint-ai-studio/"><strong>Blueprint AI Studio</strong><span>In development - follow the progress &#8594;</span></a></div>
<nav class="fb-mobile-extra" aria-label="More destinations"><a href="https://github.com/fbratten">GitHub &#8599;</a><a href="/all-pages/">All pages</a></nav>
</div></div></div>'''


def breadcrumbs(url):
    if url == "/": return ""
    parts = [("Home", "/")]
    if url.startswith("/blueprint-ai-studio/labs/"):
        parts += [("Methods & Labs", "/methods/"), ("Labs", "/labs/")]
    elif url.startswith("/methods/") and url != "/methods/":
        parts.append(("Methods & Labs", "/methods/"))
    elif url == "/labs/":
        parts.append(("Methods & Labs", "/methods/"))
    elif section_for(url) == "/projects/" and url != "/projects/":
        parts.append(("Projects", "/projects/"))
    items = "".join(f'<li><a href="{href}">{escape(label)}</a></li>' for label, href in parts)
    return f'<nav class="fb-breadcrumbs" aria-label="Breadcrumb"><ol>{items}<li><span aria-current="page">{escape(LABELS[url])}</span></li></ol></nav>'


ARTICLE_GROUPS = {
    "Essay": "Essays", "Technical Guide": "Technical guides",
    "Case Study": "Case studies", "Case Studies": "Case studies",
    "Research Note": "Research notes", "AI Technology": "AI technology",
}
ARTICLE_GROUP_ORDER = ["Essays", "Technical guides", "Case studies", "Research notes",
                       "AI technology", "Earlier posts"]


def article_group(a):
    # Keep the source metadata intact; group only the directory's browsing view.
    if a["date"] < "2026-01-01": return "Earlier posts"
    return ARTICLE_GROUPS[a["category"]]


def article_card(a):
    e = lambda key: escape(a[key], quote=True)
    return f'''<article class="fb-article" data-article data-category="{escape(article_group(a))}"><a href="{e('url')}">
<img src="{e('image')}" alt="{e('image_alt')}" width="1200" height="675" loading="lazy" decoding="async">
<div class="fb-article-copy"><div class="fb-article-meta"><span>{e('category')}</span><time datetime="{e('date')}">{e('date')}</time></div>
<h3>{e('title')}</h3><p>{e('summary')}</p><span class="fb-article-destination">Read on Adaptivearts.ai &#8599;</span></div></a></article>'''


def progress_entry(p):
    links = "".join(f'<li><a href="{escape(s["url"], quote=True)}">{escape(s["label"])}</a></li>' for s in p["sources"])
    return f'''<article class="fb-progress-entry" id="{escape(p['id'])}"><div><time datetime="{p['date']}">{p['date']}</time><p><span class="fb-status">{escape(p['kind'])}</span></p></div><div><h3>{escape(p['title'])}</h3><p>{escape(p['summary'])}</p><ul aria-label="Evidence">{links}</ul></div></article>'''


def resolve_progress(selection=None, public_log=None):
    """Project journal entries can only project admitted public Build Log records."""
    if selection is None: selection = json.loads((ROOT / "blueprint-ai-studio/progress.json").read_text())
    if public_log is None: public_log = json.loads((ROOT / "build-log/entries.json").read_text())
    entries = []
    for reference in selection["entries"]:
        matches = [row for row in public_log if row["date"] == reference["date"]
                   and row["title"] == reference["build_log_title"]]
        if len(matches) != 1 or matches[0]["state"] not in ("SHIPPED", "PUBLISHED", "VERIFIED"):
            raise ValueError(f"Progress requires one admitted Build Log record: {reference['id']}")
        source = matches[0]
        entries.append({"id": reference["id"], "date": source["date"],
                        "kind": source["state"].capitalize(), "source_title": source["title"],
                        "title": reference.get("display_title", source["title"]),
                        "summary": reference.get("display_summary", source["summary"]),
                        "sources": source["evidence"]})
    return entries


def directory_html():
    groups = [
        ("Start", [("/", "Home"), ("/projects/", "Projects"), ("/methods/", "Methods & Labs"),
                   ("/labs/", "Lab directory"), ("/articles/", "Writing"), ("/build-log/", "Build log")]),
        ("Flagships", [("/intelligence-engine-showcase/", "Intelligence Engine"),
                       ("/mads/", "MADS"), ("/adaptivearts-ai/", "Adaptivearts.ai evidence"), ("/gate-monitor/", "Gate Monitor")]),
        ("Blueprint AI Studio", [("/blueprint-ai-studio/", "Book, LMS and progress"),
                                  ("/blueprint-ai-studio/labs/rules-authority-enforcement/", "Rules, Authority & Enforcement reader labs")]),
        ("Supporting proofs", [("/vertex/", "Vertex"), ("/worktrace/", "Worktrace"),
                              ("/broker-lane-sandbox/", "Broker Lane Sandbox"),
                              ("/spine-showcase/recruiter-proof/", "SPINE evidence"),
                              ("/Adaptive-MCP-Orchestrator-Blueprint-Showcase/recruiter-proof/", "Orchestrator evidence")]),
        ("Methods: control and reasoning", [(f"/methods/{s}/", METHOD_NAMES[s]) for s in
            ("5pp", "dialogue-lifecycle", "aics", "dialectic", "rigvedan", "hermeneutic-didactic", "dial4", "dial4plus", "dial4p-possibility", "pisd", "ipb")]),
        ("Methods: orientation and capability", [(f"/methods/{s}/", METHOD_NAMES[s]) for s in
            ("orbit", "sorr", "card-pointer", "srcb", "capability-gap", "csr", "cbe", "cbe-ix", "gdsa")]),
        ("Maps and earlier work", [("/methods/solutions/", "Solution-space map"), ("/projects/#archive", "Earlier showcases and experiments")]),
        ("Elsewhere", [("https://adaptivearts.ai/", "Adaptivearts.ai"), ("https://adaptivearts.ai/book/", "From Blueprint to Application"),
                       ("https://blueprintaistudio.app/", "blueprintaistudio.app"), ("https://github.com/fbratten", "GitHub")])]
    return "\n".join('<section><h2>' + escape(name) + '</h2>' + ''.join(
        f'<a href="{href}">{escape(label)}</a>' for href, label in links) + '</section>' for name, links in groups)


def rss(entries):
    root = ET.Element("rss", version="2.0")
    channel = ET.SubElement(root, "channel")
    for name, value in [("title", "Blueprint AI Studio - Project progress"), ("link", ORIGIN + "/blueprint-ai-studio/"),
                        ("description", "Dated public progress for Blueprint AI Studio, its LMS and From Blueprint to Application."), ("language", "en")]:
        ET.SubElement(channel, name).text = value
    for p in entries:
        item = ET.SubElement(channel, "item")
        url = ORIGIN + "/blueprint-ai-studio/#" + p["id"]
        ET.SubElement(item, "title").text = p["title"]
        ET.SubElement(item, "link").text = url
        ET.SubElement(item, "guid", isPermaLink="true").text = url
        ET.SubElement(item, "description").text = p["summary"]
        timestamp = datetime.fromisoformat(p["date"]).replace(tzinfo=timezone.utc).timestamp()
        ET.SubElement(item, "pubDate").text = formatdate(timestamp, usegmt=True)
    ET.indent(root)
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode") + "\n"


def render():
    articles = json.loads((ROOT / "articles/entries.json").read_text())["articles"]
    entries = resolve_progress()
    pages = sorted(ROOT.glob("**/index.html")) + [ROOT / "404.html"]
    pages = [p for p in pages if "node_modules" not in p.parts and ".git" not in p.parts]
    output = {}
    footer = '''<footer class="fb-footer"><div class="fb-footer-brand"><strong>Fredrik Bratten</strong><p>Applied AI, automation, security and reliable agent systems.</p></div>
<nav aria-label="Explore"><strong>Explore</strong><a href="/">Home</a><a href="/projects/">Projects</a><a href="/methods/">Methods &amp; Labs</a><a href="/articles/">Writing</a><a href="/all-pages/">All pages</a></nav>
<nav aria-label="Initiatives"><strong>Initiative</strong><a href="https://adaptivearts.ai/">Adaptivearts.ai &#8599;</a><a href="/blueprint-ai-studio/">Blueprint AI Studio</a><a href="https://adaptivearts.ai/book/">From Blueprint to Application &#8599;</a></nav>
<nav aria-label="Evidence"><strong>Evidence</strong><a href="/build-log/">Build log</a><a href="https://github.com/fbratten">GitHub &#8599;</a></nav></footer>'''
    for path in pages:
        url = path_url(path)
        text = path.read_text()
        # Old context bars may have no destinations after shared navigation moved in.
        text = re.sub(r'<nav\b[^>]*>\s*</nav>', '', text)
        # Keep local footer notes, with one shared site footer landmark.
        if '<!-- FB:FOOTER -->' not in text:
            text = re.sub(r'<footer\b([^>]*)>([\s\S]*?)</footer>',
                          lambda m: '<div class="fb-context-footer">' + m[2] + '</div>', text)
            text = text.replace('</body>', '<!-- FB:FOOTER --><!-- /FB:FOOTER -->\n</body>')
        # A page's existing hero header is an introduction, not a second site banner.
        text = re.sub(r'<header\b(?![^>]*\brole=)([^>]*)>', r'<header role="region" aria-label="Page introduction"\1>', text)
        # Explicit labels make new pages a deliberate navigation decision.
        if url not in LABELS: raise ValueError(f"Missing page label: {url}")
        if "<!-- FB:HEAD -->" not in text:
            text = text.replace("</head>", "<!-- FB:HEAD --><!-- /FB:HEAD -->\n</head>")
        head = '<link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script>'
        if url == "/blueprint-ai-studio/":
            head += '<link rel="alternate" type="application/rss+xml" title="Blueprint AI Studio progress" href="/blueprint-ai-studio/feed.xml">'
        text = replace_block(text, "HEAD", head)
        if "<!-- FB:NAV -->" not in text:
            text = re.sub(r"(<body\b[^>]*>)", r"\1\n<!-- FB:NAV --><!-- /FB:NAV -->\n", text, count=1)
        text = replace_block(text, "NAV", navigation(url) + breadcrumbs(url))
        text = replace_block(text, "FOOTER", footer)
        text = replace_block(text, "LATEST", "\n".join(article_card(a) for a in articles[:3]))
        text = replace_block(text, "ARTICLES", "\n".join(article_card(a) for a in articles))
        counts = {group: sum(article_group(a) == group for a in articles) for group in ARTICLE_GROUP_ORDER}
        text = replace_block(text, "CATEGORIES", "\n".join(
            f'<option value="{escape(group, quote=True)}">{escape(group)} ({count})</option>'
            for group, count in counts.items() if count))
        text = replace_block(text, "PROGRESS", "\n".join(progress_entry(p) for p in entries))
        published = next(p for p in entries if p["kind"] == "Published")
        teaser = f'<div><time datetime="{published["date"]}">{published["date"]}</time><span>{escape(published["title"])}</span></div><div><span>Available now</span><span>Rules, Authority &amp; Enforcement reader labs</span></div><div><span>Coming soon</span><span>Blueprint AI Studio and its learning platform</span></div>'
        text = replace_block(text, "BLUEPRINT-TEASER", teaser)
        latest = json.loads((ROOT / "build-log/entries.json").read_text())[0]
        text = replace_block(text, "BUILD-LATEST", f'<span>Latest verified update, <time datetime="{latest["date"]}">{latest["date"]}</time>: {escape(latest["title"])}.</span>')
        text = replace_block(text, "DIRECTORY", directory_html())
        output[path] = text
    output[ROOT / "blueprint-ai-studio/feed.xml"] = rss(entries)
    sitemap = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for url in sorted(LABELS):
        if url != "/404.html": ET.SubElement(ET.SubElement(sitemap, "url"), "loc").text = ORIGIN + url
    ET.indent(sitemap)
    output[ROOT / "sitemap.xml"] = '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(sitemap, encoding="unicode") + "\n"
    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    stale = []
    for path, content in render().items():
        if not path.exists() or path.read_text() != content:
            stale.append(str(path.relative_to(ROOT)))
            if not args.check: path.write_text(content)
    if args.check and stale:
        raise SystemExit("Stale generated content: " + ", ".join(stale))
    print("Navigation, directories and feed are current." if args.check else f"Updated {len(stale)} files.")
