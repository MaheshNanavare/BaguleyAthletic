/* ---------- FA Full-Time feed (loaded by FaFeed.astro) ---------- */
// The league widget arrives after page load with its own inline styling, some of
// it !important, which no stylesheet can beat. Strip it when the table lands so
// global.css owns the look, and tag our own fixtures in a division-wide list.
// Only childList is observed, so removing attributes here doesn't re-trigger it.
//
// Once tidied, the table is read back into a matchday sheet (.matchdays), rendered
// as a sibling of .fa-feed so writing it can't re-trigger the observer. If the feed's
// row shapes ever change and nothing parses, the sheet isn't built and the tidied
// table stays on show with its own styling as the fallback.
const feed = document.querySelector('.fa-feed');

const COMPETITIONS = { PD: 'Premier Division' };
const ACRONYMS = /^(AFC|FC|JFC|ARLFC|4G|3G|MUFC|YMCA|FA)$/;

// the feed shouts venue names; bring the all-caps words back to title case
const venueCase = (text) => text.split(' ').map((word) => {
  if (ACRONYMS.test(word) || word !== word.toUpperCase() || word.length < 2) return word;
  return word.charAt(0) + word.slice(1).toLowerCase();
}).join(' ');

const esc = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cellText = (td) => (td ? td.textContent.replace(/\s+/g, ' ').trim() : '');

const readFeed = () => {
  const days = [];
  const links = [];
  let slot = null;

  feed.querySelectorAll('table tr').forEach((row) => {
    const cells = [...row.children].filter((el) => el.tagName === 'TD');
    if (cells.length === 1 && cells[0].colSpan > 1) {
      // either a date row, or the closing row of League | Table links
      const date = /^(\w{3})\w*\s+(\d{1,2})\s+(\w+)\s+(\d{4})\s*(\d{1,2}:\d{2})?/.exec(cellText(cells[0]));
      if (!date) {
        cells[0].querySelectorAll('a').forEach((a) => {
          if (cellText(a)) links.push({ href: a.href, text: cellText(a) });
        });
        return;
      }
      const [, weekday, day, month, year, time] = date;
      const key = `${day} ${month} ${year}`;
      let entry = days.find((d) => d.key === key);
      if (!entry) {
        entry = { key, weekday, day, month, slots: [] };
        days.push(entry);
      }
      slot = entry.slots.find((s) => s.time === (time || 'TBC'));
      if (!slot) {
        slot = { time: time || 'TBC', games: [] };
        entry.slots.push(slot);
      }
    } else if (cells.length >= 4 && slot) {
      // Comp and home are always cells[0]/[1]; venue is always the last cell and away the
      // one before it. Between home and away sits either just a separator ("v"/"-", 5 cells
      // total) or a separator flanked by two score cells (7 cells, once a result is in) —
      // reading from the end keeps both shapes working instead of assuming a fixed index.
      const link = row.querySelector('a');
      const hasScore = cells.length >= 7;
      slot.games.push({
        comp: cellText(cells[0]),
        home: cellText(cells[1]),
        homeScore: hasScore ? cellText(cells[2]) : '',
        away: cellText(cells[cells.length - 2]),
        awayScore: hasScore ? cellText(cells[cells.length - 3]) : '',
        venue: venueCase(cellText(cells[cells.length - 1])),
        href: link ? link.href : '',
      });
    }
  });

  return { days, links };
};

const gameMarkup = (game) => {
  const homeOurs = /baguley/i.test(game.home);
  const ours = homeOurs || /baguley/i.test(game.away);
  const compName = COMPETITIONS[game.comp];
  const side = ours
    ? `<span class="md-side md-side-${homeOurs ? 'home' : 'away'}">${homeOurs ? 'Home' : 'Away'}</span>`
    : '';
  const played = game.homeScore !== '' && game.awayScore !== '';
  const middle = played
    ? `<span class="md-score">${esc(game.homeScore)}&ndash;${esc(game.awayScore)}</span>`
    : `<span class="md-v">v</span>`;
  const tag = game.href ? 'a' : 'div';
  const href = game.href ? ` href="${esc(game.href)}" target="_blank" rel="noopener"` : '';
  return `
    <li>
      <${tag} class="md-game${ours ? ' is-ours' : ''}${played ? ' is-played' : ''}"${href}>
        <span class="md-teams">
          <span class="md-home">${esc(game.home)}</span>
          ${middle}
          <span class="md-away">${esc(game.away)}</span>
        </span>
        <span class="md-meta">
          ${side}<span class="md-venue">${esc(game.venue)}</span>
          <span class="md-comp"${compName ? ` title="${compName}"` : ''}>${esc(compName || game.comp)}</span>
        </span>
      </${tag}>
    </li>`;
};

const renderSheet = ({ days, links }) => {
  const games = days.reduce((n, d) => n + d.slots.reduce((m, s) => m + s.games.length, 0), 0);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  const body = days.map((d) => `
    <section class="md-day">
      <h2 class="md-date">
        <span class="md-num">${esc(d.day)}</span>
        <span class="md-when">${esc(d.weekday)} ${esc(d.month)}</span>
      </h2>
      <div class="md-slots">
        ${d.slots.map((s) => `
        <div class="md-slot">
          <p class="md-kick">${esc(s.time)}</p>
          <ul class="md-games">${s.games.map(gameMarkup).join('')}</ul>
        </div>`).join('')}
      </div>
    </section>`).join('');

  const extra = links.map((l) => `<a class="text-link" href="${esc(l.href)}" target="_blank" rel="noopener">${l.text === 'Table' ? 'League table' : l.text === 'League' ? 'All league fixtures' : esc(l.text)}</a>`).join('');

  return `
    <p class="md-summary">${plural(games, 'fixture')} across ${plural(days.length, 'matchday')}</p>
    ${body}
    ${extra ? `<p class="md-links">${extra}</p>` : ''}`;
};

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
      row.classList.toggle('is-ours', /baguley/i.test(row.textContent));
    });

    const parsed = readFeed();
    const built = parsed.days.length > 0;
    if (built) sheet.innerHTML = renderSheet(parsed);
    feed.classList.toggle('is-read', built);
    sheet.hidden = !built;
  };
  sheet.hidden = true;
  new MutationObserver(tidy).observe(feed, { childList: true, subtree: true });
  // this runs as a deferred module, so the table may already have landed
  if (feed.querySelector('table')) tidy();
}
