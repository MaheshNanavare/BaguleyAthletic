const fs = require('fs');

// Source: baguleyathletic.co.uk — Men's First Team Fixtures (Manchester League, Division 1)
const F = [
  ['29','AUG','14:00','H','Ericstan Park','Baguley Athletic','Springhead'],
  ['05','SEP','14:00','A','West Drive Football Centre','Tintwistle Athletic','Baguley Athletic'],
  ['12','SEP','13:15','A','Salford Sports Village','Salford Victoria','Baguley Athletic'],
  ['19','SEP','14:30','A','Blessed Thomas Holford Catholic College','Altrincham Hale','Baguley Athletic'],
  ['03','OCT','14:00','H','Ericstan Park','Baguley Athletic','Bolton County'],
  ['10','OCT','14:00','H','Ericstan Park','Baguley Athletic','Tintwistle Athletic'],
  ['24','OCT','14:00','H','Ericstan Park','Baguley Athletic','Eccles United'],
  ['31','OCT','13:00','A','Vestacare Stadium','Avro Reserves','Baguley Athletic'],
  ['07','NOV','14:00','A','Radcliffe Road','Bolton County','Baguley Athletic'],
  ['14','NOV','14:00','A','Ashfield Crescent','Springhead','Baguley Athletic'],
  ['21','NOV','14:00','H','Ericstan Park','Baguley Athletic','Heywood St. James'],
  ['05','DEC','14:00','H','Ericstan Park','Baguley Athletic','Altrincham Hale'],
  ['12','DEC','14:00','H','Ericstan Park','Baguley Athletic','Salford Victoria'],
  ['19','DEC','14:30','A','Oldham Sixth Form College','Moston Brook','Baguley Athletic'],
  ['09','JAN','14:00','H','Ericstan Park','Baguley Athletic','Horwich R.M.I'],
  ['16','JAN','14:00','H','Ericstan Park','Baguley Athletic','Eccles United'],
  ['23','JAN','14:00','A','Woodhams Park','East Manchester','Baguley Athletic'],
  ['13','FEB','14:00','H','Ericstan Park','Baguley Athletic','Bolton Lads &amp; Girls'],
  ['20','FEB','14:00','A','Hallsworth Road','Eccles United','Baguley Athletic'],
  ['27','FEB','14:00','A','Hilton Community Centre','Horwich R.M.I','Baguley Athletic'],
  ['13','MAR','14:00','H','Ericstan Park','Baguley Athletic','Moston Brook'],
  ['20','MAR','14:00','A','Andrew Street','Chadderton Reserves','Baguley Athletic'],
  ['03','APR','14:00','H','Ericstan Park','Baguley Athletic','Macclesfield Shadow Youth'],
  ['24','APR','14:00','A','Essa Academy','Bolton United','Baguley Athletic'],
];

const MONTH_NAMES = {
  AUG: 'August', SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December',
  JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April',
};

// Source: Commercial Brochure.pdf (8pp), supplied by the club.
// [name, price, term, blurb, perks]
// photo/bg pairs come from the club's Zeus kit renders in assets/Kits/ — bg is the
// exact colour baked into each PNG so the product photo sits flush with no seam
const KITS = [
  ['Home kit', '1500', '2 years', 'Front of shirt on the white home strip, worn every game at Ericstan Park.', 'assets/Kits/home-kit.png', '#000000'],
  ['Home &amp; away kit', '2250', '2 years', 'Both strips, every fixture, home and away. The fullest season-long presence we offer.', 'assets/Kits/home-&-away-kit.png', '#f0e966'],
  ['Away kit', '1250', '2 years', 'Front of shirt on the away strip, seen at grounds right across the region.', 'assets/Kits/away-kit.png', '#000000'],
];

const KIT_BENEFITS = [
  'Front of shirt branding',
  'Digital branding on the website and social media',
  'Lunch Club invite for 2, plus a Matchday Sponsor package for 4',
  'Two tickets to every club event, including the End of Season Presentation',
  'An End of Season Award presented in your company name',
  'A signed shirt, from the chairman and players',
  'An antique match ball',
];

const PACKS = [
  ['Player sponsor', '300', 'per player, per season',
    ['Digital branding', 'Signed shirt', 'Event tickets']],
  ['Matchday sponsor', '400', 'per match',
    ['Light refreshments and drinks on matchday, up to 4 people', 'Private lounge access', 'Digital presence', 'Signed shirt', 'Antique football']],
  ['Player warm-up shirt', '500', 'per team, 2 seasons',
    ['Front of shirt branding', 'Digital branding', 'Signed shirt', 'Event tickets']],
  ['Sleeve 4 Cause', '500', 'per team, 2 seasons',
    ['Sleeve branding for a charity of your choice', 'Digital branding', 'Signed shirt', 'Event tickets'],
    'Publicity for your chosen charity and your company at the same time.'],
  ['Video content', '1200', 'per season',
    ['Your logo on ALL video content produced by the club', 'Signed shirt', 'Event tickets']],
];

