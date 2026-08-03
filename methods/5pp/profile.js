(() => {
  'use strict';

  const COLORS = {
    bg: '#071018',
    panel: '#101f2c',
    line: '#365064',
    text: '#eaf2f7',
    muted: '#9cb0bd',
    accent: '#53d3a7',
    blue: '#6ca8ff',
    amber: '#e9b75b',
    grey: '#597080',
    danger: '#f27f7f'
  };

  const PHASES = [
    {
      id: 'clarification', number: '01', title: 'Clarification',
      summary: 'Restate the objective and expose assumptions before scope or execution is treated as stable.',
      evidence: ['A restatement of the task', 'An explicit objective', 'Assumptions, including an explicit “none” where appropriate'],
      failure: 'The record repeats the request without resolving the operative objective or hidden assumptions.'
    },
    {
      id: 'scope', number: '02', title: 'Scope Validation',
      summary: 'Define what belongs to the task, what is excluded and which constraints govern the work.',
      evidence: ['At least one in-scope item', 'At least one out-of-scope item', 'At least one constraint'],
      failure: 'Execution inherits undefined boundaries or quietly expands into adjacent work.'
    },
    {
      id: 'plan', number: '03', title: 'Reasoning Plan',
      summary: 'Create an inspectable workflow plan before execution evidence appears. This is not a request for private chain-of-thought.',
      evidence: ['An enumerated sequence of intended actions', 'A reviewable relationship between plan and objective', 'An approval checkpoint before execution'],
      failure: 'The record contains execution evidence before a stable plan or approval checkpoint.'
    },
    {
      id: 'execution', number: '04', title: 'Execution',
      summary: 'Perform bounded work after the plan and preserve enough evidence to inspect what occurred.',
      evidence: ['Actions traceable to the plan', 'Outputs or receipts', 'No silent expansion beyond the declared scope'],
      failure: 'The work diverges from the plan without recording the deviation, or evidence predates approval.'
    },
    {
      id: 'verification', number: '05', title: 'Verification',
      summary: 'Audit alignment, drift, completeness, uncertainty and introduced errors, then close with exactly one declared verdict.',
      evidence: ['A complete accepted self-audit enumeration', 'Uncertainty or weak-point disclosure', 'Exactly one verdict: Advance, Narrow, Revise, Park or Reject'],
      failure: '“Seems fine” or a duplicated/ambiguous verdict is treated as insufficient verification.'
    }
  ];

  const PROFILE_RULES = {
    standard: {
      label: 'Standard',
      required: new Set(PHASES.map(p => p.id)),
      enhanced: new Set(),
      note: 'All five phases are required as headings.'
    },
    constraint: {
      label: 'Constraint-hardened',
      required: new Set(PHASES.map(p => p.id)),
      enhanced: new Set(['scope', 'plan', 'verification']),
      note: 'Constraints become measurable predicates, a skeleton precedes execution and verification measures each constraint.'
    },
    silent: {
      label: 'Silent',
      required: new Set(['verification']),
      enhanced: new Set(['verification']),
      note: 'Explicit authorization is required. Steps 1-4 are not heading-required, while verification consequences remain mandatory.'
    }
  };

  function setupScrollButtons() {
    document.querySelectorAll('[data-scroll-target]').forEach(button => {
      button.addEventListener('click', () => {
        document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function makeHiDpiCanvas(canvas, draw) {
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, rect.width, rect.height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return resize;
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function initPhaseCanvas() {
    const canvas = document.getElementById('phaseCanvas');
    const detail = document.getElementById('phaseDetail');
    if (!canvas || !detail) return;

    let activeProfile = 'standard';
    let selectedId = 'clarification';
    let dragging = null;
    let pointerOffset = { x: 0, y: 0 };
    let bounds = { width: 0, height: 0 };

    const nodes = PHASES.map((phase, index) => ({ ...phase, x: 0, y: 0, w: 150, h: 82, index }));

    function resetLayout() {
      const mobile = bounds.width < 650;
      nodes.forEach((node, index) => {
        if (mobile) {
          node.x = bounds.width / 2;
          node.y = 65 + index * Math.max(82, (bounds.height - 110) / 5);
        } else {
          const spacing = (bounds.width - 120) / 5;
          node.x = 60 + spacing * index + spacing / 2;
          node.y = bounds.height / 2;
        }
      });
      draw();
    }

    function phaseState(node) {
      const rules = PROFILE_RULES[activeProfile];
      if (rules.enhanced.has(node.id)) return 'enhanced';
      if (rules.required.has(node.id)) return 'required';
      return 'internal';
    }

    function drawArrow(ctx, from, to) {
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      const startX = from.x + Math.cos(angle) * from.w * 0.46;
      const startY = from.y + Math.sin(angle) * from.h * 0.46;
      const endX = to.x - Math.cos(angle) * to.w * 0.46;
      const endY = to.y - Math.sin(angle) * to.h * 0.46;
      ctx.strokeStyle = 'rgba(156,176,189,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.fillStyle = 'rgba(156,176,189,0.75)';
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - Math.cos(angle - Math.PI / 6) * 10, endY - Math.sin(angle - Math.PI / 6) * 10);
      ctx.lineTo(endX - Math.cos(angle + Math.PI / 6) * 10, endY - Math.sin(angle + Math.PI / 6) * 10);
      ctx.closePath();
      ctx.fill();
    }

    function draw(ctxArg,width,height){width=Number.isFinite(width)?width:bounds.width;height=Number.isFinite(height)?height:bounds.height;if(!width||!height)return;bounds={width:width,height:height};
      const ctx = ctxArg || canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(83,211,167,0.04)';
      for (let x = 24; x < width; x += 34) {
        for (let y = 24; y < height; y += 34) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = 0; i < nodes.length - 1; i++) drawArrow(ctx, nodes[i], nodes[i + 1]);

      nodes.forEach(node => {
        const state = phaseState(node);
        const selected = node.id === selectedId;
        const color = state === 'enhanced' ? COLORS.amber : state === 'required' ? COLORS.accent : COLORS.grey;
        ctx.save();
        ctx.shadowColor = selected ? color : 'transparent';
        ctx.shadowBlur = selected ? 22 : 0;
        roundedRect(ctx, node.x - node.w / 2, node.y - node.h / 2, node.w, node.h, 14);
        ctx.fillStyle = selected ? `${color}22` : 'rgba(16,31,44,0.96)';
        ctx.fill();
        ctx.lineWidth = selected ? 2.5 : 1.5;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = color;
        ctx.font = '700 12px ui-monospace, monospace';
        ctx.fillText(node.number, node.x - node.w / 2 + 14, node.y - 16);
        ctx.fillStyle = COLORS.text;
        ctx.font = '700 15px system-ui, sans-serif';
        const titleLines = wrapText(ctx, node.title, node.w - 28);
        titleLines.slice(0, 2).forEach((line, i) => ctx.fillText(line, node.x - node.w / 2 + 14, node.y + 7 + i * 18));
        ctx.fillStyle = COLORS.muted;
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(state === 'internal' ? 'not heading-required' : state, node.x - node.w / 2 + 14, node.y + node.h / 2 - 10);
      });

      const rule = PROFILE_RULES[activeProfile];
      ctx.fillStyle = COLORS.muted;
      ctx.font = '12px system-ui, sans-serif';
      const note = `${rule.label}: ${rule.note}`;
      const lines = wrapText(ctx, note, width - 36);
      lines.slice(0, 2).forEach((line, i) => ctx.fillText(line, 18, 24 + i * 16));
    }

    const resize = makeHiDpiCanvas(canvas, (ctx, width, height) => {
      bounds = { width, height };
      if (nodes.every(n => n.x === 0)) resetLayout();
      else draw(ctx, width, height);
    });

    function hitNode(x, y) {
      return [...nodes].reverse().find(node => Math.abs(x - node.x) <= node.w / 2 && Math.abs(y - node.y) <= node.h / 2);
    }

    function pointFromEvent(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function updateDetail() {
      const phase = PHASES.find(item => item.id === selectedId) || PHASES[0];
      const rules = PROFILE_RULES[activeProfile];
      detail.querySelector('h3').textContent = phase.title;
      detail.querySelector('.detail-summary').textContent = phase.summary;
      detail.querySelector('.detail-evidence').innerHTML = phase.evidence.map(item => `<li>${item}</li>`).join('');
      detail.querySelector('.detail-failure').textContent = phase.failure;
      const status = rules.enhanced.has(phase.id) ? 'Enhanced requirement' : rules.required.has(phase.id) ? 'Required heading' : 'Internal or not heading-required';
      detail.querySelector('.label').textContent = `${rules.label} · ${status}`;
    }

    canvas.addEventListener('pointerdown', event => {
      const point = pointFromEvent(event);
      const node = hitNode(point.x, point.y);
      if (!node) return;
      selectedId = node.id;
      dragging = node;
      pointerOffset = { x: point.x - node.x, y: point.y - node.y };
      canvas.setPointerCapture(event.pointerId);
      updateDetail();
      draw();
    });

    canvas.addEventListener('pointermove', event => {
      const point = pointFromEvent(event);
      if (dragging) {
        dragging.x = Math.max(dragging.w / 2 + 8, Math.min(bounds.width - dragging.w / 2 - 8, point.x - pointerOffset.x));
        dragging.y = Math.max(dragging.h / 2 + 45, Math.min(bounds.height - dragging.h / 2 - 40, point.y - pointerOffset.y));
        draw();
      } else {
        canvas.style.cursor = hitNode(point.x, point.y) ? 'grab' : 'default';
      }
    });

    const stopDrag = event => {
      if (dragging) {
        dragging = null;
        try { canvas.releasePointerCapture(event.pointerId); } catch (_) { /* no-op */ }
      }
    };
    canvas.addEventListener('pointerup', stopDrag);
    canvas.addEventListener('pointercancel', stopDrag);

    document.querySelectorAll('.profile-button').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.profile-button').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        activeProfile = button.dataset.profile;
        document.getElementById('sandboxProfile').value = activeProfile;
        updateDetail();
        draw();
      });
    });

    document.getElementById('resetPhaseLayout')?.addEventListener('click', resetLayout);
    window.addEventListener('orientationchange', () => setTimeout(() => { resize(); resetLayout(); }, 100));
    updateDetail();
  }

  function initSandbox() {
    const form = document.getElementById('sandboxForm');
    const result = document.getElementById('sandboxResult');
    if (!form || !result) return;

    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      const profile = document.getElementById('sandboxProfile').value;
      const verdict = document.getElementById('sandboxVerdict').value;
      const checked = name => data.get(name) === 'on';
      const failures = [];

      if (profile === 'standard' || profile === 'constraint') {
        for (const phase of ['clarification', 'scope', 'plan', 'execution', 'verification']) {
          if (!checked(phase)) failures.push(`Missing required ${phase} evidence.`);
        }
        if (!checked('approval')) failures.push('Approval checkpoint is missing before execution.');
      } else {
        if (!checked('verification')) failures.push('Verification remains heading-required in the silent profile.');
        if (!checked('silentAuthorized')) failures.push('Silent profile authorization is missing.');
      }

      if (!checked('audit')) failures.push('The accepted verification enumeration is incomplete.');
      if (!checked('singleVerdict')) failures.push('Exactly one labeled verdict is required.');
      if (profile === 'constraint') {
        if (!checked('measurable')) failures.push('Constraint-hardened profile requires measurable predicates.');
        if (!checked('skeleton')) failures.push('Constraint-hardened profile requires an output skeleton before execution.');
      }

      const passed = failures.length === 0;
      const badge = result.querySelector('.result-badge');
      badge.className = `result-badge ${passed ? 'pass' : 'fail'}`;
      badge.textContent = passed ? 'Synthetic pass' : 'Synthetic fail';
      result.querySelector('h3').textContent = passed ? 'Gate conditions satisfied' : 'Gate conditions not satisfied';
      result.querySelector('p').textContent = passed
        ? 'The selected evidence satisfies this bounded browser model. Run the real Python gate for an authoritative result.'
        : `${failures.length} blocking condition${failures.length === 1 ? '' : 's'} detected in this bounded browser model.`;
      result.querySelector('ul').innerHTML = (passed ? ['No synthetic blocking findings.'] : failures).map(item => `<li>${item}</li>`).join('');
      document.getElementById('receiptStatus').textContent = passed ? 'passed' : 'failed';
      document.getElementById('receiptVerdict').textContent = verdict;
    });
  }

  function initLineageCanvas() {
    const canvas = document.getElementById('lineageCanvas');
    const detail = document.getElementById('lineageDetail');
    if (!canvas || !detail) return;

    const originalNodes = [
      { id: 'plugin', label: 'Obsidian plugin work', group: 'origin', x: 0.12, y: 0.24, r: 42, summary: 'The public origin account ties the large meta-prompt to work around an Obsidian plugin.', type: 'Origin context', evidence: 'Public first-person account' },
      { id: 'meta', label: 'Giant meta-prompt', group: 'origin', x: 0.27, y: 0.16, r: 44, summary: 'A larger instruction package in which the five-part discipline existed implicitly before compression.', type: 'Precursor artefact', evidence: 'Public origin account' },
      { id: 'article', label: 'Origin article', group: 'origin', x: 0.18, y: 0.48, r: 39, summary: 'Published 26 February 2026. A first-person account of the compression into 5PP.', type: 'Public provenance', evidence: 'Adaptivearts.ai/blog' },
      { id: '5pp', label: '5PP protocol', group: 'core', x: 0.45, y: 0.36, r: 56, summary: 'Clarification, Scope Validation, Reasoning Plan, Execution and Verification.', type: 'Work protocol', evidence: 'Canonical corpus plus later implementations' },
      { id: 'gate', label: '5pp-gate', group: 'mechanization', x: 0.67, y: 0.18, r: 48, summary: 'Deterministic Python compliance gate for recorded 5PP artefacts.', type: 'Mechanical implementation', evidence: 'Source, tests and changelog' },
      { id: 'aics', label: 'AICS', group: 'adoption', x: 0.78, y: 0.36, r: 38, summary: 'Uses 5PP Variation A for instruction-contract hardening and audit.', type: 'Representative adoption', evidence: 'AICS specification and source' },
      { id: 'spine', label: 'SPINE', group: 'adoption', x: 0.65, y: 0.56, r: 40, summary: 'Uses 5PP in project lanes, planning discipline and evidence-oriented execution.', type: 'Representative adoption', evidence: 'SPINE records and documentation' },
      { id: 'changeplane', label: 'ChangePlane', group: 'adoption', x: 0.83, y: 0.63, r: 42, summary: 'Stores 5PP phase steps as first-class protocol records and binds them into the run trace.', type: 'Operationalization', evidence: 'Typed source, schema and tests' },
      { id: 'ccops', label: 'control-center-ops', group: 'adoption', x: 0.48, y: 0.73, r: 45, summary: 'Uses the method in project-change governance, runbooks, handovers and operator workflows.', type: 'Operational use', evidence: 'Vault records and receipts' },
      { id: 'demo', label: 'Historical public demo', group: 'mechanization', x: 0.28, y: 0.75, r: 40, summary: 'An earlier explanatory web demo. Useful for lineage, but superseded by this source-pinned profile for evidence framing.', type: 'Public presentation', evidence: 'From-Blueprint-to-Application' }
    ];

    const edges = [
      ['plugin', 'meta', 'context'], ['meta', '5pp', 'compressed into'], ['5pp', 'article', 'publicly explained'],
      ['5pp', 'gate', 'mechanized by'], ['5pp', 'aics', 'governs'], ['5pp', 'spine', 'used by'],
      ['5pp', 'changeplane', 'recorded by'], ['5pp', 'ccops', 'used by'], ['5pp', 'demo', 'presented by']
    ];

    let nodes = [];
    let activeFilter = 'all';
    let selectedId = '5pp';
    let dragging = null;
    let offset = { x: 0, y: 0 };
    let bounds = { width: 0, height: 0 };

    function resetLayout() {
      nodes = originalNodes.map(node => ({ ...node, px: node.x * bounds.width, py: node.y * bounds.height }));
      draw();
    }

    function visible(node) {
      return activeFilter === 'all' || node.group === activeFilter || node.group === 'core';
    }

    function groupColor(group) {
      if (group === 'origin') return COLORS.blue;
      if (group === 'mechanization') return COLORS.amber;
      if (group === 'adoption') return COLORS.accent;
      return '#f5f7fa';
    }

    function draw(ctxArg,width,height){width=Number.isFinite(width)?width:bounds.width;height=Number.isFinite(height)?height:bounds.height;if(!width||!height)return;bounds={width:width,height:height};
      const ctx = ctxArg || canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(108,168,255,0.09)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 48) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      for (const [fromId, toId, relation] of edges) {
        const from = nodes.find(n => n.id === fromId);
        const to = nodes.find(n => n.id === toId);
        if (!from || !to || !visible(from) || !visible(to)) continue;
        const angle = Math.atan2(to.py - from.py, to.px - from.px);
        const sx = from.px + Math.cos(angle) * from.r;
        const sy = from.py + Math.sin(angle) * from.r;
        const ex = to.px - Math.cos(angle) * to.r;
        const ey = to.py - Math.sin(angle) * to.r;
        ctx.strokeStyle = 'rgba(156,176,189,0.38)';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        const mx = (sx + ex) / 2;
        const my = (sy + ey) / 2;
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillStyle = COLORS.muted;
        ctx.textAlign = 'center';
        ctx.fillText(relation, mx, my - 5);
      }

      for (const node of nodes) {
        if (!visible(node)) continue;
        const color = groupColor(node.group);
        const selected = node.id === selectedId;
        ctx.save();
        ctx.shadowColor = selected ? color : 'transparent';
        ctx.shadowBlur = selected ? 24 : 0;
        ctx.beginPath();
        ctx.arc(node.px, node.py, node.r, 0, Math.PI * 2);
        ctx.fillStyle = selected ? `${color}26` : 'rgba(16,31,44,0.95)';
        ctx.fill();
        ctx.lineWidth = selected ? 3 : 1.5;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = COLORS.text;
        ctx.font = `700 ${node.id === '5pp' ? 14 : 11}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = wrapText(ctx, node.label, node.r * 1.45).slice(0, 3);
        lines.forEach((line, index) => ctx.fillText(line, node.px, node.py + (index - (lines.length - 1) / 2) * 14));
      }
    }

    const resize = makeHiDpiCanvas(canvas, (ctx, width, height) => {
      bounds = { width, height };
      if (!nodes.length) resetLayout();
      else draw(ctx, width, height);
    });

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function hit(x, y) {
      return [...nodes].reverse().find(node => visible(node) && Math.hypot(x - node.px, y - node.py) <= node.r);
    }

    function updateDetail() {
      const node = nodes.find(item => item.id === selectedId) || nodes.find(item => item.id === '5pp');
      if (!node) return;
      detail.querySelector('h3').textContent = node.label;
      detail.querySelector('.detail-summary').textContent = node.summary;
      detail.querySelector('.label').textContent = node.group === 'core' ? 'Central method' : node.group;
      detail.querySelector('.node-metadata').innerHTML = `
        <div><dt>Artefact type</dt><dd>${node.type}</dd></div>
        <div><dt>Evidence basis</dt><dd>${node.evidence}</dd></div>
        <div><dt>Graph scope</dt><dd>Representative, not complete</dd></div>`;
    }

    canvas.addEventListener('pointerdown', event => {
      const p = point(event);
      const node = hit(p.x, p.y);
      if (!node) return;
      selectedId = node.id;
      dragging = node;
      offset = { x: p.x - node.px, y: p.y - node.py };
      canvas.setPointerCapture(event.pointerId);
      updateDetail();
      draw();
    });
    canvas.addEventListener('pointermove', event => {
      const p = point(event);
      if (dragging) {
        dragging.px = Math.max(dragging.r + 8, Math.min(bounds.width - dragging.r - 8, p.x - offset.x));
        dragging.py = Math.max(dragging.r + 8, Math.min(bounds.height - dragging.r - 8, p.y - offset.y));
        draw();
      } else {
        canvas.style.cursor = hit(p.x, p.y) ? 'grab' : 'default';
      }
    });
    const stop = event => {
      if (!dragging) return;
      dragging = null;
      try { canvas.releasePointerCapture(event.pointerId); } catch (_) { /* no-op */ }
    };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);

    document.querySelectorAll('.graph-filter').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.graph-filter').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        activeFilter = button.dataset.filter;
        const selected = nodes.find(node => node.id === selectedId);
        if (!selected || !visible(selected)) selectedId = '5pp';
        updateDetail();
        draw();
      });
    });
    document.getElementById('resetLineageLayout')?.addEventListener('click', resetLayout);
    window.addEventListener('orientationchange', () => setTimeout(() => { resize(); resetLayout(); }, 100));
  }

  function initCharts() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = COLORS.muted;
    Chart.defaults.borderColor = 'rgba(156,176,189,0.18)';
    Chart.defaults.font.family = 'Inter, ui-sans-serif, system-ui, sans-serif';

    const testsContext = document.getElementById('testsChart');
    const evidenceContext = document.getElementById('evidenceChart');
    if (!testsContext || !evidenceContext) return;

    const testsChart = new Chart(testsContext, {
      type: 'line',
      data: {
        labels: ['1.0.0', '1.1.0', '1.2.0', '1.2.1'],
        datasets: [{
          label: 'Source-reported tests',
          data: [107, 131, 135, 139],
          borderColor: COLORS.accent,
          backgroundColor: 'rgba(83,211,167,0.14)',
          pointBackgroundColor: COLORS.accent,
          pointBorderColor: COLORS.bg,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2.5,
          fill: true,
          tension: 0.25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: false, suggestedMin: 100, suggestedMax: 145, title: { display: true, text: 'Tests' } },
          x: { title: { display: true, text: 'Release' } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { afterLabel: context => ['1.0.0: initial release', '1.1.0: H1-H6 hardening', '1.2.0: reconciliation updates', '1.2.1: sidecar guards'][context.dataIndex] } }
        }
      }
    });

    const evidenceChart = new Chart(evidenceContext, {
      type: 'radar',
      data: {
        labels: ['Definition', 'Implementation', 'Mechanical verification', 'Operational use', 'Public provenance', 'External validation'],
        datasets: [{
          label: 'Current source-registry coding',
          data: [4, 4, 4, 4, 4, 0],
          borderColor: COLORS.blue,
          backgroundColor: 'rgba(108,168,255,0.16)',
          pointBackgroundColor: COLORS.blue,
          pointBorderColor: COLORS.bg,
          pointRadius: 4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 4,
            ticks: { stepSize: 1, backdropColor: 'transparent' },
            pointLabels: { color: COLORS.text, font: { size: 11, weight: '600' } },
            grid: { color: 'rgba(156,176,189,0.18)' },
            angleLines: { color: 'rgba(156,176,189,0.18)' }
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true } },
          tooltip: {
            callbacks: {
              afterLabel: context => context.dataIndex === 5
                ? 'No independent effect study identified in the inspected source set.'
                : 'Registry evidence code, not an efficacy measurement.'
            }
          }
        }
      }
    });

    function exportChart(chart, filename) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = chart.toBase64Image('image/png', 1);
      link.click();
    }
    document.getElementById('exportTestsChart')?.addEventListener('click', () => exportChart(testsChart, '5pp-test-growth.png'));
    document.getElementById('exportEvidenceChart')?.addEventListener('click', () => exportChart(evidenceChart, '5pp-evidence-surface.png'));
  }

  setupScrollButtons();
  initPhaseCanvas();
  initSandbox();
  initLineageCanvas();
  initCharts();
})();
