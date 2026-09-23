/* ---------- FA Full-Time feed (loaded by FaFeed.astro) ---------- */
// The league widget arrives after page load with its own inline styling, some of
// it !important, which no stylesheet can beat. Strip it when the table lands so
// global.css owns the look, and tag our own fixtures in the fallback table.
// Only childList is observed, so removing attributes here doesn't re-trigger it.
//
// Once tidied, the table is read back into a season sheet (.matchdays), rendered as a
// sibling of .fa-feed so writing it can't re-trigger the observer: the next match as a
// black panel, then the games still to play and the results, each grouped by month.
// If the feed's row shapes ever change and nothing parses, the sheet isn't built and
// the tidied table stays on show with its own styling as the fallback.
import { OURS, esc, readFeed, season, isResult, nextGame } from './fa-read.js';

const feed = document.querySelector('.fa-feed');

const MARKS = { won: ['W', 'Won'], drawn: ['D', 'Drawn'], lost: ['L', 'Lost'], postponed: ['P', 'Postponed'], abandoned: ['A', 'Abandoned'], pending: ['?', 'Result to come'], other: ['–', 'Result'] };
const NOTES = { postponed: 'Postponed', abandoned: 'Abandoned', pending: 'Result to come' };

const mark = (state) => `<span class="fx-mark is-${state}" title="${MARKS[state][1]}"><span aria-hidden="true">${MARKS[state][0]}</span><span class="visually-hidden">${MARKS[state][1]}</span></span>`;
const sideTag = (g) => `<span class="fx-side is-${g.homeOurs ? 'home' : 'away'}">${g.homeOurs ? 'Home' : 'Away'}</span>`;
const monthName = (date) => date.toLocaleDateString('en-GB', { month: 'long' });

const row = (g, showDate) => {
  const scored = isResult(g) || g.state === 'other';
  const goals = (score) => (scored ? `<b class="fx-goals">${esc(score)}</b>` : '');
  const tag = g.href ? 'a' : 'div';
  const href = g.href ? ` href="${esc(g.href)}" target="_blank" rel="noopener"` : '';
  const note = NOTES[g.state] ? `<span class="fx-note">${NOTES[g.state]}</span>` : '';
  return `
    <li${showDate ? '' : ' class="is-same-day"'}>
      <${tag} class="fx-row"${href}>
        <span class="fx-date">${showDate ? `<b>${g.date.getDate()}</b> ${esc(g.weekday)}` : ''}</span>
        ${g.state === 'upcoming' ? `<span class="fx-kick">${esc(g.time)}</span>` : mark(g.state)}
        <span class="fx-tie">
          <span class="fx-team fx-home"><span class="fx-name">${esc(g.home)}</span>${goals(g.homeScore)}</span>
          <span class="fx-sep" aria-hidden="true">${scored ? '–' : 'v'}</span>
          <span class="fx-team fx-away"><span class="fx-name">${esc(g.away)}</span>${goals(g.awayScore)}</span>
        </span>
        <span class="fx-meta">${sideTag(g)}${g.comp ? `<span class="fx-comp">${esc(g.comp)}</span>` : ''}<span class="fx-venue">${esc(g.venue)}</span>${note}</span>
      </${tag}>
    </li>`;
};

// games grouped under a month label; a second game on the same day drops its date
const byMonth = (games) => {
  const months = [];
  games.forEach((g) => {
    const key = `${g.date.getFullYear()}-${g.date.getMonth()}`;
    if (months.at(-1)?.key !== key) months.push({ key, name: monthName(g.date), games: [] });
    months.at(-1).games.push(g);
  });
  return months.map((m) => `
    <h3 class="fx-month">${m.name}</h3>
    <ul class="fx-list">${m.games.map((g, i) => row(g, i === 0 || +g.date !== +m.games[i - 1].date)).join('')}</ul>`).join('');
};

