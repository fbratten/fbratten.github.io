(() => {
  'use strict';
  const ids=['stateCanvas','comparisonCanvas','lineageCanvas'];
  function nudge(canvas){if(!canvas)return;const previous=canvas.style.width;canvas.style.width='calc(100% - 1px)';requestAnimationFrame(()=>{canvas.style.width=previous||'100%'})}
  function stabilize(){ids.forEach(id=>nudge(document.getElementById(id)))}
  window.addEventListener('load',()=>setTimeout(stabilize,0));
  window.addEventListener('orientationchange',()=>setTimeout(stabilize,240));
  ['resetStateLayout','resetComparisonLayout','resetLineageLayout'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(stabilize,0)));
})();
