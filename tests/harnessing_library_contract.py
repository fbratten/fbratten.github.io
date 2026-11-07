"""Validate the library's reference graph, content and publication boundary."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
page = (ROOT / 'harnessing/index.html').read_text()
data = json.loads(re.search(r'<script type="application/json" id="harness-library-data">(.*?)</script>', page, re.S)[1])
ids = {m['id'] for m in data['methods']}
assert len(ids) == len(data['methods']) == 15
assert {'card', 'pointer'} <= ids
assert sum(len(m['examples']) for m in data['methods']) == 30
assert len(data['pipelines']) == 6
assert len(data['terminal']) == 2
for method in data['methods']:
    assert all(method[k] for k in ('name', 'trigger', 'mechanism', 'output', 'practice', 'url'))
    assert set(method['combine']) <= ids
    assert len(method['examples']) == 2
for owner in data['pipelines']:
    assert len(owner['stages']) == 5
    for stage in owner['stages']:
        assert set(stage['methods']) <= ids
        assert all(stage[k] for k in ('input', 'work', 'output', 'gate', 'recovery'))
for case in data['terminal']:
    assert len(case['steps']) == 6
    for step in case['steps']:
        assert set(step['methods']) <= ids
        assert step['record']
assert 'max-height:840px' not in page and 'max-height:260px' not in page
assert 'noindex' not in page and 'Concept preview' not in page
assert 'Source and publication boundaries' not in page
assert 'Harnessing in practice.' in page
assert 'harnessing/' in (ROOT / 'scripts/build_preview.py').read_text()
assert 'href="/harnessing/"' in (ROOT / 'methods/index.html').read_text()
assert 'href="/harnessing/"' in (ROOT / 'all-pages/index.html').read_text()
assert 'https://fbratten.github.io/harnessing/' in (ROOT / 'sitemap.xml').read_text()

# Fail closed on internal source routing or browser network/persistence code.
for token in ('obs-vault-', 'control-center-ops', '03-Projects/Active/',
              '05-Operations/', 'libfile_', 'file_0000', 'github_pat_',
              'localStorage', 'sessionStorage', 'indexedDB', 'XMLHttpRequest',
              'WebSocket', 'sendBeacon', 'fetch('):
    assert token not in page, token
class Resources(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'img', 'iframe') and 'src' in attrs:
            assert attrs['src'] == '/assets/site.js', attrs['src']
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            assert attrs['href'] == '/assets/site.css'
Resources().feed(page)

manifest = json.loads((ROOT / 'archived/harnessing-publication-20261107/manifest.json').read_text())
for record in manifest['files']:
    assert hashlib.sha256((ROOT / record['archive']).read_bytes()).hexdigest() == record['sha256']
print('PASS: 15 methods, 30 situations, 6 pipelines, 12 terminal moments, references, public boundary and preserved source hashes.')
