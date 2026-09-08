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
node -e "const http=require('http'),fs=require('fs'),p=require('path');const t={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.avif':'image/avif'};http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split('?')[0]);if(f==='/')f='/index.html';fs.readFile(p.join(process.cwd(),f),(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':t[p.extname(f).toLowerCase()]||'application/octet-stream'});r.end(d)})}).listen(4322,()=>console.log('http://localhost:4322'))"
```

Regenerate the built pages after editing fixtures, packages, events, nav or footer:

```bash
node build.js               # writes fixtures.html, commercial.html and events.html
node build.js fixtures.html # or just one of them
```

## Architecture

Four pages (`index.html`, `fixtures.html`, `commercial.html`, `events.html`) sharing one stylesheet
and one script.

**`build.js` owns `fixtures.html`, `commercial.html` and `events.html`.** All three are generated
output — hand-edits to them are lost on the next run. Edit the data arrays or the templates in the
generator instead:

- `F` — all 24 fixtures, as `[day, month, time, H|A, venue, homeTeam, awayTeam]`
- `KITS`, `KIT_BENEFITS`, `PACKS` — the sponsorship prices and perks, transcribed from the club's
  Commercial Brochure PDF (a copy lives at `assets/commercial-brochure.pdf`, linked for download from
  the commercial page). These are the client's real prices; check the PDF before changing a number.
  `KITS` also points each tier at its product photo in `assets/kits/` plus a `bg` hex — that colour is
  sampled from the PNG's own baked-in backdrop so the photo sits flush in its panel with no seam;
  resample it if a kit photo is ever replaced.
- `EVENTS` — photo + caption pairs for the events gallery, sourced from `assets/events/`. Captions
  describe only what's visible in each photo; there's no event calendar or dates behind this yet.

**The site chrome exists in two places.** The header (nav + dropdowns + mobile menu) and footer are
duplicated inline in `index.html` *and* as `nav`/`footer` template strings inside `build.js`. Any
change to navigation or footer must be applied to both or the pages drift. This is the main structural
weakness; the proportionate fix, if it starts to hurt, is to move `index.html`'s unique markup into
`build.js` too so the builder emits all three pages.

**`app.js` is loaded by all three pages** and only handles the fixtures filter (All / Home / Away,
updating the count and empty state). Every animation is CSS-driven; the file no-ops cleanly on the
other two pages because its selectors match nothing there.

## Design constraints

The palette is white-dominant with black as the accent — the club stopped playing in black, but the
crest is a black badger on a white shield, so black is the "Badgers" signature rather than the ground
colour. Tokens are at the top of `styles.css`. There is deliberately **no** third accent colour; an
earlier yellow was removed. Note the client's own Commercial Brochure is yellow-and-black throughout
and the away kit is yellow, so this is a live tension to settle with them — the commercial page is
built in the site palette, not the brochure's.

`assets/badge-white-hd.png` is white artwork on transparency, 76×76. It is invisible on white, so it
always needs either a black roundel (`.badge`) or `filter: invert(1)` on a light ground. It is also too
small to scale much past ~120px.

## The hero orbit (`.stage` in `styles.css`)

Four photos orbit the club crest in CSS 3D, with a goal net behind and a full-bleed dark stage. Three
things are load-bearing and easy to break:

- **Depth sorting, not `z-index`.** The four `.orb` cards and `.orbit-core` are siblings in one
  `transform-style: preserve-3d` context on `.orbit`. That is what lets the front card pass *in front
  of* the crest and the back cards *behind* it. Adding `z-index` to any of them, or reintroducing a
  wrapper element that flattens the context, reverts it to flat paint order and the crest wins again.
- **Per-card counter-rotation.** Each card animates `rotateY(A) translateZ(340px) rotateY(-A)` — the
  first rotation walks it round the ring, the trailing one cancels the spin so photos face the viewer.
  Without it, cards on the back half render mirrored, and two of the four photos carry readable text.
  The radius appears in `@keyframes orb0`–`orb3` *and* again in the ≤760px overrides; changing it means
  updating all of them.
- **The crest is two stacked faces.** `.crest-face` + `.crest-back` (pre-rotated 180°, both
  `backface-visibility: hidden`) so the badge reads correctly through the whole flip.

`prefers-reduced-motion` parks the cards on their static transform and stops the flip.

## Assets and deployment

Hero images live in `assets/hero/` with lowercase, ASCII, hyphenated filenames. Vercel serves from a
case-sensitive Linux filesystem, so the original Wix names (capitalised folder, `~mv2` suffixes) were
normalised deliberately — keep new assets to the same convention. Two hero images are `.avif`, which is
fine in current browsers but blank on older ones; add `<picture>` fallbacks if the client needs wide
support.

`HomePage/` and `Fixtures/` are saved copies of the live Wix pages, kept as the **source of truth for
content** — real fixture data, the chairman's quote, contact details and partner logos were extracted
from them. The two `Reference …` folders are a separate site ("The Immortals") used as design reference
for the orbit, goal net and scoreboard. All four folders are excluded in `.vercelignore` so they never
deploy; `vercel.json` enables `cleanUrls`.
