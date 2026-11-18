import * as THREE from '../vendor/three.module.min.js';
import { OrbitControls } from '../vendor/OrbitControls.js';

// Vertex's perspective camera, orbit controls, faceted nodes and curved links.
// Project the meshes onto a canvas so the directory also works without a GPU.
const map = document.getElementById('site-map');
const stage = map.querySelector('.cm-stage');
const canvas = map.querySelector('canvas');
const context = canvas.getContext('2d');
if (context) startMap();

function startMap() {
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
  camera.position.set(0, 0, 15);
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = .62;
  controls.minPolarAngle = Math.PI * .20;
  controls.maxPolarAngle = Math.PI * .80;
  canvas.style.touchAction = 'pan-y';
  const preview = map.querySelector('.cm-preview');
  const previewLink = preview.querySelector('a');
  const tools = map.querySelector('.cm-tools');
  const keyLight = new THREE.Vector3(-.5, .8, 1).normalize();

  // Coordinates describe the opening composition. The last value creates real depth.
  const layout = {
    projects:   [[.19,.31], [.24,.10],  .9, 'cube'],
    methods:    [[.38,.16], [.69,.13], -.8, 'oct'],
    labs:       [[.62,.14], [.28,.27],  .4, 'tetra'],
    harnessing: [[.81,.31], [.73,.32], -.9, 'icosa'],
    creative:   [[.86,.59], [.73,.56],  .8, 'torus'],
    writing:    [[.69,.78], [.74,.76], -.3, 'oct'],
    studio:     [[.46,.80], [.33,.88],  .7, 'cube'],
    log:        [[.24,.72], [.22,.68], -.6, 'tetra'],
    proofs:     [[.12,.52], [.23,.48], -.2, 'diamond'],
    directory:  [[.49,.46], [.51,.42], 1.4, 'core']
  };
  const solids = {
    cube: new THREE.BoxGeometry(1.45,1.45,1.45),
    oct: new THREE.OctahedronGeometry(1.12),
    tetra: new THREE.TetrahedronGeometry(1.27),
    icosa: new THREE.IcosahedronGeometry(1),
    diamond: new THREE.OctahedronGeometry(1.06).scale(.84,1.24,.84),
    torus: new THREE.TorusGeometry(.79,.28,6,12),
    core: new THREE.IcosahedronGeometry(1.34)
  };
  const nodes = Array.from(map.querySelectorAll('.cm-node'), (link, index) => {
    const {node:id,color} = link.dataset;
    const [wide,narrow,depth,shape] = layout[id];
    const mesh = new THREE.Mesh(solids[shape]);
    mesh.rotation.set(.33 + index * .075, .48 + index * .37, id === 'creative' ? -.42 : .12);
    return {id,link,color,mesh,wide,narrow,depth};
  });
  const byId = new Map(nodes.map(node => [node.id,node]));
  const edges = [
    ['directory','projects'], ['directory','methods'], ['directory','labs'],
    ['directory','harnessing'], ['directory','creative'], ['directory','writing'],
    ['directory','studio'], ['directory','log'], ['directory','proofs'],
    ['projects','proofs'], ['methods','labs'], ['labs','harnessing'],
    ['harnessing','methods'], ['writing','studio'], ['projects','log']
  ];
  const starField = Array.from({length:145}, (_,i) => ({
    x: (Math.sin(i*138.3+1)*980.32)%1, y:(Math.sin(i*47.7+7)*843.45)%1,
    radius: i%11===0 ? 1.15 : .58
  }));
  let width=1, height=1, span=1, active=null, pinned=false, frame=0;
  const vector = new THREE.Vector3();
  function project(world) {
    vector.copy(world).project(camera);
    return {x:(vector.x+1)*width/2, y:(1-vector.y)*height/2, z:vector.z};
  }
  function invalidate() {
    if (!frame) frame=requestAnimationFrame(draw);
  }
  function resize() {
    width=stage.clientWidth; height=stage.clientHeight;
    const dpr=Math.min(window.devicePixelRatio || 1,2);
    canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
    context.setTransform(dpr,0,0,dpr,0,0);
    camera.aspect=width/height; camera.updateProjectionMatrix();
    span=2*15*Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
    nodes.forEach(node => {
      const [x,y]=width<600 ? node.narrow : node.wide;
      const scale=(15-node.depth)/15;
      node.mesh.position.set((x-.5)*span*camera.aspect*scale,(.5-y)*span*scale,node.depth);
      node.mesh.scale.setScalar(span/height*(node.id==='directory' ? 20 : 15)*scale);
      node.mesh.updateMatrixWorld();
    });
    hidePreview(); invalidate();
  }
  function path(points, stroke, lineWidth=1) {
    context.beginPath();
    points.forEach(({x,y},i)=>i ? context.lineTo(x,y) : context.moveTo(x,y));
    context.strokeStyle=stroke; context.lineWidth=lineWidth; context.stroke();
  }
  function orbitLine(radius, tilt, spin, color) {
    const rotation=new THREE.Euler(tilt,.08,spin);
    const pts=[];
    for(let i=0;i<=100;i++) {
      const a=i*Math.PI/50;
      pts.push(project(new THREE.Vector3(radius*Math.cos(a),radius*Math.sin(a),0).applyEuler(rotation)));
    }
    path(pts,color);
  }
  function drawSolid(node) {
    const mesh=node.mesh, geo=mesh.geometry, pos=geo.attributes.position;
    const points=Array.from({length:pos.count}, (_,i)=>project(new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld)));
    const faces=[], index=geo.index, normals=geo.attributes.normal;
    for(let i=0;i<(index ? index.count : pos.count);i+=3){
      const ids=index ? [index.getX(i),index.getX(i+1),index.getX(i+2)] : [i,i+1,i+2];
      const [a,b,c]=ids.map(j=>points[j]);
      if((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)>=0) continue;
      const normal=new THREE.Vector3().fromBufferAttribute(normals,ids[0]).applyQuaternion(mesh.quaternion);
      const color=new THREE.Color(node.color).multiplyScalar(.43+.78*Math.max(0,normal.dot(keyLight)));
      faces.push({a,b,c,z:a.z+b.z+c.z,color:color.getStyle()});
    }
    faces.sort((a,b)=>b.z-a.z);
    for(const f of faces){
      context.beginPath(); context.moveTo(f.a.x,f.a.y);context.lineTo(f.b.x,f.b.y);context.lineTo(f.c.x,f.c.y);context.closePath();
      context.fillStyle=f.color;context.fill();
      context.strokeStyle=node.id==='directory' ? '#fff2c151' : '#ecf4ff28';context.lineWidth=.65;context.stroke();
    }
  }
  function draw() {
    frame=0; camera.updateMatrixWorld(); context.clearRect(0,0,width,height);
    for(const s of starField){
      context.beginPath();context.arc((s.x+1)*width/2,(s.y+1)*height/2,s.radius,0,2*Math.PI);
      context.fillStyle=s.radius>1 ? '#b6cbe482' : '#9cbed05c';context.fill();
    }
    const radius=span*Math.min(camera.aspect*.46,.75);
    context.setLineDash([2,5]);
    orbitLine(radius,1.06,.24,'#7899b34a');
    orbitLine(radius*.83,.85,-.30,'#6988ae3d');
    context.setLineDash([]);
    for(const [aid,bid] of edges){
      const a=byId.get(aid),b=byId.get(bid),start=a.mesh.position,end=b.mesh.position;
      const mid=start.clone().lerp(end,.5); mid.y+=.36;mid.z+=.37;
      const curve=new THREE.QuadraticBezierCurve3(start,mid,end);
      const selected=a===active || b===active;
      path(curve.getPoints(22).map(project),selected ? active.color+'b5' : aid==='directory' ? '#7795b960' : '#6a92a14a',selected ? 1.7 : 1);
    }
    for(const n of nodes) n.screen=project(n.mesh.position);
    const sorted=[...nodes].sort((a,b)=>b.screen.z-a.screen.z);
    for(const [order,n] of sorted.entries()){
      const {x,y}=n.screen;
      const glow=context.createRadialGradient(x,y,1,x,y,n===active ? 43 : 34);
      glow.addColorStop(0,n.color+'38');glow.addColorStop(1,n.color+'00');
      context.fillStyle=glow;context.fillRect(x-44,y-44,88,88);
      if(n.id==='directory' || n===active){
        context.beginPath();context.ellipse(x,y,29,11,-.33,0,Math.PI*2);context.strokeStyle=n.color+'96';context.lineWidth=1;context.stroke();
      }
      drawSolid(n);
      n.link.style.transform='translate('+x+'px,'+y+'px) translate(-50%,-18px)';
      n.link.style.zIndex=String(order+1);
    }
  }

  function hidePreview() {
    if(active) active.link.classList.remove('cm-active');
    active=null;pinned=false;preview.hidden=true;preview.classList.remove('cm-pinned');invalidate();
  }
  function place(x,y) {
    const gap=14, w=preview.offsetWidth,h=preview.offsetHeight;
    let left=x+gap, top=y+gap;
    if(left+w>width-8) left=x-w-gap;
    if(top+h>height-8) top=y-h-gap;
    preview.style.left=Math.max(8,Math.min(left,width-w-8))+'px';
    preview.style.top=Math.max(8,Math.min(top,height-h-8))+'px';
  }
  function show(node,x,y,pin=false) {
    if(active!==node || pinned!==pin){
      if(active) active.link.classList.remove('cm-active');
      active=node;pinned=pin;node.link.classList.add('cm-active');
      preview.querySelector('img').src=node.link.dataset.image;
      preview.querySelector('strong').textContent=node.link.textContent;
      preview.querySelector('p').textContent=node.link.dataset.preview;
      previewLink.href=node.link.href;previewLink.hidden=!pin;
      preview.classList.toggle('cm-pinned',pin);preview.hidden=false;invalidate();
    }
    place(x,y);
  }
  function pointerPosition(event){
    const rect=stage.getBoundingClientRect();
    return [event.clientX-rect.left,event.clientY-rect.top];
  }
  let lastTouch=null;
  for(const n of nodes){
    const link=n.link;
    link.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch') show(n,...pointerPosition(e));});
    link.addEventListener('pointermove',e=>{if(e.pointerType!=='touch' && active===n && !pinned) place(...pointerPosition(e));});
    link.addEventListener('pointerleave',()=>{if(!pinned && active===n) hidePreview();});
    link.addEventListener('pointerdown',e=>{lastTouch=e.pointerType==='touch' ? n : null;});
    link.addEventListener('focus',()=>{if(link.matches(':focus-visible') && n.screen) show(n,n.screen.x,n.screen.y+25);});
    link.addEventListener('blur',()=>{if(!pinned && active===n) hidePreview();});
    link.addEventListener('click',e=>{
      if(lastTouch===n && e.detail>0 && !(pinned && active===n)){
        e.preventDefault();show(n,n.screen.x,n.screen.y+24,true);
      }
      lastTouch=null;
    });
  }
  document.addEventListener('pointerdown',e=>{if(pinned && !preview.contains(e.target) && !e.target.closest('.cm-node')) hidePreview();});
  map.addEventListener('keydown',e=>{if(e.key==='Escape') hidePreview();});
  controls.addEventListener('start',hidePreview);
  controls.addEventListener('change',invalidate);
  tools.querySelector('button').addEventListener('click',()=>{controls.reset();hidePreview();});
  controls.saveState();
  canvas.hidden=false;tools.hidden=false;map.classList.add('cm-ready');
  new ResizeObserver(resize).observe(stage);
  resize();
}
