#!/usr/bin/env python3
"""Render the admitted Music & Film content into ordinary static routes."""
import argparse
import json
from html import escape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def player(provider, item_id, title):
    if provider == 'suno':
        assert re.fullmatch(r'[0-9a-f-]{36}', item_id)
        href = 'https://suno.com/song/' + item_id
        label = 'Load Suno player'
    else:
        assert provider == 'youtube' and re.fullmatch(r'[A-Za-z0-9_-]{11}', item_id)
        href = 'https://www.youtube.com/watch?v=' + item_id
        label = 'Load YouTube player'
    provider_name = 'Suno' if provider == 'suno' else 'YouTube'
    return f'''<div class="player-box" data-provider="{provider}" data-media-id="{item_id}" data-title="{escape(title, quote=True)}">
<div data-player-slot><h3>{escape(title)}</h3><p>The player connects to {provider_name} only when you choose to load it.</p><button class="button primary" type="button" data-load-player>{label}</button></div>
<a class="player-fallback" href="{href}" target="_blank" rel="noopener">Open on {provider_name} ↗</a>
<noscript><p>Use the link above to listen without JavaScript.</p></noscript></div>'''


def page(title, description, route, body):
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} | Fredrik Brattén</title><meta name="description" content="{escape(description, quote=True)}">
<link rel="canonical" href="https://fbratten.github.io{route}">
<link rel="stylesheet" href="/creative/creative.css"><script src="/creative/players.js" defer></script>
</head><body class="creative-page"><main id="main" tabindex="-1">{body}</main></body></html>
'''


def render():
    works = json.loads((ROOT / 'creative/source/works.json').read_text())
    home_source = (ROOT / 'creative/source/home.html.txt').read_text()
    cards = []
    compact_cards = []
    compact_ids = {'take-em-all', 'rise-together-or-we-fall', 'low-orbit-high-standards'}
    output = {}
    for w in works:
        title, route = escape(w['title']), '/creative/' + w['id'] + '/'
        alt = escape(w.get('cover_alt', w['title'] + ' artwork'), quote=True)
        cover = f'<img class="cover-image" src="{w["cover"]}" alt="{alt}" width="800" height="800" loading="lazy" decoding="async">'
        if w['id'] in compact_ids:
            compact_cards.append(f'<a class="work-card work-card--compact" href="{route}"><figure>{cover}</figure><div><h3>{title}</h3><p>{escape(w["desc"])}</p><span class="meta">{escape(w["kind"])} →</span></div></a>')
        else:
            cards.append(f'<a class="work-card" href="{route}"><figure>{cover}</figure><h3>{title}</h3><p>{escape(w["desc"])}</p><span class="meta">{escape(w["kind"])} →</span></a>')
        media = player('suno', w['suno'], w['title']) if w.get('suno') else ''
        if w.get('youtube'):
            label = 'Official Music Video' if w['id'] == 'take-em-all' else 'Official Audio'
            media += player('youtube', w['youtube'], w['title'] + ' - ' + label)
        action = 'Listen &amp; watch' if media else 'Explore the production'
        media_section = f'<section class="article-grid" id="listen"><h2>Listen &amp; watch</h2><div class="article-body">{media}</div></section>' if media else '<div id="listen"></div>'
        if w.get('body_source_section'):
            section_id = w['body_source_section']
            match = re.search(r'<section\b[^>]*\bid="' + re.escape(section_id) + r'"[^>]*>[\s\S]*?</section>', home_source)
            assert match, section_id
            # Reuse the complete existing section; show its details immediately.
            content = re.sub(r'<details(?=[ >])', '<details open', match.group())
        else:
            content = w['body_html']
        body = f'''<div class="shell"><section class="work-hero"><div><span class="eyebrow">{escape(w['kind'])}</span><h1>{title}</h1>
<p class="artist">By Fredrik Brattén · Artist name: Ragnar Bratten</p><p class="intro">{escape(w['intro'])}</p>
<div class="actions"><a class="button primary" href="#listen">{action} ↓</a><a class="button" href="/creative/#works">All works</a></div>
<p class="fine">{escape(w['angle'])}</p></div><figure>{cover}</figure></section>
{media_section}
{content}<div class="bottom-cta"><p>Music, moving images and the decisions behind them.</p><a class="button" href="/creative/#works">Explore the collection →</a></div></div>'''
        output[ROOT / route.strip('/') / 'index.html'] = page(w['title'], w['desc'], route, body)
    home = home_source
    home = home.replace('<!-- CREATIVE:WORKS -->', '<div class="works" id="work-grid">' + '\n'.join(cards) + '</div><div class="works works--compact" aria-label="More music">' + '\n'.join(compact_cards) + '</div>')
    for item_id, title in [('791d21b2-c908-4a1e-8861-ff300ae66461', 'Superposition Baby, more Concepts than You got Cells'), ('03f72637-ce31-4334-8eee-0e5d761414a3', 'Awaken Wired (Chalumeau, Sul)')]:
        pattern = r'<div class="actions"><a[^>]+href="https://suno.com/song/' + item_id + r'"[^>]*>.*?</a></div>'
        home, count = re.subn(pattern, lambda _: player('suno', item_id, title), home, count=1)
        assert count == 1, item_id
    output[ROOT / 'creative/index.html'] = page('Music & Film', 'Music, film and the creative decisions behind them. Nine works by Fredrik Brattén, with music credited to Ragnar Bratten.', '/creative/', home)
    return output


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    # Shared navigation is generated separately. Compare content after rendering
    # both layers, so a check never requires deleting the shared page frame.
    import build_navigation
    generated = render()
    if args.check:
        from tempfile import TemporaryDirectory
        from shutil import copytree
        with TemporaryDirectory() as tmp:
            shadow = Path(tmp) / 'site'
            copytree(ROOT, shadow, ignore=lambda p, names: [n for n in names if n in {'.git', 'node_modules', '.openai', '_site', '_preview'}])
            for path, content in generated.items():
                dest = shadow / path.relative_to(ROOT)
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text(content)
            old = build_navigation.ROOT
            try:
                build_navigation.ROOT = shadow
                rendered = build_navigation.render()
                stale = [str(p.relative_to(shadow)) for p, text in rendered.items()
                         if p.relative_to(shadow).parts[0] == 'creative'
                         and (ROOT / p.relative_to(shadow)).read_text() != text]
            finally:
                build_navigation.ROOT = old
            if stale:
                raise SystemExit('Stale creative pages: ' + ', '.join(stale))
    else:
        for path, content in generated.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        for path, content in build_navigation.render().items():
            path.write_text(content)
    print('Music & Film: ten static routes are current.')
