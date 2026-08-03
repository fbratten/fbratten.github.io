(() => {
  'use strict';
  const ids=['modeCanvas','mappingCanvas','collisionCanvas','lineageCanvas'];
  function stabilize(){ids.forEach(id=>{const c=document.getElementById(id);if(!c)return;const old=c.style.width;c.style.width='calc(100% - 1px)';requestAnimationFrame(()=>{c.style.width=old||'100%';});});}
  window.addEventListener('load',()=>setTimeout(stabilize,0));
  window.addEventListener('resize',()=>setTimeout(stabilize,100));
  window.addEventListener('orientationchange',()=>setTimeout(stabilize,240));
  ['resetModeLayout','resetMappingLayout','resetCollisionLayout','resetLineageLayout'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(stabilize,0)));
})();
