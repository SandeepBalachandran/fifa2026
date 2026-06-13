// Temporary feature — remove after World Cup 2026.
// Team names must match what the Football Data API returns exactly.
// Adjust keys here if a label is missing for a team.

export type BetParticipant = 'Sandy' | 'Rahul';

export const AMOUNT_PER_WIN = 30;

export const BET_OWNERSHIP: Record<string, BetParticipant> = {
  // ── Sandy (24) ──────────────────────────────────────────────────────────
  // Tier 1
  Netherlands:           'Sandy',  // fixed
  France:                'Sandy',
  England:               'Sandy',
  Germany:               'Sandy',
  Belgium:               'Sandy',
  // Tier 2
  'United States':       'Sandy',  // API may use "USA"
  Morocco:               'Sandy',
  Japan:                 'Sandy',
  'South Korea':         'Sandy',  // API may use "Korea Republic"
  Switzerland:           'Sandy',
  // Tier 3
  Canada:                'Sandy',
  Australia:             'Sandy',
  'Ivory Coast':         'Sandy',  // API may use "Côte d'Ivoire"
  Ecuador:               'Sandy',
  Egypt:                 'Sandy',
  Norway:                'Sandy',
  Czechia:               'Sandy',  // API may use "Czech Republic"
  Paraguay:              'Sandy',
  // Tier 4
  'Bosnia-Herzegovina':  'Sandy',  // API may use "Bosnia and Herzegovina"
  Scotland:              'Sandy',
  'Curaçao':             'Sandy',
  'Cape Verde Islands':  'Sandy',  // API may use "Cape Verde"
  'New Zealand':         'Sandy',
  Panama:                'Sandy',

  // ── Rahul (24) ──────────────────────────────────────────────────────────
  // Tier 1
  Argentina:             'Rahul',  // fixed
  Brazil:                'Rahul',
  Spain:                 'Rahul',
  Portugal:              'Rahul',
  // Tier 2
  Mexico:                'Rahul',
  Uruguay:               'Rahul',
  Senegal:               'Rahul',
  Croatia:               'Rahul',
  Colombia:              'Rahul',
  // Tier 3
  Turkey:                'Rahul',  // API may use "Türkiye"
  Sweden:                'Rahul',
  Tunisia:               'Rahul',
  'Saudi Arabia':        'Rahul',
  Iran:                  'Rahul',
  Algeria:               'Rahul',
  Austria:               'Rahul',
  Ghana:                 'Rahul',
  // Tier 4
  Qatar:                 'Rahul',
  Haiti:                 'Rahul',
  Iraq:                  'Rahul',
  Jordan:                'Rahul',
  'Congo DR':            'Rahul',  // API may use "DR Congo"
  Uzbekistan:            'Rahul',
  'South Africa':        'Rahul',
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
