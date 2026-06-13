import Link from 'next/link';
import Image from 'next/image';
import { getWarRoomData } from '@/lib/war-room/data';
import { BattleCard } from '@/components/battles/BattleCard';

function WRCrest({ src, name }: { src: string | null; name: string }) {
  if (!src) return <span className="inline-block h-5 w-5 shrink-0 rounded-sm bg-gray-100 dark:bg-gray-700" />;
  return <Image src={src} alt={name} width={20} height={20} className="shrink-0 object-contain" unoptimized />;
}

export default async function WarRoomPage() {
  const { leader, topFive, upcomingFixtures, recentResults, upcomingBattles, recentBattles } =
    await getWarRoomData();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
        🏟 War Room
      </h1>

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
          </div>
        </section>

        {/* ── Upcoming Fixtures ── */}
        <section className="col-span-1 overflow-hidden rounded-2xl shadow-lg lg:col-span-2">
          <div className="flex items-center justify-between bg-linear-to-r from-emerald-600 to-green-600 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">
              📅 Upcoming Fixtures
            </p>
            <Link href="/fixtures" className="text-xs font-semibold text-white/80 hover:text-white">
              All fixtures →
            </Link>
          </div>
          <div className="bg-white px-5 py-4 dark:bg-gray-900">
            {upcomingFixtures.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming fixtures.</p>
            ) : (
              <ul className="space-y-2.5">
                {upcomingFixtures.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-4">
                    <span className="flex min-w-0 items-center gap-2 font-medium text-gray-900 dark:text-white">
                      <WRCrest src={f.homeTeam.crest} name={f.homeTeam.name} />
                      <span className="truncate">{f.homeTeam.name}</span>
                      <span className="shrink-0 font-normal text-gray-400">vs</span>
                      <span className="truncate">{f.awayTeam.name}</span>
                      <WRCrest src={f.awayTeam.crest} name={f.awayTeam.name} />
                    </span>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      {new Date(f.utcDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Recent Results ── */}
        <section className="col-span-1 overflow-hidden rounded-2xl shadow-lg">
          <div className="bg-linear-to-br from-sky-500 to-cyan-600 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-100">
              🏁 Recent Results
            </p>
          </div>
          <div className="bg-white px-5 py-4 dark:bg-gray-900">
            {recentResults.length === 0 ? (
              <p className="text-sm text-gray-400">No results yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {recentResults.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <WRCrest src={f.homeTeam.crest} name={f.homeTeam.name} />
                      <span className="truncate">{f.homeTeam.name}</span>
                    </span>
                    <span className="shrink-0 rounded bg-sky-100 px-2 py-0.5 font-bold text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                      {f.score.fullTime.home}–{f.score.fullTime.away}
                    </span>
                    <span className="flex min-w-0 items-center justify-end gap-1.5 text-right text-gray-700 dark:text-gray-300">
                      <span className="truncate">{f.awayTeam.name}</span>
                      <WRCrest src={f.awayTeam.crest} name={f.awayTeam.name} />
                    </span>
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
