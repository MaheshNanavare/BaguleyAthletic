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
  components/                Header, Footer, PageHeading, ChairmanQuote, NewsBand, FaFeed, ManualFixtures
  pages/                     index, story, fixtures, commercial, events, 404  → one .html each
  pages/news/                index (the /news list) and [slug] (one page per story)
  content/news/*.md          the news stories (schema in src/content.config.ts)
  data/                      fixtures.ts, commercial.ts, events.ts, news.ts (story helpers)
  scripts/fa-feed.js         FA Full-Time feed tidier + matchday sheet (imported by FaFeed)
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
`ManualFixtures.astro`, and the feed logic in `FaFeed.astro` → `scripts/fa-feed.js`.

**Data files:**

- `data/fixtures.ts` — `FA_LRCODE`/`FA_DIVISION` for the live feed, plus `FIXTURES`, the old
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
`FA_LRCODE` is the embed code the club admin generated; the widget script finds its container by id
(`lrep` + lrcode) and reads a *global* `lrcode`, so in `FaFeed.astro` the div, the `var lrcode`
script and the `cs1.js` script must stay together, in that order, and both scripts must stay
`is:inline` (bundling or `define:vars` would scope the variable and break it). The widget lists every
club in the division. At the time of writing the code points at the Manchester Football League
*Premier Division*, which Baguley isn't in, so no Baguley fixtures show until the admin regenerates it
for the right division. The widget only loads from a real http(s) origin.

The widget writes inline styles, some `!important`, which no stylesheet can override. So a
`MutationObserver` on `.fa-feed` strips those attributes as the table lands and tags rows mentioning
Baguley with `.is-ours`. It then reads the table back into a **matchday sheet** (`.matchdays`, a
sibling of `.fa-feed` so writing it can't re-trigger the observer): one row per date with a large day
number pinned in the left rail, games grouped under kick-off times, Baguley games as black bands
tagged Home/Away. If nothing parses, the sheet stays hidden and the tidied table shows with its own
styling as the fallback. The feed's row shapes are documented above the `.fa-feed` rules in the CSS.

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
