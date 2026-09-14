// Source: Commercial Brochure.pdf (8pp), supplied by the club — a copy is served from
// public/assets/commercial-brochure.pdf. These are the client's real prices; check the
// PDF before changing a number.

// photo/bg pairs come from the club's Zeus kit renders in public/assets/Kits/ — bg is the
// exact colour baked into each PNG so the product photo sits flush with no seam.
// Resample it if a kit photo is ever replaced.
export const KITS = [
  { name: 'Home kit', price: '1500', term: '2 years', blurb: 'Front of shirt on the white home strip, worn every game at Ericstan Park.', photo: '/assets/Kits/home-kit.png', bg: '#000000' },
  { name: 'Home & away kit', price: '2250', term: '2 years', blurb: 'Both strips, every fixture, home and away. The fullest season-long presence we offer.', photo: '/assets/Kits/home-&-away-kit.png', bg: '#f0e966', featured: true },
  { name: 'Away kit', price: '1250', term: '2 years', blurb: 'Front of shirt on the away strip, seen at grounds right across the region.', photo: '/assets/Kits/away-kit.png', bg: '#000000' },
];

export const KIT_BENEFITS = [
  'Front of shirt branding',
  'Digital branding on the website and social media',
  'Lunch Club invite for 2, plus a Matchday Sponsor package for 4',
  'Two tickets to every club event, including the End of Season Presentation',
  'An End of Season Award presented in your company name',
  'A signed shirt, from the chairman and players',
  'An antique match ball',
];

export const PACKS: { name: string; price: string; term: string; perks: string[]; note?: string }[] = [
  { name: 'Player sponsor', price: '300', term: 'per player, per season',
    perks: ['Digital branding', 'Signed shirt', 'Event tickets'] },
  { name: 'Matchday sponsor', price: '400', term: 'per match',
    perks: ['Light refreshments and drinks on matchday, up to 4 people', 'Private lounge access', 'Digital presence', 'Signed shirt', 'Antique football'] },
  { name: 'Player warm-up shirt', price: '500', term: 'per team, 2 seasons',
    perks: ['Front of shirt branding', 'Digital branding', 'Signed shirt', 'Event tickets'] },
  { name: 'Sleeve 4 Cause', price: '500', term: 'per team, 2 seasons',
    perks: ['Sleeve branding for a charity of your choice', 'Digital branding', 'Signed shirt', 'Event tickets'],
    note: 'Publicity for your chosen charity and your company at the same time.' },
  { name: 'Video content', price: '1200', term: 'per season',
    perks: ['Your logo on ALL video content produced by the club', 'Signed shirt', 'Event tickets'] },
];
