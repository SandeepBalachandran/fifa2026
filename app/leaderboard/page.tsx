import { readStore } from '@/lib/store';
import { buildLeaderboard } from '@/lib/leaderboard/calculate';
import { fetchStandings } from '@/lib/football-data/client';
import { LeaderboardShell } from '@/components/leaderboard/LeaderboardShell';
import type { GroupStanding } from '@/lib/football-data/types';

export default async function LeaderboardPage() {
  const store = readStore();
  const entries = buildLeaderboard(store);
  const { ownership } = store;

  let standings: GroupStanding[] = [];
  let standingsError: string | null = null;
  try {
    standings = await fetchStandings(2026, 1);
  } catch (err) {
    standingsError = String(err);
  }

  return (
    <LeaderboardShell
      entries={entries}
      standings={standings}
      ownership={ownership}
      standingsError={standingsError}
    />
  );
}
