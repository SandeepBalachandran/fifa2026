import { readStore } from '@/lib/store';
import { buildLeaderboard } from '@/lib/leaderboard/calculate';
import { fetchStandings } from '@/lib/football-data/client';
import type { GroupStanding, StandingEntry } from '@/lib/football-data/types';

const RANK_ICON: Record<string, string> = { UP: '▲', DOWN: '▼', UNCHANGED: '–' };
const RANK_COLOR: Record<string, string> = {
  UP: 'text-emerald-500',
  DOWN: 'text-red-500',
  UNCHANGED: 'text-gray-400',
};

const MEDAL: Record<number, { row: string; pts: string; badge: string }> = {
  1: { row: 'bg-amber-50 dark:bg-amber-950/40',   pts: 'text-amber-600 dark:text-amber-400',  badge: '🥇' },
  2: { row: 'bg-slate-50 dark:bg-slate-800/40',   pts: 'text-slate-500 dark:text-slate-400',  badge: '🥈' },
  3: { row: 'bg-orange-50 dark:bg-orange-950/40', pts: 'text-orange-600 dark:text-orange-400', badge: '🥉' },
};

function groupLabel(group: string) {
  if (group === 'OVERALL') return 'Overall Standings';
  return group.replace('GROUP_', 'Group ');
}

function gdLabel(gd: number) {
  if (gd > 0) return `+${gd}`;
  return String(gd);
}

