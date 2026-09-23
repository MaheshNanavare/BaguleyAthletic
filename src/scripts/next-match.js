/* ---------- home page next match (loaded by NextMatch.astro) ---------- */
// The home scoreboard reads the first team's FA Full-Time feed, so it moves on by
// itself as the season does. The widget is only a data source here: it loads into a
// hidden container after the page is up (it reads a global lrcode and fills
// #lrep<lrcode>, so it works injected late), then the next game is written into
// the scoreboard. Until then, or if the league's feed never answers, the board
// holds a short note and the fixtures button beneath it still works.
import { OURS, esc, readFeed, season, nextGame } from './fa-read.js';

const board = document.querySelector('.scoreboard[data-lrcode]');
const source = board && document.getElementById(`lrep${board.dataset.lrcode}`);

// Ericstan Park is ours, so the board can give its full address
const ADDRESSES = { 'Ericstan Park': 'Timpson Road, Wythenshawe' };

const say = (text) => { board.innerHTML = `<p class="sb-wait">${text}</p>`; };

const side = (name, right) => {
  const badge = OURS.test(name)
    ? '<span class="badge sb-badge"><img src="/assets/badge-white-hd.png" alt=""></span>'
    : `<span class="badge sb-badge sb-badge-away" aria-hidden="true">${esc(name.charAt(0))}</span>`;
  const label = `<span class="sb-name">${esc(name)}</span>`;
  return `<div class="sb-team${right ? ' sb-right' : ''}">${right ? label + badge : badge + label}</div>`;
};

const render = (g) => {
  const address = ADDRESSES[g.venue] ? `, ${ADDRESSES[g.venue]}` : '';
  const long = Math.max(g.home.length, g.away.length) > 18 ? ' is-long' : '';
  board.innerHTML = `
    <div class="sb-top${long}">
      ${side(g.home, false)}
      <div class="sb-c">
        <span class="sb-kick">${esc(g.time)}</span>
        <span class="sb-day">${g.date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>
      ${side(g.away, true)}
    </div>
    <p class="sb-meta">
      <span><b>${esc(g.venue)}</b>${esc(address)}</span>
      <span>${esc(g.comp || board.dataset.division)}</span>
    </p>`;
};

if (board && source) {
  let done = false;
  const read = () => {
    const { days } = readFeed(source);
    if (!days.length) return;
    done = true;
    observer.disconnect();
    const next = nextGame(season(days));
    if (next) render(next);
    else say('No fixture is set yet. The next one shows here as soon as the league publishes it.');
  };
  const observer = new MutationObserver(read);
  observer.observe(source, { childList: true, subtree: true });

  window.lrcode = board.dataset.lrcode;
  const script = document.createElement('script');
  script.src = 'https://fulltime.thefa.com/client/api/cs1.js';
  script.async = true;
  script.onerror = () => { if (!done) say("The league's fixtures feed didn't load. The fixtures page has the full season."); };
  document.body.append(script);
  // the feed can be slow, but after 20 seconds say so rather than wait for ever
  setTimeout(() => { if (!done) say("The league's fixtures feed is taking a while. The fixtures page has the full season."); }, 20000);
}
