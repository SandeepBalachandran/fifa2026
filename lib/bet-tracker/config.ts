// Temporary feature — remove after World Cup 2026.
// Team names must match what the Football Data API returns exactly.
// Adjust keys here if a label is missing for a team.

export type BetParticipant = 'Sandy' | 'Rahul';

export const AMOUNT_PER_WIN = 30;

export const BET_OWNERSHIP: Record<string, BetParticipant> = {
  // Group-based split: within each group teams ranked by FIFA strength.
  // Each person gets the #1+#4 pair OR the #2+#3 pair from that group.
  // Who gets the #1 pick is chosen so both sides have comparable elite teams.
  // Sandy: France, Spain, Brazil, Netherlands (top-7 anchors)
  // Rahul: Argentina, England, Belgium, Portugal, Germany (top-9 anchors)

  // ── Sandy (24) ──────────────────────────────────────────────────────────
  // Group A — #1+#4 pair
  Mexico:                'Sandy',
  'South Africa':        'Sandy',
  // Group B — #1+#4 pair
  Switzerland:           'Sandy',
  'Bosnia-Herzegovina':  'Sandy',  // API may use "Bosnia and Herzegovina"
  // Group C — #1+#4 pair (Brazil)
  Brazil:                'Sandy',
  Haiti:                 'Sandy',
  // Group D — #2+#3 pair
  Australia:             'Sandy',
  Turkey:                'Sandy',  // API may use "Türkiye"
  // Group E — #2+#3 pair
  Ecuador:               'Sandy',
  'Ivory Coast':         'Sandy',  // API may use "Côte d'Ivoire"
  // Group F — #1+#4 pair (Netherlands, fixed)
  Netherlands:           'Sandy',  // fixed
  Tunisia:               'Sandy',
  // Group G — #2+#3 pair
  Iran:                  'Sandy',
  Egypt:                 'Sandy',
  // Group H — #1+#4 pair (Spain)
  Spain:                 'Sandy',
  'Cape Verde Islands':  'Sandy',  // API may use "Cape Verde"
  // Group I — #1+#4 pair (France)
  France:                'Sandy',
  Iraq:                  'Sandy',
  // Group J — #2+#3 pair
  Austria:               'Sandy',
  Algeria:               'Sandy',
  // Group K — #2+#3 pair
  Colombia:              'Sandy',
  'Congo DR':            'Sandy',  // API may use "DR Congo"
  // Group L — #2+#3 pair
  Croatia:               'Sandy',
  Ghana:                 'Sandy',

  // ── Rahul (24) ──────────────────────────────────────────────────────────
  // Group A — #2+#3 pair
  'South Korea':         'Rahul',  // API may use "Korea Republic"
  Czechia:               'Rahul',  // API may use "Czech Republic"
  // Group B — #2+#3 pair
  Canada:                'Rahul',
  Qatar:                 'Rahul',
  // Group C — #2+#3 pair
  Morocco:               'Rahul',
  Scotland:              'Rahul',
  // Group D — #1+#4 pair (USA)
  'United States':       'Rahul',  // API may use "USA"
  Paraguay:              'Rahul',
  // Group E — #1+#4 pair (Germany)
  Germany:               'Rahul',
  'Curaçao':             'Rahul',
  // Group F — #2+#3 pair
  Japan:                 'Rahul',
  Sweden:                'Rahul',
  // Group G — #1+#4 pair (Belgium)
  Belgium:               'Rahul',
  'New Zealand':         'Rahul',
  // Group H — #2+#3 pair
  Uruguay:               'Rahul',
  'Saudi Arabia':        'Rahul',
  // Group I — #2+#3 pair
  Senegal:               'Rahul',
  Norway:                'Rahul',
  // Group J — #1+#4 pair (Argentina, fixed)
  Argentina:             'Rahul',  // fixed
  Jordan:                'Rahul',
  // Group K — #1+#4 pair (Portugal)
  Portugal:              'Rahul',
  Uzbekistan:            'Rahul',
  // Group L — #1+#4 pair (England)
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
