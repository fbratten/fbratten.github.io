(() => {
  'use strict';
  const boot=()=>{const P=window.Dial4PlusProfile;P.setupScroll();P.initGraph({canvasId:'axisCanvas',detailId:'axisDetail',resetId:'resetAxisLayout',nodes:P.axisNodes,edges:P.axisEdges,filterSelector:'[data-axis-filter]',defaultSelected:'claim'});P.initGraph({canvasId:'mappingCanvas',detailId:'mappingDetail',resetId:'resetMappingLayout',nodes:P.mappingNodes,edges:P.mappingEdges,defaultSelected:'concept'});P.initGraph({canvasId:'recordCanvas',detailId:'recordDetail',resetId:'resetRecordLayout',nodes:P.recordNodes,edges:P.recordEdges,defaultSelected:'claim'});P.initGraph({canvasId:'lineageCanvas',detailId:'lineageDetail',resetId:'resetLineageLayout',nodes:P.lineageNodes,edges:P.lineageEdges,defaultSelected:'model'});P.initCalibration();P.initScopeStress();P.initSchemaBoundary();P.initCharts();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
