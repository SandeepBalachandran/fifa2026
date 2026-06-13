import type { Fixture } from '../football-data/types';
import { BET_OWNERSHIP, AMOUNT_PER_WIN } from './config';
import type { BetMatchRecord, BetStats } from './types';

export interface BetResult {
  sandy: BetStats;
  rahul: BetStats;
  history: BetMatchRecord[];
  teamCrests: Record<string, string | null>;
}

export function calculateBetStats(fixtures: Fixture[]): BetResult {
  const teamCrests: Record<string, string | null> = {};
  const history: BetMatchRecord[] = [];
  let sandyWins = 0;
  let rahulWins = 0;

  for (const f of fixtures) {
    if (f.homeTeam.crest) teamCrests[f.homeTeam.name] = f.homeTeam.crest;
    if (f.awayTeam.crest) teamCrests[f.awayTeam.name] = f.awayTeam.crest;

    if (f.status !== 'FINISHED') continue;
    const { home, away } = f.score.fullTime;
    if (home === null || away === null) continue;

    const homeOwner = BET_OWNERSHIP[f.homeTeam.name] ?? null;
    const awayOwner = BET_OWNERSHIP[f.awayTeam.name] ?? null;
    if (!homeOwner && !awayOwner) continue;

    let winner: string | null = null;
    let winnerOwner: 'Sandy' | 'Rahul' | null = null;

    if (home > away) {
      winner = f.homeTeam.name;
      winnerOwner = homeOwner;
    } else if (away > home) {
      winner = f.awayTeam.name;
      winnerOwner = awayOwner;
    }

    if (winnerOwner === 'Sandy') sandyWins++;
    else if (winnerOwner === 'Rahul') rahulWins++;

    history.push({
      matchId: f.id,
      date: f.utcDate,
      homeTeam: f.homeTeam.name,
      awayTeam: f.awayTeam.name,
      homeCrest: f.homeTeam.crest,
      awayCrest: f.awayTeam.crest,
      winner,
      winnerOwner,
      amount: winnerOwner ? AMOUNT_PER_WIN : 0,
    });
  }

  return {
    sandy: { wins: sandyWins, amount: sandyWins * AMOUNT_PER_WIN },
    rahul: { wins: rahulWins, amount: rahulWins * AMOUNT_PER_WIN },
    history: history.sort((a, b) => b.date.localeCompare(a.date)),
    teamCrests,
  };
}
