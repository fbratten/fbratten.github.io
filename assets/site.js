// The full navigation and article directory remain available without JavaScript.
const menu = document.querySelector('.fb-menu-panel');
const toggle = document.querySelector('.fb-menu-button');
if (menu && toggle) {
  const mobile = window.matchMedia('(max-width: 1100px)');
  const setOpen = open => {
    menu.hidden = mobile.matches && !open;
    toggle.setAttribute('aria-expanded', String(!menu.hidden));
    toggle.textContent = mobile.matches && open ? 'Close' : 'Menu';
  };
  const resize = () => { toggle.hidden = !mobile.matches; setOpen(false); };
  toggle.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', event => {
    if (mobile.matches && event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  mobile.addEventListener('change', resize);
  resize();
}

const filters = document.querySelector('.fb-filters');
if (filters) {
  const input = filters.querySelector('input');
  const select = filters.querySelector('select');
  const cards = [...document.querySelectorAll('[data-article]')];
  const count = document.querySelector('.fb-filter-count');
  const empty = document.querySelector('.fb-no-results');
  const filter = () => {
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const card of cards) {
      card.hidden = !(card.textContent.toLocaleLowerCase().includes(query)
        && (!select.value || card.dataset.category === select.value));
      if (!card.hidden) visible++;
    }
    count.textContent = `${visible} of ${cards.length} articles`;
    empty.hidden = visible !== 0;
  };
  filters.hidden = false;
  input.addEventListener('input', filter);
  select.addEventListener('change', filter);
  filters.addEventListener('submit', event => event.preventDefault());
  filter();
}

// Category links retain their ordinary anchor behavior without JavaScript.
const projectCategories = document.querySelector('.fb-project-categories');
if (projectCategories) {
  const tabs = [...projectCategories.querySelectorAll('[data-project-category]')];
  const panels = tabs.map(tab => document.getElementById(tab.dataset.projectCategory));
  projectCategories.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    const panel = panels[index];
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    const count = panel.querySelectorAll('.fb-route, .fb-project-row, .fb-building').length;
    tab.querySelector('[data-project-count]').textContent = count;
  });
  const activate = (id, update = false) => {
    const selected = tabs.find(tab => tab.dataset.projectCategory === id) || tabs[0];
    tabs.forEach((tab, index) => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });
    if (update && location.hash !== '#' + selected.dataset.projectCategory) history.pushState(null, '', '#' + selected.dataset.projectCategory);
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); activate(tab.dataset.projectCategory, true);
    });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault(); tabs[next].focus(); activate(tabs[next].dataset.projectCategory, true);
      }
    });
  });
  window.addEventListener('hashchange', () => activate(location.hash.slice(1)));
  window.addEventListener('popstate', () => activate(location.hash.slice(1)));
  activate(location.hash.slice(1));
}
