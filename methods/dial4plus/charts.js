(() => {
  'use strict';
  const P=window.Dial4PlusProfile=window.Dial4PlusProfile||{};
  P.initCharts=()=>{
    if(!window.Chart)return;
    Chart.defaults.color='#c9d6df';Chart.defaults.borderColor='rgba(156,176,189,.18)';
    new Chart(document.getElementById('coverageChart'),{type:'bar',data:{labels:['Confidence','Evidence quality','Scope','Strength','Supporting evidence','Weaknesses','Uncertainty'],datasets:[{label:'Conceptual model / framework',data:[1,1,1,0,0,0,1],backgroundColor:'rgba(108,168,255,.58)'},{label:'ChangePlane explicit record field',data:[1,0,0,1,1,1,1],backgroundColor:'rgba(83,211,167,.58)'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{tooltip:{callbacks:{afterBody:()=>['Binary structural coding: explicit surface present = 1.','This is not a quality or efficacy score.']}}},scales:{y:{beginAtZero:true,max:1,ticks:{stepSize:1,callback:v=>v===1?'explicit':'absent'}}}}});
    new Chart(document.getElementById('constraintChart'),{type:'bar',data:{labels:['CLI describes 0..1','Dataclass range check','Schema minimum','Schema maximum','Inspected rejection test'],datasets:[{label:'Present at pinned ChangePlane source',data:[1,0,0,0,0],backgroundColor:['rgba(108,168,255,.58)','rgba(242,127,127,.58)','rgba(242,127,127,.58)','rgba(242,127,127,.58)','rgba(233,183,91,.58)']}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{afterLabel:c=>['Documentation intent is visible in CLI help.','No explicit dataclass validation found.','No minimum keyword in pinned schema.','No maximum keyword in pinned schema.','Inspected MVP-4 tests cover tag switching and flow, not range rejection.'][c.dataIndex]}}},scales:{x:{beginAtZero:true,max:1,ticks:{stepSize:1,callback:v=>v===1?'present':'absent'}}}}});
    document.querySelectorAll('[data-download-chart]').forEach(btn=>btn.addEventListener('click',()=>{const canvas=document.getElementById(btn.dataset.downloadChart),a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download=`${btn.dataset.downloadChart}.png`;a.click()}));
  };
})();
