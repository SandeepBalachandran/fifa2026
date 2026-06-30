export interface BetStats {
  wins: number;
  amount: number;
}

export interface BetMatchRecord {
  matchId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest: string | null;
  awayCrest: string | null;
  winner: string | null;
  homeOwner: 'Sandy' | 'Rahul' | null;
  awayOwner: 'Sandy' | 'Rahul' | null;
  winnerOwner: 'Sandy' | 'Rahul' | null;
  amount: number;
  nobet: boolean; // true when both teams belong to the same owner
}
