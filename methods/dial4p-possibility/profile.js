(() => {
  'use strict';
  const boot = () => {
    const P = window.Dial4PPossibility;
    P.setupScroll();
    P.initGraph({canvasId:'stackCanvas',detailId:'stackDetail',resetId:'resetStackLayout',nodes:P.stackNodes,edges:P.stackEdges,filterSelector:'[data-stack-filter]',defaultSelected:'state'});
    P.initGraph({canvasId:'statusCanvas',detailId:'statusDetail',resetId:'resetStatusLayout',nodes:P.statusNodes,edges:P.statusEdges,filterSelector:'[data-status-filter]',defaultSelected:'could'});
    P.initGraph({canvasId:'pathwayCanvas',detailId:'pathwayDetail',resetId:'resetPathwayLayout',nodes:P.pathwayNodes,edges:P.pathwayEdges,defaultSelected:'possibility'});
    P.initGraph({canvasId:'boundaryCanvas',detailId:'boundaryDetail',resetId:'resetBoundaryLayout',nodes:P.boundaryNodes,edges:P.boundaryEdges,defaultSelected:'warning'});
    P.initClassifier(); P.initDivisionBuilder(); P.initCollapseLab(); P.initCharts();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