function StandingsTable({
  rows,
  ownership,
}: {
  rows: StandingEntry[];
  ownership: Record<string, string>;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-gray-800">
          <th className="px-4 py-3 text-left">#</th>
          <th className="px-4 py-3 text-left">Team</th>
          <th className="px-3 py-3">P</th>
          <th className="px-3 py-3">W</th>
          <th className="px-3 py-3">D</th>
          <th className="px-3 py-3">L</th>
          <th className="px-3 py-3">GF</th>
          <th className="px-3 py-3">GA</th>
          <th className="px-3 py-3">GD</th>
          <th className="px-3 py-3 pr-4">Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const owner = ownership[row.team.name];
          const isOwned = Boolean(owner);
          return (
            <tr
              key={row.team.id}
              className={`border-b border-gray-50 last:border-0 transition-colors dark:border-gray-800 ${
                isOwned
                  ? 'bg-blue-50 dark:bg-blue-950/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <td className="px-4 py-2.5 font-bold text-gray-400">{row.position}</td>
              <td className="px-4 py-2.5">
                <span className="font-semibold text-gray-900 dark:text-white">{row.team.name}</span>
                {isOwned && (
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    {owner}
                  </span>
                )}
              </td>
              <td className="px-3 py-2.5 text-right text-gray-500">{row.playedGames}</td>
              <td className="px-3 py-2.5 text-right font-medium text-emerald-600 dark:text-emerald-400">{row.won}</td>
              <td className="px-3 py-2.5 text-right text-gray-500">{row.draw}</td>
              <td className="px-3 py-2.5 text-right text-red-500">{row.lost}</td>
              <td className="px-3 py-2.5 text-right text-gray-500">{row.goalsFor}</td>
              <td className="px-3 py-2.5 text-right text-gray-500">{row.goalsAgainst}</td>
              <td className="px-3 py-2.5 text-right font-medium text-gray-600 dark:text-gray-400">{gdLabel(row.goalDifference)}</td>
              <td className="px-3 py-2.5 pr-4 text-right font-black text-gray-900 dark:text-white">{row.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function GroupCard({
  standing,
  ownership,
}: {
  standing: GroupStanding;
  ownership: Record<string, string>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="bg-linear-to-r from-indigo-600 to-blue-600 px-4 py-2.5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/90">
          {groupLabel(standing.group)}
        </h3>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-right text-gray-400 dark:border-gray-800">
            <th className="px-3 py-2 text-left font-semibold">Team</th>
            <th className="px-2 py-2 font-semibold">P</th>
            <th className="px-2 py-2 font-semibold">W</th>
            <th className="px-2 py-2 font-semibold">D</th>
            <th className="px-2 py-2 font-semibold">L</th>
            <th className="px-2 py-2 font-semibold">GD</th>
            <th className="px-2 py-2 pr-3 font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standing.table.map((row) => {
            const owner = ownership[row.team.name];
            const isOwned = Boolean(owner);
            return (
              <tr
                key={row.team.id}
                className={`border-b border-gray-50 last:border-0 dark:border-gray-800 ${
                  isOwned ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                }`}
              >
                <td className="px-3 py-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {row.position}. {row.team.shortName || row.team.name}
                  </span>
                  {isOwned && (
                    <span className="ml-1.5 text-blue-600 dark:text-blue-400">({owner})</span>
                  )}
                </td>
                <td className="px-2 py-2 text-right text-gray-500">{row.playedGames}</td>
                <td className="px-2 py-2 text-right font-medium text-emerald-600">{row.won}</td>
                <td className="px-2 py-2 text-right text-gray-500">{row.draw}</td>
                <td className="px-2 py-2 text-right text-red-500">{row.lost}</td>
                <td className="px-2 py-2 text-right text-gray-500">{gdLabel(row.goalDifference)}</td>
                <td className="px-2 py-2 pr-3 text-right font-black text-gray-900 dark:text-white">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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

  const isOverall = standings.length === 1 && standings[0].group === 'OVERALL';

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="mb-8 flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
        🏆 Leaderboard
      </h1>

      {/* ── Draft Standings ── */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-700 dark:text-gray-300">
          Draft Standings
        </h2>

        {entries.length === 0 ? (
          <p className="text-sm text-gray-400">No participants yet. Add some in the admin panel.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-linear-to-r from-blue-600 to-indigo-600 text-left text-xs font-bold uppercase tracking-wider text-blue-100">
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-4 py-3">Participant</th>
                  <th className="px-4 py-3 text-right">Points</th>
                  <th className="px-4 py-3 text-right">Gap</th>
                  <th className="px-4 py-3 text-right">Teams Left</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const medal = MEDAL[e.rank];
                  return (
                    <tr
                      key={e.participantName}
                      className={`border-b border-gray-50 last:border-0 dark:border-gray-800 ${medal?.row ?? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                    >
                      <td className="px-5 py-3.5">
                        <span className="mr-1">{medal?.badge ?? ''}</span>
                        <span className="font-black text-gray-700 dark:text-gray-200">{e.rank}</span>{' '}
                        <span className={`text-xs ${RANK_COLOR[e.rankChange]}`}>
                          {RANK_ICON[e.rankChange]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                        {e.participantName}
                      </td>
                      <td className={`px-4 py-3.5 text-right text-lg font-black ${medal?.pts ?? 'text-gray-700 dark:text-gray-200'}`}>
                        {e.totalPoints}
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-400">
                        {e.rank === 1 ? '—' : `-${e.scoreDelta}`}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          {e.teamsRemaining}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── World Cup Standings ── */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-700 dark:text-gray-300">
          🌍 World Cup Standings
        </h2>

        {standingsError && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40">
            <div className="border-b border-red-200 bg-red-100 px-4 py-2 dark:border-red-800 dark:bg-red-900/40">
              <p className="text-xs font-bold uppercase text-red-700 dark:text-red-400">API Error</p>
            </div>
            <p className="px-4 py-3 text-sm text-red-700 dark:text-red-400">{standingsError}</p>
          </div>
        )}

        {!standingsError && standings.length === 0 && (
          <p className="text-sm text-gray-400">No standings available yet.</p>
        )}

        {isOverall ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="bg-linear-to-r from-green-700 to-emerald-600 px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-white/90">
                Overall Standings — Matchday 1
              </p>
            </div>
            <StandingsTable rows={standings[0].table} ownership={ownership} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {standings.map((group) => (
              <GroupCard key={group.group} standing={group} ownership={ownership} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
