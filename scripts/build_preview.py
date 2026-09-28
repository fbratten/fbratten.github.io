#!/usr/bin/env python3
"""Build a portable, clickable review of the hub pages. No deployment required."""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = ['/', '/projects/', '/methods/', '/labs/', '/articles/', '/blueprint-ai-studio/', '/all-pages/', '/404.html']
pages = {}
css = (ROOT / 'assets/site.css').read_text()
js = (ROOT / 'assets/site.js').read_text()
for route in PAGES:
    path = ROOT / (route.lstrip('/') + 'index.html' if route.endswith('/') else route.lstrip('/'))
    text = path.read_text()
    text = text.replace('<head>', '<head><base href="https://fbratten.github.io' + route + '">', 1)
    text = text.replace('<link rel="stylesheet" href="/assets/site.css">', '<style>' + css + '</style>')
    text = text.replace('<script src="/assets/site.js" defer></script>', '')
    # Reuse the actual page script and content; do not maintain a second mock UI.
    text = text.replace('</body>', '<script>' + js + '''
document.addEventListener('click', event => {
  const a = event.target.closest('a');
  if (!a || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const url = new URL(a.href);
  if (url.origin === 'https://fbratten.github.io' && PREVIEW_ROUTES.includes(url.pathname)) {
    event.preventDefault(); parent.postMessage({previewRoute: url.pathname + url.hash}, '*');
  } else { a.target = '_blank'; a.rel = 'noopener'; }
});
window.addEventListener('message', event => {
  if (event.source === parent && event.data.previewAnchor) document.getElementById(event.data.previewAnchor)?.scrollIntoView();
});
''' .replace('PREVIEW_ROUTES', json.dumps(PAGES)) + '</script></body>')
    pages[route] = text

payload = json.dumps(pages, ensure_ascii=False).replace('</', '<\\/')
output = '''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portfolio navigation - Review draft</title><style>
body { margin:0; background:#09131c; color:#eaf2f7; font:13px/1.5 system-ui,sans-serif; }
.review-bar { padding:10px 18px; background:#263b32; border-bottom:1px solid #789184; }
.review-bar strong { color:#c4f4d9; } iframe { width:100%; height:calc(100dvh - 63px); border:0; display:block; }
</style></head><body><div class="review-bar"><strong>Review draft / Not published</strong><br>Explore the hub pages here. Method profiles, labs and external articles open their current public pages.</div><iframe title="Portfolio draft"></iframe><script>
const pages = PAYLOAD;
const frame = document.querySelector('iframe');
let anchor = '';
let currentRoute = null;
function render() {
  let requested;
  try { requested = decodeURIComponent(location.hash.slice(1)) || '/'; } catch { requested = '/'; }
  const split = requested.indexOf('#');
  const route = split < 0 ? requested : requested.slice(0, split);
  anchor = split < 0 ? '' : requested.slice(split + 1);
  if (route === currentRoute) {
    frame.contentWindow.postMessage({previewAnchor:anchor || 'main'}, '*');
    return;
  }
  currentRoute = route;
  frame.srcdoc = pages[route] || pages['/404.html'];
}
frame.addEventListener('load', () => { if (anchor) frame.contentWindow.postMessage({previewAnchor:anchor}, '*'); });
window.addEventListener('message', event => {
  if (event.source !== frame.contentWindow || typeof event.data.previewRoute !== 'string') return;
  const next = '#' + encodeURIComponent(event.data.previewRoute);
  if (location.hash === next) render();
  else location.hash = next;
});
window.addEventListener('hashchange', render);
render();
</script></body></html>'''.replace('PAYLOAD', payload)
path = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/portfolio-navigation-preview.html')
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(output)
print(f'Built clickable review: {path} ({len(output.encode())} bytes)')
