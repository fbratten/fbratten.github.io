(() => {
  'use strict';
  const P = window.Dial4PPossibility = window.Dial4PPossibility || {};
  P.initCharts = () => {
    if (!window.Chart) return;
    Chart.defaults.color = '#c9d6df';
    Chart.defaults.borderColor = 'rgba(156,176,189,.18)';

    new Chart(document.getElementById('statusChart'), {
      type: 'bar',
      data: {
        labels: ['Full operating prompt', 'Public article subset'],
        datasets: [{ label: 'Explicit status labels', data: [9, 6], backgroundColor: ['rgba(83,211,167,.58)','rgba(108,168,255,.58)'] }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { afterLabel: c => c.dataIndex === 0 ? 'Includes Could Be, Impossible Under Current Constraints and Out of Scope.' : 'Condensed public explanation; not a replacement taxonomy.' } } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, title: { display: true, text: 'count' } } }
      }
    });

    new Chart(document.getElementById('contractChart'), {
      type: 'bar',
      data: {
        labels: ['Master required structure', 'Later Output Schema'],
        datasets: [{ label: 'Top-level sections', data: [10, 9], backgroundColor: ['rgba(178,147,255,.58)','rgba(233,183,91,.58)'] }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { afterLabel: c => c.dataIndex === 0 ? 'Includes separate What Exists / What Could Be / What Is Blocked and Final Structured Verdict.' : 'Introduces What Must Not Be Collapsed Prematurely and condenses other sections.' } } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, title: { display: true, text: 'sections' } } }
      }
    });

    new Chart(document.getElementById('compositionChart'), {
      type: 'radar',
      data: {
        labels: ['Claim typing', 'Strength grading', 'Document routing', 'Process governance', 'Mechanical enforcement'],
        datasets: [{
          label: 'Explicitly represented surface',
          data: [1,1,1,1,0],
          backgroundColor: 'rgba(83,211,167,.16)', borderColor: 'rgba(83,211,167,.78)', pointBackgroundColor: 'rgba(83,211,167,.9)'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { r: { beginAtZero: true, min: 0, max: 1, ticks: { stepSize: 1, display: false } } },
        plugins: { tooltip: { callbacks: { afterLabel: c => c.dataIndex === 4 ? 'No separate executable validator or machine-enforced status schema was identified.' : 'The source model explicitly represents this layer.' } } }
      }
    });

    document.querySelectorAll('[data-download-chart]').forEach(btn => btn.addEventListener('click', () => {
      const canvas = document.getElementById(btn.dataset.downloadChart), link = document.createElement('a');
      link.href = canvas.toDataURL('image/png'); link.download = `${btn.dataset.downloadChart}.png`; link.click();
    }));
  };
})();
