# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A redesign demo of the Baguley Athletic FC website ("The Badgers", Wythenshawe, Manchester), built as
static HTML/CSS/vanilla JS and deployed to Vercel. The client's live site is Wix — this code is a
**visual spec**, not the production system. Someone will rebuild the approved design in the Wix editor.

That destination drives most decisions here: no framework, no build step, no `package.json`, no
dependencies, no tests. Don't add React/Next/Tailwind/a bundler — none of it survives the handoff to
Wix, and the demo needs to open instantly on a phone in a client meeting. (If the client ever agrees
to leave Wix, that calculus changes and Next.js + a CMS becomes the right call.)

## Commands

There is no toolchain. Preview with any static server, e.g.:

```bash
node -e "const http=require('http'),fs=require('fs'),p=require('path');const t={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.avif':'image/avif','.mp4':'video/mp4','.pdf':'application/pdf'};http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split('?')[0]);if(f==='/')f='/index.html';f=p.join(process.cwd(),f);fs.stat(f,(e,s)=>{if(e){r.writeHead(404);return r.end()}const ct=t[p.extname(f).toLowerCase()]||'application/octet-stream';const rg=q.headers.range&&/bytes=(\d*)-(\d*)/.exec(q.headers.range);if(rg){const a=+rg[1]||0,b=rg[2]?+rg[2]:s.size-1;r.writeHead(206,{'Content-Type':ct,'Content-Range':'bytes '+a+'-'+b+'/'+s.size,'Accept-Ranges':'bytes','Content-Length':b-a+1});return fs.createReadStream(f,{start:a,end:b}).pipe(r)}r.writeHead(200,{'Content-Type':ct,'Accept-Ranges':'bytes','Content-Length':s.size});fs.createReadStream(f).pipe(r)})}).listen(4322,()=>console.log('http://localhost:4322'))"
```

The range-request handling matters: Chrome will not play the `<video>` elements on `story.html`
from a server that only answers plain `200`s, and they render as black boxes.

Regenerate the built pages after editing fixtures, packages, events, nav or footer:

```bash
node build.js               # writes fixtures.html, commercial.html and events.html
node build.js fixtures.html # or just one of them
```

## Architecture

Five pages (`index.html`, `story.html`, `fixtures.html`, `commercial.html`, `events.html`) sharing one
stylesheet and one script. `index.html` and `story.html` are hand-written; the other three are built.

**`build.js` owns `fixtures.html`, `commercial.html` and `events.html`.** All three are generated
output — hand-edits to them are lost on the next run. Edit the data arrays or the templates in the
generator instead:

- `fixturesMain` — **the published fixtures page is the league's live FA Full-Time widget**, not local
  data. `FA_LRCODE` is the embed code the club admin generated; the widget script finds its container
  by id (`lrep` + lrcode), so the id, `var lrcode` and the script tag must stay together and in that
  order. It lists every club in the division. At the time of writing the code points at the
  Manchester Football League *Premier Division*, which Baguley isn't in, so no Baguley fixtures show
  until the admin regenerates it for the right division.
- `F` — the old hand-maintained 24 fixtures, as `[day, month, time, H|A, venue, homeTeam, awayTeam]`.
  **Kept but not published**: `manualFixturesMain` still renders it; swap it into `OUT` to switch back.
- `KITS`, `KIT_BENEFITS`, `PACKS` — the sponsorship prices and perks, transcribed from the club's
  Commercial Brochure PDF (a copy lives at `assets/commercial-brochure.pdf`, linked for download from
  the commercial page). These are the client's real prices; check the PDF before changing a number.
  `KITS` also points each tier at its product photo in `assets/Kits/` plus a `bg` hex — that colour is
  sampled from the PNG's own baked-in backdrop so the photo sits flush in its panel with no seam;
  resample it if a kit photo is ever replaced.
- `EVENTS` — photo + caption pairs for the events gallery, sourced from `assets/events/`. Captions
  describe only what's visible in each photo; there's no event calendar or dates behind this yet.

**The site chrome exists in three places.** The header (nav + dropdowns + mobile menu) and footer are
duplicated inline in `index.html` and `story.html` *and* as `nav`/`footer` template strings inside
`build.js`. Any change to navigation or footer must be applied to all three or the pages drift. This is the main structural
weakness; the proportionate fix, if it starts to hurt, is to move the two hand-written pages' unique
markup into `build.js` too so the builder emits all five.