const fixtureRow = ([d, m, time, ha, venue, home, away], i) => {
  const isHome = ha === 'H';
  const tag = isHome
    ? '<span class="tag tag-home">Home</span>'
    : '<span class="tag tag-away">Away</span>';
  const label = i === 0 ? '\n          <span class="next-label">Next match</span>' : '';
  return [
    `        <article class="fixture${i === 0 ? ' next' : ''}" data-venue="${isHome ? 'home' : 'away'}">`,
    `          <div class="fixture-date"><strong>${d}</strong><span>Sat</span></div>`,
    `          <div class="fixture-teams">`,
    `            <small class="league">Manchester League, Division One</small>`,
    `            <h2>${home} <b>v</b> ${away}</h2>`,
    `            <span class="venue">${tag}${venue}</span>`,
    `          </div>${label}`,
    `          <p class="fixture-kick">${time}</p>`,
    `        </article>`,
  ].join('\n');
};

// fixtures run in date order, so a month break is simply a change of the month field
const monthGroups = F.reduce((groups, fixture, i) => {
  const last = groups[groups.length - 1];
  if (!last || last.month !== fixture[1]) groups.push({ month: fixture[1], rows: [[fixture, i]] });
  else last.rows.push([fixture, i]);
  return groups;
}, []);

const items = monthGroups.map(({ month, rows }) => `      <section class="month">
        <h2 class="month-head">${MONTH_NAMES[month]}</h2>
${rows.map(([fixture, i]) => fixtureRow(fixture, i)).join('\n')}
      </section>`).join('\n');

const homeCount = F.filter(f => f[3] === 'H').length;

const nav = `
  <header class="site-header">
    <div class="topline">
      <div class="container topbar">
        <span>Ericstan Park, Wythenshawe, Manchester</span>
        <a href="mailto:club@baguleyathletic.co.uk">club@baguleyathletic.co.uk</a>
      </div>
    </div>
    <div class="container nav-wrap">
      <a class="brand" href="index.html" aria-label="Baguley Athletic FC — home">
        <span class="badge"><img src="assets/badge-white-hd.png" alt=""></span>
        <span><b>Baguley Athletic</b><small>Football Club</small></span>
      </a>
      <nav aria-label="Main navigation">
        <div class="nav-item">
          <a href="story.html">The Club</a>
          <div class="submenu">
            <a href="story.html">Our Story</a>
            <a href="story.html#vision">Our People</a>
            <a href="story.html#vision">History</a>
          </div>
        </div>
        <div class="nav-item">
          <a href="fixtures.html">Teams</a>
          <div class="submenu">
            <a href="fixtures.html">Men's 1st Team</a>
            <a href="fixtures.html">Development Squad</a>
            <a href="fixtures.html">Ladies 1st Team</a>
            <a href="fixtures.html">Under 18s</a>
            <a href="fixtures.html">Vets Squad</a>
          </div>
        </div>
        <a href="index.html#story">News</a>
        <div class="nav-item">
          <a href="commercial.html">Commercial Hub</a>
          <div class="submenu">
            <a href="commercial.html#kit">Kit Sponsorship</a>
            <a href="commercial.html#packages">Packages &amp; Perks</a>
            <a href="commercial.html#advertising">Pitch &amp; Stadium</a>
            <a href="index.html#partners">Our Partners</a>
            <a href="commercial.html#brochure">Commercial Brochure</a>
          </div>
        </div>
        <a href="events.html">Events</a>
        <a href="index.html#contact">Contact Us</a>
      </nav>
      <details class="mobile-nav">
        <summary aria-label="Open menu"><i></i><i></i><i></i></summary>
        <div class="mobile-panel">
          <a href="story.html">The Club</a>
          <a href="fixtures.html">Teams</a>
          <a href="index.html#story">News</a>
          <a href="commercial.html">Commercial Hub</a>
          <a href="events.html">Events</a>
          <a href="index.html#contact">Contact Us</a>
          <a href="fixtures.html">Fixtures</a>
        </div>
      </details>
      <a class="button button-dark nav-cta" href="fixtures.html">Fixtures</a>
    </div>
  </header>`;

