#!/usr/bin/env python3
"""Check media identity, static access and the page-scoped CSP boundary."""
import hashlib
import importlib.util
import json
from html.parser import HTMLParser
from pathlib import Path
import tempfile
import wave
import ast
import re

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('release', ROOT / 'scripts/pages_release.py')
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)


class Policy(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta' and attrs.get('http-equiv') == 'Content-Security-Policy':
            self.directives = {p.strip().split()[0]: p.strip().split()[1:]
                               for p in attrs['content'].split(';')}


with tempfile.TemporaryDirectory() as temp:
    for creative in [False, True]:
        path = Path(temp) / 'index.html'
        path.write_text('<!doctype html><html><head></head><body><script>window.verified=true;</script></body></html>')
        release.add_policy(path, creative=creative)
        parser = Policy(); parser.feed(path.read_text()); policy = parser.directives
        assert policy['default-src'] == ["'none'"]
        assert policy['script-src-attr'] == ["'none'"]
        assert "'unsafe-inline'" not in policy['script-src']
        assert policy['connect-src'] == ["'self'"]
        assert policy['object-src'] == ["'none'"]
        assert policy['frame-src'] == (['https://www.youtube-nocookie.com', 'https://suno.com'] if creative else ["'none'"])
        assert policy['media-src'] == (["'self'", 'data:'] if creative else ["'none'"])

wav = ROOT / 'creative/media/hud-mot-hud-seed.wav'
assert hashlib.sha256(wav.read_bytes()).hexdigest() == '398ba5d67cc256f9b873012a04b9f21c184b723a8b6115a9a7576c99488e6cda'
with wave.open(str(wav)) as sound:
    assert (sound.getnframes(), sound.getframerate(), sound.getnchannels(), sound.getsampwidth()) == (557052, 44100, 1, 2)
assert hashlib.sha256((ROOT / 'creative/archived/preview-20261108.html').read_bytes()).hexdigest() == '4e4405f5445dde2b44202e651b2c995cff9289b71934b40baba805151f943982'
assert 'url=/creative/' in (ROOT / 'creative/preview.html').read_text()
evidence = json.loads((ROOT / 'docs/music-film-media-evidence-20261112.json').read_text())
works = json.loads((ROOT / 'creative/source/works.json').read_text())
assert len(works) == 9
for work in works:
    html = (ROOT / 'creative' / work['id'] / 'index.html').read_text()
    if work.get('suno'):
        row = next(r for r in evidence['records'] if r['suno_id'] == work['suno'])
        image = ROOT / row['local_cover']
        assert hashlib.sha256(image.read_bytes()).hexdigest() == row['cover_sha256']
        assert 'https://suno.com/song/' + work['suno'] in html
        assert f'data-media-id="{work["suno"]}"' in html
    if work.get('video'):
        assert '<video controls playsinline' in html
        assert work['video'] in html and work['captions'] in html
    assert '<iframe' not in html, 'Players must wait for visitor action'
    assert 'Typographic layout study' not in html
    assert 'noindex' not in html
    assert '<h1>' in html and 'aria-label="Site navigation"' in html
# Prevent the observed language and internal-review prose regression. Titles and
# lyrics keep their original language; surrounding English copy does not.
public = [(ROOT / 'creative/index.html'), *(ROOT / 'creative' / w['id'] / 'index.html' for w in works)]
for path in public:
    text = path.read_text()
    assert '<html lang="en">' in text
    for phrase in ['den oortodoxa friktionen', 'Grundinställningar', 'släp på',
                   'remains unproved', 'unavailable', 'not yet been made',
                   'require listening', 'remaining gaps', 'placeholder',
                   'cannot be substantiated', 'går inte att belägga', 'uppgifter saknas']:
        assert phrase.lower() not in text.lower(), (path, phrase)

# Guard the two formerly hidden works as first-class routes with complete content.
from html import unescape
home = (ROOT / 'creative/index.html').read_text()
for route in ['awaken-wired', 'superposition-baby']:
    assert f'class="work-card" href="/creative/{route}/"' in home
    page = (ROOT / 'creative' / route / 'index.html').read_text()
    assert '<details' in page and '<details open' in page
awaken = (ROOT / 'creative/awaken-wired/index.html').read_text()
intro = re.search(r'<pre class="intro-source"><code>([\s\S]*?)</code></pre>', awaken).group(1)
assert unescape(intro).strip() == (ROOT / 'creative/source/awaken-wired-intro.txt').read_text().strip()
for section_id, route in [('awaken', 'awaken-wired'), ('learning', 'superposition-baby')]:
    pattern = r'<section\b[^>]*\bid="' + section_id + r'"[^>]*>[\s\S]*?</section>'
    original = re.search(pattern, (ROOT / 'creative/source/home.html.txt').read_text()).group()
    page_section = re.search(pattern, (ROOT / 'creative' / route / 'index.html').read_text()).group()
    assert page_section.replace('<details open', '<details') == original

# Translation must preserve the synthesis program, not silently change the seed.
def synthesis_tree(filename):
    tree = ast.parse((ROOT / 'creative/source' / filename).read_text())
    tree.body = [node for node in tree.body if not (isinstance(node, ast.Expr)
        and isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Name)
        and node.value.func.id == 'print')]
    return ast.dump(tree)
assert synthesis_tree('hud_mot_hud_seed.py') == synthesis_tree('hud_mot_hud_seed.en.py')
studio = json.loads((ROOT / 'docs/music-film-studio-evidence-20261112.json').read_text())
for item in studio['published_assets']:
    assert hashlib.sha256((ROOT / item['path']).read_bytes()).hexdigest() == item['sha256']
print('PASS: preserved originals, media identities, English editorial copy, nine works, creative-only media policy.')
