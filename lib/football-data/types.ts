export type MatchStatus = 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'CANCELLED';
export type MatchStage =
  | 'REGULAR_SEASON'
  | 'GROUP_STAGE'
  | 'LAST_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL'
  | (string & {});

export interface Fixture {
  id: string;
  matchday: number | null;
  homeTeam: { id: string; name: string; crest: string | null };
  awayTeam: { id: string; name: string; crest: string | null };
  utcDate: string;
  status: MatchStatus;
  stage: MatchStage;
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

/** teamName -> ownerName */
export type OwnershipMap = Record<string, string>;

export interface StandingEntry {
  position: number;
  team: { id: string; name: string; shortName: string; tla: string; crest: string | null };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface GroupStanding {
  group: string;  // e.g. "GROUP_A"
  table: StandingEntry[];
}