const nextMatch = (g, division) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const away = Math.round((g.date - today) / 864e5);
  const when = away === 0 ? 'Today' : away === 1 ? 'Tomorrow' : `In ${away} days`;
  const tag = g.href ? 'a' : 'div';
  const href = g.href ? ` href="${esc(g.href)}" target="_blank" rel="noopener"` : '';
  // long club names ("Elton & Walshaw FC U18 Sunday") step the display size down
  const long = Math.max(g.home.length, g.away.length) > 22 ? ' is-long' : '';
  return `
    <section class="nm">
      <${tag} class="nm-board${long}"${href}>
        <span class="net" aria-hidden="true"></span>
        <span class="label">Next match</span>
        <span class="nm-teams">
          <span class="nm-name">${esc(g.home)}</span>
          <span class="nm-c">
            <span class="nm-kick">${esc(g.time)}</span>
            <span class="nm-day">${g.date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </span>
          <span class="nm-name nm-away">${esc(g.away)}</span>
        </span>
        <span class="nm-meta">
          ${sideTag(g)}<span class="nm-venue">${esc(g.venue)}</span>
          <span class="nm-comp">${esc(g.comp || division)}</span>
          <span class="nm-when">${when}</span>
        </span>
      </${tag}>
    </section>`;
};

const renderSheet = ({ days, links }, division) => {
  const games = season(days);
  const upcoming = games.filter((g) => g.ahead);
  const next = nextGame(games);
  // results read newest first, as they would on a club noticeboard
  const past = games.filter((g) => !g.ahead).reverse();
  const form = past.filter(isResult).slice(0, 5).reverse();
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  const LINK_NAMES = { Table: 'League table', League: 'All division fixtures' };
  const extra = links.map((l) => `<a class="text-link" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(LINK_NAMES[l.text] || l.text)}</a>`).join('');

  return `
    ${next ? nextMatch(next, division) : ''}
    ${upcoming.length ? `
    <section class="fx-block">
      <h2 class="fx-head">Still to play <span class="fx-aside">${plural(upcoming.length, 'game')}</span></h2>
      ${byMonth(upcoming)}
    </section>` : ''}
    ${past.length ? `
    <section class="fx-block">
      <h2 class="fx-head">Results ${form.length ? `<span class="fx-aside fx-form">Form<span class="visually-hidden">, oldest first:</span> ${form.map((g) => mark(g.state)).join('')}</span>` : ''}</h2>
      ${byMonth(past)}
    </section>` : ''}
    ${extra ? `<p class="fx-links">${extra}</p>` : ''}`;
};

// on a phone the team tabs scroll sideways; start with the current team in view
const tabs = document.querySelector('.team-tabs');
const current = tabs && tabs.querySelector('[aria-current]');
if (current && tabs.scrollWidth > tabs.clientWidth) tabs.scrollLeft = current.offsetLeft - 16;

if (feed) {
  const sheet = document.createElement('div');
  sheet.className = 'matchdays';
  sheet.setAttribute('aria-live', 'polite');
  feed.after(sheet);

  const tidy = () => {
    feed.querySelectorAll('[style], table, td').forEach((el) => {
      ['style', 'border', 'cellspacing', 'cellpadding', 'align', 'bgcolor', 'width'].forEach((a) => el.removeAttribute(a));
    });
    feed.querySelectorAll('tr').forEach((row) => {
      row.classList.toggle('is-ours', OURS.test(row.textContent));
    });

    const parsed = readFeed(feed);
    const built = parsed.days.length > 0;
    if (built) sheet.innerHTML = renderSheet(parsed, feed.dataset.division || 'League');
    feed.classList.toggle('is-read', built);
    sheet.hidden = !built;
  };
  sheet.hidden = true;
  new MutationObserver(tidy).observe(feed, { childList: true, subtree: true });
  // this runs as a deferred module, so the table may already have landed
  if (feed.querySelector('table')) tidy();
}
