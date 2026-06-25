export type GoalType = 'REGULAR' | 'OWN' | 'PENALTY';
export type CardType = 'YELLOW' | 'YELLOW_RED' | 'RED';
export type MatchDuration = 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT';
export type MatchWinner = 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW';

export interface MatchTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
}

export interface GoalScorer {
  id: number;
  name: string;
}

export interface Goal {
  minute: number | null;
  injuryTime: number | null;
  type: GoalType;
  team: MatchTeam;
  scorer: GoalScorer | null;
  assist: GoalScorer | null;
}

export interface Booking {
  minute: number | null;
  injuryTime: number | null;
  team: MatchTeam;
  player: GoalScorer;
  card: CardType;
}

export interface Referee {
  id: number;
  name: string;
  type: string;
  nationality: string | null;
}

export interface MatchDetail {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: {
    winner: MatchWinner | null;
    duration: MatchDuration | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  goals: Goal[] | null;
  bookings: Booking[] | null;
  referees: Referee[] | null;
}

export interface H2HTeamRecord {
  id: number;
  name: string;
  wins: number;
  draws: number;
  losses: number;
}

export interface H2HSummary {
  numberOfMatches: number;
  totalGoals: number;
  homeTeam: H2HTeamRecord;
  awayTeam: H2HTeamRecord;
}

export interface H2HMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { id: number; name: string; crest: string | null };
  awayTeam: { id: number; name: string; crest: string | null };
  score: {
    winner: MatchWinner | null;
    fullTime: { home: number | null; away: number | null };
  } | null;
}

export interface Head2HeadResult {
  aggregates: H2HSummary;
  matches: H2HMatch[];
}
