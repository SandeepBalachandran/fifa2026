import { randomUUID } from 'crypto';
import type { AppNotification } from './types';
import type { MatchPointsResult } from '../scoring/calculate';
import type { DirectBattle } from '../battles/types';
import type { LeaderboardEntry } from '../leaderboard/calculate';

export function generateMatchNotifications(
  results: MatchPointsResult[],
  teamName: string,
  opponentName: string
): AppNotification[] {
  return results.map((r) => ({
    id: randomUUID(),
    participantName: r.ownerName,
    type: r.points > 0 ? 'MATCH_WIN' : 'MATCH_LOSS',
    message: `${r.teamName} played ${opponentName}: +${r.points} pts`,
    createdAt: new Date().toISOString(),
    read: false,
  }));
}

export function generateBattleNotification(
  battle: DirectBattle
): AppNotification[] {
  const outcomeLabel =
    battle.outcome === 'HOME_WIN' ? `${battle.homeTeam} won`
      : battle.outcome === 'AWAY_WIN' ? `${battle.awayTeam} won`
      : 'Draw';

  return [battle.homeOwner, battle.awayOwner].map((owner) => ({
    id: randomUUID(),
    participantName: owner,
    type: 'BATTLE_RESULT' as const,
    message: `Direct Battle: ${battle.homeTeam} vs ${battle.awayTeam} — ${outcomeLabel}`,
    createdAt: new Date().toISOString(),
    read: false,
  }));
}

export function generateRankChangeNotifications(
  before: Record<string, number>,
  after: LeaderboardEntry[]
): AppNotification[] {
  const notes: AppNotification[] = [];
  for (const entry of after) {
    const prev = before[entry.participantName];
    if (prev === undefined || prev === entry.rank) continue;
    const dir = entry.rank < prev ? 'moved up' : 'dropped';
    notes.push({
      id: randomUUID(),
      participantName: entry.participantName,
      type: 'RANK_CHANGE',
      message: `You ${dir} to rank #${entry.rank} (${entry.totalPoints} pts)`,
      createdAt: new Date().toISOString(),
      read: false,
    });
  }
  return notes;
}

export function generateEliminationNotification(
  teamName: string,
  ownerName: string
): AppNotification {
  return {
    id: randomUUID(),
    participantName: ownerName,
    type: 'ELIMINATION',
    message: `${teamName} has been eliminated from the tournament`,
    createdAt: new Date().toISOString(),
    read: false,
  };
}
