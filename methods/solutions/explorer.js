(() => {
  const form = document.querySelector('#solution-filters');
  const cards = [...document.querySelectorAll('.solution')];
  const fields = ['problem', 'stage', 'scale'].map(id => document.getElementById(id));
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#no-results');

  function apply(writeUrl = false) {
    let visible = 0;
    for (const card of cards) {
      card.hidden = !fields.every(field => !field.value || card.dataset[field.id].split(' ').includes(field.value));
      if (!card.hidden) visible += 1;
    }
    count.textContent = `${visible} of ${cards.length} patterns match. Filters combine across all three dimensions.`;
    empty.hidden = visible !== 0;
    if (writeUrl) {
      const url = new URL(location.href);
      fields.forEach(field => field.value ? url.searchParams.set(field.id, field.value) : url.searchParams.delete(field.id));
      url.hash = '';
      history.replaceState(null, '', url);
    }
  }

  function restore() {
    const params = new URLSearchParams(location.search);
    fields.forEach(field => {
      const value = params.get(field.id) || '';
      field.value = [...field.options].some(option => option.value === value) ? value : '';
    });
    // A direct pattern link takes precedence over a filter that would hide it.
    if (cards.some(card => `#${card.id}` === location.hash)) fields.forEach(field => { field.value = ''; });
    apply();
  }

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('change', () => apply(true));
  form.addEventListener('reset', event => {
    event.preventDefault();
    fields.forEach(field => { field.value = ''; });
    apply(true);
  });
  window.addEventListener('popstate', restore);
  window.addEventListener('hashchange', restore);
  restore();
  form.hidden = false;
})();
