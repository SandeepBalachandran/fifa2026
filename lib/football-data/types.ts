export type MatchStatus = 'SCHEDULED' | 'TIMED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'CANCELLED';
export type MatchStage =
  | 'GROUP_STAGE'
  | 'LAST_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface Fixture {
  id: string;
  matchday: number | null;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
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
  team: { id: string; name: string; shortName: string; tla: string };
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
