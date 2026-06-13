export type BattleStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';
export type BattleOutcome = 'HOME_WIN' | 'AWAY_WIN' | 'DRAW' | null;

export interface DirectBattle {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string | null;
  awayCrest?: string | null;
  homeOwner: string;
  awayOwner: string;
  status: BattleStatus;
  outcome: BattleOutcome;
  matchDate: string;
}
