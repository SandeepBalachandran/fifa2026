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
  winnerOwner: 'Sandy' | 'Rahul' | null;
  amount: number;
}
