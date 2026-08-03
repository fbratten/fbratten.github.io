(() => {
  'use strict';
  const ids = ['stackCanvas','statusCanvas','pathwayCanvas','boundaryCanvas'];
  function stabilize() {
    ids.forEach(id => {
      const canvas = document.getElementById(id); if (!canvas) return;
      const old = canvas.style.width; canvas.style.width = 'calc(100% - 1px)';
      requestAnimationFrame(() => { canvas.style.width = old || '100%'; });
    });
  }
  window.addEventListener('load', () => setTimeout(stabilize, 0));
  window.addEventListener('resize', () => setTimeout(stabilize, 100));
  window.addEventListener('orientationchange', () => setTimeout(stabilize, 240));
  ['resetStackLayout','resetStatusLayout','resetPathwayLayout','resetBoundaryLayout'].forEach(id => document.getElementById(id)?.addEventListener('click', () => setTimeout(stabilize, 0)));
})();
