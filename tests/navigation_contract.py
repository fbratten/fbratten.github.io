#!/usr/bin/env python3
"""Check route integrity, article provenance and the published progress contract."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
import json
import re
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://fbratten.github.io'
# These destinations are served by separate GitHub Pages repositories.
PROJECT_SITES = set('intelligence-engine-showcase 8me-showcase spine-showcase Adaptive-MCP-Orchestrator-Blueprint-Showcase arbiter-showcase Security-Audit-MCP-Server-Showcase agentspool-showcase switchcore-showcase vigil-showcase spawn-showcase music-video-creator-showcase AI-Human-Admin-Dashboard From-Blueprint-to-Application'.split())


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links, self.ids = [], []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag in ('a', 'link') and 'href' in attrs: self.links.append(attrs['href'])
        if tag in ('img', 'script') and 'src' in attrs: self.links.append(attrs['src'])


subprocess.run(['python', 'scripts/build_navigation.py', '--check'], cwd=ROOT, check=True)
pages = list(ROOT.glob('**/index.html')) + [ROOT / '404.html']
pages = [p for p in pages if 'node_modules' not in p.parts]
errors = []
for path in pages:
    text = path.read_text()
    page = Page(text)
    rel = path.relative_to(ROOT).as_posix()
    if len(page.ids) != len(set(page.ids)): errors.append(f'{rel}: duplicate IDs')
    if text.count('aria-label="Site navigation"') != 1: errors.append(f'{rel}: shared navigation missing or duplicated')
    if rel != 'index.html' and 'aria-label="Breadcrumb"' not in text: errors.append(f'{rel}: breadcrumb missing')
    if 'id="main"' not in text: errors.append(f'{rel}: skip-link target missing')
    for link in page.links:
        url = urlsplit(urljoin(ORIGIN + '/' + rel, link))
        if url.netloc != 'fbratten.github.io': continue
        route = unquote(url.path)
        if route.strip('/').split('/')[0] in PROJECT_SITES: continue
        target = ROOT / route.lstrip('/')
        if route.endswith('/'): target /= 'index.html'
        if not target.exists():
            errors.append(f'{rel}: broken local destination {link}')
        elif url.fragment and target.suffix == '.html':
            if unquote(url.fragment) not in Page(target.read_text()).ids:
                errors.append(f'{rel}: missing fragment {link}')

articles = json.loads((ROOT / 'articles/entries.json').read_text())
seen = set()
for a in articles['articles']:
    assert a['url'].startswith('https://adaptivearts.ai/blog/')
    assert a['image'].startswith('https://') and a['image_alt'].strip()
    assert a['title'].strip() and re.fullmatch(r'\d{4}-\d{2}-\d{2}', a['date'])
    assert a['url'] not in seen, 'Duplicate article'
    seen.add(a['url'])
assert (ROOT / 'articles/index.html').read_text().count('data-article ') == len(seen)
profiles = re.findall(r'class="card" href="\./([^/]+)/"', (ROOT / 'methods/index.html').read_text())
assert len(profiles) == 20 and len(set(profiles)) == 20
assert '18 published capabilities' not in (ROOT / 'index.html').read_text()
progress = json.loads((ROOT / 'blueprint-ai-studio/progress.json').read_text())
ids = set()
for p in progress['entries']:
    assert p['id'] not in ids and p['sources']
    assert p['kind'] in ('Status check', 'Published', 'Preview', 'Planned')
    assert p['date'] <= progress['verified_at']
    ids.add(p['id'])
feed = ET.parse(ROOT / 'blueprint-ai-studio/feed.xml')
assert len(feed.findall('./channel/item')) == len(ids)
for path in [ROOT / 'index.html', ROOT / 'blueprint-ai-studio/index.html']:
    assert 'https://adaptivearts.ai/book/' in path.read_text()
    assert 'subscribepage.io' not in path.read_text()
if errors: raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages, {len(seen)} article cards, 20 methods, {len(ids)} progress entries; routes and anchors resolve.')
