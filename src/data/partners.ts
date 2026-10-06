// The club's partners, shown as the logo row on the home page and in full on /partners.
// Logos and links come from the old Wix home page; the BW3 and Woodhouse Park lines from the
// Commercial Brochure, Yeep!, Golazzo, Lomarton and Absolute Intelligence from their own sites. `slug` is the anchor on /partners.
export interface Partner {
  slug: string;
  name: string;
  role: string; // what they are to the club, the small label above the name
  logo: string;
  url?: string; // leave out until we have their website; the logo and name then show unlinked
  site?: string; // the link text: the bare domain
  about: string;
}

export const PARTNERS: Partner[] = [
  {
    slug: 'bw3', name: 'BW3 — Business Working With Wythenshawe', role: 'Home shirt partner',
    logo: '/assets/partner-bw3.png', url: 'https://www.bw3.org.uk/', site: 'bw3.org.uk',
    about: 'A charity funded by local businesses that invests in Wythenshawe schoolchildren, giving them more opportunities and building a wider local talent pool. We gifted them the front of our home shirt.',
  },
  {
    slug: 'woodhouse-park', name: 'Woodhouse Park Family Centre', role: 'Away shirt partner',
    logo: '/assets/partner-woodhouse.png', url: 'https://whpfamilycentre.co.uk/', site: 'whpfamilycentre.co.uk',
    about: 'A not-for-profit centre offering free childcare and day-to-day support for local families who need it. We gifted them the front of our away shirt.',
  },
  {
    slug: 'golazzo', name: 'Golazzo Group', role: 'Club partner',
    logo: '/assets/partner-golazzo.jpeg', url: 'https://www.golazzogroup.com/', site: 'golazzogroup.com',
    about: 'Team-wear, footballs and equipment for grassroots clubs across the UK, from Wilmslow.',
  },
  {
    slug: 'yeep', name: 'Yeep!', role: 'Development team sponsor',
    logo: '/assets/partner-yeep.png', url: 'https://yeeplockers.com/', site: 'yeeplockers.com',
    about: 'Eco-friendly local parcel lockers — "your community, eco-friendly local parcel place."',
  },
  {
    slug: 'lomarton', name: 'Lomarton', role: 'Ladies team sponsor',
    logo: '/assets/partner-lomarton.webp', url: 'https://lomarton.com/', site: 'lomarton.com',
    about: 'HR advisory and people transformation for businesses without in-house HR — "your partner in HR excellence and people transformation."',
  },
  {
    slug: 'absolute-intelligence', name: 'Absolute Intelligence UK', role: 'Player sponsor',
    logo: '/assets/partner-absolute-intelligence.png', url: 'https://absoluteintelligenceuk.com/', site: 'absoluteintelligenceuk.com',
    about: 'Customer experience outsourcing from London and Manchester, blending human expertise with AI.',
  },
];
