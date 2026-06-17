// Temporary feature — remove after World Cup 2026.
// Team names must match what the Football Data API returns exactly.
// Adjust keys here if a label is missing for a team.

export type BetParticipant = 'Sandy' | 'Rahul';

export const AMOUNT_PER_WIN = 30;

export const BET_OWNERSHIP: Record<string, BetParticipant> = {
  // Assignment is group-based: within each group, teams are ranked by FIFA
  // strength. Each person gets one strong (rank 1 or 2) and one weak (rank 3
  // or 4) per group. Who gets rank 1 alternates across groups for balance.

  // ── Sandy (24) ──────────────────────────────────────────────────────────
  // Group A
  'South Korea':         'Sandy',  // API may use "Korea Republic"
  Czechia:               'Sandy',  // API may use "Czech Republic"
  // Group B
  Switzerland:           'Sandy',
  'Bosnia-Herzegovina':  'Sandy',  // API may use "Bosnia and Herzegovina"
  // Group C
  Morocco:               'Sandy',
  Scotland:              'Sandy',
  // Group D
  Australia:             'Sandy',
  Turkey:                'Sandy',  // API may use "Türkiye"
  // Group E
  Ecuador:               'Sandy',
  'Ivory Coast':         'Sandy',  // API may use "Côte d'Ivoire"
  // Group F
  Netherlands:           'Sandy',  // fixed
  Tunisia:               'Sandy',
  // Group G
  Iran:                  'Sandy',
  Egypt:                 'Sandy',
  // Group H
  Spain:                 'Sandy',
  'Cape Verde Islands':  'Sandy',  // API may use "Cape Verde"
  // Group I
  Senegal:               'Sandy',
  Norway:                'Sandy',
  // Group J
  Austria:               'Sandy',
  Algeria:               'Sandy',
  // Group K
  Colombia:              'Sandy',
  Uzbekistan:            'Sandy',
  // Group L
  Croatia:               'Sandy',
  Ghana:                 'Sandy',

  // ── Rahul (24) ──────────────────────────────────────────────────────────
  // Group A
  Mexico:                'Rahul',
  'South Africa':        'Rahul',
  // Group B
  Canada:                'Rahul',
  Qatar:                 'Rahul',
  // Group C
  Brazil:                'Rahul',
  Haiti:                 'Rahul',
  // Group D
  'United States':       'Rahul',  // API may use "USA"
  Paraguay:              'Rahul',
  // Group E
  Germany:               'Rahul',
  'Curaçao':             'Rahul',
  // Group F
  Japan:                 'Rahul',
  Sweden:                'Rahul',
  // Group G
  Belgium:               'Rahul',
  'New Zealand':         'Rahul',
  // Group H
  Uruguay:               'Rahul',
  'Saudi Arabia':        'Rahul',
  // Group I
  France:                'Rahul',
  Iraq:                  'Rahul',
  // Group J
  Argentina:             'Rahul',  // fixed
  Jordan:                'Rahul',
  // Group K
  Portugal:              'Rahul',
  'Congo DR':            'Rahul',  // API may use "DR Congo"
  // Group L
  England:               'Rahul',
  Panama:                'Rahul',
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
