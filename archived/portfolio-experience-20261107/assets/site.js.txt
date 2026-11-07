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
