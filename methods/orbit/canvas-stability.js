(() => {
  'use strict';
  const ids = ['nodeCanvas', 'planesCanvas', 'lineageCanvas'];
  function applyResponsiveHeight() {
    const panel = document.getElementById('nodeCanvas')?.parentElement;
    if (!panel) return;
    panel.style.minHeight = window.innerWidth < 700 ? '66rem' : '';
  }
  function nudge(canvas) {
    if (!canvas) return;
    const previous = canvas.style.width;
    canvas.style.width = 'calc(100% - 1px)';
    requestAnimationFrame(() => { canvas.style.width = previous || '100%'; });
  }
  function stabilize() {
    applyResponsiveHeight();
    ids.forEach(id => nudge(document.getElementById(id)));
  }
  window.addEventListener('load', () => setTimeout(stabilize, 0));
  window.addEventListener('resize', () => setTimeout(stabilize, 80));
  window.addEventListener('orientationchange', () => setTimeout(stabilize, 240));
  ['resetNodeLayout', 'resetPlaneLayout', 'resetLineageLayout'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => setTimeout(stabilize, 0));
  });
})();