The manual fixtures render **grouped by month** — `monthGroups` folds `F` into `<section class="month">`
blocks headed by the month name, which is why the row itself only prints the day number and `Sat`.
Because the month is in the heading, adding it back to the row is redundant.

**`app.js` is loaded by every page** and does three small things: toggles `.is-scrolled` on the header
(which collapses the topline and tightens the nav past 24px of scroll); tidies the FA Full-Time feed
when its table arrives; and runs the manual fixtures filter (All / Home / Away), which currently has
nothing to act on. Each part no-ops cleanly on pages where its selectors match nothing.

The Full-Time widget writes inline styles, some `!important`, which no stylesheet can override. So a
`MutationObserver` on `.fa-feed` strips those attributes as the table lands and tags rows mentioning
Baguley with `.is-ours`; `styles.css` then styles the bare table normally. The feed's row shapes are
documented above the `.fa-feed` rules, and under 760px each row becomes a grid. The widget only
loads from a real http(s) origin, not `file://`.

## Design constraints

The palette is white-dominant with black as the accent — the club stopped playing in black, but the
crest is a black badger on a white shield, so black is the "Badgers" signature rather than the ground
colour. `--ink` is true `#000`, deliberately: a tinted near-black reads as a default. Tokens are at
the top of `styles.css`. There is deliberately **no** third accent colour; an earlier yellow was
removed, and the surviving `--away` yellow is functional only — it tags away fixtures and comes from
the away kit. Note the client's own Commercial Brochure is yellow-and-black throughout and the away
kit is yellow, so this is a live tension to settle with them — the commercial page is built in the
site palette, not the brochure's.

Type is **Big Shoulders Display** (700–800, uppercased in CSS so the markup stays sentence case) for
display, **Instrument Sans** for everything else. Headlines are one solid colour: `<em>` survives in
the markup purely as a line-break hook and inherits its colour, because greying the second line of
every headline was the site's most repeated tic. Sections open with `.section-mark` — a full-measure
rule with the label riding under its left end — which replaced a dash-and-caps eyebrow above every
heading. `.label` is the same label without the rule, for use inside a panel that already has an edge.
Watch specificity around both: an element-level rule like `.quote p` will otherwise beat `.label`.

`assets/badge-white-hd.png` is white artwork on transparency, 76×76. It is invisible on white, so it
always needs either a black roundel (`.badge`) or `filter: invert(1)` on a light ground. It is also too
small to scale much past ~120px.

## Latest news (`.newsband` in `styles.css`)

Under the hero, a full-bleed black band holds the four newest stories: one lead card with an excerpt,
and three compact rows. Every card is a plain link to its story. This replaced a CSS 3D orbit of photos
round the crest. The rotation was unwanted, and the pictures needed to click through to their stories,
so **the home page has no ambient animation now**. Don't reintroduce a carousel or auto-rotation here.

The stories live on the club's Wix site, and the cards link out to the live posts in a new tab. Wix
gave them non-descriptive slugs (`copy-of-…`), so check each link against its headline on
baguleyathletic.co.uk/news rather than trusting the slug. Headlines and the lead excerpt are
taken from the posts themselves. When the design is rebuilt in Wix these become internal links, and
the band should pull from the blog rather than being hand-maintained.

The goal net (`.net`) survives from the orbit as texture behind the band. It is masked with a radial
gradient so it fades toward the edges; at full strength it reads as noise rather than depth.

## Assets and deployment

News images live in `assets/news/` (960px JPEGs resized from the Wix originals) and event photos in
`assets/events/`, all with lowercase, ASCII, hyphenated filenames. `assets/hero/` held the old orbit photos
and is no longer referenced. Vercel serves from a case-sensitive Linux filesystem, so the original Wix
names (capitalised folder, `~mv2` suffixes) were normalised deliberately — keep new assets to the same
convention.

`reference/HomePage/` and `reference/Fixtures/` are saved copies of the live Wix pages, kept as the
**source of truth for content** — real fixture data, the chairman's quote, contact details and partner
logos were extracted from them. The `reference/Reference …` folders are a separate site ("The
Immortals") used as design reference for the orbit, goal net and scoreboard. The whole `reference/`
directory is excluded in `.vercelignore` so it never deploys; `vercel.json` enables `cleanUrls`.
