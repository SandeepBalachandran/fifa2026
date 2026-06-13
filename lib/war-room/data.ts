import { readStore } from '../store';
import { fetchFixtures } from '../football-data/client';
import { buildLeaderboard, type LeaderboardEntry } from '../leaderboard/calculate';
import type { DirectBattle } from '../battles/types';
import type { Fixture } from '../football-data/types';

export interface WarRoomData {
  leader: LeaderboardEntry | null;
  topFive: LeaderboardEntry[];
  upcomingFixtures: Fixture[];
  recentResults: Fixture[];
  upcomingBattles: DirectBattle[];
  recentBattles: DirectBattle[];
}

export async function getWarRoomData(): Promise<WarRoomData> {
  const store = readStore();
  const leaderboard = buildLeaderboard(store);
  const battles = Object.values(store.battles);

  let fixtures: Fixture[] = [];
  try {
    fixtures = await fetchFixtures();
  } catch {
    fixtures = store.fixtures; // fall back to cached store fixtures on API error
  }

  const upcomingFixtures = fixtures
    .filter((f) => f.status === 'SCHEDULED' || f.status === 'TIMED' || f.status === 'IN_PLAY')
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
    .slice(0, 5);

  const recentResults = fixtures
    .filter((f) => f.status === 'FINISHED')
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
    .slice(0, 5);

  const upcomingBattles = battles
    .filter((b) => b.status === 'SCHEDULED' || b.status === 'LIVE')
    .sort((a, b) => a.matchDate.localeCompare(b.matchDate))
    .slice(0, 3);

  const recentBattles = battles
    .filter((b) => b.status === 'FINISHED')
    .sort((a, b) => b.matchDate.localeCompare(a.matchDate))
    .slice(0, 3);

  return {
    leader: leaderboard[0] ?? null,
    topFive: leaderboard.slice(0, 5),
    upcomingFixtures,
    recentResults,
    upcomingBattles,
    recentBattles,
  };
}
