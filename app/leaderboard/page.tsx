import { readStore } from '@/lib/store';
import { buildLeaderboard } from '@/lib/leaderboard/calculate';
import { fetchStandings } from '@/lib/football-data/client';
import { LeaderboardShell } from '@/components/leaderboard/LeaderboardShell';
import type { GroupStanding } from '@/lib/football-data/types';

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string; season?: string }>;
}) {
  const { competition = 'WC', season } = await searchParams;
  const seasonYear = season ? parseInt(season, 10) : undefined;
  const store = readStore();
  const entries = buildLeaderboard(store);
  const { ownership } = store;

  let standings: GroupStanding[] = [];
  let standingsError: string | null = null;
  try {
    standings = await fetchStandings(competition, seasonYear);
  } catch (err) {
    standingsError = String(err);
  }

  return (
    <LeaderboardShell
      entries={entries}
      standings={standings}
      ownership={ownership}
      standingsError={standingsError}
      competition={competition}
    />
  );
}
