(() => {
  'use strict';
  const P = window.Dial4PPossibility = window.Dial4PPossibility || {};
  P.colors = {
    text: '#eaf2f7', muted: '#9cb0bd', accent: '#53d3a7', blue: '#6ca8ff',
    amber: '#e9b75b', violet: '#b293ff', danger: '#f27f7f', success: '#68d391'
  };
  const C = P.colors;

  function wrap(ctx, text, maxWidth) {
    const words = String(text).split(/\s+/), lines = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line); line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }

  function pointer(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function groupColor(group) {
    return group === 'claim' ? C.blue
      : group === 'strength' ? C.violet
      : group === 'form' ? C.amber
      : group === 'governance' ? C.accent
      : group === 'engineering' ? C.success
      : group === 'boundary' ? C.danger
      : C.muted;
  }

  function arrow(ctx, a, b, label = '', dashed = false, color = 'rgba(156,176,189,.43)') {
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const ar = a.r || 48, br = b.r || 48;
    const sx = a.x + Math.cos(angle) * ar * .84;
    const sy = a.y + Math.sin(angle) * ar * .84;
    const ex = b.x - Math.cos(angle) * br * .84;
    const ey = b.y - Math.sin(angle) * br * .84;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 1.7;
    if (dashed) ctx.setLineDash([7, 6]);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - Math.cos(angle - Math.PI / 6) * 9, ey - Math.sin(angle - Math.PI / 6) * 9);
    ctx.lineTo(ex - Math.cos(angle + Math.PI / 6) * 9, ey - Math.sin(angle + Math.PI / 6) * 9);
    ctx.closePath(); ctx.fill();
    if (label) {
      ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = C.muted;
      ctx.fillText(label, (sx + ex) / 2, (sy + ey) / 2 - 7);
    }
    ctx.restore();
  }

  P.initGraph = function ({ canvasId, detailId, resetId, nodes: source, edges, filterSelector, defaultSelected }) {
    const canvas = document.getElementById(canvasId), detail = document.getElementById(detailId);
    if (!canvas || !detail) return;
    let nodes = [], selected = defaultSelected || source[0].id, filter = 'all';
    let drag = null, offset = { x: 0, y: 0 }, size = { w: 0, h: 0 };
    const visible = n => filter === 'all' || n.group === filter || n.always;

    function inspect() {
      const n = nodes.find(x => x.id === selected) || nodes[0];
      if (!n) return;
      const label = detail.querySelector('.label');
      if (label) label.textContent = n.groupLabel || n.group;
      const h = detail.querySelector('h3');
      if (h) h.textContent = n.label.replace(/\n/g, ' ');
      const summary = detail.querySelector('.detail-summary');
      if (summary) summary.textContent = n.summary || '';
      const dl = detail.querySelector('.node-metadata');
      if (dl) {
        dl.replaceChildren();
        for (const [k, v] of (n.meta || [])) {
          const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
          dt.textContent = k; dd.textContent = v; row.append(dt, dd); dl.append(row);
        }
      }
      const ul = detail.querySelector('.detail-list');
      if (ul) {
        ul.replaceChildren();
        for (const item of (n.items || [])) {
          const li = document.createElement('li'); li.textContent = item; ul.append(li);
        }
      }
    }

    function draw(ctx, w, h) {
      size = { w, h };
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(83,211,167,.03)';
      for (let x = 24; x < w; x += 36) for (let y = 24; y < h; y += 36) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }
      for (const e of edges) {
        const a = nodes.find(n => n.id === e.from), b = nodes.find(n => n.id === e.to);
        if (!a || !b || !visible(a) || !visible(b)) continue;
        arrow(ctx, { x: a.px, y: a.py, r: a.r }, { x: b.px, y: b.py, r: b.r }, e.label, e.dashed, e.color);
      }
      for (const n of nodes) {
        if (!visible(n)) continue;
        const col = groupColor(n.group), active = n.id === selected;
        ctx.save();
        ctx.shadowColor = active ? col : 'transparent'; ctx.shadowBlur = active ? 22 : 0;
        ctx.beginPath(); ctx.arc(n.px, n.py, n.r || 48, 0, Math.PI * 2);
        ctx.fillStyle = active ? `${col}25` : 'rgba(16,31,44,.96)'; ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = active ? 3 : 1.5; ctx.stroke(); ctx.restore();
        ctx.fillStyle = C.text; ctx.font = `700 ${n.primary ? 14 : 11}px system-ui`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const lines = n.label.split('\n').flatMap(t => wrap(ctx, t, (n.r || 48) * 1.45)).slice(0, 3);
        lines.forEach((line, i) => ctx.fillText(line, n.px, n.py + (i - (lines.length - 1) / 2) * 14));
      }
    }

    function render() {
      const rect = canvas.getBoundingClientRect(), dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, rect.width, rect.height);
    }

    function reset() {
      nodes = source.map(n => ({ ...n, px: n.x * size.w, py: n.y * size.h }));
      render(); inspect();
    }

    const hit = (x, y) => [...nodes].reverse().find(n => visible(n) && Math.hypot(x - n.px, y - n.py) <= (n.r || 48));
    new ResizeObserver(() => {
      const old = { ...size }; render();
      if (nodes.length && old.w && old.h) {
        nodes.forEach(n => { n.px = n.px / old.w * size.w; n.py = n.py / old.h * size.h; }); render();
      } else reset();
    }).observe(canvas);

    canvas.addEventListener('pointerdown', e => {
      const p = pointer(canvas, e), n = hit(p.x, p.y); if (!n) return;
      selected = n.id; drag = n; offset = { x: p.x - n.px, y: p.y - n.py };
      canvas.setPointerCapture(e.pointerId); inspect(); render();
    });
    canvas.addEventListener('pointermove', e => {
      const p = pointer(canvas, e);
      if (drag) {
        drag.px = Math.max((drag.r || 48) + 8, Math.min(size.w - (drag.r || 48) - 8, p.x - offset.x));
        drag.py = Math.max((drag.r || 48) + 8, Math.min(size.h - (drag.r || 48) - 8, p.y - offset.y));
        render();
      } else canvas.style.cursor = hit(p.x, p.y) ? 'grab' : 'default';
    });
    const stop = e => { if (!drag) return; drag = null; try { canvas.releasePointerCapture(e.pointerId); } catch (_) {} };
    canvas.addEventListener('pointerup', stop); canvas.addEventListener('pointercancel', stop);
    document.getElementById(resetId)?.addEventListener('click', reset);

    if (filterSelector) document.querySelectorAll(filterSelector).forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll(filterSelector).forEach(x => x.classList.remove('active'));
      btn.classList.add('active'); filter = btn.dataset.filter;
      const current = nodes.find(n => n.id === selected);
      if (!current || !visible(current)) selected = defaultSelected;
      render(); inspect();
    }));
    inspect();
  };
})();
