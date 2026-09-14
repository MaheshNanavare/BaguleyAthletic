// Live feed: the embed code FA Full-Time generated for the club admin. The widget script
// looks for its container by id (lrep + lrcode), so the id and lrcode must change together.
// At the time of writing this points at the Manchester Football League Premier Division,
// which Baguley isn't in, so no Baguley fixtures show until the admin regenerates it.
export const FA_LRCODE = '573852128';
export const FA_DIVISION = 'https://fulltime.thefa.com/index.html?divisionseason=192323718';

// Source: baguleyathletic.co.uk — Men's First Team Fixtures (Manchester League, Division 1)
// NOT CURRENTLY PUBLISHED. fixtures.astro renders the live FA Full-Time feed instead;
// swap <FaFeed /> for <ManualFixtures /> there to switch back to this list.
export type Fixture = [day: string, month: string, time: string, side: 'H' | 'A', venue: string, home: string, away: string];

export const FIXTURES: Fixture[] = [
  ['29', 'AUG', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Springhead'],
  ['05', 'SEP', '14:00', 'A', 'West Drive Football Centre', 'Tintwistle Athletic', 'Baguley Athletic'],
  ['12', 'SEP', '13:15', 'A', 'Salford Sports Village', 'Salford Victoria', 'Baguley Athletic'],
  ['19', 'SEP', '14:30', 'A', 'Blessed Thomas Holford Catholic College', 'Altrincham Hale', 'Baguley Athletic'],
  ['03', 'OCT', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Bolton County'],
  ['10', 'OCT', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Tintwistle Athletic'],
  ['24', 'OCT', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Eccles United'],
  ['31', 'OCT', '13:00', 'A', 'Vestacare Stadium', 'Avro Reserves', 'Baguley Athletic'],
  ['07', 'NOV', '14:00', 'A', 'Radcliffe Road', 'Bolton County', 'Baguley Athletic'],
  ['14', 'NOV', '14:00', 'A', 'Ashfield Crescent', 'Springhead', 'Baguley Athletic'],
  ['21', 'NOV', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Heywood St. James'],
  ['05', 'DEC', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Altrincham Hale'],
  ['12', 'DEC', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Salford Victoria'],
  ['19', 'DEC', '14:30', 'A', 'Oldham Sixth Form College', 'Moston Brook', 'Baguley Athletic'],
  ['09', 'JAN', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Horwich R.M.I'],
  ['16', 'JAN', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Eccles United'],
  ['23', 'JAN', '14:00', 'A', 'Woodhams Park', 'East Manchester', 'Baguley Athletic'],
  ['13', 'FEB', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Bolton Lads & Girls'],
  ['20', 'FEB', '14:00', 'A', 'Hallsworth Road', 'Eccles United', 'Baguley Athletic'],
  ['27', 'FEB', '14:00', 'A', 'Hilton Community Centre', 'Horwich R.M.I', 'Baguley Athletic'],
  ['13', 'MAR', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Moston Brook'],
  ['20', 'MAR', '14:00', 'A', 'Andrew Street', 'Chadderton Reserves', 'Baguley Athletic'],
  ['03', 'APR', '14:00', 'H', 'Ericstan Park', 'Baguley Athletic', 'Macclesfield Shadow Youth'],
  ['24', 'APR', '14:00', 'A', 'Essa Academy', 'Bolton United', 'Baguley Athletic'],
];

export const MONTH_NAMES: Record<string, string> = {
  AUG: 'August', SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December',
  JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April',
};