const footer = `
  <footer class="site-footer" id="contact">
    <div class="container footer-main">
      <div>
        <a class="brand brand-footer" href="index.html">
          <span class="badge"><img src="assets/badge-white-hd.png" alt=""></span>
          <span><b>Baguley Athletic</b><small>Football Club</small></span>
        </a>
        <p>Ericstan Park, Timpson Road,<br>Wythenshawe, M23 9LL</p>
      </div>
      <div>
        <p class="footer-label">Explore</p>
        <a href="index.html">Home</a>
        <a href="fixtures.html">Fixtures</a>
        <a href="story.html">Our story</a>
        <a href="commercial.html">Commercial hub</a>
        <a href="events.html">Events</a>
      </div>
      <div>
        <p class="footer-label">Get in touch</p>
        <a href="mailto:club@baguleyathletic.co.uk">club@baguleyathletic.co.uk</a>
        <a href="https://wa.me/447418605390">WhatsApp 07418 605390</a>
        <p class="footer-note">Messaging service only.</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>&copy; Baguley Athletic FC</span>
      <span>#WeAreBaguley</span>
    </div>
  </footer>`;

const page = (title, description, main) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${description}">
  <title>${title}</title>
  <link rel="icon" href="assets/badge-white-hd.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${nav}

  <main>
${main}
    <div class="stripes" aria-hidden="true"></div>
  </main>
${footer}

  <script src="app.js"></script>
</body>
</html>
`;

/* ---------------------------------------------------------------- fixtures */

const fixturesMain = `    <section class="page-heading container">
      <p class="section-mark">Manchester League, Division One</p>
      <h1>First team<br><em>fixtures.</em></h1>
      <p class="lede">Every date, every opponent, every chance to get behind the Badgers. Home games at Ericstan Park.</p>
    </section>

    <section class="fixtures-section container">
      <div class="fixture-toolbar">
        <div class="filters">
          <button class="filter active" data-filter="all">All</button>
          <button class="filter" data-filter="home">Home</button>
          <button class="filter" data-filter="away">Away</button>
        </div>
        <span class="fixture-count" data-count-all="${F.length}" data-count-home="${homeCount}" data-count-away="${F.length - homeCount}">${F.length} fixtures</span>
      </div>
      <div class="fixture-list">
${items}
      </div>
      <p class="no-results" hidden>No fixtures match that filter.</p>
    </section>
`;

/* -------------------------------------------------------------- commercial */

const tiers = KITS.map(([name, price, term, blurb, photo, bg], i) => `        <article class="tier${i === 1 ? ' tier-featured' : ''}">
          <div class="tier-photo" style="background:${bg}"><img src="${photo}" alt="${name.replace(/&amp;/g, 'and')} product photo" loading="lazy"></div>
          <div class="tier-body">
            <h3>${name}</h3>
            <p class="tier-price"><span>&pound;</span>${price}</p>
            <p class="tier-term">${term}</p>
            <p class="tier-blurb">${blurb}</p>
          </div>
        </article>`).join('\n');

const packs = PACKS.map(([name, price, term, perks, note]) => `        <article class="pack">
          <h3>${name}</h3>
          <ul>
${perks.map(p => `            <li>${p}</li>`).join('\n')}
          </ul>
          <p class="pack-price"><span>&pound;</span>${price}</p>
          <p class="pack-term">${term}</p>${note ? `
          <p class="pack-note">${note}</p>` : ''}
        </article>`).join('\n');

const commercialMain = `    <section class="page-heading container">
      <p class="section-mark">Commercial hub</p>
      <h1>Partner with<br><em>the Badgers.</em></h1>
      <p class="lede">Grassroots sponsorship is usually a begging ask. We would rather it ran both ways &mdash; visibility, connection and real value for money.</p>
    </section>

    <section class="stat-band">
      <div class="container stat-row">
        <div><strong>60,000</strong><span>cars past the ground each week</span></div>
        <div><strong>3</strong><span>clubs playing at Ericstan Park</span></div>
        <div><strong>2004</strong><span>the year we were founded</span></div>
        <div><strong>5</strong><span>squads, from Under 18s to Vets</span></div>
      </div>
    </section>

    <section class="container commercial-intro">
      <div class="intro-grid">
        <p class="section-mark">Why partner with us</p>
        <h2>Identity and<br><em>presence.</em></h2>
        <div>
          <p>Since joining we have gained real momentum, on the pitch and off it. In large part that has come from focusing on two core principles &mdash; identity and presence &mdash; and the two go hand in hand.</p>
          <p>Identity means smart new kits and new training and travel apparel, so that players, volunteers and prospective commercial partners can feel proud of what we stand for and how we look. Presence means being involved, deeply, in the local community.</p>
          <p>We have gifted front of shirt sponsorship to two charities. The home kit carries the logo of <strong>BW3</strong>, funded by businesses to invest in local schoolchildren. The away shirt carries <strong>Woodhouse Park Family Centre</strong>, a not-for-profit free childcare programme for families that need it.</p>
          <cite>David Platt<span>Club Chairman</span></cite>
        </div>
      </div>
    </section>

    <section class="container packages" id="kit">
      <p class="section-mark">Kit sponsorship</p>
      <h2 class="section-title">Front of shirt.</h2>
      <div class="tier-grid">
