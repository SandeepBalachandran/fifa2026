// Temporary feature — remove after World Cup 2026.
// Team names must match what the Football Data API returns exactly.
// Adjust keys here if a label is missing for a team.
//
// Reshuffle strategy: confederation peers are split between Sandy and Rahul
// so teams likely to share a group end up on opposite sides.

export type BetParticipant = 'Sandy' | 'Rahul';

export const AMOUNT_PER_WIN = 30;

export const BET_OWNERSHIP: Record<string, BetParticipant> = {
  // ── Sandy (24) ──────────────────────────────────────────────────────────
  // UEFA — Tier 1 (3)
  Netherlands:           'Sandy',  // fixed
  France:                'Sandy',
  England:               'Sandy',
  Germany:               'Sandy',
  // UEFA — Mid (5)
  Switzerland:           'Sandy',
  Norway:                'Sandy',
  Scotland:              'Sandy',
  Sweden:                'Sandy',
  Czechia:               'Sandy',  // API may use "Czech Republic"
  // CONCACAF (3)
  'United States':       'Sandy',  // API may use "USA"
  Canada:                'Sandy',
  'Curaçao':             'Sandy',
  // CONMEBOL (2)
  Uruguay:               'Sandy',
  Paraguay:              'Sandy',
  // AFC (4)
  'South Korea':         'Sandy',  // API may use "Korea Republic"
  Australia:             'Sandy',
  Japan:                 'Sandy',
  Uzbekistan:            'Sandy',
  // CAF (5)
  Morocco:               'Sandy',
  'Ivory Coast':         'Sandy',  // API may use "Côte d'Ivoire"
  Egypt:                 'Sandy',
  'Cape Verde Islands':  'Sandy',  // API may use "Cape Verde"
  'South Africa':        'Sandy',
  // OFC (1)
  'New Zealand':         'Sandy',

  // ── Rahul (24) ──────────────────────────────────────────────────────────
  // UEFA — Tier 1 (3)
  Argentina:             'Rahul',  // fixed
  Spain:                 'Rahul',
  Portugal:              'Rahul',
  Belgium:               'Rahul',
  // UEFA — Mid (4)
  Croatia:               'Rahul',
  Austria:               'Rahul',
  'Bosnia-Herzegovina':  'Rahul',  // API may use "Bosnia and Herzegovina"
  Turkey:                'Rahul',  // API may use "Türkiye"
  // CONCACAF (3)
  Mexico:                'Rahul',
  Haiti:                 'Rahul',
  Panama:                'Rahul',
  // CONMEBOL (3)
  Brazil:                'Rahul',
  Ecuador:               'Rahul',
  Colombia:              'Rahul',
  // AFC (5)
  'Saudi Arabia':        'Rahul',
  Iran:                  'Rahul',
  Qatar:                 'Rahul',
  Iraq:                  'Rahul',
  Jordan:                'Rahul',
  // CAF (5)
  Tunisia:               'Rahul',
  Senegal:               'Rahul',
  Algeria:               'Rahul',
  'Congo DR':            'Rahul',  // API may use "DR Congo"
  Ghana:                 'Rahul',
};

export function getBetLabel(teamName: string): '(S)' | '(R)' | '' {
  const owner = BET_OWNERSHIP[teamName];
  if (owner === 'Sandy') return '(S)';
  if (owner === 'Rahul') return '(R)';
  return '';
}

export const SANDY_TEAMS = Object.entries(BET_OWNERSHIP)
  .filter(([, v]) => v === 'Sandy')
  .map(([k]) => k)
  .sort();

export const RAHUL_TEAMS = Object.entries(BET_OWNERSHIP)
  .filter(([, v]) => v === 'Rahul')
  .map(([k]) => k)
  .sort();
