import type { DraftStore } from '../store';

export interface LeaderboardEntry {
  rank: number;
  participantName: string;
  totalPoints: number;
  scoreDelta: number;
  teamsRemaining: number;
  rankChange: 'UP' | 'DOWN' | 'UNCHANGED';
}

export function buildLeaderboard(store: DraftStore): LeaderboardEntry[] {
  const { participants, scores, ownership, eliminated, previousRanks } = store;

  const teamsPerOwner: Record<string, number> = {};
  for (const [teamName, ownerName] of Object.entries(ownership)) {
    if (!eliminated.includes(teamName)) {
      teamsPerOwner[ownerName] = (teamsPerOwner[ownerName] ?? 0) + 1;
    }
  }

  const sorted = [...participants].sort((a, b) => {
    const scoreDiff = (scores[b] ?? 0) - (scores[a] ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (teamsPerOwner[b] ?? 0) - (teamsPerOwner[a] ?? 0);
  });

  return sorted.map((name, i) => {
    const rank = i + 1;
    const totalPoints = scores[name] ?? 0;
    const prevRank = previousRanks[name];
    const rankChange: LeaderboardEntry['rankChange'] =
      prevRank === undefined ? 'UNCHANGED'
        : rank < prevRank ? 'UP'
        : rank > prevRank ? 'DOWN'
        : 'UNCHANGED';

    const above = sorted[i - 1];
    const scoreDelta = above ? (scores[above] ?? 0) - totalPoints : 0;

    return {
      rank,
      participantName: name,
      totalPoints,
      scoreDelta,
      teamsRemaining: teamsPerOwner[name] ?? 0,
      rankChange,
    };
  });
}

export function snapshotRanks(entries: LeaderboardEntry[]): Record<string, number> {
  return Object.fromEntries(entries.map((e) => [e.participantName, e.rank]));
}