${tiers}
      </div>
      <div class="benefits">
        <p class="benefits-head">Every kit package includes</p>
        <ul>
${KIT_BENEFITS.map(b => `          <li>${b}</li>`).join('\n')}
        </ul>
      </div>
    </section>

    <section class="container packages" id="packages">
      <p class="section-mark">Packages and perks</p>
      <h2 class="section-title">Other ways in.</h2>
      <div class="pack-grid">
${packs}
      </div>
    </section>

    <section class="container packages" id="advertising">
      <p class="section-mark">Pitch and stadium advertising</p>
      <h2 class="section-title">Seen all week.</h2>
      <div class="advert-grid">
        <article class="advert">
          <h3>On matchdays</h3>
          <p>Your pitch-side board reaches a wide, diverse demographic of thousands of visitors. Because our ground proudly hosts Baguley Athletic, Wythenshawe Town and Wythenshawe Town Laces (formerly Manchester Laces), your brand gets triple the exposure &mdash; welcoming football communities from across the region every weekend.</p>
        </article>
        <article class="advert">
          <h3>Throughout the week</h3>
          <p>The visibility doesn't stop when the final whistle blows. Our external stadium boards face directly onto Altrincham Road (A556), a major local traffic artery. With an estimated 60,000 cars passing the ground every week, your business gains constant, repetitive exposure to daily commuters.</p>
        </article>
      </div>
    </section>

    <section class="commercial-cta" id="brochure">
      <div class="container cta-inner">
        <div>
          <p class="label">Talk to us</p>
          <h2>Let's shape a<br><em>package together.</em></h2>
          <p class="cta-copy">The packages here are our opening ideas. We would be very open to learning what you need as a business, and how we can shape them to give you that.</p>
        </div>
        <div class="cta-side">
          <p class="cta-label">Head of Commercial Operations</p>
          <p class="cta-name">John Ewbank</p>
          <a class="cta-mail" href="mailto:jewbank@baguleyathletic.co.uk">jewbank@baguleyathletic.co.uk</a>
          <a class="button button-onblack" href="assets/commercial-brochure.pdf" target="_blank" rel="noopener">Download the brochure <span aria-hidden="true">&darr;</span></a>
          <p class="cta-note">PDF, 8 pages</p>
        </div>
      </div>
    </section>
`;

/* ------------------------------------------------------------------ events */

// Photos supplied by the club — captions describe only what's visible in each,
// no invented event names or dates.
const EVENTS = [
  ['assets/events/kit-handover.jpg', 'The new home shirt, carrying the BW3 logo, handed over pitch-side at Ericstan Park.'],
  ['assets/events/charity-challenge.jpg', 'Players and volunteers taking on a charity fitness challenge in BW3 colours.'],
  ['assets/events/ericstan-park-visit.jpg', 'Outside the clubhouse at Ericstan Park, home to Baguley Athletic and Wythenshawe Town.'],
  ['assets/events/shirt-close-up.jpg', 'A closer look at the away shirt — the Baguley crest alongside the Woodhouse Park Family Centre logo.'],
];

const eventCards = EVENTS.map(([photo, caption]) => `        <figure class="event-card">
          <img src="${photo}" alt="${caption}" loading="lazy">
          <figcaption>${caption}</figcaption>
        </figure>`).join('\n');

const eventsMain = `    <section class="page-heading container">
      <p class="section-mark">Club life</p>
      <h1>Moments from<br><em>the season.</em></h1>
      <p class="lede">Sponsorship handovers, charity challenges and life around Ericstan Park &mdash; a look at what being part of the club actually looks like.</p>
    </section>

    <section class="container event-grid">
${eventCards}
    </section>
`;

/* ------------------------------------------------------------------ output */

const OUT = [
  ['fixtures.html', page(
    "Men's First Team Fixtures | Baguley Athletic FC",
    "Baguley Athletic FC men's first team fixtures — Manchester League Division One.",
    fixturesMain)],
  ['commercial.html', page(
    'Commercial Hub | Baguley Athletic FC',
    'Sponsorship, matchday packages and pitch-side advertising with Baguley Athletic FC, Wythenshawe.',
    commercialMain)],
  ['events.html', page(
    'Events | Baguley Athletic FC',
    'Photos from Baguley Athletic FC events — sponsorship handovers, charity challenges and club life at Ericstan Park.',
    eventsMain)],
];

// `node build.js fixtures.html` still writes just that page; no args writes all three.
const only = process.argv[2];
OUT.filter(([f]) => !only || f === only).forEach(([file, html]) => {
  fs.writeFileSync(file, html);
  console.log('wrote', file, html.length, 'bytes');
});
console.log(F.length, 'fixtures (', homeCount, 'home ) across', monthGroups.length, 'months,', KITS.length + PACKS.length, 'packages');
