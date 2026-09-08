/* ---------- header: compact once the page moves ---------- */
const header = document.querySelector('.site-header');

if (header) {
  const setHeaderState = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });
}

/* ---------- fixtures filter (fixtures.html) ---------- */
const filters = document.querySelectorAll('.filter');
const fixtures = document.querySelectorAll('.fixture');
const months = document.querySelectorAll('.month');
const count = document.querySelector('.fixture-count');
const empty = document.querySelector('.no-results');

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const selected = filter.dataset.filter;

    filters.forEach((item) => item.classList.toggle('active', item === filter));

    let shown = 0;
    fixtures.forEach((fixture) => {
      const match = selected === 'all' || fixture.dataset.venue === selected;
      fixture.hidden = !match;
      if (match) shown += 1;
    });

    // a month heading with nothing left under it is just a stray label
    months.forEach((month) => {
      month.hidden = !month.querySelector('.fixture:not([hidden])');
    });

    if (count) {
      count.textContent = `${shown} ${shown === 1 ? 'fixture' : 'fixtures'}`;
    }
    if (empty) {
      empty.hidden = shown > 0;
    }
  });
});

/* The hero orbit is CSS-driven — it pauses on hover and parks itself under
   prefers-reduced-motion without needing script. */
