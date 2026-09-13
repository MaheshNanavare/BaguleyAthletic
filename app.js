/* ---------- header: compact once the page moves ---------- */
const header = document.querySelector('.site-header');

if (header) {
  const setHeaderState = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });
}

/* ---------- fixtures filter (manual fixtures list, currently unpublished) ---------- */
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

/* ---------- FA Full-Time feed (fixtures.html) ---------- */
// The league widget arrives after page load with its own inline styling, some of
// it !important, which no stylesheet can beat. Strip it when the table lands so
// styles.css owns the look, and tag our own fixtures in a division-wide list.
// Only childList is observed, so removing attributes here doesn't re-trigger it.
const feed = document.querySelector('.fa-feed');

if (feed) {
  const tidy = () => {
    feed.querySelectorAll('[style], table, td').forEach((el) => {
      ['style', 'border', 'cellspacing', 'cellpadding', 'align', 'bgcolor', 'width'].forEach((a) => el.removeAttribute(a));
    });
    feed.querySelectorAll('tr').forEach((row) => {
      row.classList.toggle('is-ours', /baguley/i.test(row.textContent));
    });
  };
  new MutationObserver(tidy).observe(feed, { childList: true, subtree: true });
}
