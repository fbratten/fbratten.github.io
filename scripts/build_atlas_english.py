#!/usr/bin/env python3
"""Generate the English atlas from the Swedish source and reviewed translations.

Only display text is translated. Graph identifiers, topology, dates, source URLs
and deterministic model behavior remain shared. The navigation renderer owns
the FB blocks; existing generated navigation is preserved during regeneration.
"""
from pathlib import Path
import argparse
import copy
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
ATLAS = ROOT / 'labs/aristotle-to-agents'
TRANSLATIONS = json.loads((ATLAS / 'translations.en.json').read_text())
TEXT = TRANSLATIONS['text']
CODE = TRANSLATIONS['code']
FB = re.compile(r'<!-- FB:(\w+) -->[\s\S]*?<!-- /FB:\1 -->')


def canonical_html(value):
    """Exclude only navigation-renderer-owned block content from comparison."""
    return FB.sub(lambda m:'<!-- FB:'+m[1]+' -->', value)


def verify_source_fingerprints():
    """Fail before generating any output when a reviewed source has changed."""
    names = ('graph.json', 'app.js', 'model.js', 'index.html')
    recorded = TRANSLATIONS.get('source_sha256', {})
    if set(recorded) != set(names):
        raise ValueError('English atlas needs reviewed source fingerprints for graph.json, app.js, model.js and index.html.')
    changed = []
    for name in names:
        source = (ATLAS / name).read_bytes()
        if name == 'index.html':
            source = canonical_html(source.decode('utf-8')).encode('utf-8')
        if hashlib.sha256(source).hexdigest() != recorded[name]:
            changed.append(name)
    if changed:
        raise ValueError('English atlas source changed: '+', '.join(changed)+
                         '. Review and update the English translations, then explicitly update '
                         'source_sha256 in translations.en.json for the reviewed snapshot. '
                         'The generator never refreshes fingerprints automatically.')


def text(value, required=False):
    if value in TEXT:
        return TEXT[value]
    if required and value not in ('Argumentation',):
        raise ValueError(f'Missing English display translation: {value!r}')
    return value


def replace_phrases(source, javascript=False):
    # One pass: replacements cannot translate their own output or change order.
    pattern = re.compile('|'.join(re.escape(k) for k in sorted(CODE, key=len, reverse=True)))
    def replace(match):
        result = CODE[match[0]]
        # Escaping an apostrophe is safe in both JS quotes and template strings.
        return result.replace("'", "\\'") if javascript else result
    return pattern.sub(replace, source)


def english_graph():
    original = json.loads((ATLAS / 'graph.json').read_text())
    data = copy.deepcopy(original)
    assert set(TRANSLATIONS['nodes']) == {n['id'] for n in original['noder']}
    assert len(TRANSLATIONS['edges']) == len(original['kanter']) == 111
    for node in data['noder']:
        node['label'], node['beskrivning'] = TRANSLATIONS['nodes'][node['id']]
        if node.get('period'):
            period = node['period']
            node['period'] = text(period, bool(re.search('[A-Za-zåäöÅÄÖ]', period)) and period not in ('LLM', 'RAG', 'LLM/agent', 'agent', 'multiagent'))
        node['provenance'] = text(node['provenance'], True)
    for edge, relation in zip(data['kanter'], TRANSLATIONS['edges']):
        edge['relation'] = relation
        for key in ('grundning', 'förklaring', 'review_status'):
            edge[key] = text(edge[key], True)
    for category in data['kategorier'].values():
        category['legend'] = text(category['legend'], True)
    for relation in data['typer'].values():
        for key in ('label', 'description'):
            relation[key] = text(relation[key], True)
    for source in data['källor'].values():
        source['title'] = text(source['title'])
        source['review_status'] = text(source['review_status'], True)
    for view in data['views']:
        for key in ('title', 'headline', 'intro', 'lesson'):
            view[key] = text(view[key], True)
        for column in view['columns']:
            column['title'] = text(column['title'], True)
    data['metadata']['språk'] = 'en'
    for key in ('titel', 'beskrivning'):
        data['metadata'][key] = text(data['metadata'][key], True)
    # Translation does not move any source, node, edge or view membership.
    assert [n['id'] for n in data['noder']] == [n['id'] for n in original['noder']]
    assert [(e['id'], e['källa'], e['mål'], e['typ'], e['referenser']) for e in data['kanter']] == [(e['id'], e['källa'], e['mål'], e['typ'], e['referenser']) for e in original['kanter']]
    assert {k:s['url'] for k,s in data['källor'].items()} == {k:s['url'] for k,s in original['källor'].items()}
    return data


def render():
    verify_source_fingerprints()
    graph = english_graph()
    html = replace_phrases((ATLAS / 'index.html').read_text())
    html = html.replace('<html lang="sv">', '<html lang="en">', 1)
    html = html.replace('href="./style.css"', 'href="../style.css"')
    html = html.replace('href="./original-graph.json"', 'href="../original-graph.json"')
    html = html.replace('href="./original-diagrams/', 'href="../original-diagrams/')
    html = re.sub(r'(<a\b[^>]*data-atlas-language) aria-current="page"', r'\1', html)
    html = re.sub(r'(<a\b[^>]*href="/labs/aristotle-to-agents/en/"[^>]*data-atlas-language)(?! aria-current)', r'\1 aria-current="page"', html)
    existing = ATLAS / 'en/index.html'
    if existing.exists():
        blocks = {m[1]:m[0] for m in FB.finditer(existing.read_text())}
        html = FB.sub(lambda m:blocks.get(m[1],m[0]),html)
    output = {
        ATLAS / 'en/index.html': html,
        ATLAS / 'en/graph.json': json.dumps(graph, ensure_ascii=False, indent=2)+'\n',
        ATLAS / 'en/data.js': 'window.ATLAS_DATA = '+json.dumps(graph,ensure_ascii=False)+';\n',
    }
    for name in ('app.js','model.js'):
        content = replace_phrases((ATLAS / name).read_text(), javascript=True)
        content = content.replace("toLocaleLowerCase('sv')", "toLocaleLowerCase('en')")
        # This detects untranslated Swedish prose, while leaving stable graph IDs
        # and proper names alone. Text-field coverage above is exhaustive.
        for phrase in ('Visa definition', 'sökträffar', 'Är slutsatsen', 'Alla katter', 'Kräv faktisk', 'Slutsatsen följer', 'obestyrkt', 'Nästa steg', 'Återställ'):
            if phrase in content:
                raise ValueError(f'Untranslated English {name} phrase: {phrase}')
        output[ATLAS / 'en' / name] = '// Generated by scripts/build_atlas_english.py. Edit translations.en.json.\n'+content
    return output


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    stale = []
    for path, content in render().items():
        actual = path.read_text() if path.exists() else None
        # Navigation and head/footer blocks have a different owning generator.
        if actual is None or canonical_html(actual) != canonical_html(content):
            stale.append(str(path.relative_to(ROOT)))
            if not args.check:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content)
    if stale and args.check:
        raise SystemExit('Stale English atlas: '+', '.join(stale))
    print('English atlas current: 74 nodes, 111 relationships, 5 views and 5 labs.' if args.check else f'Generated English atlas: {len(stale)} updated files.')
