import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { getWarRoomData } from '@/lib/war-room/data';
import { BattleCard } from '@/components/battles/BattleCard';
import { getBetLabel } from '@/lib/bet-tracker/config';
import { fetchFixtures, fetchStandings } from '@/lib/football-data/client';
import { calculateBetStats } from '@/lib/bet-tracker/calculate';
import { CompetitionSwitcher } from '@/components/CompetitionSwitcher';
import { SeasonSwitcher } from '@/components/SeasonSwitcher';
import { PlanUpgradeBanner } from '@/components/PlanUpgradeBanner';
import type { Fixture, StandingEntry } from '@/lib/football-data/types';

function WRCrest({ src, name, size = 18 }: { src: string | null; name: string; size?: number }) {
  if (!src) return <span className="inline-block shrink-0 rounded-sm bg-gray-100 dark:bg-gray-700" style={{ width: size, height: size }} />;
  return <Image src={src} alt={name} width={size} height={size} className="shrink-0 object-contain" unoptimized />;
}

function BetLabel({ name }: { name: string }) {
  const label = getBetLabel(name);
  if (!label) return null;
  return <span className="shrink-0 text-xs font-bold text-amber-500 dark:text-amber-400">{label}</span>;
}

export default async function WarRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string; season?: string }>;
}) {
  const { competition = 'WC', season } = await searchParams;
  const seasonYear = season ? parseInt(season, 10) : undefined;

  const [warRoomData, wcFixtures, compFixturesResult, standingsResult] = await Promise.all([
    getWarRoomData().catch(() => ({ leader: null, topFive: [], upcomingBattles: [], recentBattles: [] })),
    fetchFixtures('WC').catch((): Fixture[] => []),
    fetchFixtures(competition, undefined, seasonYear).catch((e: unknown) => ({ error: String(e) })),
    fetchStandings(competition, seasonYear).catch((e: unknown) => ({ error: String(e) })),
  ]);

  const compFixtures: Fixture[] = Array.isArray(compFixturesResult) ? compFixturesResult : [];
  const compError: string | null = Array.isArray(compFixturesResult) ? null : compFixturesResult.error;
  const standings = Array.isArray(standingsResult) ? standingsResult : [];
  const standingsError = Array.isArray(standingsResult) ? null : standingsResult.error;

  const { leader, topFive, upcomingBattles, recentBattles } = warRoomData;
  const { sandy, rahul } = calculateBetStats(wcFixtures);

  const betLeader =
    sandy.wins > rahul.wins ? { name: 'Sandy', wins: sandy.wins, amount: sandy.amount } :
    rahul.wins > sandy.wins ? { name: 'Rahul', wins: rahul.wins, amount: rahul.amount } :
    null;

  const upcomingFixtures = compFixtures
    .filter((f) => f.status === 'SCHEDULED' || f.status === 'TIMED' || f.status === 'IN_PLAY')
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
    .slice(0, 6);

  const recentResults = compFixtures
    .filter((f) => f.status === 'FINISHED')
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
    .slice(0, 5);

  const topTeams: StandingEntry[] = standings
    .flatMap((g) => g.table)
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor
    )
    .slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
          🏟 War Room
        </h1>
        <Suspense fallback={<div className="h-9 w-48 animate-pulse rounded-lg bg-green-100 dark:bg-green-900/30" />}>
          <div className="flex items-center gap-2">
            <CompetitionSwitcher />
            <SeasonSwitcher />
          </div>
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* ── Current Leader ── */}
        <section className="col-span-1 overflow-hidden rounded-2xl shadow-lg">
          <div className="bg-linear-to-br from-amber-400 to-yellow-600 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-900/70">
              🥇 Current Leader
            </p>
          </div>
          <div className="bg-white px-5 py-5 dark:bg-gray-900">
            {leader ? (
              <>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {leader.participantName}
                </p>
                <p className="mt-1 text-5xl font-black text-amber-500">{leader.totalPoints}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {leader.teamsRemaining} team{leader.teamsRemaining === 1 ? '' : 's'} remaining
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No data yet.</p>
            )}

            {/* Bet Leader */}
            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
                🎯 Bet Leader
              </p>
              {betLeader ? (
                <>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{betLeader.name}</p>
                  <p className="text-sm text-gray-500">{betLeader.wins} wins · ₹{betLeader.amount}</p>
                </>
              ) : sandy.wins === 0 && rahul.wins === 0 ? (
                <p className="text-sm text-gray-400">No bets won yet.</p>
              ) : (
                <p className="text-sm font-semibold text-gray-500">Tied — {sandy.wins} wins each 🤝</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Standings ── */}
        <section className="col-span-1 overflow-hidden rounded-2xl shadow-lg lg:col-span-2">
          <div className="flex items-center justify-between bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
              📊 Standings
            </p>
            <Link href="/leaderboard" className="text-xs font-semibold text-white/80 hover:text-white">
              Full leaderboard →
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-900">
            {/* Draft Standings */}
            {topFive.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No participants yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-800">
                    <th className="px-5 py-2">#</th>
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2 text-right">Pts</th>
                    <th className="px-4 py-2 text-right">Teams</th>
                  </tr>
                </thead>
                <tbody>
                  {topFive.map((e) => (
                    <tr key={e.participantName} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                      <td className="px-5 py-2.5 font-bold text-gray-400">{e.rank}</td>
                      <td className="px-2 py-2.5 font-semibold text-gray-900 dark:text-white">{e.participantName}</td>
                      <td className="px-2 py-2.5 text-right font-bold text-blue-600 dark:text-blue-400">{e.totalPoints}</td>
                      <td className="px-4 py-2.5 text-right text-gray-400">{e.teamsRemaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Top 5 Teams */}
            {standingsError && (
              <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">🌍 Top 5 Teams</p>
                <PlanUpgradeBanner />
              </div>
            )}
            {!standingsError && topTeams.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  🌍 Top 5 Teams
                </p>
                <table className="w-full text-xs">
                  <tbody>
                    {topTeams.map((entry, i) => (
                      <tr key={entry.team.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                        <td className="py-1.5 pr-2 font-bold text-gray-400">{i + 1}</td>
                        <td className="py-1.5">
                          <div className="flex items-center gap-1.5">
                            <WRCrest src={entry.team.crest} name={entry.team.name} size={16} />
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {entry.team.shortName || entry.team.name}
                            </span>
                            <BetLabel name={entry.team.name} />
                          </div>
                        </td>
                        <td className="py-1.5 text-right font-black text-gray-900 dark:text-white">{entry.points}</td>
                        <td className="py-1.5 pl-3 text-right text-gray-400">
                          {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ── Upcoming Fixtures — tiny cards ── */}
        <section className="col-span-1 overflow-hidden rounded-2xl shadow-lg lg:col-span-2">
          <div className="flex items-center justify-between bg-linear-to-r from-emerald-600 to-green-600 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">
              📅 Upcoming Fixtures
            </p>
            <Link href="/fixtures" className="text-xs font-semibold text-white/80 hover:text-white">
              All fixtures →
            </Link>
          </div>
          <div className="bg-white px-4 py-4 dark:bg-gray-900">
            {compError ? (
              <PlanUpgradeBanner />
            ) : upcomingFixtures.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming fixtures.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {upcomingFixtures.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/40"
                  >
                    <p className="mb-2 text-center text-xs text-gray-400">
                      {new Date(f.utcDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {' · '}
                      {new Date(f.utcDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <WRCrest src={f.homeTeam.crest} name={f.homeTeam.name} />
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {f.homeTeam.name}
                      </span>
                      <BetLabel name={f.homeTeam.name} />
                    </div>
                    <p className="my-1 text-center text-xs font-medium text-gray-400">vs</p>
                    <div className="flex items-center gap-1.5">
                      <WRCrest src={f.awayTeam.crest} name={f.awayTeam.name} />
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {f.awayTeam.name}
                      </span>
                      <BetLabel name={f.awayTeam.name} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Recent Results — 2-line stacked ── */}
        <section className="col-span-1 overflow-hidden rounded-2xl shadow-lg">
          <div className="bg-linear-to-br from-sky-500 to-cyan-600 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-100">
              🏁 Recent Results
            </p>
          </div>
          <div className="bg-white px-4 py-4 dark:bg-gray-900">
            {compError ? (
              <PlanUpgradeBanner />
            ) : recentResults.length === 0 ? (
              <p className="text-sm text-gray-400">No results yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentResults.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2.5 dark:border-sky-900/30 dark:bg-sky-950/20"
                  >
                    <div className="flex items-center gap-1.5">
                      <WRCrest src={f.homeTeam.crest} name={f.homeTeam.name} size={16} />
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {f.homeTeam.name}
                      </span>
                      <BetLabel name={f.homeTeam.name} />
                    </div>
                    <div className="my-1.5 text-center">
                      <span className="rounded bg-sky-100 px-3 py-0.5 text-sm font-black tabular-nums text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                        {f.score.fullTime.home} – {f.score.fullTime.away}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <WRCrest src={f.awayTeam.crest} name={f.awayTeam.name} size={16} />
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {f.awayTeam.name}
                      </span>
                      <BetLabel name={f.awayTeam.name} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Direct Battles ── */}
        {(upcomingBattles.length > 0 || recentBattles.length > 0) && (
          <section className="col-span-1 overflow-hidden rounded-2xl shadow-lg lg:col-span-3">
            <div className="flex items-center justify-between bg-linear-to-r from-orange-500 to-red-600 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-100">
                ⚔️ Direct Battles
              </p>
              <Link href="/battles" className="text-xs font-semibold text-white/80 hover:text-white">
                All battles →
              </Link>
            </div>
            <div className="bg-white px-5 py-4 dark:bg-gray-900">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...upcomingBattles, ...recentBattles].map((b) => (
                  <BattleCard key={b.matchId} battle={b} />
                ))}
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
