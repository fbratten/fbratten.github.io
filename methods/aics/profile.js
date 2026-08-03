(() => {
  'use strict';
  const A=window.AICSProfile;
  A.setupScroll();
  A.initGraph({canvasId:'atomCanvas',detailId:'atomDetail',resetId:'resetAtomLayout',nodes:A.atomNodes,edges:A.atomEdges,filterSelector:'.atom-filter',defaultSelected:'contract'});
  A.initGraph({canvasId:'projectionCanvas',detailId:'projectionDetail',resetId:'resetProjectionLayout',nodes:A.projectionNodes,edges:A.projectionEdges,defaultSelected:'contract'});
  A.initGraph({canvasId:'conformanceCanvas',detailId:'conformanceDetail',resetId:'resetConformanceLayout',nodes:A.conformanceNodes,edges:A.conformanceEdges,defaultSelected:'core'});
  A.initGraph({canvasId:'lineageCanvas',detailId:'lineageDetail',resetId:'resetLineageLayout',nodes:A.lineageNodes,edges:A.lineageEdges,filterSelector:'.lineage-filter',defaultSelected:'v02'});
  A.initPhaseGateLab();A.initRoundTripLab();A.initChangesetLab();A.initCharts();
})();
