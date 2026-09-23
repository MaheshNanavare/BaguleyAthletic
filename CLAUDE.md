# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Baguley Athletic FC website ("The Badgers", Wythenshawe, Manchester), built with **Astro** as a
fully static site and deployed to **Cloudflare Pages** (free plan). The club's old site is on Wix;
the club manager approved replacing it with this, so this code is now the production system, not a
visual spec to be rebuilt in Wix.

Astro was chosen because the site is content pages with almost no interactivity: it ships plain HTML
with no client framework, components kill the old copy-pasted header/footer, and data lives in typed
files. Keep it that way — don't add React/Vue islands or Tailwind unless a feature genuinely needs
them. The pages should still open instantly on a phone.

## Commands

Requires Node 22.12+ (`.node-version` pins 22 for Cloudflare's build image).

```bash
npm install
npm run dev       # dev server with live reload, http://localhost:4321
npm run build     # static output to dist/
npm run preview   # serve dist/ (runs detached in Astro 7; `npx astro preview stop` to stop)
```

There are no tests or linter. `npm run build` is the check — it fails on template/type errors.

## Architecture

```
src/
  layouts/BaseLayout.astro   <head>, fonts, global.css import, Header + <main> + Footer
  components/                Header, Footer, PageHeading, ChairmanQuote, NewsBand, NextMatch, FaFeed, ManualFixtures
  pages/                     index, story, fixtures, commercial, events, 404  → one .html each
  pages/fixtures/[team]      one fixtures page per team after the first (/fixtures/ladies etc.)
  pages/news/                index (the /news list) and [slug] (one page per story)
  content/news/*.md          the news stories (schema in src/content.config.ts)
  data/                      fixtures.ts, commercial.ts, events.ts, news.ts (story helpers)
  scripts/fa-read.js         FA Full-Time feed reader, shared by the two below
  scripts/fa-feed.js         FA Full-Time feed tidier + season sheet (imported by FaFeed)
  scripts/next-match.js      home page next-match board from the live feed (imported by NextMatch)
  styles/global.css          the whole stylesheet, one global file
public/assets/               images, videos, brochure PDF — served as-is at /assets/…
public/_headers              Cloudflare Pages headers (long cache on /_astro/*)
public/_redirects            Cloudflare Pages redirects (old Wix news URLs → /news/…)
```

The header and footer each exist **once**, in `src/components/`. `build.format: 'file'` plus
`trailingSlash: 'never'` emits `story.html` etc., so URLs are `/story`, `/commercial#kit`. Link with
root-relative clean URLs (`/fixtures`, `/#contact`), never `something.html`.

Styling is deliberately **one global stylesheet** (`src/styles/global.css`, imported by the layout),
not scoped `<style>` blocks — the CSS was written as a single system with shared tokens and class
names, and splitting it per component would scatter it for no gain. New CSS goes there too.

Client JS lives in component `<script>` tags, which Astro bundles as modules and only emits on pages
that use the component: the header's scroll state is in `Header.astro`, the fixtures filter in
`ManualFixtures.astro`, the feed logic in `FaFeed.astro` → `scripts/fa-feed.js`, and the home next match in `NextMatch.astro` → `scripts/next-match.js`.

**Data files:**

- `data/fixtures.ts` — `TEAMS`, one FA Full-Time embed code + division link per team, plus `FIXTURES`, the old
  hand-maintained 24 fixtures as `[day, month, time, H|A, venue, homeTeam, awayTeam]`.
- `data/commercial.ts` — `KITS`, `KIT_BENEFITS`, `PACKS`, transcribed from the club's Commercial
  Brochure (`public/assets/commercial-brochure.pdf`, linked for download from the commercial page).
  These are the client's real prices; check the PDF before changing a number. Each kit points at its
  product photo in `public/assets/Kits/` plus a `bg` hex sampled from the PNG's own baked-in backdrop
  so the photo sits flush in its panel; resample it if a kit photo is ever replaced.
- `data/events.ts` — photo + caption pairs for the events gallery. Captions describe only what's
  visible in each photo; there's no event calendar or dates behind this yet.

Write plain characters in data (`&`, `—`); Astro escapes output, so HTML entities would double-escape.

## Fixtures: the FA Full-Time feed

**The published fixtures page is the league's live FA Full-Time widget**, not local data.
Each entry in `TEAMS` (`data/fixtures.ts`) holds the embed code the club admin generated for one
team; the widget script finds its container by id (`lrep` + lrcode) and reads a *global* `lrcode`, so
in `FaFeed.astro` the div, the `var lrcode` script and the `cs1.js` script must stay together, in that
order, and both scripts must stay `is:inline` (bundling or `define:vars` would scope the variable and
break it). That global is also why there is **one team per page**: the first team at `/fixtures`, the
others at `/fixtures/<slug>` from `pages/fixtures/[team].astro`, linked by a tab strip (`.team-tabs`)
above the feed and by the header's Teams menu. Each code lists that team's own games for the whole
season, played (with scores) and still to come; the page count and venues were checked live. Regenerate
the codes each new season, since the FA rolls the season id over. The widget only loads
from a real http(s) origin.

The widget writes inline styles, some `!important`, which no stylesheet can override. So a
`MutationObserver` on `.fa-feed` strips those attributes as the table lands and tags rows mentioning
Baguley with `.is-ours`. It then reads the table back into a **season sheet** (`.matchdays`, a
sibling of `.fa-feed` so writing it can't re-trigger the observer). The **next match** is a black panel
(`.nm-board`, goal net behind), the page's one loud element. Below it are **Still to play** and
**Results** (newest first), both grouped by month, as quiet white rows (`.fx-row`) on one shared grid.
Each row has date, kick-off or result mark, home and away either side of a centred score, then
Home/Away and the venue. The Results heading carries a **form guide** of the last five results. Result
marks stay black and white on purpose (win = filled black box, loss = empty, draw = grey), with no
red or green, to keep to the palette. A played fixture's row has two extra score cells either side of
the separator; once both are numbers the game counts as a result, so results show automatically as the
league enters them, with no separate results page or feed to maintain. The split is by date, not by
score: a game postponed ahead of its date stays under Still to play. Feed quirks handled in
`fa-feed.js`: `00:00` means the kick-off isn't set (shown as TBC), `P`/`P` is postponed, `A`/`A` is
abandoned, and a past game with no score reads "Result to come". The most common competition code on a
page is taken as the team's league and left untagged; any other code (`Cup:`, `CC`) gets a Cup tag.
If nothing parses, the sheet stays hidden and the tidied table shows with its own styling as the
fallback. The feed's row shapes are documented above the `.fa-feed` rules in the CSS.

The `.team-tabs` strip is a `<nav>`, so the header's element-level `nav>a:after` underline applies to
it as well. That's deliberate: the underline grows on hover, and the current squad holds it at full
width. On phones the strip scrolls sideways, and `fa-feed.js` scrolls the current squad into view.

The **home page next match** (`NextMatch.astro`, the white `.scoreboard`) reads the first team's
feed too, so it is never typed in by hand. `next-match.js` sets the global `lrcode` itself and injects
`cs1.js` async after the page is up into a hidden `#lrep…` div; the widget works loaded late like
this, so the home page doesn't wait on the league's server. It reads the table with the same
`fa-read.js` parser as the fixtures page and writes the first game still going ahead into the board.
Until then the board shows a short note (`.sb-wait`, sized to the board so nothing jumps), and after 20
seconds without the feed it points to the fixtures page instead.

`ManualFixtures.astro` still renders the old `FIXTURES` list (grouped by month, with an All / Home /
Away filter) but isn't used. To switch back, render it in place of `<FaFeed />` in
`pages/fixtures.astro`. The month is in each group's heading, so rows print only the day and `Sat`.

## Design constraints

The palette is white-dominant with black as the accent — the club stopped playing in black, but the
crest is a black badger on a white shield, so black is the "Badgers" signature rather than the ground
colour. `--ink` is true `#000`, deliberately: a tinted near-black reads as a default. Tokens are at
the top of `global.css`. There is deliberately **no** third accent colour; an earlier yellow was
removed, and the surviving `--away` yellow is functional only — it tags away fixtures and comes from
the away kit. Note the client's own Commercial Brochure is yellow-and-black throughout and the away
kit is yellow, so this is a live tension to settle with them — the commercial page is built in the
site palette, not the brochure's.

Type is **Big Shoulders Display** (700–800, uppercased in CSS so the markup stays sentence case) for
display, **Instrument Sans** for everything else, linked from Google Fonts in `BaseLayout.astro`.
Headlines are one solid colour: `<em>` survives in the markup purely as a line-break hook and inherits
its colour, because greying the second line of every headline was the site's most repeated tic.
Sections open with `.section-mark` — a full-measure rule with the label riding under its left end —
which replaced a dash-and-caps eyebrow above every heading. `.label` is the same label without the
rule, for use inside a panel that already has an edge. Watch specificity around both: an
element-level rule like `.quote p` will otherwise beat `.label`.

`public/assets/badge-white-hd.png` (822×822) is the crest used on the page, and `badge-white.png` (76×77)
is the browser-tab icon. Both are white artwork on transparency, invisible on white, so on the page the
badge always needs either a black roundel (`.badge`) or `filter: invert(1)` on a light ground.

## News

`src/content/news/` holds one Markdown file per story; the filename is the URL
(`charity-event-victory.md` → `/news/charity-event-victory`). Frontmatter is `title`, `order`, optional
`summary`, `image`, `imageAlt` (schema in `src/content.config.ts`, so a missing field fails the build).
Stories have no dates yet, so `order` sets the sequence: higher is newer, and a new story just takes
the next number. `summary` is the standfirst under the headline; where a story has none, cards and the
meta description use its first paragraph. Story text was transcribed verbatim from the club's Wix posts —
don't rewrite it. To add a story: drop a 960px JPEG in `public/assets/news/`, add the .md, build.

The black band on the home page (`NewsBand.astro`, `.newsband`) shows the four newest: one lead card
with its excerpt and three compact rows. Each story page reuses the band as "More news" with the rest.
The lead headline breaks before its last word, which rides the `<em>` hook and gets a full stop if it has
no closing punctuation. This band replaced a CSS 3D orbit of photos round the crest; the rotation was
unwanted and the pictures needed to click through, so **the home page has no ambient animation**. Don't
reintroduce a carousel or auto-rotation here.

The stories used to link out to the Wix posts; they're internal now. `public/_redirects` maps the old Wix
URLs to the new pages so shared links survive the domain move. Wix gave the posts non-descriptive
`copy-of-…` slugs that don't match their headlines, so those redirects are mapped by headline.

The goal net (`.net`) survives from the orbit as texture behind the band. It is masked with a radial
gradient so it fades toward the edges; at full strength it reads as noise rather than depth.

## Assets and deployment

Everything in `public/` is deployed verbatim. News images live in `public/assets/news/` (960px JPEGs
resized from the Wix originals) and event photos in `public/assets/events/`, all with lowercase,
ASCII, hyphenated filenames. Cloudflare serves from a case-sensitive filesystem, so the original Wix
names (capitalised folder, `~mv2` suffixes) were normalised deliberately — keep new assets to the
same convention. Don't put anything in `public/` that shouldn't be publicly downloadable.

`story.astro` plays two `<video>` loops from `public/assets/videos/`. Chrome won't play them from a
server that only answers plain `200`s (no range requests); Astro's dev/preview servers and Cloudflare
both handle ranges.

**Cloudflare Pages** (Git integration): framework preset Astro, build command `npm run build`, output
directory `dist`. `dist/404.html` is picked up automatically — without it Pages would treat the site
as a SPA and serve the home page for every unknown URL.

`reference/` (gitignored, local only) holds saved copies of the live Wix pages — the **source of
truth for content** (fixture data, the chairman's quote, contact details, partner logos were
extracted from them) — plus a separate site ("The Immortals") used as design reference for the goal
net and scoreboard.
