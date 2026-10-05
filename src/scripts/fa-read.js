/* ---------- FA Full-Time feed reader (shared by fa-feed.js and next-match.js) ----------
   Reads the league widget's table back into dated games. The row shapes are
   documented above the .fa-feed rules in global.css. */
const ACRONYMS = /^(AFC|FC|JFC|ARLFC|4G|3G|MUFC|YMCA|FA)$/;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
export const OURS = /baguley/i;

// the feed shouts venue names (and the odd team name); bring all-caps words back to title case
const titleCase = (text) => text.split(' ').map((word) => {
  if (ACRONYMS.test(word) || word !== word.toUpperCase() || word.length < 2) return word;
  // capitalise the first letter, not the first character: "(HACKEN" → "(Hacken"
  return word.toLowerCase().replace(/[a-z]/, (c) => c.toUpperCase());
}).join(' ');
const teamName = (text) => (text === text.toUpperCase() ? titleCase(text) : text);

// the league lists our home ground under the landlord club's name; the club calls it
// Ericstan Park. Collapse the repeat if the feed ever gives both ("…Town FC, Ericstan Park").
const venueName = (text) => titleCase(text)
  .replace(/\bWythenshawe Town( A?FC)?\b/gi, 'Ericstan Park')
  .replace(/(Ericstan Park)(\W+Ericstan Park)+/gi, '$1');

export const esc = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cellText = (td) => (td ? td.textContent.replace(/\s+/g, ' ').trim() : '');

export const readFeed = (feed) => {
  const days = [];
  const links = [];
  let slot = null;

  feed.querySelectorAll('table tr').forEach((row) => {
    const cells = [...row.children].filter((el) => el.tagName === 'TD');
    // the closing League | Table row comes either as one spanning cell or as separate
    // logo / link / "|" / link cells; the latter would otherwise read as a game
    if (row.querySelector('a[href*="table.html"]')) {
      row.querySelectorAll('a').forEach((a) => {
        if (cellText(a) && !links.some((l) => l.href === a.href)) links.push({ href: a.href, text: cellText(a) });
      });
      return;
    }
    if (cells.length === 1 && cells[0].colSpan > 1) {
      // either a date row, or the closing row of League | Table links
      const date = /^(\w{3})\w*\s+(\d{1,2})\s+(\w+)\s+(\d{4})\s*(\d{1,2}:\d{2})?/.exec(cellText(cells[0]));
      if (!date) {
        cells[0].querySelectorAll('a').forEach((a) => {
          if (cellText(a) && !links.some((l) => l.href === a.href)) links.push({ href: a.href, text: cellText(a) });
        });
        return;
      }
      const [, weekday, day, month, year, time] = date;
      const key = `${day} ${month} ${year}`;
      let entry = days.find((d) => d.key === key);
      if (!entry) {
        entry = { key, weekday, date: new Date(+year, MONTHS.indexOf(month.slice(0, 3).toLowerCase()), +day), slots: [] };
        days.push(entry);
      }
      // the feed writes 00:00 when the kick-off hasn't been set
      const kick = time && time !== '00:00' ? time : 'TBC';
      slot = entry.slots.find((s) => s.time === kick);
      if (!slot) {
        slot = { time: kick, games: [] };
        entry.slots.push(slot);
      }
    } else if (cells.length >= 4 && slot) {
      // Comp and home are always cells[0]/[1]. Then comes either just a separator ("v"/"-")
      // or a separator flanked by two score cells, then away, then the venue — but only if
      // the embed code was generated with venues on (the 2026/27 codes weren't). So find the
      // separator and read from there: 4–7 cells all work without assuming a fixed index.
      const link = row.querySelector('a');
      const sep = cells.findIndex((td, i) => i >= 2 && /^(v|vs|-)$/i.test(cellText(td)));
      const hasScore = sep === 3;
      const awayAt = sep > 0 ? sep + (hasScore ? 2 : 1) : cells.length - 2;
      slot.games.push({
        comp: cellText(cells[0]).replace(/:$/, ''),
        home: teamName(cellText(cells[1])),
        homeScore: hasScore ? cellText(cells[2]) : '',
        away: teamName(cellText(cells[awayAt])),
        awayScore: hasScore ? cellText(cells[sep + 1]) : '',
        venue: venueName(cellText(cells[awayAt + 1])),
        href: link ? link.href : '',
      });
    }
  });

  return { days, links };
};

// One flat, dated list of games, each with its state from our side:
// upcoming, won / drawn / lost, postponed, abandoned, pending (past but no score yet),
// or other (a score the feed wrote that isn't two numbers, e.g. a walkover).
export const season = (days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const games = days.flatMap((d) => d.slots.flatMap((s) => s.games.map((g) => ({ ...g, weekday: d.weekday, date: d.date, time: s.time }))));

  // the competition most games share is the team's league; only the others get a tag
  const counts = {};
  games.forEach((g) => { counts[g.comp] = (counts[g.comp] || 0) + 1; });
  const league = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];

  return games.map((g) => {
    const homeOurs = OURS.test(g.home);
    const [h, a] = [g.homeScore, g.awayScore];
    let state = g.date < today ? 'pending' : 'upcoming';
    if (/^\d+$/.test(h) && /^\d+$/.test(a)) {
      const [us, them] = homeOurs ? [+h, +a] : [+a, +h];
      state = us > them ? 'won' : us < them ? 'lost' : 'drawn';
    } else if (h === 'P' && a === 'P') state = 'postponed';
    else if (h === 'A' && a === 'A') state = 'abandoned';
    else if (h || a) state = 'other';
    const comp = g.comp !== league && g.comp ? (/cup|^CC$/i.test(g.comp) ? 'Cup' : g.comp) : '';
    // a game called off ahead of its date still belongs with the games to come
    const ahead = g.date >= today && !isResult({ state }) && state !== 'other';
    return { ...g, homeOurs, state, comp, ahead };
  });
};


export const isResult = (g) => ['won', 'drawn', 'lost'].includes(g.state);

// the first game still to come that is actually going ahead
export const nextGame = (games) => games.find((g) => g.ahead && g.state === 'upcoming');
