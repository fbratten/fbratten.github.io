#!/usr/bin/env python3
"""Check media identity, static access and the page-scoped CSP boundary."""
import hashlib
import importlib.util
import json
from html.parser import HTMLParser
from pathlib import Path
import tempfile
import wave

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
assert hashlib.sha256((ROOT / 'creative/preview.html').read_bytes()).hexdigest() == '4e4405f5445dde2b44202e651b2c995cff9289b71934b40baba805151f943982'
evidence = json.loads((ROOT / 'docs/music-film-media-evidence-20261112.json').read_text())
works = json.loads((ROOT / 'creative/source/works.json').read_text())
assert len(works) == 6
for work in works:
    html = (ROOT / 'creative' / work['id'] / 'index.html').read_text()
    row = next(r for r in evidence['records'] if r['suno_id'] == work['suno'])
    image = ROOT / row['local_cover']
    assert hashlib.sha256(image.read_bytes()).hexdigest() == row['cover_sha256']
    assert 'https://suno.com/song/' + work['suno'] in html
    assert f'data-media-id="{work["suno"]}"' in html
    assert '<iframe' not in html, 'Players must wait for visitor action'
    assert 'Typographic layout study' not in html
    assert 'noindex' not in html
    assert '<h1>' in html and 'aria-label="Site navigation"' in html
print('PASS: original media hashes, six selected versions, static content, explicit creative-only media policy.')
